/**
 * Pseudo-Assembly Code Generator.
 * Lowers TAC instructions into readable target assembly mnemonics
 * using the registers assigned by graph coloring.
 */

export function generateAssembly(tac, allocation) {
  const { colors } = allocation;
  const out = [];

  const getLoc = (name) => {
    return colors[name] || name;
  };

  for (const line of tac) {
    // Label or function boundary
    if (/^[A-Za-z0-9_]+:$/.test(line)) {
      out.push(line);
      continue;
    }
    if (line.startsWith('func_begin')) {
      out.push(`\n; === ${line} ===`);
      continue;
    }
    if (line.startsWith('func_end')) {
      out.push(`; === ${line} ===\n`);
      continue;
    }

    // Binary operation: "t1 = a + b"
    let match = /^(\w+) = (\w+) ([+\-*/%]) (\w+)$/.exec(line);
    if (match) {
      const dest = getLoc(match[1]);
      const op1 = getLoc(match[2]);
      const op = match[3];
      const op2 = getLoc(match[4]);
      const opMap = { '+': 'ADD', '-': 'SUB', '*': 'MUL', '/': 'DIV', '%': 'REM' };
      out.push(`  MOV  ${dest}, ${op1}`);
      out.push(`  ${opMap[op] || 'OP'}  ${dest}, ${op2}`);
      continue;
    }

    // Copy / Assignment: "t1 = 42" or "a = t1"
    match = /^(\w+) = (.+)$/.exec(line);
    if (match) {
      const dest = getLoc(match[1]);
      const src = getLoc(match[2]);
      out.push(`  MOV  ${dest}, ${src}`);
      continue;
    }

    // Branching: "if_false t1 goto L2"
    match = /^if_false (\w+) goto (\w+)$/.exec(line);
    if (match) {
      const cond = getLoc(match[1]);
      out.push(`  CMP  ${cond}, 0`);
      out.push(`  JE   ${match[2]}`);
      continue;
    }

    // Unconditional jump: "goto L1"
    match = /^goto (\w+)$/.exec(line);
    if (match) {
      out.push(`  JMP  ${match[1]}`);
      continue;
    }

    // Print
    match = /^print (.+)$/.exec(line);
    if (match) {
      const val = getLoc(match[1]);
      out.push(`  PUSH ${val}`);
      out.push(`  CALL sys_print`);
      continue;
    }

    // Call
    match = /^(\w+) = call (\w+),\s*(\d+)$/.exec(line);
    if (match) {
      const dest = getLoc(match[1]);
      out.push(`  CALL ${match[2]}`);
      out.push(`  MOV  ${dest}, RET_REG`);
      continue;
    }

    // Param
    match = /^param (.+)$/.exec(line);
    if (match) {
      out.push(`  PUSH ${getLoc(match[1])}`);
      continue;
    }

    // Return
    match = /^return(?:\s+(.+))?$/.exec(line);
    if (match) {
      if (match[1]) out.push(`  MOV  RET_REG, ${getLoc(match[1])}`);
      out.push(`  RET`);
      continue;
    }

    out.push(`  ${line}`);
  }

  return out.join('\n');
}
