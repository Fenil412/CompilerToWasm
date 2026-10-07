/**
 * Register Allocation via Graph Coloring (Chaitin-Briggs model).
 * Performs backward liveness analysis, constructs an Interference Graph,
 * and assigns colors (K physical registers) or spills to memory.
 */

export function allocateRegisters(tac, k = 4) {
  const vars = new Set();
  const liveRanges = new Map();
  const edges = new Map();

  // 1. Collect all variable and temporary names
  for (const line of tac) {
    const lhs = line.match(/^(\w+) =/);
    const ids = line.match(/\b(?:t\d+|[A-Za-z_]\w*)\b/g) || [];
    for (const v of [...ids, ...(lhs ? [lhs[1]] : [])]) {
      if (!/^L\d+$/.test(v) && !['if', 'if_false', 'goto', 'print', 'param', 'call', 'return', 'func_begin', 'func_end'].includes(v)) {
        vars.add(v);
      }
    }
  }

  // 2. Identify def and use sets for each instruction line
  const lines = tac.map((text, i) => {
    const defMatch = text.match(/^(\w+) =/);
    const def = defMatch ? defMatch[1] : null;

    let usePart = '';
    if (text.includes('=')) {
      usePart = text.split('=')[1] || '';
    } else if (text.startsWith('if') || text.startsWith('print') || text.startsWith('param') || text.startsWith('return')) {
      usePart = text;
    }
    const uses = (usePart.match(/\b(?:t\d+|[A-Za-z_]\w*)\b/g) || []).filter(u => vars.has(u));

    return { text, i, def, uses };
  });

  // 3. Backward Liveness Analysis & Interference Graph construction
  let currentLive = new Set();
  for (let i = lines.length - 1; i >= 0; i--) {
    const { def, uses } = lines[i];

    if (def && vars.has(def)) {
      if (!liveRanges.has(def)) liveRanges.set(def, []);
      liveRanges.get(def).push(i);

      if (!edges.has(def)) edges.set(def, new Set());
      for (const liveVar of currentLive) {
        if (liveVar !== def) {
          edges.get(def).add(liveVar);
          if (!edges.has(liveVar)) edges.set(liveVar, new Set());
          edges.get(liveVar).add(def);
        }
      }
      currentLive.delete(def);
    }

    uses.forEach(u => {
      currentLive.add(u);
      if (!liveRanges.has(u)) liveRanges.set(u, []);
      liveRanges.get(u).push(i);
      if (!edges.has(u)) edges.set(u, new Set());
    });
  }

  // 4. Greedy Graph Coloring with K registers (R1, R2, ..., Rk)
  const colors = {};
  const sortedVars = [...vars].sort((a, b) => {
    const degA = edges.get(a)?.size || 0;
    const degB = edges.get(b)?.size || 0;
    return degB - degA; // Highest degree first heuristic
  });

  let spillCount = 0;
  for (const v of sortedVars) {
    const neighborColors = new Set(
      [...(edges.get(v) || [])]
        .map(n => colors[n])
        .filter(Boolean)
    );

    let regIdx = 1;
    while (neighborColors.has(`R${regIdx}`) && regIdx <= k) {
      regIdx++;
    }

    if (regIdx <= k) {
      colors[v] = `R${regIdx}`;
    } else {
      colors[v] = `MEM[${v}]`; // Spill
      spillCount++;
    }
  }

  return {
    variables: [...vars],
    edges: Object.fromEntries([...edges].map(([k, set]) => [k, [...set]])),
    colors,
    registerCount: k,
    liveRanges: Object.fromEntries(liveRanges),
    spillCount
  };
}
