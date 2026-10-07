# CompilerToWasm: High-Level Language Compiler Targeting WebAssembly

**Academic Course:** Principles of Compiler Design (Course Code: 4CS501CC25)  
**Academic Level:** 7th Semester B.Tech Computer Science & Engineering  
**Target Architecture:** W3C WebAssembly (WAT / Wasm MVP) via Browser Virtual Machine (V8 / SpiderMonkey)

---

## 📌 Project Overview

**CompilerToWasm** is a complete, educational, source-driven compiler pipeline for **MiniLang**—a custom high-level programming language supporting scalar variables, user-defined functions with parameters and recursion, control-flow statements (`if-else`, `while`), boolean logic, arithmetic expressions, and compile-time optimizations.

Unlike demo webapps that render predefined static outputs, **CompilerToWasm generates every artifact dynamically from the entered source code**:
- **Tokens** are extracted by a handwritten regular-expression scanner.
- **AST** is built by a recursive-descent parser with panic-mode synchronization.
- **Symbol Table** is constructed with lexical scoping (globals & function locals).
- **Three-Address Code (TAC)** and **Quadruples** represent the machine-independent IR.
- **Constant Folding & Propagation** optimizes arithmetic and boolean expressions.
- **Interference Graph & Graph-Coloring** allocates K physical registers (`R1`..`R4`).
- **WebAssembly Text (WAT)** is emitted directly from the AST.
- **Binary Wasm** is assembled at runtime using the `wabt` toolchain and executed directly inside the browser using standard `WebAssembly.instantiate` and an imported `env.print` host function.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js version 18+ (verified on Node.js 20/22/24)
- npm (Node Package Manager)

### Install Dependencies
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```
Open the printed local URL (e.g. `http://localhost:5173/`) in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Build Production Bundle
```bash
npm run build
```

---

## 🗂️ Project Architecture & Structure

The repository follows a clean, modular academic compiler structure:

```text
compiler-wasm/
├── src/
│   ├── compiler/
│   │   ├── lexer/
│   │   │   ├── token.js              # Token types, Token class, CompileError
│   │   │   └── lexer.js              # Lexical scanner with line/col tracking
│   │   ├── parser/
│   │   │   ├── astNodes.js           # AST Node kinds and hierarchy
│   │   │   ├── grammar.js            # Formal EBNF grammar specification
│   │   │   └── parser.js             # Recursive-descent parser & panic recovery
│   │   ├── semantic/
│   │   │   ├── symbolTable.js        # Symbol & Scope hierarchy (globals + functions)
│   │   │   └── analyzer.js           # Multi-pass semantic validation
│   │   ├── ir/
│   │   │   ├── quadruple.js          # Quadruple model (op, arg1, arg2, result)
│   │   │   └── tacGenerator.js       # Linear 3AC & Quadruples generator
│   │   ├── optimizer/
│   │   │   └── optimizer.js          # Constant folding & forward propagation
│   │   ├── codegen/
│   │   │   ├── registerAllocator.js  # Liveness analysis & graph coloring (Chaitin)
│   │   │   ├── assemblyGenerator.js  # Pseudo-assembly target lowering
│   │   │   └── watGenerator.js       # WebAssembly Text Format (WAT) emitter
│   │   ├── runtime/
│   │   │   └── wasmRunner.js         # Browser WebAssembly VM instantiation & execution
│   │   └── index.js                  # Master pipeline orchestrator
│   ├── components/
│   │   ├── Header.jsx                # Course header & real-time status pill
│   │   ├── PipelineNav.jsx           # Interactive 8-phase pipeline breadcrumb
│   │   ├── CodeEditor.jsx            # Source editor with line numbers & sample picker
│   │   ├── TokenTable.jsx            # Lexer token table with type filter & stats
│   │   ├── ASTVisualizer.jsx         # Interactive expandable tree & JSON viewer
│   │   ├── SymbolTableView.jsx       # Scope-aware symbol table with memory slots
│   │   ├── IRViewer.jsx              # Three-Address Code & Quadruple table
│   │   ├── OptimizerViewer.jsx       # Side-by-side optimization diff & logs
│   │   ├── RegisterViewer.jsx        # Interference graph, coloring, & pseudo-assembly
│   │   ├── WatViewer.jsx             # Syntax-highlighted WAT viewer & downloader
│   │   ├── ConsoleOutput.jsx         # Terminal console with execution timings
│   │   └── ErrorPanel.jsx            # Compiler diagnostics with source code pointer
│   ├── examples/
│   │   └── samplePrograms.js         # 12 curated demonstration test programs
│   ├── App.jsx                       # Master UI layout & stage synchronization
│   ├── style.css                     # Premium dark-mode design system
│   └── main.jsx                      # React 18 application entry point
├── PROJECT_REPORT.md                 # Complete B.Tech semester VII project report
├── VIVA.md                           # 45 Viva questions and answers
└── package.json
```

