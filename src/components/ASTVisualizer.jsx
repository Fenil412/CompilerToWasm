import React, { useState } from 'react';

function TreeNode({ node, label, isLast = true }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!node || typeof node !== 'object') {
    return (
      <div className="tree-leaf">
        {label && <span className="tree-key">{label}: </span>}
        <span className="tree-primitive">{String(node)}</span>
      </div>
    );
  }

  // Determine label and details
  const kind = node.kind || 'Node';
  const hasChildren = Object.keys(node).some(k => k !== 'kind' && k !== 'loc');

  const getNodeBadgeClass = (k) => {
    if (k.includes('Declaration')) return 'badge-decl';
    if (k.includes('Statement')) return 'badge-stmt';
    if (k.includes('Expression') || k.includes('Literal')) return 'badge-expr';
    return 'badge-node';
  };

  const getSummary = () => {
    if (node.kind === 'VariableDeclaration') return `${node.varType} ${node.name}`;
    if (node.kind === 'FunctionDeclaration') return `${node.name}(${(node.params || []).join(', ')})`;
    if (node.kind === 'Identifier') return `name: "${node.name}"`;
    if (node.kind === 'NumericLiteral') return `value: ${node.value} (${node.numType})`;
    if (node.kind === 'BooleanLiteral') return `value: ${node.value}`;
    if (node.kind === 'BinaryExpression') return `op: "${node.op}"`;
    if (node.kind === 'LogicalExpression') return `op: "${node.op}"`;
    if (node.kind === 'CallExpression') return `callee: "${node.callee}"`;
    if (node.kind === 'AssignmentStatement') return `var: "${node.name}"`;
    return '';
  };

  const summary = getSummary();

  return (
    <div className="tree-node">
      <div className="tree-node-header" onClick={() => hasChildren && setCollapsed(!collapsed)}>
        {hasChildren ? (
          <span className="tree-toggle">{collapsed ? '▶' : '▼'}</span>
        ) : (
          <span className="tree-bullet">•</span>
        )}

        {label && <span className="tree-key">{label}: </span>}

        <span className={`tree-kind-badge ${getNodeBadgeClass(kind)}`}>
          {kind}
        </span>

        {summary && <span className="tree-summary">{summary}</span>}

        {node.loc && (
          <span className="tree-loc">L{node.loc.line}:C{node.loc.column}</span>
        )}
      </div>

      {!collapsed && hasChildren && (
        <div className="tree-children">
          {Object.entries(node).map(([key, val]) => {
            if (key === 'kind' || key === 'loc') return null;

            if (Array.isArray(val)) {
              return (
                <div key={key} className="tree-array-group">
                  <div className="tree-key-header">
                    <span className="tree-key">{key}</span> [{val.length}]:
                  </div>
                  <div className="tree-array-items">
                    {val.map((item, idx) => (
                      <TreeNode key={idx} node={item} label={`${key}[${idx}]`} />
                    ))}
                  </div>
                </div>
              );
            }

            if (typeof val === 'object' && val !== null) {
              return <TreeNode key={key} node={val} label={key} />;
            }

            return (
              <div key={key} className="tree-leaf">
                <span className="tree-key">{key}: </span>
                <span className="tree-primitive">{String(val)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ASTVisualizer({ ast, grammar }) {
  const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'json' | 'grammar'

  if (!ast) {
    return (
      <div className="empty-state">
        <p>No AST generated yet. Compile your code to perform syntax analysis.</p>
      </div>
    );
  }

  return (
    <div className="ast-container">
      <div className="stage-toolbar">
        <div className="view-toggle-buttons">
          <button
            type="button"
            className={`btn-sub ${viewMode === 'visual' ? 'active' : ''}`}
            onClick={() => setViewMode('visual')}
          >
            🌳 Visual Tree
          </button>
          <button
            type="button"
            className={`btn-sub ${viewMode === 'json' ? 'active' : ''}`}
            onClick={() => setViewMode('json')}
          >
            {'{ }'} Raw JSON
          </button>
          <button
            type="button"
            className={`btn-sub ${viewMode === 'grammar' ? 'active' : ''}`}
            onClick={() => setViewMode('grammar')}
          >
            📜 EBNF Grammar
          </button>
        </div>

        {viewMode === 'json' && (
          <button
            type="button"
            className="btn-sub"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(ast, null, 2))}
          >
            📋 Copy JSON
          </button>
        )}
      </div>

      <div className="ast-body">
        {viewMode === 'visual' && (
          <div className="tree-view-wrapper">
            <TreeNode node={ast} label="Root" />
          </div>
        )}

        {viewMode === 'json' && (
          <pre className="codebox json-view">
            {JSON.stringify(ast, null, 2)}
          </pre>
        )}

        {viewMode === 'grammar' && (
          <div className="grammar-doc-wrapper">
            <h3>Context-Free Grammar (EBNF Specification)</h3>
            <pre className="codebox grammar-box">{grammar}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
