/**
 * Three-Address Code (TAC) Intermediate Representation Generator.
 * Lowers AST constructs into atomic 3AC instructions and Quadruples.
 */

import { NodeKind } from '../parser/astNodes.js';
import { tacLineToQuadruple } from './quadruple.js';

export function generateTac(ast) {
  const instructions = [];
  let tempCount = 0;
  let labelCount = 0;

  const newTemp = () => `t${++tempCount}`;
  const newLabel = () => `L${++labelCount}`;

  // Evaluate expressions into temporary variables or atomic operands
  const emitExpr = (node) => {
    if (!node) return '0';

    switch (node.kind) {
      case NodeKind.NUMERIC_LITERAL:
        return String(node.value);

      case NodeKind.BOOLEAN_LITERAL:
        return node.value ? '1' : '0';

      case NodeKind.IDENTIFIER:
        return node.name;

      case NodeKind.UNARY_EXPR: {
        const arg = emitExpr(node.argument);
        const t = newTemp();
        instructions.push(`${t} = ${node.op}${arg}`);
        return t;
      }

      case NodeKind.BINARY_EXPR:
      case NodeKind.LOGICAL_EXPR: {
        const left = emitExpr(node.left);
        const right = emitExpr(node.right);
        const t = newTemp();
        instructions.push(`${t} = ${left} ${node.op} ${right}`);
        return t;
      }

      case NodeKind.CALL_EXPR: {
        const argTemps = node.args.map(a => emitExpr(a));
        for (const a of argTemps) {
          instructions.push(`param ${a}`);
        }
        const t = newTemp();
        instructions.push(`${t} = call ${node.callee}, ${argTemps.length}`);
        return t;
      }

      default:
        return '0';
    }
  };

  // Emit control-flow and statement constructs
  const emitStmt = (stmt) => {
    if (!stmt) return;

    switch (stmt.kind) {
      case NodeKind.PROGRAM:
      case NodeKind.BLOCK_STATEMENT:
        stmt.body.forEach(s => emitStmt(s));
        break;

      case NodeKind.VAR_DECLARATION:
        if (stmt.init) {
          const val = emitExpr(stmt.init);
          instructions.push(`${stmt.name} = ${val}`);
        }
        break;

      case NodeKind.ASSIGNMENT: {
        const val = emitExpr(stmt.value);
        instructions.push(`${stmt.name} = ${val}`);
        break;
      }

      case NodeKind.PRINT_STATEMENT: {
        const val = emitExpr(stmt.value);
        instructions.push(`print ${val}`);
        break;
      }

      case NodeKind.RETURN_STATEMENT: {
        if (stmt.value) {
          const val = emitExpr(stmt.value);
          instructions.push(`return ${val}`);
        } else {
          instructions.push(`return`);
        }
        break;
      }

      case NodeKind.EXPR_STATEMENT: {
        emitExpr(stmt.expr);
        break;
      }

      case NodeKind.IF_STATEMENT: {
        const condVal = emitExpr(stmt.test);
        const lElse = newLabel();
        const lEnd = newLabel();

        instructions.push(`if_false ${condVal} goto ${stmt.alternate ? lElse : lEnd}`);
        emitStmt(stmt.consequent);

        if (stmt.alternate) {
          instructions.push(`goto ${lEnd}`);
          instructions.push(`${lElse}:`);
          emitStmt(stmt.alternate);
        }

        instructions.push(`${lEnd}:`);
        break;
      }

      case NodeKind.WHILE_STATEMENT: {
        const lStart = newLabel();
        const lBody = newLabel();
        const lEnd = newLabel();

        instructions.push(`${lStart}:`);
        const condVal = emitExpr(stmt.test);
        instructions.push(`if_false ${condVal} goto ${lEnd}`);
        instructions.push(`${lBody}:`);
        emitStmt(stmt.body);
        instructions.push(`goto ${lStart}`);
        instructions.push(`${lEnd}:`);
        break;
      }

      case NodeKind.FN_DECLARATION: {
        instructions.push(`func_begin ${stmt.name}`);
        stmt.body.body.forEach(s => emitStmt(s));
        instructions.push(`func_end ${stmt.name}`);
        break;
      }

      default:
        break;
    }
  };

  emitStmt(ast);

  const quadruples = instructions.map((line, idx) => tacLineToQuadruple(line, idx + 1));

  return {
    tac: instructions,
    quadruples
  };
}