---

## 📖 MiniLang Language Specification

MiniLang is an imperative, block-structured language designed for compiler design courses.

### 1. Variables & Types
```javascript
let a = 10;
let b = 20.5;
let sum = a + b;
```

### 2. Arithmetic & Modulo
```javascript
let x = (10 + 20) * 2;
let rem = 29 % 5;
```

### 3. Boolean & Relational Operators
```javascript
let ok = (x >= 10) && (y < 50);
let notZero = !(x == 0);
```

### 4. Control Flow (`if-else`, `while`)
```javascript
if (score >= 90) {
  print(1);
} else {
  print(2);
}

let i = 1;
while (i <= 5) {
  print(i);
  i = i + 1;
}
```

### 5. Functions & Recursion
```javascript
fn factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

let ans = factorial(5);
print(ans); // Outputs 120
```

### 6. Built-in I/O & Comments
```javascript
// Single-line comment
/* Multi-line 
   block comment */
print(ans);
```

---

## 🧪 Demonstration Test Cases

The application includes 12 curated test programs directly selectable from the **Load Sample** dropdown:

| # | Test Name | Language Feature | Expected Behavior |
|---|---|---|---|
| 1 | Basic Arithmetic | Variables, precedence `*` before `+` | Emits TAC & WAT, prints `50` |
| 2 | Conditional Branching | Relational ops, `if-else` | Jumps to correct branch, prints `2` |
| 3 | Iteration (while loop) | Loop condition, backward jump | Loops 5 times, prints `1, 2, 3, 4, 5, 15` |
| 4 | Functions & Return | User functions, parameters, return | Local scopes created, prints `42` |
| 5 | Recursive Factorial | Activation records, call stack | Recursive calls in Wasm, prints `120` |
| 6 | Constant Folding | Optimizer phase | `10 + 20 * 2` folds to `50`, prints `60` |
| 7 | Boolean Logic | `&&`, `\|\|`, `!` operators | Evaluates boolean expressions, prints `100, 200` |
| 8 | Modulo Remainder | Integer remainder `%` | Wasm `i64.rem_s`, prints `4` |
| 9 | Undeclared Variable | Semantic error detection | Diagnostics: `"Variable 'b' is not declared"` |
| 10 | Duplicate Declaration | Symbol table scope check | Diagnostics: `"Duplicate variable declaration 'x'"` |
| 11 | Invalid Function Arity | Semantic call validation | Diagnostics: `"Function 'square' expects 1 argument"` |
| 12 | Syntax Error & Recovery | Panic-mode error recovery | Reports missing `;`, continues parsing |

---

## 🎓 Academic Documentation & Viva Preparation

- Comprehensive Project Report: [PROJECT_REPORT.md](PROJECT_REPORT.md)
- Viva Voce Questions & Answers: [VIVA.md](VIVA.md) (45 detailed questions covering theory and practical viva topics)
