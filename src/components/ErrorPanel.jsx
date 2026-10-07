import React from 'react';

export default function ErrorPanel({ errors, source }) {
  if (!errors || errors.length === 0) return null;

  const sourceLines = source ? source.split('\n') : [];

  const getBadgeClass = (kind) => {
    switch (kind) {
      case 'Lexical': return 'badge-lex-err';
      case 'Syntax': return 'badge-syntax-err';
      case 'Semantic': return 'badge-semantic-err';
      default: return 'badge-runtime-err';
    }
  };

  return (
    <div className="error-panel-container">
      <div className="error-header">
        <span className="error-icon">⚠️</span>
        <h4>Compilation Diagnostics ({errors.length} issue{errors.length > 1 ? 's' : ''} found)</h4>
      </div>

      <div className="error-list">
        {errors.map((err, idx) => {
          const lineNum = err.line ?? 1;
          const colNum = err.column ?? 1;
          const errorLine = sourceLines[lineNum - 1] || '';
          const pointerIndent = ' '.repeat(Math.max(0, colNum - 1));

          return (
            <div key={idx} className="error-card">
              <div className="error-card-header">
                <span className={`error-kind-badge ${getBadgeClass(err.kind)}`}>
                  {err.kind || 'Syntax'} Error
                </span>
                <span className="error-loc">
                  Line {lineNum}, Column {colNum}
                </span>
              </div>

              <div className="error-message">
                {err.message}
              </div>

              {errorLine && (
                <div className="error-snippet">
                  <div className="snippet-line">
                    <span className="snippet-num">{lineNum} |</span>
                    <span className="snippet-code">{errorLine}</span>
                  </div>
                  <div className="snippet-pointer">
                    <span className="snippet-num">  |</span>
                    <span className="pointer-chars">{pointerIndent}^</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
