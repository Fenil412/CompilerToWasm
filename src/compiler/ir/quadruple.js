/**
 * Quadruple representation of Intermediate Code.
 * Standard textbook format: (op, arg1, arg2, result).
 */

export class Quadruple {
  constructor(op, arg1 = null, arg2 = null, result = null, id = 0) {
    this.id = id;
    this.op = op;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.result = result;
  }

  toString() {
    const a1 = this.arg1 !== null ? String(this.arg1) : '-';
    const a2 = this.arg2 !== null ? String(this.arg2) : '-';
    const res = this.result !== null ? String(this.result) : '-';
    return `(${this.op}, ${a1}, ${a2}, ${res})`;
  }
}

/**
 * Converts a linear TAC instruction line into a Quadruple object.
 */
export function tacLineToQuadruple(line, index) {
  // Label definition: "L1:"
  if (/^([A-Za-z0-9_]+):$/.test(line)) {
    const label = line.replace(':', '');
    return new Quadruple('LABEL', null, null, label, index);
  }

  // Binary assignment: "t1 = a + b"
  let match = /^(\w+) = (.+) ([+\-*/%]|==|!=|<=|>=|<|>|&&|\|\|) (.+)$/.exec(line);
  if (match) {
    return new Quadruple(match[3], match[2], match[4], match[1], index);
  }

  // Unary assignment: "t1 = -a" or "t1 = !a"
  match = /^(\w+) = ([-!])(.+)$/.exec(line);
  if (match) {
    return new Quadruple(match[2], match[3], null, match[1], index);
  }

  // Simple copy: "t1 = 42" or "a = t1"
  match = /^(\w+) = (.+)$/.exec(line);
  if (match) {
    return new Quadruple('ASSIGN', match[2], null, match[1], index);
  }

  // Conditional jump: "if_false t1 goto L2"
  match = /^if_false (\w+) goto (\w+)$/.exec(line);
  if (match) {
    return new Quadruple('IF_FALSE', match[1], null, match[2], index);
  }

  // Conditional jump: "if t1 goto L2"
  match = /^if (\w+) goto (\w+)$/.exec(line);
  if (match) {
    return new Quadruple('IF_TRUE', match[1], null, match[2], index);
  }

  // Unconditional jump: "goto L2"
  match = /^goto (\w+)$/.exec(line);
  if (match) {
    return new Quadruple('GOTO', null, null, match[1], index);
  }

  // Param: "param x"
  match = /^param (.+)$/.exec(line);
  if (match) {
    return new Quadruple('PARAM', match[1], null, null, index);
  }

  // Call with assignment: "t1 = call add, 2"
  match = /^(\w+) = call (\w+),\s*(\d+)$/.exec(line);
  if (match) {
    return new Quadruple('CALL', match[2], match[3], match[1], index);
  }

  // Return: "return x"
  match = /^return(?:\s+(.+))?$/.exec(line);
  if (match) {
    return new Quadruple('RETURN', match[1] || null, null, null, index);
  }

  // Print: "print x"
  match = /^print (.+)$/.exec(line);
  if (match) {
    return new Quadruple('PRINT', match[1], null, null, index);
  }

  // Function boundaries
  match = /^func_begin (\w+)$/.exec(line);
  if (match) return new Quadruple('FUNC_BEGIN', match[1], null, null, index);

  match = /^func_end (\w+)$/.exec(line);
  if (match) return new Quadruple('FUNC_END', match[1], null, null, index);

  return new Quadruple('INSTRUCTION', line, null, null, index);
}
