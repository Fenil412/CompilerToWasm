import React, { useState } from 'react';

function nodeClass(kind) {
  if (kind.includes('Declaration')) return 'ast-decl';
  if (kind.includes('Statement'))   return 'ast-stmt';
  if (kind.includes('Expression') || kind.includes('Literal')) return 'ast-expr';
  return 'ast-node';
}

function summary(node) {
  switch (node.kind) {
    case 'VariableDeclaration':  return `${node.varType} ${node.name}`;
    case 'FunctionDeclaration':  return `${node.name}(${(node.params || []).join(', ')})`;
    case 'Identifier':           return `"${node.name}"`;
    case 'NumericLiteral':       return `${node.value}`;
    case 'BooleanLiteral':       return `${node.value}`;
    case 'BinaryExpression':
    case 'LogicalExpression':    return `"${node.op}"`;
    case 'CallExpression':       return `${node.callee}()`;
    case 'AssignmentStatement':  return `${node.name} =`;
    default: return '';
  }
}

function TreeNode({ node, label }) {
  const [open, setOpen] = useState(true);

  if (!node || typeof node !== 'object') {
    return (
      <div className="ast-leaf">
        {label && <span className="ast-key">{label}: </span>}
        <span className="ast-val">{String(node)}</span>
      </div>
    );
  }

  const kind     = node.kind || 'Node';
  const kids     = Object.keys(node).filter(k => k !== 'kind' && k !== 'loc');
  const hasKids  = kids.length > 0;
  const sum      = summary(node);

  return (
    <div className="ast-node-wrap">
      <div className="ast-row" onClick={() => hasKids && setOpen(o => !o)} style={{ cursor: hasKids ? 'pointer' : 'default' }}>
        <span className="ast-toggle">{hasKids ? (open ? '▼' : '▶') : '•'}</span>
        {label && <span className="ast-key">{label}: </span>}
        <span className={`ast-badge ${nodeClass(kind)}`}>{kind}</span>
        {sum && <span className="ast-sum">{sum}</span>}
        {node.loc && <span className="ast-loc">L{node.loc.line}</span>}
      </div>

      {open && hasKids && (
        <div className="ast-children">
          {kids.map(k => {
            const v = node[k];
            if (Array.isArray(v)) {
              return (
                <div key={k} className="ast-array">
                  <div className="ast-key">{k} [{v.length}]:</div>
                  {v.map((item, i) => <TreeNode key={i} node={item} label={`${k}[${i}]`} />)}
                </div>
              );
            }
            if (typeof v === 'object' && v !== null) {
              return <TreeNode key={k} node={v} label={k} />;
            }
            return (
              <div key={k} className="ast-leaf">
                <span className="ast-key">{k}: </span>
                <span className="ast-val">{String(v)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ASTVisualizer({ ast, grammar }) {
  const [mode, setMode] = useState('tree');

  if (!ast) {
    return <div className="empty-state">Compile your code to see the syntax tree.</div>;
  }

  return (
    <div className="stage-wrap">
      <div className="stage-bar">
        <div className="toggle-group">
          <button className={`tog-btn ${mode === 'tree' ? 'active' : ''}`} onClick={() => setMode('tree')}>Tree</button>
          <button className={`tog-btn ${mode === 'json' ? 'active' : ''}`} onClick={() => setMode('json')}>JSON</button>
          <button className={`tog-btn ${mode === 'grammar' ? 'active' : ''}`} onClick={() => setMode('grammar')}>Grammar</button>
        </div>
        {mode === 'json' && (
          <button type="button" className="btn-sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(ast, null, 2))}>
            Copy
          </button>
        )}
      </div>

      <div className="table-scroll ast-scroll">
        {mode === 'tree' && (
          <div className="ast-tree">
            <TreeNode node={ast} label="root" />
          </div>
        )}
        {mode === 'json' && (
          <pre className="codebox">{JSON.stringify(ast, null, 2)}</pre>
        )}
        {mode === 'grammar' && (
          <div className="grammar-wrap">
            <div className="grammar-title">EBNF Grammar</div>
            <pre className="codebox">{grammar}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
