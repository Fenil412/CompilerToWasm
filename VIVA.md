# Principles of Compiler Design: Comprehensive Viva Voce Questions & Answers

**Course:** Principles of Compiler Design (4CS501CC25)  
**Level:** 7th Semester B.Tech Computer Science & Engineering  
**Project:** Design and Implementation of a High-Level Language Compiler Targeting WebAssembly

---

### Section 1: Fundamentals & Compiler Architecture

1. **What is a compiler?**  
   A compiler is a language translator that converts a computer program written in a high-level source language into an equivalent target machine or bytecode language, while diagnosing syntactic and semantic violations.

2. **What is the difference between a compiler and an interpreter?**  
   A compiler translates the entire source program into machine code or bytecode ahead of time (AOT) prior to execution. An interpreter executes the source program directly or incrementally line-by-line / AST node-by-node without generating a standalone executable binary.

3. **What are the primary phases of a compiler?**  
   1. Lexical Analysis (Scanner)  
   2. Syntax Analysis (Parser)  
   3. Semantic Analysis (Type & Scope Checker)  
   4. Intermediate Code Generation (IR)  
   5. Code Optimization  
   6. Target Code Generation (Backend)  
   7. Target Execution (Runtime)  
   *(Symbol Table Management and Error Handling operate across all phases).*

4. **What is the difference between the front-end and the back-end of a compiler?**  
   - **Front-end:** Source-dependent and machine-independent (Lexer, Parser, Semantic Analysis, IR generation).  
   - **Back-end:** Target-dependent (Instruction selection, register allocation, machine/Wasm code generation, target-specific optimizations).

5. **Why is an Intermediate Representation (IR) beneficial?**  
   An IR decouples the front-end from the back-end. For $M$ source languages and $N$ target architectures, using an IR requires only $M + N$ translators instead of $M \times N$ direct compilers. It also enables target-independent optimizations.

---

### Section 2: Lexical Analysis

6. **What is a token, a pattern, and a lexeme?**  
   - **Token:** An abstract grammatical category (e.g. `IDENTIFIER`, `INT_LITERAL`, `IF`).  
   - **Pattern:** The formal rule or regular expression describing which characters match the token (e.g. `[A-Za-z_][A-Za-z0-9_]*`).  
   - **Lexeme:** The actual concrete character sequence matched from the source text (e.g. `count`, `42`).

7. **How does your lexer handle comments and whitespace?**  
   Whitespace (spaces, tabs, newlines) and comments (`//...` and `/*...*/`) are recognized by the scanner and stripped away from the token stream, but line and column counters are updated to maintain source coordinates for diagnostics.

8. **How are multi-character operators matched?**  
   Using the **Longest Match (Maximal Munch)** principle. The lexer checks prefixes such as `==`, `!=`, `<=`, `>=`, `&&`, `||` before treating characters as single-character tokens (`=`, `!`, `<`, `>`).

9. **What is a lexical error? Give an example.**  
   A character or sequence that does not match any valid token pattern in the language specification (e.g. `@` or an unterminated block comment `/* hello`).

---

### Section 3: Syntax Analysis & Grammars

10. **What is a Context-Free Grammar (CFG)?**  
    A formal 4-tuple $G = (V, \Sigma, R, S)$, where:  
    - $V$ is a finite set of non-terminal symbols.  
    - $\Sigma$ is a finite set of terminal symbols (tokens).  
    - $R$ is a finite set of production rules $A \to \alpha$ with $A \in V$.  
    - $S \in V$ is the start symbol.

11. **What is the difference between a Parse Tree and an Abstract Syntax Tree (AST)?**  
    - **Parse Tree (Concrete Syntax Tree):** Contains every derivation step, punctuation token, parentheses, and semicolon dictated by grammar rules.  
    - **AST:** A condensed, semantic representation containing only meaningful operators, expressions, and statements, discarding superfluous delimiters.

12. **What parsing technique is used in this project?**  
    A **Top-Down Recursive-Descent Parser** with operator precedence climbing for expressions. Each non-terminal in the grammar corresponds to a parsing function.

