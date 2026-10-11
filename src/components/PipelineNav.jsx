import React from 'react';

export const PIPELINE_STAGES = [
  { id: 'tokens',    label: 'Lexer',      tab: 'Tokens',           desc: 'Token stream' },
  { id: 'ast',       label: 'Parser',     tab: 'AST',              desc: 'Syntax tree' },
  { id: 'symbols',   label: 'Semantic',   tab: 'Symbol Table',     desc: 'Symbol table' },
  { id: 'tac',       label: 'IR / TAC',   tab: 'IR (TAC)',         desc: '3-address code' },
  { id: 'opt',       label: 'Optimizer',  tab: 'Optimizer',        desc: 'Const folding' },
  { id: 'registers', label: 'RegAlloc',   tab: 'Registers & Asm',  desc: 'Graph coloring' },
  { id: 'wat',       label: 'Wasm Gen',   tab: 'WAT / Wasm',       desc: 'WAT output' },
  { id: 'run',       label: 'Execute',    tab: 'Output & Console', desc: 'Wasm runtime' },
];

export default function PipelineNav({ activeTab, onSelectTab, compilerResult }) {
  const getStatus = (id) => {
    if (!compilerResult) return 'idle';
    if (!compilerResult.valid) {
      const errs = compilerResult.errors;
      if (id === 'tokens'    && errs.some(e => e.kind === 'Lexical'))   return 'error';
      if (id === 'ast'       && errs.some(e => e.kind === 'Syntax'))    return 'error';
      if (id === 'symbols'   && errs.some(e => e.kind === 'Semantic'))  return 'error';
      if (['tac','opt','registers','wat','run'].includes(id))           return 'disabled';
    }
    return 'success';
  };

  return (
    <nav className="pipeline-nav">
      <span className="pipeline-label">Pipeline</span>
      <div className="pipeline-steps">
        {PIPELINE_STAGES.map((stage, idx) => {
          const s = getStatus(stage.id);
          const active = activeTab === stage.tab;
          return (
            <React.Fragment key={stage.id}>
              <button
                type="button"
                className={`pipe-node ${active ? 'active' : ''} ${s}`}
                onClick={() => onSelectTab(stage.tab)}
                title={stage.desc}
              >
                <span className="pipe-icon">
                  {s === 'success'  && '✓'}
                  {s === 'error'    && '✕'}
                  {s === 'idle'     && (idx + 1)}
                  {s === 'disabled' && '–'}
                </span>
                <span className="pipe-label">{stage.label}</span>
              </button>
              {idx < PIPELINE_STAGES.length - 1 && (
                <span className={`pipe-arrow ${s === 'success' ? 'done' : ''}`}>›</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
