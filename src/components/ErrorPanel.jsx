import React from 'react';

const KIND_CLASS = {
  Lexical:  'err-lex',
  Syntax:   'err-syn',
  Semantic: 'err-sem',
};

export default function ErrorPanel({ errors, source }) {
  if (!errors?.length) return null;
  const lines = source ? source.split('\n') : [];

  return (
    <div className="error-panel">
      <span className="error-panel-title">⚠ {errors.length} error{errors.length > 1 ? 's' : ''}</span>
      <div className="error-list">
        {errors.map((err, i) => {
          const line = err.line ?? 1;
          const col  = err.column ?? 1;
          const src  = lines[line - 1] || '';
          const pad  = ' '.repeat(Math.max(0, col - 1));
          const cls  = KIND_CLASS[err.kind] || 'err-syn';
          return (
            <div key={i} className="error-item">
              <div className="error-meta">
                <span className={`err-tag ${cls}`}>{err.kind || 'Syntax'}</span>
                <span className="err-loc">Line {line}:{col}</span>
              </div>
              <div className="err-msg">{err.message}</div>
              {src && (
                <pre className="err-snippet">{line} | {src}{'\n'}  | {pad}^</pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
