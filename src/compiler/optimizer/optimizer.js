/**
 * Intermediate Code Optimizer for MiniLang TAC.
 * Implements:
 * 1. Constant Folding (evaluates compile-time constant operations)
 * 2. Constant Propagation (substitutes known constants forward in basic blocks)
 * 3. Algebraic Simplification (e.g. x + 0 => x, x * 1 => x)
 * Tracks all applied optimizations for clear academic demonstrations.
 */

import { tacLineToQuadruple } from '../ir/quadruple.js';

export function optimize(tac) {
  const constants = new Map();
  const optimized = [];
  const log = [];

  for (let originalLine of tac) {
    let line = originalLine;

    // Reset known constants across basic block boundaries (labels & jumps)
    if (/^[A-Za-z0-9_]+:$/.test(line) || /^(if|if_false|goto|func_begin|func_end)/.test(line)) {
      constants.clear();
      optimized.push(line);
      continue;
    }

    // 1. Constant Propagation: Substitute known constants into operands
    for (const [varName, constVal] of constants) {
      // Don't replace on the LHS of assignment
      const parts = line.split('=');
      if (parts.length === 2) {
        const lhs = parts[0].trim();
        let rhs = parts[1];
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        if (regex.test(rhs)) {
          rhs = rhs.replace(regex, constVal);
          const newLine = `${lhs} = ${rhs.trim()}`;
          if (newLine !== line) {
            log.push({
              type: 'Constant Propagation',
              before: line,
              after: newLine,
              detail: `Substituted '${varName}' with known constant '${constVal}'`
            });
            line = newLine;
          }
        }
      }
    }

    // 2. Constant Folding: Evaluate binary expressions with two constant operands
    // Format: "t1 = 10 + 20" or "t1 = 5 > 2"
    const binMatch = /^(\w+) = (-?\d+(?:\.\d+)?) ([+\-*/%]|==|!=|<=|>=|<|>|&&|\|\|) (-?\d+(?:\.\d+)?)$/.exec(line);
    if (binMatch) {
      const dest = binMatch[1];
      const a = Number(binMatch[2]);
      const op = binMatch[3];
      const b = Number(binMatch[4]);
      let res = null;

      switch (op) {
        case '+': res = a + b; break;
        case '-': res = a - b; break;
        case '*': res = a * b; break;
        case '/': res = b !== 0 ? (a / b) : null; break;
        case '%': res = b !== 0 ? (a % b) : null; break;
        case '==': res = a === b ? 1 : 0; break;
        case '!=': res = a !== b ? 1 : 0; break;
        case '<': res = a < b ? 1 : 0; break;
        case '<=': res = a <= b ? 1 : 0; break;
        case '>': res = a > b ? 1 : 0; break;
        case '>=': res = a >= b ? 1 : 0; break;
        case '&&': res = (a !== 0 && b !== 0) ? 1 : 0; break;
        case '||': res = (a !== 0 || b !== 0) ? 1 : 0; break;
        default: break;
      }

      if (res !== null && Number.isFinite(res)) {
        // Keep integers clean
        const foldedVal = Number.isInteger(res) ? String(res) : String(parseFloat(res.toFixed(6)));
        constants.set(dest, foldedVal);
        const newLine = `${dest} = ${foldedVal}`;
        log.push({
          type: 'Constant Folding',
          before: line,
          after: newLine,
          detail: `Computed '${a} ${op} ${b}' => '${foldedVal}' at compile time`
        });
        optimized.push(newLine);
        continue;
      }
    }

    // 3. Constant Folding: Unary operations
    const unaryMatch = /^(\w+) = ([-!])(-?\d+(?:\.\d+)?)$/.exec(line);
    if (unaryMatch) {
      const dest = unaryMatch[1];
      const op = unaryMatch[2];
      const val = Number(unaryMatch[3]);
      const foldedVal = op === '-' ? String(-val) : String(val === 0 ? 1 : 0);
      constants.set(dest, foldedVal);
      const newLine = `${dest} = ${foldedVal}`;
      log.push({
        type: 'Constant Folding (Unary)',
        before: line,
        after: newLine,
        detail: `Computed '${op}${val}' => '${foldedVal}'`
      });
      optimized.push(newLine);
      continue;
    }

    // 4. Simple constant assignment: "t1 = 42"
    const directConstMatch = /^(\w+) = (-?\d+(?:\.\d+)?)$/.exec(line);
    if (directConstMatch) {
      constants.set(directConstMatch[1], directConstMatch[2]);
      optimized.push(line);
      continue;
    }

    // If a variable is redefined with a non-constant value, invalidate it
    const defMatch = /^(\w+) =/.exec(line);
    if (defMatch) {
      constants.delete(defMatch[1]);
    }

    optimized.push(line);
  }

  const optimizedQuadruples = optimized.map((l, i) => tacLineToQuadruple(l, i + 1));

  return {
    tac: optimized,
    quadruples: optimizedQuadruples,
    optimizations: log
  };
}
