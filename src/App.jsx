import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import PipelineNav from './components/PipelineNav.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import TokenTable from './components/TokenTable.jsx';
import ASTVisualizer from './components/ASTVisualizer.jsx';
import SymbolTableView from './components/SymbolTableView.jsx';
import IRViewer from './components/IRViewer.jsx';
import OptimizerViewer from './components/OptimizerViewer.jsx';
import RegisterViewer from './components/RegisterViewer.jsx';
import WatViewer from './components/WatViewer.jsx';
import ConsoleOutput from './components/ConsoleOutput.jsx';
import ErrorPanel from './components/ErrorPanel.jsx';

import { compile, runWat, grammar } from './compiler/index.js';
import { SAMPLE_PROGRAMS } from './examples/samplePrograms.js';

const TABS = [
  'Tokens', 'AST', 'Symbol Table', 'IR (TAC)',
  'Optimizer', 'Registers & Asm', 'WAT / Wasm', 'Output & Console'
];

export default function App() {
  const [selectedExample, setSelectedExample] = useState(SAMPLE_PROGRAMS[0].id);
  const [source, setSource]                   = useState(SAMPLE_PROGRAMS[0].code);
  const [compilerResult, setCompilerResult]   = useState(null);
  const [activeTab, setActiveTab]             = useState('Tokens');
  const [executionInfo, setExecutionInfo]     = useState(null);
  const [isRunning, setIsRunning]             = useState(false);
  const [status, setStatus]                   = useState('Ready');

  useEffect(() => {
    const res = compile(source);
    setCompilerResult(res);
    setStatus(res.valid ? 'Ready' : `${res.errors.length} error(s)`);
  }, []);

  const handleCompile = () => {
    const res = compile(source);
    setCompilerResult(res);
    setExecutionInfo(null);
    setStatus(res.valid ? 'Compiled' : `${res.errors.length} error(s)`);
    return res;
  };

  const handleRun = async () => {
    let res = compilerResult;
    if (!res?.valid) res = handleCompile();
    if (!res.valid) { setStatus('Fix errors first'); return; }

    setIsRunning(true);
    setStatus('Running…');
    try {
      const exec = await runWat(res.wat);
      setExecutionInfo(exec);
      setActiveTab('Output & Console');
      setStatus(`Done in ${exec.executionTimeMs}ms`);
    } catch (err) {
      setExecutionInfo({ output: [], error: err.message || String(err), executionTimeMs: 0 });
      setActiveTab('Output & Console');
      setStatus('Runtime error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectExample = (id) => {
    const sample = SAMPLE_PROGRAMS.find(s => s.id === id);
    if (!sample) return;
    setSelectedExample(id);
    setSource(sample.code);
    const res = compile(sample.code);
    setCompilerResult(res);
    setExecutionInfo(null);
    setStatus(res.valid ? `Loaded: ${sample.name}` : `${res.errors.length} error(s)`);
  };

  const handleClear = () => {
    setSource('');
    setCompilerResult(null);
    setExecutionInfo(null);
    setStatus('Ready');
  };

  return (
    <div className="app-shell">
      <Header
        status={status}
        isValid={compilerResult?.valid}
        hasErrors={compilerResult && !compilerResult.valid}
        errorCount={compilerResult?.errors?.length || 0}
      />

      <PipelineNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        compilerResult={compilerResult}
      />

      {compilerResult && !compilerResult.valid && (
        <ErrorPanel errors={compilerResult.errors} source={source} />
      )}

      <main className="workspace">
        <section className="col-editor">
          <CodeEditor
            source={source}
            setSource={setSource}
            selectedExample={selectedExample}
            onSelectExample={handleSelectExample}
            onCompile={handleCompile}
            onRun={handleRun}
            onClear={handleClear}
            isRunning={isRunning}
            isValid={compilerResult?.valid}
          />
        </section>

        <section className="col-inspector">
          <div className="panel inspector-panel">
            <div className="panel-bar inspector-bar">
              <span className="panel-name">Inspector</span>
              <div className="tab-row">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    type="button"
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="stage-content">
              {activeTab === 'Tokens'          && <TokenTable tokens={compilerResult?.tokens} />}
              {activeTab === 'AST'             && <ASTVisualizer ast={compilerResult?.ast} grammar={grammar} />}
              {activeTab === 'Symbol Table'    && <SymbolTableView symbols={compilerResult?.symbols} />}
              {activeTab === 'IR (TAC)'        && <IRViewer tac={compilerResult?.tac} quadruples={compilerResult?.quadruples} />}
              {activeTab === 'Optimizer'       && <OptimizerViewer originalTac={compilerResult?.tac} optimizedTac={compilerResult?.optimized} optimizations={compilerResult?.optimizations} />}
              {activeTab === 'Registers & Asm' && <RegisterViewer allocation={compilerResult?.allocation} assembly={compilerResult?.assembly} />}
              {activeTab === 'WAT / Wasm'      && <WatViewer wat={compilerResult?.wat} />}
              {activeTab === 'Output & Console' && <ConsoleOutput output={executionInfo?.output || []} executionInfo={executionInfo} onRun={handleRun} isRunning={isRunning} onClear={() => setExecutionInfo(null)} />}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
