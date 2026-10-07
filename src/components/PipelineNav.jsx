import React from 'react';

export const PIPELINE_STAGES = [
  { id: 'tokens', label: '1. Lexer', tab: 'Tokens', desc: 'Token Stream' },
  { id: 'ast', label: '2. Parser', tab: 'AST', desc: 'Syntax Tree' },
  { id: 'symbols', label: '3. Semantic', tab: 'Symbol Table', desc: 'Symbol Table' },
  { id: 'tac', label: '4. IR / TAC', tab: 'IR (TAC)', desc: 'Three-Address Code' },
  { id: 'opt', label: '5. Optimizer', tab: 'Optimizer', desc: 'Constant Folding' },
  { id: 'registers', label: '6. RegAlloc', tab: 'Registers & Asm', desc: 'Graph Coloring' },
  { id: 'wat', label: '7. Wasm Gen', tab: 'WAT / Wasm', desc: 'WebAssembly Text' },
  { id: 'run', label: '8. Execution', tab: 'Output & Console', desc: 'Wasm Runtime' },
];

export default function PipelineNav({ activeTab, onSelectTab, compilerResult }) {
  const getStageStatus = (stageId) => {
    if (!compilerResult) return 'idle';
    if (!compilerResult.valid) {
      // Find where errors occurred
      const errs = compilerResult.errors;
      if (stageId === 'tokens' && errs.some(e => e.kind === 'Lexical')) return 'error';
      if (stageId === 'ast' && errs.some(e => e.kind === 'Syntax')) return 'error';
      if (stageId === 'symbols' && errs.some(e => e.kind === 'Semantic')) return 'error';
      if (['tac', 'opt', 'registers', 'wat', 'run'].includes(stageId)) return 'disabled';
    }
    return 'success';
  };

  return (
    <div className="pipeline-container">
      <div className="pipeline-title">COMPILER PIPELINE PIPELINE:</div>
      <div className="pipeline-steps">
        {PIPELINE_STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.id);
          const isActive = activeTab === stage.tab;

          return (
            <React.Fragment key={stage.id}>
              <button
                type="button"
                className={`pipeline-node ${isActive ? 'active' : ''} ${status}`}
                onClick={() => onSelectTab(stage.tab)}
                title={`${stage.label}: ${stage.desc}`}
              >
                <div className="node-icon">
                  {status === 'success' && <span className="icon-check">✓</span>}
                  {status === 'error' && <span className="icon-err">✕</span>}
                  {status === 'idle' && <span className="icon-num">{idx + 1}</span>}
                  {status === 'disabled' && <span className="icon-dash">—</span>}
                </div>
                <div className="node-text">
                  <span className="node-label">{stage.label}</span>
                  <span className="node-desc">{stage.desc}</span>
                </div>
              </button>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className={`pipeline-arrow ${status === 'success' ? 'passed' : ''}`}>→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
