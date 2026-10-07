import React, { useState, useMemo } from 'react';

export default function SymbolTableView({ symbols }) {
  const [scopeFilter, setScopeFilter] = useState('ALL');

  const scopes = useMemo(() => {
    if (!symbols) return [];
    return ['ALL', ...new Set(symbols.map(s => s.scope))];
  }, [symbols]);

  const filtered = useMemo(() => {
    if (!symbols) return [];
    if (scopeFilter === 'ALL') return symbols;
    return symbols.filter(s => s.scope === scopeFilter);
  }, [symbols, scopeFilter]);

  if (!symbols || symbols.length === 0) {
    return (
      <div className="empty-state">
        <p>Symbol table is empty. Compile a valid program with variable/function declarations.</p>
      </div>
    );
  }

  const getKindBadgeClass = (kind) => {
    if (kind === 'function') return 'badge-fn';
    if (kind === 'parameter') return 'badge-param';
    return 'badge-var';
  };

  return (
    <div className="table-stage-container">
      <div className="stage-toolbar">
        <div className="stats-badges">
          <span className="stat-pill">Total Symbols: <strong>{symbols.length}</strong></span>
          <span className="stat-pill">Variables: <strong>{symbols.filter(s => s.kind === 'variable').length}</strong></span>
          <span className="stat-pill">Functions: <strong>{symbols.filter(s => s.kind === 'function').length}</strong></span>
          <span className="stat-pill">Parameters: <strong>{symbols.filter(s => s.kind === 'parameter').length}</strong></span>
        </div>

        <div className="filter-input-wrapper">
          <label className="select-wrapper-inline">
            <span>Scope: </span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="filter-select"
            >
              {scopes.map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="token-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Slot</th>
              <th>Identifier</th>
              <th>Kind</th>
              <th>Inferred Type</th>
              <th>Scope</th>
              <th>Decl Line</th>
              <th>Arity / Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sym, idx) => (
              <tr key={idx}>
                <td className="cell-muted">#{sym.address ?? idx}</td>
                <td className="cell-code">
                  <strong>{sym.name}</strong>
                </td>
                <td>
                  <span className={`token-badge ${getKindBadgeClass(sym.kind)}`}>
                    {sym.kind}
                  </span>
                </td>
                <td>
                  <span className="type-tag">{sym.type}</span>
                </td>
                <td>
                  <span className="scope-tag">{sym.scope}</span>
                </td>
                <td className="cell-num">{sym.line}</td>
                <td className="cell-muted">
                  {sym.kind === 'function' ? `${sym.arity ?? 0} params` : 'scalar'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
