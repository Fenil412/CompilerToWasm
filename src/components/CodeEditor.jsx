import React, { useRef } from 'react';
import { SAMPLE_PROGRAMS } from '../examples/samplePrograms.js';

export default function CodeEditor({
  source,
  setSource,
  selectedExample,
  onSelectExample,
  onCompile,
  onRun,
  onClear,
  isRunning,
  isValid
}) {
  const lineCount = source.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);
  const textareaRef = useRef(null);
  const linesRef = useRef(null);

  const handleScroll = (e) => {
    if (linesRef.current) {
      linesRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCompile();
    }
  };

  // Group sample programs by category
  const categories = [...new Set(SAMPLE_PROGRAMS.map(s => s.category))];

  return (
    <div className="panel editor-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-step">01</span>
          <span className="panel-title">SOURCE PROGRAM</span>
          <span className="badge-lang">MiniLang</span>
        </div>

        <div className="editor-controls">
          <label className="select-wrapper">
            <span className="select-label">Load Sample:</span>
            <select
              value={selectedExample}
              onChange={(e) => onSelectExample(e.target.value)}
              className="example-select"
            >
              {categories.map(cat => (
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {SAMPLE_PROGRAMS.filter(s => s.category === cat).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="editor-wrapper">
        <div className="line-numbers" ref={linesRef}>
          {lineNumbers.map(n => (
            <div key={n} className="line-no">{n}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          spellCheck="false"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="// Type MiniLang code here or select an example above..."
          className="code-textarea"
          aria-label="Source Code Input"
        />
      </div>

      <div className="editor-footer">
        <div className="editor-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onCompile}
            title="Compile source code through all pipeline phases (Ctrl+Enter)"
          >
            <span className="btn-icon">⚡</span> Compile
          </button>

          <button
            type="button"
            className="btn btn-success"
            onClick={onRun}
            disabled={isRunning}
            title="Compile and execute WebAssembly module in the browser"
          >
            <span className="btn-icon">{isRunning ? '⏳' : '▶'}</span>
            {isRunning ? 'Executing…' : 'Run WebAssembly'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClear}
            title="Clear editor and results"
          >
            Clear
          </button>
        </div>

        <div className="editor-hint">
          <span>Tip: Press <code>Ctrl+Enter</code> to compile</span>
        </div>
      </div>
    </div>
  );
}
