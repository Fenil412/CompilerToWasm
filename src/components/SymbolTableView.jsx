import React, { useState, useMemo } from 'react';

function kindBadge(kind) {
  if (kind === 'function')  return 'badge-fn';
  if (kind === 'parameter') return 'badge-param';
  return 'badge-var';
}

export default function SymbolTableView({ symbols }) {
  const [scope, setScope] = useState('ALL');

  const scopes = useMemo(() => {
    if (!symbols) return [];
    return ['ALL', ...new Set(symbols.map(s => s.scope))];
  }, [symbols]);

  const filtered = useMemo(() => {
    if (!symbols) return [];
    return scope === 'ALL' ? symbols : symbols.filter(s => s.scope === scope);
  }, [symbols, scope]);

  if (!symbols?.length) {
    return <div className="empty-state">Compile a program to populate the symbol table.</div>;
  }

  return (
    <div className="stage-wrap">
      <div className="stage-bar">
        <div className="chips">
          <span className="chip">Total <strong>{symbols.length}</strong></span>
          <span className="chip">Vars <strong>{symbols.filter(s => s.kind === 'variable').length}</strong></span>
          <span className="chip">Fns <strong>{symbols.filter(s => s.kind === 'function').length}</strong></span>
          <span className="chip">Params <strong>{symbols.filter(s => s.kind === 'parameter').length}</strong></span>
        </div>
        <label className="scope-label">
          Scope:
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="filter-select">
            {scopes.map(sc => <option key={sc} value={sc}>{sc}</option>)}
          </select>
        </label>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Name</th>
              <th>Kind</th>
              <th>Type</th>
              <th>Scope</th>
              <th style={{ width: 64 }}>Line</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sym, i) => (
              <tr key={i}>
                <td className="td-dim">#{sym.address ?? i}</td>
                <td className="td-mono"><strong>{sym.name}</strong></td>
                <td><span className={`badge ${kindBadge(sym.kind)}`}>{sym.kind}</span></td>
                <td><span className="type-tag">{sym.type}</span></td>
                <td><span className="scope-tag">{sym.scope}</span></td>
                <td className="td-num">{sym.line}</td>
                <td className="td-dim">{sym.kind === 'function' ? `${sym.arity ?? 0} params` : 'scalar'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