13. **How does your parser handle operator precedence?**  
    Through stratified grammatical levels:  
    `LogicalOr -> LogicalAnd -> Equality -> Relational -> Additive -> Multiplicative -> Unary -> Primary`.  
    Higher-precedence operations appear deeper in the grammar hierarchy, ensuring they bind tighter in the AST.

14. **What is panic-mode error recovery?**  
    When a syntax error occurs, the parser logs the diagnostic, discards invalid tokens until it reaches a designated synchronization token (such as `;`, `}`, or a statement keyword like `let`, `if`, `while`), and then resumes parsing. This prevents cascading syntax errors.

---

### Section 4: Semantic Analysis & Symbol Tables

15. **What is a symbol table?**  
    A compiler data structure used to store information about source-program identifiers, including name, kind (variable, function, parameter), type, scope, line of declaration, and assigned memory slot.

16. **How does your compiler support lexical scoping?**  
    Using a tree/stack of `Scope` objects. The global scope sits at the root. Entering a function creates a child scope pointing to the global scope as its parent. Looking up a variable searches the current scope first, then walks up parent scopes.

17. **What semantic checks are performed in this project?**  
    1. Declaration-before-use (undeclared variable errors).  
    2. Duplicate declarations within the same scope.  
    3. Function signature matching (calling non-functions, undefined functions, or arity mismatches).  
    4. Type validation (e.g., assigning a float literal to an int variable).  
    5. Disallowing `return` statements outside functions.

18. **What is the difference between static and dynamic scoping?**  
    - **Static (Lexical) Scoping:** Variable resolution depends on the spatial nesting of code blocks in the source text at compile time (used in MiniLang, C, Java).  
    - **Dynamic Scoping:** Variable resolution depends on the run-time call stack at execution time.

---

### Section 5: Intermediate Representation (IR)

19. **What is Three-Address Code (TAC)?**  
    An intermediate representation where each instruction has at most one operator and at most three address operands (e.g. `result = arg1 op arg2`).

20. **What are Quadruples, Triples, and Indirect Triples?**  
    - **Quadruple:** A record containing 4 fields: `(op, arg1, arg2, result)`.  
    - **Triple:** A record containing 3 fields: `(op, arg1, arg2)`, where intermediate results are referenced by their array index `(i)`.  
    - **Indirect Triple:** Stores pointers to triples in a separate list to allow easy instruction reordering during optimization.  
    *(Our compiler implements standard Quadruples).*

21. **What is a Basic Block?**  
    A sequence of consecutive statements in which flow of control enters at the beginning and leaves at the end without halting or branching except at the exit.

---

### Section 6: Code Optimization

22. **What is Constant Folding?**  
    Computing operations whose operands are statically known constants at compile time rather than generating instructions to compute them at runtime (e.g., `let x = 10 + 20 * 2` folds to `let x = 50`).

23. **What is Constant Propagation?**  
    Replacing variable references with their known constant values in subsequent expressions within a basic block until that variable is reassigned.

24. **What is the difference between local and global optimization?**  
    - **Local Optimization:** Performed strictly within a single basic block (straight-line code without jumps).  
    - **Global Optimization:** Performed across multiple basic blocks throughout an entire control-flow graph (CFG).

25. **What is Dead Code Elimination?**  
    Detecting and removing code that computes values that are never subsequently read or used by any observable program output.

---

### Section 7: Register Allocation

26. **What is variable liveness?**  
    A variable is live at a program point $P$ if its current value may be read along some execution path beginning at $P$ before it is redefined.

27. **What is an Interference Graph?**  
    An undirected graph $G = (V, E)$ where nodes $V$ represent variables and temporaries, and an edge $(u, v) \in E$ exists if variables $u$ and $v$ are live at the same time and therefore cannot share the same physical register.

