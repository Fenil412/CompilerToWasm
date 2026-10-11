import React, { useState } from 'react';

export default function IRViewer({ tac, quadruples }) {
  const [mode, setMode] = useState('tac');

  if (!tac?.length) {
    return <div className="empty-state">Compile a valid program to see IR code.</div>;
  }

  return (
    <div className="stage-wrap">
      <div className="stage-bar">
        <div className="toggle-group">
          <button className={`tog-btn ${mode === 'tac' ? 'active' : ''}`} onClick={() => setMode('tac')}>TAC</button>
          <button className={`tog-btn ${mode === 'quads' ? 'active' : ''}`} onClick={() => setMode('quads')}>Quadruples</button>
        </div>
        <span className="chip">Instructions <strong>{tac.length}</strong></span>
      </div>

      <div className="table-scroll">
        {mode === 'tac' && (
          <div className="tac-list">
            {tac.map((line, i) => {
              const isLabel = /^[A-Za-z0-9_]+:$/.test(line) || line.startsWith('func_');
              return (
                <div key={i} className={`tac-row ${isLabel ? 'tac-label' : ''}`}>
                  <span className="tac-n">{String(i + 1).padStart(3, '0')}</span>
                  <span className="tac-code">{line}</span>
                </div>
              );
            })}
          </div>
        )}

        {mode === 'quads' && (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>op</th>
                <th>arg1</th>
                <th>arg2</th>
                <th>result</th>
              </tr>
            </thead>
            <tbody>
              {(quadruples || []).map((q, i) => (
                <tr key={i}>
                  <td className="td-dim">{i + 1}</td>
                  <td><span className="badge badge-op">{q.op}</span></td>
                  <td className="td-mono">{q.arg1 ?? '—'}</td>
                  <td className="td-mono">{q.arg2 ?? '—'}</td>
                  <td className="td-mono td-accent">{q.result ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
