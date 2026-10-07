/**
 * WebAssembly Text Format (WAT) Code Generator.
 * Transforms AST directly into valid, standards-compliant WebAssembly Text.
 * Supports:
 * - Top-level execution and globals
 * - User-defined functions with parameters, local variables, and returns
 * - Structured control flow: if-then-else, while-loop
 * - Relational comparisons, arithmetic, modulo, and boolean operations
 * - Host environment print() imports
 */

import { NodeKind } from '../parser/astNodes.js';

export function emitWat(ast) {
  const globalNames = new Set();
  const functionDefs = [];
  const topLevelInstructions = [];

  // 1. Identify global variables (declared outside functions)
  for (const node of ast.body) {
    if (node.kind === NodeKind.VAR_DECLARATION) {
      globalNames.add(node.name);
    }
  }

  // Expression generator
  const genExpr = (expr, localNames) => {
    if (!expr) return '(f64.const 0)';

    switch (expr.kind) {
      case NodeKind.NUMERIC_LITERAL:
        return `(f64.const ${expr.value})`;

      case NodeKind.BOOLEAN_LITERAL:
        return `(f64.const ${expr.value ? 1 : 0})`;

      case NodeKind.IDENTIFIER:
        if (localNames.has(expr.name)) {
          return `(local.get $${expr.name})`;
        }
        return `(global.get $${expr.name})`;

      case NodeKind.UNARY_EXPR:
        if (expr.op === '-') {
          return `(f64.neg ${genExpr(expr.argument, localNames)})`;
        }
        if (expr.op === '!') {
          return `(f64.convert_i32_s (f64.eq ${genExpr(expr.argument, localNames)} (f64.const 0)))`;
        }
        return genExpr(expr.argument, localNames);

      case NodeKind.BINARY_EXPR: {
        const l = genExpr(expr.left, localNames);
        const r = genExpr(expr.right, localNames);

        if (expr.op === '%') {
          return `(f64.convert_i64_s (i64.rem_s (i64.trunc_f64_s ${l}) (i64.trunc_f64_s ${r})))`;
        }

        const floatOps = {
          '+': 'f64.add',
          '-': 'f64.sub',
          '*': 'f64.mul',
          '/': 'f64.div'
        };
        if (floatOps[expr.op]) {
          return `(${floatOps[expr.op]} ${l} ${r})`;
        }

        const relOps = {
          '<': 'f64.lt',
          '<=': 'f64.le',
          '>': 'f64.gt',
          '>=': 'f64.ge',
          '==': 'f64.eq',
          '!=': 'f64.ne'
        };
        if (relOps[expr.op]) {
          return `(f64.convert_i32_s (${relOps[expr.op]} ${l} ${r}))`;
        }
        return `(f64.add ${l} ${r})`;
      }

      case NodeKind.LOGICAL_EXPR: {
        const l = genExpr(expr.left, localNames);
        const r = genExpr(expr.right, localNames);
        const op = expr.op === '&&' ? 'i32.and' : 'i32.or';
        return `(f64.convert_i32_s (${op} (f64.ne ${l} (f64.const 0)) (f64.ne ${r} (f64.const 0))))`;
      }

      case NodeKind.CALL_EXPR: {
        const argsStr = expr.args.map(a => genExpr(a, localNames)).join(' ');
        return `(call $${expr.callee} ${argsStr})`.trim();
      }

      default:
        return '(f64.const 0)';
    }
  };

  // Convert an expression to a boolean test for if/while condition
  const genCondition = (expr, localNames) => {
    return `(f64.ne ${genExpr(expr, localNames)} (f64.const 0))`;
  };

  // Statement generator
  const genStmt = (stmt, targetList, localNames) => {
    if (!stmt) return;

    switch (stmt.kind) {
      case NodeKind.BLOCK_STATEMENT:
        stmt.body.forEach(s => genStmt(s, targetList, localNames));
        break;

      case NodeKind.VAR_DECLARATION:
        if (localNames.has(stmt.name)) {
          if (stmt.init) {
            targetList.push(`(local.set $${stmt.name} ${genExpr(stmt.init, localNames)})`);
          }
        } else {
          if (stmt.init) {
            targetList.push(`(global.set $${stmt.name} ${genExpr(stmt.init, localNames)})`);
          }
        }
        break;

      case NodeKind.ASSIGNMENT:
        if (localNames.has(stmt.name)) {
          targetList.push(`(local.set $${stmt.name} ${genExpr(stmt.value, localNames)})`);
        } else {
          targetList.push(`(global.set $${stmt.name} ${genExpr(stmt.value, localNames)})`);
        }
        break;

      case NodeKind.PRINT_STATEMENT:
        targetList.push(`(call $print ${genExpr(stmt.value, localNames)})`);
        break;

      case NodeKind.RETURN_STATEMENT:
        if (stmt.value) {
          targetList.push(`(return ${genExpr(stmt.value, localNames)})`);
        } else {
          targetList.push(`(return (f64.const 0))`);
        }
        break;

      case NodeKind.EXPR_STATEMENT:
        // Execute expression and drop result if any
        targetList.push(`(drop ${genExpr(stmt.expr, localNames)})`);
        break;

      case NodeKind.IF_STATEMENT: {
        const cond = genCondition(stmt.test, localNames);
        const thenInstructions = [];
        genStmt(stmt.consequent, thenInstructions, localNames);

        let elseInstructions = [];
        if (stmt.alternate) {
          genStmt(stmt.alternate, elseInstructions, localNames);
        }

        const elseBlock = elseInstructions.length > 0 ? ` (else\n        ${elseInstructions.join('\n        ')}\n      )` : '';
        targetList.push(`(if ${cond}\n      (then\n        ${thenInstructions.join('\n        ')}\n      )${elseBlock}\n    )`);
        break;
      }

      case NodeKind.WHILE_STATEMENT: {
        const cond = genCondition(stmt.test, localNames);
        const bodyInstructions = [];
        genStmt(stmt.body, bodyInstructions, localNames);

        targetList.push(`(block\n      (loop\n        (br_if 1 (i32.eqz ${cond}))\n        ${bodyInstructions.join('\n        ')}\n        (br 0)\n      )\n    )`);
        break;
      }

      default:
        break;
    }
  };

  // 2. Separate functions and top-level statements
  for (const node of ast.body) {
    if (node.kind === NodeKind.FN_DECLARATION) {
      const localNames = new Set(node.params);
      const localsDeclared = new Set();

      // Scan function body for local variable declarations
      const scanLocals = (s) => {
        if (!s) return;
        if (s.kind === NodeKind.BLOCK_STATEMENT) s.body.forEach(scanLocals);
        if (s.kind === NodeKind.VAR_DECLARATION) {
          localNames.add(s.name);
          localsDeclared.add(s.name);
        }
        if (s.kind === NodeKind.IF_STATEMENT) {
          scanLocals(s.consequent);
          scanLocals(s.alternate);
        }
        if (s.kind === NodeKind.WHILE_STATEMENT) scanLocals(s.body);
      };
      node.body.body.forEach(scanLocals);

      const paramsWat = node.params.map(p => `(param $${p} f64)`).join(' ');
      const localsWat = [...localsDeclared].map(l => `(local $${l} f64)`).join(' ');

      const fnInstructions = [];
      node.body.body.forEach(s => genStmt(s, fnInstructions, localNames));

      // Ensure every path returns a value
      fnInstructions.push('(f64.const 0)');

      functionDefs.push(`  (func $${node.name} ${paramsWat} (result f64)\n    ${localsWat ? localsWat + '\n    ' : ''}${fnInstructions.join('\n    ')}\n  )`);
    } else {
      genStmt(node, topLevelInstructions, new Set());
    }
  }

  // 3. Assemble WebAssembly Text Module
  const globalsWat = [...globalNames]
    .map(name => `  (global $${name} (mut f64) (f64.const 0))`)
    .join('\n');

  const wat = `(module
  (import "env" "print" (func $print (param f64)))
${globalsWat ? globalsWat + '\n' : ''}
${functionDefs.join('\n\n')}

  (func (export "run")
    ${topLevelInstructions.join('\n    ')}
  )
)`.trim();

  return {
    wat,
    globalNames: [...globalNames]
  };
}
