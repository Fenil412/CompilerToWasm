/**
 * Curated Test & Demonstration Programs for MiniLang.
 * Covers all language features, compiler phases, optimization cases, and error handling.
 */

export const SAMPLE_PROGRAMS = [
  {
    id: 'arithmetic',
    name: '1. Basic Arithmetic & Variables',
    category: 'Basics',
    description: 'Demonstrates variable declarations, operator precedence (* before +), and print output.',
    code: `// Declare variables and compute expression
let a = 10;
let b = 20;
let result = a + b * 2;
print(result); // Expected: 50`
  },
  {
    id: 'if_else',
    name: '2. Conditional Branching (if-else)',
    category: 'Control Flow',
    description: 'Tests relational comparisons, conditional jumps, and both branches.',
    code: `// Grade evaluation using if-else
let score = 85;
if (score >= 90) {
  print(1); // Grade A
} else {
  if (score >= 75) {
    print(2); // Grade B -> Expected: 2
  } else {
    print(3); // Grade C
  }
}`
  },
  {
    id: 'while_loop',
    name: '3. Iteration (while loop)',
    category: 'Control Flow',
    description: 'Tests loop condition, backward branching, loop counter updates, and sequential output.',
    code: `// Loop from 1 to 5
let count = 1;
let sum = 0;

while (count <= 5) {
  print(count);
  sum = sum + count;
  count = count + 1;
}

print(sum); // Expected total sum: 15`
  },
  {
    id: 'functions',
    name: '4. Functions & Return Values',
    category: 'Functions',
    description: 'Demonstrates user-defined functions with parameters, local scopes, and return values.',
    code: `// Define a function with multiple parameters
fn multiply(x, y) {
  let product = x * y;
  return product;
}

let a = 6;
let b = 7;
let res = multiply(a, b);
print(res); // Expected: 42`
  },
  {
    id: 'recursion',
    name: '5. Recursive Function (Factorial)',
    category: 'Functions',
    description: 'Demonstrates call stack, activation records, base case checking, and recursion in Wasm.',
    code: `// Recursive factorial calculation
fn factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

let result = factorial(5);
print(result); // Expected: 120`
  },
  {
    id: 'constant_folding',
    name: '6. Optimization (Constant Folding)',
    category: 'Optimization',
    description: 'Demonstrates compile-time evaluation of constant expressions into a single value.',
    code: `// Expressions evaluated at compile time
let folded = 10 + 20 * 2; // Folds to 50
let boolFold = 5 > 3;      // Folds to 1 (true)
let total = folded + 10;   // Propagates to 60
print(total); // Expected: 60`
  },
  {
    id: 'boolean_logic',
    name: '7. Boolean & Logical Operators',
    category: 'Logic',
    description: 'Tests logical AND (&&), logical OR (||), and unary NOT (!).',
    code: `let x = 15;
let y = 25;

// Compound boolean conditions
if (x > 10 && y < 30) {
  print(100); // Expected: 100
}

if (!(x == 0)) {
  print(200); // Expected: 200
}`
  },
  {
    id: 'modulo',
    name: '8. Modulo & Remainder',
    category: 'Arithmetic',
    description: 'Tests integer modulo arithmetic via WebAssembly integer remainder instructions.',
    code: `let number = 29;
let divisor = 5;
let remainder = number % divisor;
print(remainder); // Expected: 4`
  },
  {
    id: 'semantic_undeclared',
    name: '9. [Error] Undeclared Variable',
    category: 'Diagnostics',
    description: 'Demonstrates semantic phase reporting of variables used before declaration.',
    code: `let a = 10;
// 'b' has never been declared!
let result = a + b;
print(result);`
  },
  {
    id: 'semantic_duplicate',
    name: '10. [Error] Duplicate Declaration',
    category: 'Diagnostics',
    description: 'Demonstrates symbol table duplicate symbol rejection in the same scope.',
    code: `let x = 10;
// Redeclaring 'x' in the same global scope
let x = 20;
print(x);`
  },
  {
    id: 'semantic_arity',
    name: '11. [Error] Invalid Function Arity',
    category: 'Diagnostics',
    description: 'Demonstrates semantic validation of argument count against function declaration signature.',
    code: `fn square(x) {
  return x * x;
}

// Function expects 1 argument, but passed 3
let val = square(5, 10, 15);
print(val);`
  },
  {
    id: 'syntax_recovery',
    name: '12. [Error] Syntax Error & Recovery',
    category: 'Diagnostics',
    description: 'Demonstrates panic-mode synchronization at statement boundaries (missing semicolon).',
    code: `// Missing semicolon on line 2
let a = 10
let b = 20;
print(b);`
  }
];
