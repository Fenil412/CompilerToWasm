import React from 'react';

export default function ConsoleOutput({ output, executionInfo, onRun, isRunning, onClear }) {
  const hasExecuted = executionInfo !== null;

  return (
    <div className="console-container">
      <div className="console-toolbar">
        <div className="console-title-group">
          <span className="terminal-dot red"></span>
          <span className="terminal-dot yellow"></span>
          <span className="terminal-dot green"></span>
          <span className="console-title">WebAssembly Runtime Console (Browser V8 / SpiderMonkey VM)</span>
        </div>

        <div className="console-actions">
          {hasExecuted && (
            <div className="perf-badges">
              {executionInfo.executionTimeMs !== undefined && (
                <span className="perf-badge">⏱ {executionInfo.executionTimeMs} ms</span>
              )}
              {executionInfo.binarySizeBytes !== undefined && (
                <span className="perf-badge">📦 {executionInfo.binarySizeBytes} bytes</span>
              )}
            </div>
          )}

          <button
            type="button"
            className="btn-sub"
            onClick={onRun}
            disabled={isRunning}
          >
            {isRunning ? 'Running…' : '▶ Execute Again'}
          </button>
        </div>
      </div>

      <div className="console-screen">
        {!hasExecuted && (
          <div className="console-prompt">
            <span className="prompt-arrow">$</span>
            <span className="prompt-msg">Click <strong>Run WebAssembly</strong> to instantiate and execute the compiled binary module in the browser.</span>
          </div>
        )}

        {hasExecuted && (
          <div className="console-logs">
            <div className="console-line system-line">
              <span className="line-prefix">[SYSTEM]</span>
              <span>Instantiating WebAssembly module via <code>WebAssembly.instantiate()</code>...</span>
            </div>

            <div className="console-line system-line">
              <span className="line-prefix">[SYSTEM]</span>
              <span>Bound host import: <code>env.print(f64)</code></span>
            </div>

            <div className="console-line system-line">
              <span className="line-prefix">[SYSTEM]</span>
              <span>Invoking exported function: <code>instance.exports.run()</code></span>
            </div>

            <div className="console-divider">────────── Output Stream ──────────</div>

            {output && output.length > 0 ? (
              output.map((val, idx) => (
                <div key={idx} className="console-line output-line">
                  <span className="line-prefix">[PRINT #{idx + 1}]</span>
                  <span className="output-val">{val}</span>
                </div>
              ))
            ) : (
              <div className="console-line muted-line">
                <em>(No print() statements called during execution)</em>
              </div>
            )}

            <div className="console-divider">───────────────────────────────────</div>

            {executionInfo.error ? (
              <div className="console-line error-line">
                <span className="line-prefix">[RUNTIME ERROR]</span>
                <span>{executionInfo.error}</span>
              </div>
            ) : (
              <div className="console-line success-line">
                <span className="line-prefix">[EXIT]</span>
                <span>Process exited normally (code 0) in {executionInfo.executionTimeMs}ms.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
