/**
 * Lexical Analyzer (Scanner) for MiniLang.
 * Converts source code characters into a linear stream of tokens.
 * Tracks line and column numbers for precise academic error reporting.
 */

import { Token, TokenType, KEYWORDS, CompileError } from './token.js';

export function lex(source) {
  const tokens = [];
  const errors = [];
  let i = 0;
  let line = 1;
  let column = 1;

  const advance = () => {
    const c = source[i++];
    if (c === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return c;
  };

  while (i < source.length) {
    const c = source[i];

    // 1. Whitespace
    if (/\s/.test(c)) {
      advance();
      continue;
    }

    // 2. Comments: Single-line (//)
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') {
        advance();
      }
      if (i < source.length) advance(); // consume newline
      continue;
    }

    // 3. Comments: Multi-line (/* ... */)
    if (c === '/' && source[i + 1] === '*') {
      const startLoc = { line, column };
      advance(); // consume '/'
      advance(); // consume '*'
      let closed = false;
      while (i < source.length) {
        if (source[i] === '*' && source[i + 1] === '/') {
          advance(); // consume '*'
          advance(); // consume '/'
          closed = true;
          break;
        }
        advance();
      }
      if (!closed) {
        errors.push(new CompileError('Unterminated block comment /* ... */', startLoc, 'Lexical'));
      }
      continue;
    }

    const startLoc = { line, column };
    const rest = source.slice(i);

    // 4. Numeric Literals: Floats and Integers
    const numMatch = /^(?:\d+\.\d+|\d+)(?:[eE][+-]?\d+)?/.exec(rest);
    if (numMatch) {
      const raw = numMatch[0];
      for (let n = 0; n < raw.length; n++) advance();
      const isFloat = /[.eE]/.test(raw);
      tokens.push(new Token(
        isFloat ? TokenType.FLOAT_LITERAL : TokenType.INT_LITERAL,
        raw,
        startLoc.line,
        startLoc.column,
        raw.length
      ));
      continue;
    }

    // 5. Identifiers and Keywords
    const idMatch = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (idMatch) {
      const id = idMatch[0];
      for (let n = 0; n < id.length; n++) advance();
      const kwType = KEYWORDS[id];
      if (kwType) {
        tokens.push(new Token(kwType, id, startLoc.line, startLoc.column, id.length));
      } else {
        tokens.push(new Token(TokenType.IDENTIFIER, id, startLoc.line, startLoc.column, id.length));
      }
      continue;
    }

    // 6. Multi-character Operators (==, !=, <=, >=, &&, ||)
    const multiOp = ['==', '!=', '<=', '>=', '&&', '||'].find(op => rest.startsWith(op));
    if (multiOp) {
      advance();
      advance();
      tokens.push(new Token(multiOp, multiOp, startLoc.line, startLoc.column, 2));
      continue;
    }

    // 7. Single-character Operators and Delimiters (+, -, *, /, %, <, >, !, =, ;, ,, (, ), {, })
    if ('+-*/%<>=!;:,(){}'.includes(c)) {
      advance();
      tokens.push(new Token(c, c, startLoc.line, startLoc.column, 1));
      continue;
    }

    // 8. Unrecognized / Invalid Character
    advance();
    errors.push(new CompileError(`Invalid character '${c}' in source`, startLoc, 'Lexical'));
  }

  tokens.push(new Token(TokenType.EOF, 'EOF', line, column, 0));
  return { tokens, errors };
}
