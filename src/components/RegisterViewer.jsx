import React, { useState } from 'react';

export default function RegisterViewer({ allocation, assembly }) {
  const [viewMode, setViewMode] = useState('registers'); // 'registers' | 'assembly'

  if (!allocation || !allocation.variables || allocation.variables.length === 0) {
    return (
      <div className="empty-state">
        <p>No register allocation data. Compile a program with variable assignments to see graph coloring.</p>
      </div>
    );
  }

  const { variables, edges, colors, registerCount, spillCount } = allocation;

  return (
    <div className="reg-container">
      <div className="stage-toolbar">
        <div className="view-toggle-buttons">
          <button
            type="button"
            className={`btn-sub ${viewMode === 'registers' ? 'active' : ''}`}
            onClick={() => setViewMode('registers')}
          >
            🎨 Register Allocation & Interference Graph
          </button>
          <button
            type="button"
            className={`btn-sub ${viewMode === 'assembly' ? 'active' : ''}`}
            onClick={() => setViewMode('assembly')}
          >
            ⚙️ Pseudo-Assembly Code
          </button>
        </div>

        <div className="stats-badges">
          <span className="stat-pill">Physical Registers (K): <strong>{registerCount}</strong></span>
          <span className="stat-pill">Allocated Variables: <strong>{variables.length}</strong></span>
          <span className="stat-pill">Spills: <strong>{spillCount}</strong></span>
        </div>
      </div>

      {viewMode === 'registers' && (
        <div className="reg-content">
          <div className="reg-theory-card">
            <h4>Chaitin's Graph-Coloring Heuristic</h4>
            <p>
              Each variable/temporary represents a graph node. An edge connects two variables if their live ranges
              overlap (they are simultaneously live). The graph is colored using <strong>K = {registerCount}</strong> register colors (R1–R{registerCount}).
              Nodes with degree ≥ K that cannot be colored are spilled to memory slots.
            </p>
          </div>

          <div className="table-wrapper">
            <table className="token-table">
              <thead>
                <tr>
                  <th>Variable / Temp</th>
                  <th>Assigned Location</th>
                  <th>Graph Degree</th>
                  <th>Interfering Variables (Edges)</th>
                </tr>
              </thead>
              <tbody>
                {variables.map((v) => {
                  const assigned = colors[v] || '—';
                  const isSpill = assigned.startsWith('MEM');
                  const neighbors = edges[v] || [];

                  return (
                    <tr key={v}>
                      <td className="cell-code">
                        <strong>{v}</strong>
                      </td>
                      <td>
                        <span className={`reg-badge ${isSpill ? 'badge-spill' : 'badge-reg'}`}>
                          {assigned}
                        </span>
                      </td>
                      <td className="cell-num">{neighbors.length}</td>
                      <td className="cell-code cell-muted">
                        {neighbors.length > 0 ? neighbors.join(', ') : 'None (no interference)'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'assembly' && (
        <div className="assembly-content">
          <pre className="codebox assembly-view">
            {assembly || '; No assembly generated.'}
          </pre>
        </div>
      )}
    </div>
  );
}
