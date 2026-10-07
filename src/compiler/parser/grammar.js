/**
 * Formal Context-Free Grammar (CFG) in EBNF for MiniLang.
 * Demonstrates operator precedence, statement structure, functions, and control flow.
 */

export const EBNF_GRAMMAR = `
Program             = { Declaration | FunctionDecl | Statement } EOF ;

Declaration         = ("let" | "int" | "float") IDENTIFIER ["=" Expression] ";" ;

FunctionDecl        = ("fn" | "function") IDENTIFIER "(" [ ParamList ] ")" BlockStatement ;
ParamList           = IDENTIFIER { "," IDENTIFIER } ;

Statement           = Declaration
                    | FunctionDecl
                    | AssignmentStmt
                    | ReturnStmt
                    | PrintStmt
                    | IfStmt
                    | WhileStmt
                    | BlockStatement
                    | ExprStmt ;

AssignmentStmt      = IDENTIFIER "=" Expression ";" ;
ReturnStmt          = "return" [ Expression ] ";" ;
PrintStmt           = "print" "(" Expression ")" ";" ;
IfStmt              = "if" "(" Expression ")" Statement [ "else" Statement ] ;
WhileStmt           = "while" "(" Expression ")" Statement ;
BlockStatement      = "{" { Statement } "}" ;
ExprStmt            = Expression ";" ;

Expression          = LogicalOr ;
LogicalOr           = LogicalAnd { "||" LogicalAnd } ;
LogicalAnd          = Equality { "&&" Equality } ;
Equality            = Relational { ("==" | "!=") Relational } ;
Relational          = Additive { ("<" | "<=" | ">" | ">=") Additive } ;
Additive            = Multiplicative { ("+" | "-") Multiplicative } ;
Multiplicative      = Unary { ("*" | "/" | "%") Unary } ;
Unary               = ("-" | "!") Unary | Primary ;
Primary             = INT_LITERAL
                    | FLOAT_LITERAL
                    | "true" | "false"
                    | FunctionCall
                    | IDENTIFIER
                    | "(" Expression ")" ;

FunctionCall        = IDENTIFIER "(" [ ArgList ] ")" ;
ArgList             = Expression { "," Expression } ;
`.trim();
