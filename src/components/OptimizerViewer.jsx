import React from 'react';

export default function OptimizerViewer({ originalTac, optimizedTac, optimizations }) {
  if (!originalTac || originalTac.length === 0) {
    return (
      <div className="empty-state">
        <p>No optimization data available. Compile a valid program to inspect intermediate code optimization.</p>
      </div>
    );
  }

  const reduction = originalTac.length - optimizedTac.length;

  return (
    <div className="optimizer-container">
      <div className="stage-toolbar">
        <div className="stats-badges">
          <span className="stat-pill">Original Lines: <strong>{originalTac.length}</strong></span>
          <span className="stat-pill">Optimized Lines: <strong>{optimizedTac.length}</strong></span>
          <span className="stat-pill">Optimizations Applied: <strong>{(optimizations || []).length}</strong></span>
          {reduction > 0 && (
            <span className="stat-pill text-accent">Instructions Saved: <strong>{reduction}</strong></span>
          )}
        </div>
      </div>

      {optimizations && optimizations.length > 0 && (
        <div className="opt-log-section">
          <h4>Transformations Applied</h4>
          <div className="opt-log-cards">
            {optimizations.map((opt, i) => (
              <div key={i} className="opt-card">
                <div className="opt-card-header">
                  <span className="opt-badge">{opt.type}</span>
                  <span className="opt-detail">{opt.detail}</span>
                </div>
                <div className="opt-diff">
                  <span className="diff-before">- {opt.before}</span>
                  <span className="diff-arrow">→</span>
                  <span className="diff-after">+ {opt.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="split-view">
        <div className="split-col">
          <div className="split-header">
            <span>BEFORE OPTIMIZATION (Original TAC)</span>
          </div>
          <div className="tac-lines-wrapper">
            {originalTac.map((line, idx) => (
              <div key={idx} className="tac-line">
                <span className="tac-num">{String(idx + 1).padStart(3, '0')}</span>
                <span className="tac-code">{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="split-col">
          <div className="split-header">
            <span>AFTER OPTIMIZATION (Constant Folded & Propagated)</span>
          </div>
          <div className="tac-lines-wrapper">
            {optimizedTac.map((line, idx) => (
              <div key={idx} className="tac-line">
                <span className="tac-num">{String(idx + 1).padStart(3, '0')}</span>
                <span className="tac-code">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
