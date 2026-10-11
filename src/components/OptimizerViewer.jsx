import React from 'react';

export default function OptimizerViewer({ originalTac, optimizedTac, optimizations }) {
  if (!originalTac?.length) {
    return <div className="empty-state">Compile a valid program to see optimizations.</div>;
  }

  const saved = originalTac.length - optimizedTac.length;

  return (
    <div className="stage-wrap">
      <div className="stage-bar">
        <div className="chips">
          <span className="chip">Before <strong>{originalTac.length}</strong></span>
          <span className="chip">After <strong>{optimizedTac.length}</strong></span>
          <span className="chip">Passes <strong>{(optimizations || []).length}</strong></span>
          {saved > 0 && <span className="chip chip-ok">–{saved} instructions</span>}
        </div>
      </div>

      {optimizations?.length > 0 && (
        <div className="opt-log">
          {optimizations.map((o, i) => (
            <div key={i} className="opt-entry">
              <span className="opt-tag">{o.type}</span>
              <span className="opt-before">{o.before}</span>
              <span className="opt-arrow">→</span>
              <span className="opt-after">{o.after}</span>
            </div>
          ))}
        </div>
      )}

      <div className="split-view">
        <div className="split-col">
          <div className="split-head">Before</div>
          <div className="tac-list">
            {originalTac.map((l, i) => (
              <div key={i} className="tac-row">
                <span className="tac-n">{String(i + 1).padStart(3, '0')}</span>
                <span className="tac-code">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="split-col">
          <div className="split-head">After</div>
          <div className="tac-list">
            {optimizedTac.map((l, i) => (
              <div key={i} className="tac-row">
                <span className="tac-n">{String(i + 1).padStart(3, '0')}</span>
                <span className="tac-code">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
