# Design and Implementation of a Mini Compiler with WebAssembly Code Generation

**Course:** Principles of Compiler Design  
**Course code:** 4CS501CC25  
**Programme:** B.Tech Computer Science and Engineering, Semester VII

## Abstract

This project implements an educational compiler for MiniLang and demonstrates the principal stages of a compiler: lexical analysis, symbol-table construction, syntax analysis, error recovery, semantic checks, intermediate-code generation, optimization, register allocation, target-code generation, and execution. The compiler derives its artifacts from the entered source program. A recursive-descent parser creates an abstract syntax tree (AST); semantic checks validate declarations and types; a three-address-code (TAC) generator lowers expressions and control flow; constant folding and propagation optimize TAC; and a liveness analysis constructs an interference graph for greedy graph coloring. The project also emits pseudo-assembly and dynamically generates WebAssembly Text (WAT) from the validated AST. The browser compiles this WAT to a Wasm module and executes it using the WebAssembly API. The implementation is a practical learning model, not a Flex/YACC-generated compiler.

## 1. Introduction

A compiler translates a source language into a target representation while checking whether the program follows the language's rules. Its stages separate concerns: the lexer recognizes tokens, the parser checks grammatical structure, semantic analysis checks meaning, and later stages transform the program into a target form. MiniLang is intentionally small so that students can inspect each transformation and relate it to Principles of Compiler Design practical work.

## 2. Problem statement

Students often encounter compiler stages as separate exercises, making it difficult to see how tokens, syntax trees, intermediate representations, optimization and machine execution fit together. The project addresses this by connecting a small language implementation into an interactive, inspectable compilation pipeline.

## 3. Objectives

1. Recognize language tokens and report invalid characters with source locations.
2. Build a symbol table and detect duplicate or undeclared names.
3. Parse declarations, assignments, arithmetic, conditionals, loops, blocks and print statements into an AST.
4. Recover from syntax errors and continue at statement boundaries.
5. Check basic source-level types and assignments.
6. Generate TAC, optimize constants, build liveness/interference data and color the graph.
7. Produce illustrative pseudo-assembly and dynamic WAT, then execute Wasm in a browser.
8. Provide visible compiler stages that support practical demonstrations and viva discussion.

## 4. Existing and proposed systems

In a conventional practical sequence, a lexer, parser, semantic checker and code generator are often implemented separately. The proposed learning system links those stages through explicit data structures. A token list feeds the parser; the AST feeds semantic analysis, TAC and WAT; optimized TAC feeds liveness and pseudo-assembly. The same source is used throughout, preventing canned outputs from obscuring the pipeline.

## 5. Innovation, scope and limitations

The educational extension is browser-side WebAssembly as a target alongside syllabus concepts. Students can inspect both a conventional intermediate representation and an executable target. The scope is a compact imperative subset with scalar `int`/`float` declarations, arithmetic, comparisons, `if`/`else`, `while`, blocks and `print`. It does not implement functions, nested lexical scope, arrays, a production ABI, or Flex/Bison generated artifacts. The handwritten lexer and parser teach the same concepts but are not Lex/Flex or YACC/Bison tools.

## 6. System architecture and pipeline

```text
MiniLang source → lexer/token locations → parser/AST → symbol table + semantic checks
  → TAC → constant folding/propagation → liveness/interference/coloring
  → pseudo-assembly                         AST → WAT → wabt binary → browser Wasm
```

The compiler stops before code generation when lexical, syntax or semantic errors are present. The UI presents tokens, symbol table, AST, errors, original/optimized TAC, interference data, registers, assembly, WAT and execution output.

## 7. Lexical analysis

The scanner uses regular expressions for identifiers and numeric literals and explicit longest-match recognition for multi-character operators (`==`, `!=`, `<=`, `>=`, `&&`, `||`). It recognizes keywords, arithmetic and relational operators, assignment, delimiters, braces and parentheses. Line comments and block comments are discarded. Every token records a line and column; invalid characters and unterminated block comments become lexical diagnostics. The implementation is a JavaScript lexer demonstrating Lex/Flex concepts rather than a generated Flex scanner.

## 8. Symbol table

The semantic pass records identifier, source type, simulated address, scope label and declaration line. The current subset has global scope, represented by the `global` scope label. A name map supports declaration and use checks. A second declaration of the same name is reported with its source position.

## 9. CFG, parser and AST

The grammar is included in `README.md`. A recursive-descent parser consumes the actual lexer token array. Precedence functions encode primary/unary, multiplication/division/remainder, and addition/subtraction; conditions accept one relational operator. Statement productions cover declarations, assignments, print, blocks, if/else and while. The parser constructs typed AST nodes carrying source locations. Thus the CFG defines legal forms, the parser recognizes those forms, and the AST captures their hierarchical meaning without punctuation noise.

## 10. Syntax error recovery

On a syntax error, the parser records an error kind, line, column and message, then skips tokens to a synchronization point (`;`, `}`, or EOF). It can therefore parse subsequent statements where practical. Recovery is panic-mode recovery; it favors a clear next boundary over attempting speculative repairs.

## 11. Semantic analysis

The semantic visitor uses the AST and symbol table to detect undeclared reads/assignments, redeclarations, incompatible initializers and assignments, and incompatible operand types. It reports source lines and columns. This teaching implementation uses global declarations and a simple numeric compatibility rule; it is not a complete type system.

## 12. Three-address code

