/**
 * Abstract Syntax Tree (AST) Node definitions for MiniLang.
 * Follows standard compiler AST design with source location tracking.
 */

export const NodeKind = {
  PROGRAM: 'Program',
  VAR_DECLARATION: 'VariableDeclaration',
  FN_DECLARATION: 'FunctionDeclaration',
  RETURN_STATEMENT: 'ReturnStatement',
  ASSIGNMENT: 'AssignmentStatement',
  PRINT_STATEMENT: 'PrintStatement',
  IF_STATEMENT: 'IfStatement',
  WHILE_STATEMENT: 'WhileStatement',
  BLOCK_STATEMENT: 'BlockStatement',
  EXPR_STATEMENT: 'ExpressionStatement',
  BINARY_EXPR: 'BinaryExpression',
  LOGICAL_EXPR: 'LogicalExpression',
  UNARY_EXPR: 'UnaryExpression',
  CALL_EXPR: 'CallExpression',
  IDENTIFIER: 'Identifier',
  NUMERIC_LITERAL: 'NumericLiteral',
  BOOLEAN_LITERAL: 'BooleanLiteral'
};
