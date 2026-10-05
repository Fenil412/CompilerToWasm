# Compiler Design Viva: Questions and Concise Answers

1. **What is a compiler?** A program that translates source code into another representation and reports errors.
2. **Compiler vs interpreter?** A compiler translates before execution; an interpreter executes source or an intermediate form incrementally.
3. **What are the compiler phases?** Lexical, syntax, semantic analysis, intermediate-code generation, optimization and target-code generation.
4. **What does a lexical analyzer do?** Groups source characters into tokens and records their locations.
5. **What is a token?** A category such as identifier, integer literal, keyword or operator, usually with a lexeme and location.
6. **What is a lexeme?** The actual character sequence matched for a token, such as `count`.
7. **What is Lex/Flex?** A tool that generates a scanner from regular-expression rules and actions.
8. **Does this project use Flex?** No. Its handwritten JavaScript scanner demonstrates Lex concepts; it does not claim Flex generation.
9. **How are regular expressions used in a lexer?** They describe token patterns such as identifiers and numeric constants.
10. **Why remove comments in the lexer?** Comments do not affect program syntax or execution, so they are skipped as whitespace.
11. **What is a symbol table?** A compiler data structure recording declared names and attributes such as type, scope and storage.
12. **What is a CFG?** A context-free grammar defines how language constructs can be formed using production rules.
13. **What is a parser?** It consumes tokens and determines whether they follow the grammar, often building a syntax representation.
14. **What is YACC/Bison?** Parser generators that produce parsers from grammar rules and semantic actions.
15. **Does this project use YACC/Bison?** No. It uses recursive descent to make the grammar and parsing decisions inspectable.
16. **Parse tree vs AST?** A parse tree includes grammar details; an AST keeps the meaningful operators and constructs compactly.
17. **How does precedence work here?** Separate recursive-descent levels parse unary, multiplicative and additive operators in precedence order.
18. **What is syntax error recovery?** A parser strategy that resumes after an error so it can report more than the first issue.
19. **What is panic-mode recovery?** Skip tokens until a synchronization token such as `;` or `}` is found.
20. **What is semantic analysis?** Checks whether syntactically valid constructs make sense, including declarations and type compatibility.
21. **What is an undeclared-variable error?** A use of a name absent from the symbol table in its visible scope.
22. **What is redeclaration?** Declaring a name again where the language rules disallow another declaration.
23. **What is intermediate code?** A machine-independent representation used between source analysis and target generation.
24. **What is three-address code?** A sequence where each instruction uses at most one main operator and a small number of operands.
25. **What is a TAC temporary?** A compiler-generated name that stores an intermediate expression result.
26. **What is a quadruple?** A TAC record with operator, two arguments and result fields.
27. **What is a triple?** A TAC record with operator and operands where results are referred to by instruction position.
28. **What is a basic block?** A straight-line instruction sequence with one entry and one exit.
29. **What is code optimization?** A semantics-preserving transformation intended to improve code quality or execution cost.
30. **What is constant folding?** Compute an operation during compilation when all operands are known constants.
31. **What is constant propagation?** Substitute a known constant value at later uses until the defining value changes.
32. **What is register allocation?** Assign values to a limited set of processor registers, spilling when necessary.
33. **What is `getreg()`?** A compiler helper that chooses an available register for a value or temporary.
34. **What is liveness?** A value is live at a program point if a future use can occur before it is redefined.
35. **What is an interference graph?** Nodes represent values; an edge means two values are live at the same time and cannot share a register.
36. **How does graph coloring allocate registers?** Assign colors to nodes so adjacent nodes have different colors; each color corresponds to a register.
37. **What is spilling?** Store some values in memory when registers cannot hold all simultaneously live values.
38. **How is assembly generation represented here?** TAC is mapped to illustrative LOAD/arithmetic/STORE pseudo-instructions; this is not assembled.
39. **What is WebAssembly?** A portable, validated binary instruction format designed for safe execution in compatible runtimes.
40. **What is WAT?** A readable text notation for WebAssembly instructions and modules.
41. **How does this project execute Wasm?** It parses emitted WAT with `wabt`, compiles bytes, then calls `WebAssembly.instantiate` in the browser.
42. **Why use WebAssembly as a target?** It demonstrates a portable executable target that can run in browser sandboxes with host imports.
43. **How does print work in the Wasm module?** The module imports an `env.print` function supplied by JavaScript.
44. **Are the compiler stages hardcoded?** No. Tokens, AST, TAC, symbol data and WAT are generated from the current source input.
45. **What is a limitation of the allocator?** Its liveness/interference model is a simplified linear TAC scan, not a full CFG data-flow solution.