Arithmetic expressions are evaluated into generated temporaries in precedence order. Assignments copy the final value to a destination. Labels and conditional/unconditional jumps represent `if`, `if/else` and `while`; `print` becomes an explicit TAC operation. For `a = b + c * d`, the generator emits `t1 = c * d`, `t2 = b + t1`, `a = t2`.

## 13. Optimization

The optimizer performs constant folding and forward constant propagation on TAC assignments. For example, `t1 = 20 * 2`, `t2 = 10 + t1`, `a = t2` can become `a = 50`. The interface presents optimized TAC separately so the transformation can be compared with its input. This is a local teaching optimizer and does not attempt general data-flow fixed points across branches.

## 14. Register allocation and graph coloring

The allocator approximates variable live ranges by scanning TAC backward. A value is live from its definitions/uses in the instruction stream; simultaneously live values are connected in an interference graph. A greedy degree-ordered coloring assigns one of four registers where possible and marks excess assignments as conceptual spills. The register table, neighbor map and live positions are exposed to the student. `getreg` is represented by selecting an available color; a production allocator would account for basic-block control flow, calling conventions and spill code.

## 15. Assembly code generation

The simplified target stage maps TAC arithmetic and copies to illustrative `LOAD`, arithmetic, and `STORE` instructions using assigned register labels. Labels and jumps pass through in TAC form. This output demonstrates the connection from intermediate code to target instructions but is not assembled or executed.

## 16. WebAssembly code generation and execution

The WAT emitter traverses the validated AST, declares dynamic mutable globals for source variables, translates expressions and structured control flow, and exports a `run` function. Printing uses an imported `env.print` callback. The `wabt` package parses WAT and creates Wasm bytes at run time; the browser `WebAssembly.instantiate` API executes the module and captures output. Numeric globals use `f64`; source-level type checks remain a separate compiler concern.

## 17. Implementation and operation

The app uses React and Vite. Install dependencies with `npm install` and start with `npm run dev`. Choose an example or enter MiniLang code, compile to inspect artifacts, and run a valid program to execute its generated Wasm. Source implementation is under `src/compiler.js`; the interface is in `src/App.jsx`.

## 18. Test programs and expected demonstrations

Each row's token stream, symbol table, AST, TAC, optimized TAC, registers and WAT are generated dynamically by selecting the matching sample in the IDE. Invalid examples intentionally stop after diagnostics.

| # | Input program (MiniLang) | Expected outcome |
|---|---|---|
| 1 Basic arithmetic | `int a; int b; a=10; b=a+20; print(b);` | Executes and prints 30 |
| 2 Declarations | `int x; float y; x=4; y=2.5; print(y);` | Two symbol entries; prints 2.5 |
| 3 If | `int n; n=8; if(n>3) print(n);` | Conditional TAC; prints 8 |
| 4 If/else | `int n; n=2; if(n>3) print(9); else print(n);` | Both branches represented; prints 2 |
| 5 While | `int i; i=1; while(i<=3){print(i); i=i+1;}` | Loop TAC; prints 1, 2, 3 |
| 6 Nested expression | `int x; x=(3+4)*(8-2); print(x);` | Precedence temporaries; prints 42 |
| 7 Undeclared | `int a; b=10;` | Semantic undeclared-variable diagnostic |
| 8 Redeclaration | `int x; float x;` | Duplicate declaration diagnostic |
| 9 Syntax error | `int a a=2; print(a);` | Syntax diagnostic and recovery at semicolon |
| 10 Optimization | `int total; total=10+20*2; print(total);` | Constant folding; prints 50 |
| 11 Register allocation | `int a; int b; int c; a=2; b=3; c=(a+b)*4; print(c);` | Liveness and colors visible; prints 20 |
| 12 Graph coloring | `int a; int b; int c; int d; a=1; b=2; c=3; d=(a+b)*(b+c); print(d);` | Interference edges and graph colors shown |

## 19. Results, advantages and limitations

The interface exposes compiler representations and the browser executes source-derived Wasm output. This supports stepwise practical demonstrations and helps relate grammar, AST, TAC, optimization and allocation. The project is intentionally bounded: no Flex/Bison code generation, no complete control-flow liveness solver, no executable pseudo-assembly, and no advanced language constructs. The browser target currently represents scalar values as `f64`, and supported syntax is deliberately documented rather than implied to be a complete C-like language.

## 20. Future scope

Possible extensions include using Flex/Bison for a native front end, lexical block scopes, functions and calls, short-circuit boolean operators, basic-block data-flow analysis, spill insertion, a machine-specific backend, source maps, debugger stepping, and richer numeric types.

## 21. Conclusion

CompilerToWasm makes a compact imperative compiler pipeline visible and executable. It links the source token stream to parsing, semantic validation, intermediate representation, optimization, allocation and browser WebAssembly execution. Its explicit limitations help distinguish syllabus demonstrations from production compiler guarantees.

## References

1. A. V. Aho, M. S. Lam, R. Sethi and J. D. Ullman, *Compilers: Principles, Techniques, and Tools*, 2nd ed., Pearson.
2. WebAssembly Community Group, *WebAssembly Core Specification*, https://webassembly.github.io/spec/core/.
3. wabt project, WebAssembly Binary Toolkit, https://github.com/WebAssembly/wabt.
4. Vite documentation, https://vite.dev/guide/.
5. Flex manual, https://westes.github.io/flex/manual/.
6. GNU Bison manual, https://www.gnu.org/software/bison/manual/.
