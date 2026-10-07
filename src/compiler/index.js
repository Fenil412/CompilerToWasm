/**
 * MiniLang Compiler Pipeline Orchestrator.
 * Connects all major compiler design phases:
 * Source -> Lexer -> Parser -> Semantic Analyzer -> TAC IR -> Optimizer ->
 * Register Allocator -> Target Lowering -> WebAssembly Text Generation -> Runtime
 */

import { lex } from './lexer/lexer.js';
import { parse } from './parser/parser.js';
import { EBNF_GRAMMAR } from './parser/grammar.js';
import { analyze } from './semantic/analyzer.js';
import { generateTac } from './ir/tacGenerator.js';
import { optimize } from './optimizer/optimizer.js';
import { allocateRegisters } from './codegen/registerAllocator.js';
import { generateAssembly } from './codegen/assemblyGenerator.js';
import { emitWat } from './codegen/watGenerator.js';
import { runWasm } from './runtime/wasmRunner.js';

export { EBNF_GRAMMAR as grammar };
export { runWasm as runWat };

export function compile(source) {
  // Phase 1: Lexical Analysis
  const { tokens, errors: lexErrors } = lex(source);

  // Phase 2: Syntax Analysis & AST Generation
  const { ast, errors: syntaxErrors } = parse(tokens);

  // Phase 3: Semantic Analysis & Symbol Table Generation
  const semantic = analyze(ast);

  // Collect all compiler diagnostics across phases
  const allErrors = [
    ...lexErrors,
    ...syntaxErrors,
    ...semantic.errors
  ];

  const valid = allErrors.length === 0;

  // Phase 4: Intermediate Code Generation (Three-Address Code & Quadruples)
  const ir = valid ? generateTac(ast) : { tac: [], quadruples: [] };

  // Phase 5: Code Optimization (Constant Folding & Propagation)
  const opt = valid ? optimize(ir.tac) : { tac: [], quadruples: [], optimizations: [] };

  // Phase 6: Register Allocation (Liveness Analysis & Graph Coloring)
  const allocation = valid
    ? allocateRegisters(opt.tac, 4)
    : { variables: [], edges: {}, colors: {}, registerCount: 4, liveRanges: {}, spillCount: 0 };

  // Target Lowering: Pseudo-Assembly
  const assembly = valid ? generateAssembly(opt.tac, allocation) : '';

  // Phase 7: WebAssembly Code Generation (WAT)
  const wasmTarget = valid ? emitWat(ast) : { wat: '', globalNames: [] };

  return {
    tokens: tokens.filter(t => t.type !== 'EOF'),
    ast,
    symbols: semantic.symbols,
    errors: allErrors,
    tac: ir.tac,
    quadruples: ir.quadruples,
    optimized: opt.tac,
    optimizedQuadruples: opt.quadruples,
    optimizations: opt.optimizations,
    allocation,
    assembly,
    wat: wasmTarget.wat,
    valid,
    grammar: EBNF_GRAMMAR
  };
}
