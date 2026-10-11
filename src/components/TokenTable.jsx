import React, { useState, useMemo } from 'react';

const KEYWORDS = new Set(['LET','INT','FLOAT','FN','FUNCTION','RETURN','IF','ELSE','WHILE','PRINT']);
const OPERATORS = new Set(['+','-','*','/','%','==','!=','<','<=','>','>=','&&','||','!']);

function badgeClass(type) {
  if (KEYWORDS.has(type))                           return 'badge-kw';
  if (type === 'IDENTIFIER')                         return 'badge-id';
  if (type === 'INT_LITERAL' || type === 'FLOAT_LITERAL') return 'badge-lit';
  if (OPERATORS.has(type))                           return 'badge-op';
  return 'badge-delim';
}

export default function TokenTable({ tokens }) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!tokens) return [];
    if (!filter) return tokens;
    const q = filter.toLowerCase();
    return tokens.filter(t =>
      t.type.toLowerCase().includes(q) || String(t.value).toLowerCase().includes(q)
    );
  }, [tokens, filter]);

  if (!tokens?.length) {
    return <div className="empty-state">Compile your program to see tokens.</div>;
  }

  const kw  = tokens.filter(t => KEYWORDS.has(t.type)).length;
  const id  = tokens.filter(t => t.type === 'IDENTIFIER').length;
  const lit = tokens.filter(t => t.type.includes('LITERAL')).length;

  return (
    <div className="stage-wrap">
      <div className="stage-bar">
        <div className="chips">
          <span className="chip">Total <strong>{tokens.length}</strong></span>
          <span className="chip">Keywords <strong>{kw}</strong></span>
          <span className="chip">Identifiers <strong>{id}</strong></span>
          <span className="chip">Literals <strong>{lit}</strong></span>
        </div>
        <input
          type="text"
          placeholder="Filter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Type</th>
              <th>Value</th>
              <th style={{ width: 64 }}>Line</th>
              <th style={{ width: 64 }}>Col</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tok, i) => (
              <tr key={i}>
                <td className="td-dim">{i + 1}</td>
                <td><span className={`badge ${badgeClass(tok.type)}`}>{tok.type}</span></td>
                <td className="td-mono"><code>{tok.value}</code></td>
                <td className="td-num">{tok.line}</td>
                <td className="td-num">{tok.column}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
