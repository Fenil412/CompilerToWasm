import React from 'react';

export default function Header({ status, isValid, hasErrors, errorCount }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="academic-badge">
          <span className="dot pulse"></span>
          <span>B.Tech CSE Semester VII · Principles of Compiler Design (4CS501CC25)</span>
        </div>
        <h1>
          Compiler<span className="gradient-text">ToWasm</span>
          <span className="version-pill">v2.0</span>
        </h1>
        <p className="subtitle">
          Interactive High-Level Language Compiler with End-to-End WebAssembly Generation and Browser Runtime Execution
        </p>
      </div>

      <div className={`status-pill ${hasErrors ? 'status-error' : isValid ? 'status-success' : 'status-ready'}`}>
        <span className={`status-indicator ${isValid ? 'ok' : hasErrors ? 'err' : ''}`} />
        <span className="status-label">{status}</span>
        {hasErrors && <span className="error-counter">{errorCount}</span>}
      </div>
    </header>
  );
}
