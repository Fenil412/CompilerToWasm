/**
 * Symbol Table implementation with Lexical Scope hierarchy.
 * Tracks identifier metadata: name, kind (var/fn/param), type, scope, address slot, and line.
 */

export class Symbol {
  constructor(name, kind, type, scope, line, address = 0, arity = null) {
    this.name = name;
    this.kind = kind; // 'variable' | 'function' | 'parameter'
    this.type = type; // 'int' | 'float' | 'bool' | 'any'
    this.scope = scope; // 'global' | 'fn:<name>'
    this.line = line;
    this.address = address; // storage slot index
    this.arity = arity; // argument count for functions
  }
}

export class Scope {
  constructor(name, parent = null) {
    this.name = name;
    this.parent = parent;
    this.symbols = new Map();
  }

  define(symbol) {
    this.symbols.set(symbol.name, symbol);
  }

  resolve(name) {
    if (this.symbols.has(name)) {
      return this.symbols.get(name);
    }
    if (this.parent) {
      return this.parent.resolve(name);
    }
    return null;
  }

  hasLocal(name) {
    return this.symbols.has(name);
  }
}
