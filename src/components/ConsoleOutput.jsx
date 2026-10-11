import React from 'react';

export default function ConsoleOutput({ output, executionInfo, onRun, isRunning }) {
  const ran = executionInfo !== null;

  return (
    <div className="console-wrap">
      <div className="console-bar">
        <div className="term-dots">
          <span className="dot-r" /><span className="dot-y" /><span className="dot-g" />
        </div>
        <span className="console-bar-title">output</span>
        {ran && (
          <div className="console-meta">
            {executionInfo.executionTimeMs !== undefined && (
              <span className="meta-chip">⏱ {executionInfo.executionTimeMs}ms</span>
            )}
            {executionInfo.binarySizeBytes !== undefined && (
              <span className="meta-chip">📦 {executionInfo.binarySizeBytes}b</span>
            )}
          </div>
        )}
        <button type="button" className="btn-run-again" onClick={onRun} disabled={isRunning}>
          {isRunning ? 'Running…' : '▶ Run again'}
        </button>
      </div>

      <div className="console-screen">
        {!ran && (
          <span className="console-hint">$ Click <strong>Run</strong> to execute</span>
        )}

        {ran && (
          <div className="console-lines">
            {output?.length > 0
              ? output.map((v, i) => (
                  <div key={i} className="out-line">
                    <span className="out-idx">#{i + 1}</span>
                    <span className="out-val">{v}</span>
                  </div>
                ))
              : <span className="console-dim">(no output)</span>
            }

            {executionInfo.error
              ? <div className="console-err">✕ {executionInfo.error}</div>
              : <div className="console-ok">✓ Exited in {executionInfo.executionTimeMs}ms</div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
