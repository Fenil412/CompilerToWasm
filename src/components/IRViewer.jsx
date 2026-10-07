import React, { useState } from 'react';

export default function IRViewer({ tac, quadruples }) {
  const [viewMode, setViewMode] = useState('tac'); // 'tac' | 'quadruples'

  if (!tac || tac.length === 0) {
    return (
      <div className="empty-state">
        <p>No Intermediate Code generated. Ensure your program has no syntax or semantic errors.</p>
      </div>
    );
  }

  return (
    <div className="ir-container">
      <div className="stage-toolbar">
        <div className="view-toggle-buttons">
          <button
            type="button"
            className={`btn-sub ${viewMode === 'tac' ? 'active' : ''}`}
            onClick={() => setViewMode('tac')}
          >
            📋 Three-Address Code (TAC)
          </button>
          <button
            type="button"
            className={`btn-sub ${viewMode === 'quadruples' ? 'active' : ''}`}
            onClick={() => setViewMode('quadruples')}
          >
            📊 Quadruples Table (Op, Arg1, Arg2, Res)
          </button>
        </div>

        <div className="stats-badges">
          <span className="stat-pill">Instructions: <strong>{tac.length}</strong></span>
        </div>
      </div>

      <div className="ir-content">
        {viewMode === 'tac' && (
          <div className="tac-lines-wrapper">
            {tac.map((line, idx) => {
              const isLabel = /^[A-Za-z0-9_]+:$/.test(line) || line.startsWith('func_');
              return (
                <div key={idx} className={`tac-line ${isLabel ? 'label-line' : ''}`}>
                  <span className="tac-num">{String(idx + 1).padStart(3, '0')}</span>
                  <span className="tac-code">{line}</span>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'quadruples' && (
          <div className="table-wrapper">
            <table className="token-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Operator (op)</th>
                  <th>Argument 1 (arg1)</th>
                  <th>Argument 2 (arg2)</th>
                  <th>Result (result)</th>
                </tr>
              </thead>
              <tbody>
                {(quadruples || []).map((q, idx) => (
                  <tr key={idx}>
                    <td className="cell-muted">{idx + 1}</td>
                    <td>
                      <span className="token-badge badge-operator">{q.op}</span>
                    </td>
                    <td className="cell-code">{q.arg1 !== null ? q.arg1 : '—'}</td>
                    <td className="cell-code">{q.arg2 !== null ? q.arg2 : '—'}</td>
                    <td className="cell-code">
                      <strong className="text-accent">{q.result !== null ? q.result : '—'}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
