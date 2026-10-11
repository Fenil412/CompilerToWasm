import React, { useState } from 'react';

export default function WatViewer({ wat }) {
  const [copied, setCopied] = useState(false);

  if (!wat) {
    return <div className="empty-state">Compile a valid program to see WebAssembly text.</div>;
  }

  const lines = wat.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(wat);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([wat], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'program.wat'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stage-wrap">
      <div className="stage-bar">
        <div className="chips">
          <span className="chip">WAT</span>
          <span className="chip"><strong>{lines.length}</strong> lines</span>
        </div>
        <div className="btn-group">
          <button type="button" className="btn-sm" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button type="button" className="btn-sm" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>

      <div className="wat-body">
        <div className="wat-nums" aria-hidden="true">
          {lines.map((_, i) => <div key={i} className="line-no">{i + 1}</div>)}
        </div>
        <pre className="codebox wat-code">{wat}</pre>
      </div>
    </div>
  );
}
