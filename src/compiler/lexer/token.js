/**
 * Token Types and Token Representation for MiniLang Compiler.
 * 7th Semester B.Tech Computer Science - Principles of Compiler Design.
 */

export const TokenType = {
  // Keywords
  LET: 'LET',
  INT: 'INT',
  FLOAT: 'FLOAT',
  FN: 'FN',
  FUNCTION: 'FUNCTION',
  RETURN: 'RETURN',
  IF: 'IF',
  ELSE: 'ELSE',
  WHILE: 'WHILE',
  PRINT: 'PRINT',
  TRUE: 'TRUE',
  FALSE: 'FALSE',

  // Literals & Identifiers
  IDENTIFIER: 'IDENTIFIER',
  INT_LITERAL: 'INT_LITERAL',
  FLOAT_LITERAL: 'FLOAT_LITERAL',

  // Arithmetic Operators
  PLUS: '+',
  MINUS: '-',
  STAR: '*',
  SLASH: '/',
  PERCENT: '%',

  // Relational & Logical Operators
  EQUAL_EQUAL: '==',
  BANG_EQUAL: '!=',
  LESS: '<',
  GREATER: '>',
  LESS_EQUAL: '<=',
  GREATER_EQUAL: '>=',
  AND: '&&',
  OR: '||',
  BANG: '!',

  // Assignment & Delimiters
  ASSIGN: '=',
  SEMICOLON: ';',
  COMMA: ',',
  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',

  // End of file
  EOF: 'EOF'
};

export const KEYWORDS = {
  'let': TokenType.LET,
  'int': TokenType.INT,
  'float': TokenType.FLOAT,
  'fn': TokenType.FN,
  'function': TokenType.FUNCTION,
  'return': TokenType.RETURN,
  'if': TokenType.IF,
  'else': TokenType.ELSE,
  'while': TokenType.WHILE,
  'print': TokenType.PRINT,
  'true': TokenType.TRUE,
  'false': TokenType.FALSE
};

export class Token {
  constructor(type, value, line, column, length = 1) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
    this.length = length;
  }

  toString() {
    return `<${this.type}, "${this.value}", Line:${this.line}, Col:${this.column}>`;
  }
}

export class CompileError extends Error {
  constructor(message, loc = { line: 1, column: 1 }, kind = 'Syntax') {
    super(message);
    this.name = 'CompileError';
    this.message = message;
    this.kind = kind; // 'Lexical' | 'Syntax' | 'Semantic' | 'Runtime'
    this.line = loc?.line ?? 1;
    this.column = loc?.column ?? 1;
  }
}
