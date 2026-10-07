import React, { useState, useMemo } from 'react';

export default function TokenTable({ tokens }) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!tokens) return [];
    if (!filter) return tokens;
    const lower = filter.toLowerCase();
    return tokens.filter(t =>
      t.type.toLowerCase().includes(lower) ||
      String(t.value).toLowerCase().includes(lower)
    );
  }, [tokens, filter]);

  if (!tokens || tokens.length === 0) {
    return (
      <div className="empty-state">
        <p>No tokens generated yet. Compile your program to run lexical analysis.</p>
      </div>
    );
  }

  const getTypeBadgeClass = (type) => {
    if (['LET', 'INT', 'FLOAT', 'FN', 'FUNCTION', 'RETURN', 'IF', 'ELSE', 'WHILE', 'PRINT'].includes(type)) {
      return 'badge-keyword';
    }
    if (type === 'IDENTIFIER') return 'badge-identifier';
    if (type === 'INT_LITERAL' || type === 'FLOAT_LITERAL') return 'badge-literal';
    if (['+', '-', '*', '/', '%', '==', '!=', '<', '<=', '>', '>=', '&&', '||', '!'].includes(type)) {
      return 'badge-operator';
    }
    return 'badge-delimiter';
  };

  return (
    <div className="table-stage-container">
      <div className="stage-toolbar">
        <div className="stats-badges">
          <span className="stat-pill">Total: <strong>{tokens.length}</strong></span>
          <span className="stat-pill">Keywords: <strong>{tokens.filter(t => getTypeBadgeClass(t.type) === 'badge-keyword').length}</strong></span>
          <span className="stat-pill">Identifiers: <strong>{tokens.filter(t => t.type === 'IDENTIFIER').length}</strong></span>
          <span className="stat-pill">Literals: <strong>{tokens.filter(t => t.type.includes('LITERAL')).length}</strong></span>
        </div>

        <div className="filter-input-wrapper">
          <input
            type="text"
            placeholder="Filter tokens..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="token-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th>Token Type</th>
              <th>Lexeme / Value</th>
              <th style={{ width: '80px' }}>Line</th>
              <th style={{ width: '80px' }}>Column</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tok, idx) => (
              <tr key={idx}>
                <td className="cell-muted">{idx + 1}</td>
                <td>
                  <span className={`token-badge ${getTypeBadgeClass(tok.type)}`}>
                    {tok.type}
                  </span>
                </td>
                <td className="cell-code">
                  <code>{tok.value}</code>
                </td>
                <td className="cell-num">{tok.line}</td>
                <td className="cell-num">{tok.column}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
