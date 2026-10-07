/**
 * Semantic Analyzer for MiniLang.
 * Performs multi-pass validation:
 * 1. Scope hierarchy and symbol table generation
 * 2. Declaration-before-use checks
 * 3. Duplicate declaration detection
 * 4. Function call validation (existence, arity matching)
 * 5. Return statement scope validation
 * 6. Basic type compatibility checking
 */

import { NodeKind } from '../parser/astNodes.js';
import { CompileError } from '../lexer/token.js';
import { Scope, Symbol } from './symbolTable.js';

export function analyze(ast) {
  const globalScope = new Scope('global');
  let currentScope = globalScope;
  let currentFunction = null; // tracking enclosing function for 'return' checks
  const errors = [];
  const symbolList = [];
  let globalAddr = 0;
  let localAddr = 0;

  // Built-in functions registered globally
  globalScope.define(new Symbol('print', 'function', 'void', 'global', 1, 0, 1));

  // First pass: hoisted function signatures
  for (const node of ast.body) {
    if (node.kind === NodeKind.FN_DECLARATION) {
      if (globalScope.hasLocal(node.name)) {
        errors.push(new CompileError(`Duplicate declaration of function '${node.name}'.`, node.loc, 'Semantic'));
      } else {
        const fnSym = new Symbol(node.name, 'function', 'any', 'global', node.loc.line, globalAddr++, node.params.length);
        globalScope.define(fnSym);
        symbolList.push(fnSym);
      }
    }
  }

  // Expression type inference and identifier verification
  const checkExpression = (expr) => {
    if (!expr) return 'void';

    switch (expr.kind) {
      case NodeKind.NUMERIC_LITERAL:
        return expr.numType || 'int';

      case NodeKind.BOOLEAN_LITERAL:
        return 'bool';

      case NodeKind.IDENTIFIER: {
        const sym = currentScope.resolve(expr.name);
        if (!sym) {
          errors.push(new CompileError(`Variable '${expr.name}' is not declared in this scope.`, expr.loc, 'Semantic'));
          return 'any';
        }
        return sym.type;
      }

      case NodeKind.UNARY_EXPR: {
        const argType = checkExpression(expr.argument);
        if (expr.op === '!' && argType !== 'bool' && argType !== 'int' && argType !== 'any') {
          errors.push(new CompileError(`Unary '!' expects boolean or integer operand, got '${argType}'.`, expr.loc, 'Semantic'));
        }
        return expr.op === '!' ? 'bool' : argType;
      }

      case NodeKind.BINARY_EXPR: {
        const leftType = checkExpression(expr.left);
        const rightType = checkExpression(expr.right);
        const isRelational = ['<', '<=', '>', '>=', '==', '!='].includes(expr.op);
        if (isRelational) {
          return 'bool';
        }
        if (leftType === 'float' || rightType === 'float') {
          return 'float';
        }
        return 'int';
      }

      case NodeKind.LOGICAL_EXPR: {
        checkExpression(expr.left);
        checkExpression(expr.right);
        return 'bool';
      }

      case NodeKind.CALL_EXPR: {
        const sym = currentScope.resolve(expr.callee);
        if (!sym) {
          errors.push(new CompileError(`Function '${expr.callee}' is not defined.`, expr.loc, 'Semantic'));
          return 'any';
        }
        if (sym.kind !== 'function') {
          errors.push(new CompileError(`'${expr.callee}' is a variable, not a function.`, expr.loc, 'Semantic'));
          return 'any';
        }
        if (sym.arity !== null && sym.arity !== expr.args.length) {
          errors.push(new CompileError(
            `Function '${expr.callee}' expects ${sym.arity} argument(s), but got ${expr.args.length}.`,
            expr.loc,
            'Semantic'
          ));
        }
        expr.args.forEach(arg => checkExpression(arg));
        return sym.type || 'any';
      }

      default:
        return 'any';
    }
  };

  // Statement visitor
  const checkStatement = (stmt) => {
    if (!stmt) return;

    switch (stmt.kind) {
      case NodeKind.VAR_DECLARATION: {
        if (currentScope.hasLocal(stmt.name)) {
          errors.push(new CompileError(
            `Duplicate variable declaration of '${stmt.name}' in scope '${currentScope.name}'.`,
            stmt.loc,
            'Semantic'
          ));
        } else {
          const rawType = stmt.varType === 'let' ? 'any' : stmt.varType;
          const slot = currentScope === globalScope ? globalAddr++ : localAddr++;
          const sym = new Symbol(stmt.name, 'variable', rawType, currentScope.name, stmt.loc.line, slot);
          currentScope.define(sym);
          symbolList.push(sym);
        }

        if (stmt.init) {
          const initType = checkExpression(stmt.init);
          if (stmt.varType === 'int' && initType === 'float') {
            errors.push(new CompileError(`Cannot initialize 'int' variable '${stmt.name}' with 'float' expression.`, stmt.loc, 'Semantic'));
          }
        }
        break;
      }

      case NodeKind.ASSIGNMENT: {
        const sym = currentScope.resolve(stmt.name);
        if (!sym) {
          errors.push(new CompileError(`Cannot assign to undeclared variable '${stmt.name}'.`, stmt.loc, 'Semantic'));
        } else if (sym.kind === 'function') {
          errors.push(new CompileError(`Cannot assign to function '${stmt.name}'.`, stmt.loc, 'Semantic'));
        }
        const valType = checkExpression(stmt.value);
        if (sym && sym.type === 'int' && valType === 'float') {
          errors.push(new CompileError(`Cannot assign 'float' to 'int' variable '${stmt.name}'.`, stmt.loc, 'Semantic'));
        }
        break;
      }

      case NodeKind.FN_DECLARATION: {
        const prevScope = currentScope;
        const prevFn = currentFunction;
        localAddr = 0;
        currentScope = new Scope(`fn:${stmt.name}`, prevScope);
        currentFunction = stmt.name;

        // Register parameters in the function scope
        stmt.params.forEach((paramName) => {
          if (currentScope.hasLocal(paramName)) {
            errors.push(new CompileError(`Duplicate parameter '${paramName}' in function '${stmt.name}'.`, stmt.loc, 'Semantic'));
          } else {
            const paramSym = new Symbol(paramName, 'parameter', 'any', currentScope.name, stmt.loc.line, localAddr++);
            currentScope.define(paramSym);
            symbolList.push(paramSym);
          }
        });

        // Check function body
        stmt.body.body.forEach(s => checkStatement(s));

        currentScope = prevScope;
        currentFunction = prevFn;
        break;
      }

      case NodeKind.RETURN_STATEMENT: {
        if (!currentFunction) {
          errors.push(new CompileError(`'return' statement cannot appear outside of a function.`, stmt.loc, 'Semantic'));
        }
        if (stmt.value) {
          checkExpression(stmt.value);
        }
        break;
      }

      case NodeKind.PRINT_STATEMENT: {
        checkExpression(stmt.value);
        break;
      }

      case NodeKind.IF_STATEMENT: {
        checkExpression(stmt.test);
        checkStatement(stmt.consequent);
        if (stmt.alternate) {
          checkStatement(stmt.alternate);
        }
        break;
      }

      case NodeKind.WHILE_STATEMENT: {
        checkExpression(stmt.test);
        checkStatement(stmt.body);
        break;
      }

      case NodeKind.BLOCK_STATEMENT: {
        stmt.body.forEach(s => checkStatement(s));
        break;
      }

      case NodeKind.EXPR_STATEMENT: {
        checkExpression(stmt.expr);
        break;
      }

      default:
        break;
    }
  };

  // Run semantic traversal on all statements
  for (const node of ast.body) {
    checkStatement(node);
  }

  return {
    symbols: symbolList,
    errors
  };
}
