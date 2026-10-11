import React, { useRef } from 'react';
import { SAMPLE_PROGRAMS } from '../examples/samplePrograms.js';

export default function CodeEditor({
  source, setSource,
  selectedExample, onSelectExample,
  onCompile, onRun, onClear,
  isRunning, isValid
}) {
  const lineCount   = source.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);
  const textareaRef = useRef(null);
  const linesRef    = useRef(null);

  const handleScroll = (e) => {
    if (linesRef.current) linesRef.current.scrollTop = e.target.scrollTop;
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCompile();
    }
  };

  const categories = [...new Set(SAMPLE_PROGRAMS.map(s => s.category))];

  return (
    <div className="panel editor-panel">
      <div className="panel-bar">
        <span className="panel-name">Source</span>
        <span className="lang-tag">MiniLang</span>
        <select
          value={selectedExample}
          onChange={(e) => onSelectExample(e.target.value)}
          className="example-select"
          aria-label="Load example program"
        >
          {categories.map(cat => (
            <optgroup key={cat} label={cat}>
              {SAMPLE_PROGRAMS.filter(s => s.category === cat).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="editor-body">
        <div className="line-nums" ref={linesRef} aria-hidden="true">
          {lineNumbers.map(n => <div key={n} className="line-no">{n}</div>)}
        </div>
        <textarea
          ref={textareaRef}
          spellCheck="false"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="// Write MiniLang code or pick an example above..."
          className="code-textarea"
          aria-label="Source code"
        />
      </div>

      <div className="editor-foot">
        <div className="editor-actions">
          <button type="button" className="btn btn-compile" onClick={onCompile}
            title="Ctrl+Enter">
            ⚡ Compile
          </button>
          <button type="button" className="btn btn-run" onClick={onRun} disabled={isRunning}>
            {isRunning ? '⏳ Running…' : '▶ Run'}
          </button>
          <button type="button" className="btn btn-clear" onClick={onClear}>
            Clear
          </button>
        </div>
        <span className="editor-tip">Ctrl+Enter to compile</span>
      </div>
    </div>
  );
}
