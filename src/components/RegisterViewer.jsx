import React, { useState } from 'react';

export default function RegisterViewer({ allocation, assembly }) {
  const [mode, setMode] = useState('regs');

  if (!allocation?.variables?.length) {
    return <div className="empty-state">Compile a program with variables to see register allocation.</div>;
  }

  const { variables, edges, colors, registerCount, spillCount } = allocation;

  return (
    <div className="stage-wrap">
      <div className="stage-bar">
        <div className="toggle-group">
          <button className={`tog-btn ${mode === 'regs' ? 'active' : ''}`} onClick={() => setMode('regs')}>Registers</button>
          <button className={`tog-btn ${mode === 'asm' ? 'active' : ''}`} onClick={() => setMode('asm')}>Assembly</button>
        </div>
        <div className="chips">
          <span className="chip">K = <strong>{registerCount}</strong></span>
          <span className="chip">Vars <strong>{variables.length}</strong></span>
          <span className="chip">Spills <strong>{spillCount}</strong></span>
        </div>
      </div>

      {mode === 'regs' && (
        <div className="table-scroll">
          <div className="info-card">
            Graph-coloring register allocation with K = {registerCount} registers.
            Variables sharing a live range get different registers; overflow is spilled to memory.
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Assigned</th>
                <th>Degree</th>
                <th>Interferes with</th>
              </tr>
            </thead>
            <tbody>
              {variables.map(v => {
                const loc   = colors[v] || '—';
                const spill = loc.startsWith('MEM');
                const nbrs  = edges[v] || [];
                return (
                  <tr key={v}>
                    <td className="td-mono"><strong>{v}</strong></td>
                    <td><span className={`badge ${spill ? 'badge-spill' : 'badge-reg'}`}>{loc}</span></td>
                    <td className="td-num">{nbrs.length}</td>
                    <td className="td-dim td-mono">{nbrs.length ? nbrs.join(', ') : 'none'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'asm' && (
        <div className="table-scroll">
          <pre className="codebox asm-view">{assembly || '; no assembly'}</pre>
        </div>
      )}
    </div>
  );
}
