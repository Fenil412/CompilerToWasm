import React, { useState } from 'react';

export default function WatViewer({ wat }) {
  const [copied, setCopied] = useState(false);

  if (!wat) {
    return (
      <div className="empty-state">
        <p>No WebAssembly generated yet. Compile a valid program without errors.</p>
      </div>
    );
  }

  const lines = wat.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(wat);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([wat], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'program.wat';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="wat-container">
      <div className="stage-toolbar">
        <div className="stats-badges">
          <span className="stat-pill">Format: <strong>WebAssembly S-Expression (WAT)</strong></span>
          <span className="stat-pill">Lines: <strong>{lines.length}</strong></span>
          <span className="stat-pill">Target ABI: <strong>MVP WebAssembly</strong></span>
        </div>

        <div className="wat-actions">
          <button type="button" className="btn-sub" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy WAT'}
          </button>
          <button type="button" className="btn-sub" onClick={handleDownload}>
            💾 Download .wat
          </button>
        </div>
      </div>

      <div className="wat-code-wrapper">
        <div className="wat-line-numbers">
          {lines.map((_, i) => (
            <div key={i} className="line-no">{i + 1}</div>
          ))}
        </div>
        <pre className="codebox wat-code">
          {wat}
        </pre>
      </div>
    </div>
  );
}
