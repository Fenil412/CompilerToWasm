/**
 * Recursive-Descent Syntax Analyzer (Parser) with Panic-Mode Error Recovery.
 * Builds a typed Abstract Syntax Tree (AST) conforming to MiniLang's EBNF grammar.
 */

import { TokenType, CompileError } from '../lexer/token.js';
import { NodeKind } from './astNodes.js';

export function parse(tokens) {
  let current = 0;
  const errors = [];

  const peek = () => tokens[current] || tokens[tokens.length - 1];
  const previous = () => tokens[current - 1] || tokens[0];
  const isAtEnd = () => peek().type === TokenType.EOF;

  const check = (...types) => {
    if (isAtEnd()) return false;
    return types.includes(peek().type);
  };

  const advance = () => {
    if (!isAtEnd()) current++;
    return previous();
  };

  const match = (...types) => {
    for (const type of types) {
      if (check(type)) {
        advance();
        return true;
      }
    }
    return false;
  };

  const consume = (type, message) => {
    if (check(type)) return advance();
    throw new CompileError(message, peek(), 'Syntax');
  };

  // Synchronization for panic-mode error recovery
  const synchronize = () => {
    advance();
    while (!isAtEnd()) {
      if (previous().type === TokenType.SEMICOLON) return;
      if (check(
        TokenType.LET, TokenType.INT, TokenType.FLOAT,
        TokenType.FN, TokenType.FUNCTION,
        TokenType.IF, TokenType.WHILE, TokenType.PRINT,
        TokenType.RETURN, TokenType.RBRACE
      )) {
        return;
      }
      advance();
    }
  };

  // --- Expressions Parsing (Precedence Climbing) ---

  const primary = () => {
    if (match(TokenType.INT_LITERAL)) {
      const tok = previous();
      return {
        kind: NodeKind.NUMERIC_LITERAL,
        value: parseInt(tok.value, 10),
        raw: tok.value,
        numType: 'int',
        loc: { line: tok.line, column: tok.column }
      };
    }

    if (match(TokenType.FLOAT_LITERAL)) {
      const tok = previous();
      return {
        kind: NodeKind.NUMERIC_LITERAL,
        value: parseFloat(tok.value),
        raw: tok.value,
        numType: 'float',
        loc: { line: tok.line, column: tok.column }
      };
    }

    if (match(TokenType.TRUE)) {
      const tok = previous();
      return {
        kind: NodeKind.BOOLEAN_LITERAL,
        value: true,
        loc: { line: tok.line, column: tok.column }
      };
    }

    if (match(TokenType.FALSE)) {
      const tok = previous();
      return {
        kind: NodeKind.BOOLEAN_LITERAL,
        value: false,
        loc: { line: tok.line, column: tok.column }
      };
    }

    if (match(TokenType.IDENTIFIER)) {
      const tok = previous();
      // Check if it's a function call: identifier '(' ... ')'
      if (match(TokenType.LPAREN)) {
        const args = [];
        if (!check(TokenType.RPAREN)) {
          do {
            args.push(expression());
          } while (match(TokenType.COMMA));
        }
        consume(TokenType.RPAREN, "Expected ')' after function arguments.");
        return {
          kind: NodeKind.CALL_EXPR,
          callee: tok.value,
          args,
          loc: { line: tok.line, column: tok.column }
        };
      }
      return {
        kind: NodeKind.IDENTIFIER,
        name: tok.value,
        loc: { line: tok.line, column: tok.column }
      };
    }

    if (match(TokenType.LPAREN)) {
      const startLoc = { line: previous().line, column: previous().column };
      const expr = expression();
      consume(TokenType.RPAREN, "Expected ')' after expression.");
      return expr;
    }

    throw new CompileError(
      `Unexpected token '${peek().value}'. Expected a number, identifier, or '(' expression.`,
      peek(),
      'Syntax'
    );
  };

  const unary = () => {
    if (match(TokenType.MINUS, TokenType.BANG)) {
      const opTok = previous();
      const arg = unary();
      return {
        kind: NodeKind.UNARY_EXPR,
        op: opTok.value,
        argument: arg,
        loc: { line: opTok.line, column: opTok.column }
      };
    }
    return primary();
  };

  const multiplicative = () => {
    let expr = unary();
    while (match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const opTok = previous();
      const right = unary();
      expr = {
        kind: NodeKind.BINARY_EXPR,
        op: opTok.value,
        left: expr,
        right,
        loc: { line: opTok.line, column: opTok.column }
      };
    }
    return expr;
  };

  const additive = () => {
    let expr = multiplicative();
    while (match(TokenType.PLUS, TokenType.MINUS)) {
      const opTok = previous();
      const right = multiplicative();
      expr = {
        kind: NodeKind.BINARY_EXPR,
        op: opTok.value,
        left: expr,
        right,
        loc: { line: opTok.line, column: opTok.column }
      };
    }
    return expr;
  };

  const relational = () => {
    let expr = additive();
    while (match(TokenType.LESS, TokenType.LESS_EQUAL, TokenType.GREATER, TokenType.GREATER_EQUAL)) {
      const opTok = previous();
      const right = additive();
      expr = {
        kind: NodeKind.BINARY_EXPR,
        op: opTok.value,
        left: expr,
        right,
        loc: { line: opTok.line, column: opTok.column }
      };
    }
    return expr;
  };

  const equality = () => {
    let expr = relational();
    while (match(TokenType.EQUAL_EQUAL, TokenType.BANG_EQUAL)) {
      const opTok = previous();
      const right = relational();
      expr = {
        kind: NodeKind.BINARY_EXPR,
        op: opTok.value,
        left: expr,
        right,
        loc: { line: opTok.line, column: opTok.column }
      };
    }
    return expr;
  };

  const logicalAnd = () => {
    let expr = equality();
    while (match(TokenType.AND)) {
      const opTok = previous();
      const right = equality();
      expr = {
        kind: NodeKind.LOGICAL_EXPR,
        op: '&&',
        left: expr,
        right,
        loc: { line: opTok.line, column: opTok.column }
      };
    }
    return expr;
  };

  const logicalOr = () => {
    let expr = logicalAnd();
    while (match(TokenType.OR)) {
      const opTok = previous();
      const right = logicalAnd();
      expr = {
        kind: NodeKind.LOGICAL_EXPR,
        op: '||',
        left: expr,
        right,
        loc: { line: opTok.line, column: opTok.column }
      };
    }
    return expr;
  };

  const expression = () => logicalOr();

  // --- Statements Parsing ---

  const blockStatement = () => {
    const startTok = previous();
    const body = [];
    while (!check(TokenType.RBRACE) && !isAtEnd()) {
      const stmt = statement();
      if (stmt) body.push(stmt);
    }
    consume(TokenType.RBRACE, "Expected '}' at end of block.");
    return {
      kind: NodeKind.BLOCK_STATEMENT,
      body,
      loc: { line: startTok.line, column: startTok.column }
    };
  };

  const varDeclaration = () => {
    const typeTok = previous();
    const idTok = consume(TokenType.IDENTIFIER, 'Expected variable name in declaration.');
    let init = null;
    if (match(TokenType.ASSIGN)) {
      init = expression();
    }
    consume(TokenType.SEMICOLON, "Expected ';' after variable declaration.");
    return {
      kind: NodeKind.VAR_DECLARATION,
      varType: typeTok.value,
      name: idTok.value,
      init,
      loc: { line: typeTok.line, column: typeTok.column }
    };
  };

  const functionDeclaration = () => {
    const fnTok = previous();
    const nameTok = consume(TokenType.IDENTIFIER, 'Expected function name after fn/function.');
    consume(TokenType.LPAREN, "Expected '(' after function name.");
    const params = [];
    if (!check(TokenType.RPAREN)) {
      do {
        const paramTok = consume(TokenType.IDENTIFIER, 'Expected parameter name.');
        params.push(paramTok.value);
      } while (match(TokenType.COMMA));
    }
    consume(TokenType.RPAREN, "Expected ')' after parameter list.");
    consume(TokenType.LBRACE, "Expected '{' to begin function body.");
    const body = blockStatement();
    return {
      kind: NodeKind.FN_DECLARATION,
      name: nameTok.value,
      params,
      body,
      loc: { line: fnTok.line, column: fnTok.column }
    };
  };

  const returnStatement = () => {
    const retTok = previous();
    let value = null;
    if (!check(TokenType.SEMICOLON)) {
      value = expression();
    }
    consume(TokenType.SEMICOLON, "Expected ';' after return value.");
    return {
      kind: NodeKind.RETURN_STATEMENT,
      value,
      loc: { line: retTok.line, column: retTok.column }
    };
  };

  const printStatement = () => {
    const printTok = previous();
    consume(TokenType.LPAREN, "Expected '(' after 'print'.");
    const value = expression();
    consume(TokenType.RPAREN, "Expected ')' after print argument.");
    consume(TokenType.SEMICOLON, "Expected ';' after print statement.");
    return {
      kind: NodeKind.PRINT_STATEMENT,
      value,
      loc: { line: printTok.line, column: printTok.column }
    };
  };

  const ifStatement = () => {
    const ifTok = previous();
    consume(TokenType.LPAREN, "Expected '(' after 'if'.");
    const test = expression();
    consume(TokenType.RPAREN, "Expected ')' after if condition.");
    const consequent = statement();
    let alternate = null;
    if (match(TokenType.ELSE)) {
      alternate = statement();
    }
    return {
      kind: NodeKind.IF_STATEMENT,
      test,
      consequent,
      alternate,
      loc: { line: ifTok.line, column: ifTok.column }
    };
  };

  const whileStatement = () => {
    const whileTok = previous();
    consume(TokenType.LPAREN, "Expected '(' after 'while'.");
    const test = expression();
    consume(TokenType.RPAREN, "Expected ')' after while condition.");
    const body = statement();
    return {
      kind: NodeKind.WHILE_STATEMENT,
      test,
      body,
      loc: { line: whileTok.line, column: whileTok.column }
    };
  };

  const statement = () => {
    try {
      if (match(TokenType.LET, TokenType.INT, TokenType.FLOAT)) {
        return varDeclaration();
      }
      if (match(TokenType.FN, TokenType.FUNCTION)) {
        return functionDeclaration();
      }
      if (match(TokenType.RETURN)) {
        return returnStatement();
      }
      if (match(TokenType.PRINT)) {
        return printStatement();
      }
      if (match(TokenType.IF)) {
        return ifStatement();
      }
      if (match(TokenType.WHILE)) {
        return whileStatement();
      }
      if (match(TokenType.LBRACE)) {
        return blockStatement();
      }

      // Assignment or Expression statement
      if (check(TokenType.IDENTIFIER) && tokens[current + 1]?.type === TokenType.ASSIGN) {
        const idTok = advance();
        advance(); // consume '='
        const val = expression();
        consume(TokenType.SEMICOLON, "Expected ';' after assignment.");
        return {
          kind: NodeKind.ASSIGNMENT,
          name: idTok.value,
          value: val,
          loc: { line: idTok.line, column: idTok.column }
        };
      }

      // Expression statement (e.g., function call `add(1, 2);`)
      const expr = expression();
      consume(TokenType.SEMICOLON, "Expected ';' after expression.");
      return {
        kind: NodeKind.EXPR_STATEMENT,
        expr,
        loc: expr.loc
      };
    } catch (err) {
      errors.push(err);
      synchronize();
      return null;
    }
  };

  // --- Program Parsing ---
  const body = [];
  while (!isAtEnd()) {
    const stmt = statement();
    if (stmt) body.push(stmt);
  }

  const ast = {
    kind: NodeKind.PROGRAM,
    body,
    loc: { line: 1, column: 1 }
  };

  return { ast, errors };
}
