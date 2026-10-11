import React from 'react';

export default function Header({ status, isValid, hasErrors, errorCount }) {
  const statusClass = hasErrors ? 'status-error' : isValid ? 'status-ok' : 'status-idle';

  return (
    <header className="app-header">
      <div className="brand">
        <h1>Compiler<span className="brand-accent">ToWasm</span></h1>
        <span className="brand-sub">MiniLang → WebAssembly</span>
      </div>

      <div className={`status-chip ${statusClass}`}>
        <span className="status-dot" />
        <span>{status}</span>
        {hasErrors && <span className="err-badge">{errorCount}</span>}
      </div>
    </header>
  );
}