28. **How does Graph Coloring allocate registers (Chaitin's Algorithm)?**  
    It models register allocation as the NP-complete Graph Coloring problem: color the interference graph using at most $K$ colors (where $K$ is the number of physical CPU registers) such that no two adjacent nodes have the same color. If a node cannot be colored, it is spilled to memory (`MEM[var]`).

---

### Section 8: WebAssembly (Wasm) Architecture

29. **What is WebAssembly?**  
    WebAssembly is an open W3C standard binary instruction format designed as a portable compilation target for programming languages, executing at near-native speed in sandboxed virtual machines inside web browsers and non-web hosts.

30. **What is the difference between WAT and Wasm?**  
    - **WAT (WebAssembly Text Format):** Human-readable S-Expression text representation (e.g. `(func (param f64) ...)`).  
    - **Wasm:** The compact, binary-encoded bytecode format (`.wasm`) distributed over the network and decoded by the browser VM.

31. **What kind of virtual machine architecture does WebAssembly use?**  
    A **Stack Machine** architecture. Instructions push values onto an implicit operand stack and pop operands to execute operations (e.g. `f64.add` pops two 64-bit floats and pushes their sum).

32. **Why target WebAssembly instead of x86 or MIPS assembly?**  
    1. **Platform Portability:** Runs identically on Windows, Linux, macOS, ARM, and x86 architectures.  
    2. **Immediate Execution:** Executes inside the user's browser without requiring an external C compiler, assembler, or hardware emulator.  
    3. **Safety & Sandboxing:** Memory-safe and memory-isolated, preventing arbitrary memory corruptions.

33. **How does standard output / `print()` work in your WebAssembly target?**  
    WebAssembly modules cannot directly access operating system I/O. Our compiler imports a host function `(import "env" "print" (func $print (param f64)))` provided by JavaScript during instantiation (`WebAssembly.instantiate`), which intercepts calls and logs the printed values.

34. **How are variables represented in the generated WebAssembly module?**  
    - Global variables are declared as mutable WebAssembly globals `(global $var (mut f64) (f64.const 0))`.  
    - Function parameters and local variables are declared as function locals `(local $var f64)`.

35. **How does WebAssembly implement structured control flow?**  
    WebAssembly rejects arbitrary `goto` jumps in favor of structured blocks: `block`, `loop`, `if-then-else`, and branch instructions (`br`, `br_if`). A `br` inside a `block` jumps forward to the end of the block; a `br` inside a `loop` jumps backward to the start of the loop.

36. **What is WABT?**  
    The **WebAssembly Binary Toolkit (WABT)**. It is a collection of tools for WebAssembly, including `wat2wasm` which translates WebAssembly text format (`.wat`) into binary bytecode (`.wasm`). In our web application, WABT runs compiled inside the browser.

---

### Section 9: Advanced Concepts & Project Implementation

37. **How does your compiler support recursion?**  
    Functions are compiled into distinct WebAssembly functions `(func $name ...)`. Each recursive call `(call $name ...)` creates a new activation record on the browser virtual machine's internal execution call stack, maintaining independent local variables and parameters.

38. **Are your compiler's outputs dynamically generated or static?**  
    Every output is 100% dynamically generated from the source code. Modifying an expression or statement immediately recalculates tokens, AST nodes, symbol entries, TAC instructions, optimized lines, and WebAssembly bytecode.

39. **What are the key limitations of the current MiniLang compiler?**  
    1. All numeric variables are modeled as 64-bit floating-point numbers in the Wasm backend for uniformity.  
    2. Arrays, strings, and dynamically allocated heap objects are not yet implemented.  
    3. Boolean operators (`&&`, `||`) use eager arithmetic conversion rather than short-circuit evaluation.

40. **If you were to add arrays to MiniLang, what changes would be required?**  
    1. **Lexer/Parser:** Add `[` and `]` delimiters, array type syntax, and index expressions `arr[i]`.  
    2. **Semantic Analysis:** Type check array dimensions and elements.  
    3. **IR / CodeGen:** Allocate a contiguous linear memory segment in WebAssembly via `(memory 1)`, compute base address plus element offset (`base + index * 8`), and emit `f64.load` / `f64.store` instructions.
