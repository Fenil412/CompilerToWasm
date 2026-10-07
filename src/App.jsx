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
  'Tokens',
  'AST',
  'Symbol Table',
  'IR (TAC)',
  'Optimizer',
  'Registers & Asm',
  'WAT / Wasm',
  'Output & Console'
];

export default function App() {
  const [selectedExample, setSelectedExample] = useState(SAMPLE_PROGRAMS[0].id);
  const [source, setSource] = useState(SAMPLE_PROGRAMS[0].code);
  const [compilerResult, setCompilerResult] = useState(null);
  const [activeTab, setActiveTab] = useState('Tokens');
  const [executionInfo, setExecutionInfo] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Ready');

  // Initial compilation on mount
  useEffect(() => {
    const res = compile(source);
    setCompilerResult(res);
    setStatus(res.valid ? 'Ready to execute' : `${res.errors.length} issue(s) detected`);
  }, []);

  const handleCompile = () => {
    const res = compile(source);
    setCompilerResult(res);
    setExecutionInfo(null);
    if (res.valid) {
      setStatus('Compiled successfully');
    } else {
      setStatus(`${res.errors.length} issue(s) detected in source`);
    }
    return res;
  };

  const handleRun = async () => {
    let res = compilerResult;
    // Recompile if needed
    if (!res || !res.valid) {
      res = handleCompile();
    }

    if (!res.valid) {
      setStatus('Cannot execute: fix compilation errors first');
      return;
    }

    setIsRunning(true);
    setStatus('Executing WebAssembly in browser VM...');
    try {
      const execRes = await runWat(res.wat);
      setExecutionInfo(execRes);
      setActiveTab('Output & Console');
      setStatus(`Wasm executed in ${execRes.executionTimeMs}ms`);
    } catch (err) {
      setExecutionInfo({
        output: [],
        error: err.message || String(err),
        executionTimeMs: 0
      });
      setActiveTab('Output & Console');
      setStatus('WebAssembly runtime error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectExample = (id) => {
    const sample = SAMPLE_PROGRAMS.find(s => s.id === id);
    if (sample) {
      setSelectedExample(id);
      setSource(sample.code);
      const res = compile(sample.code);
      setCompilerResult(res);
      setExecutionInfo(null);
      setStatus(res.valid ? `Loaded "${sample.name}"` : `${res.errors.length} issue(s) detected`);
    }
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

      <main className="workspace-grid">
        {/* Left Column: Code Editor */}
        <section className="column-editor">
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

        {/* Right Column: Multi-Stage Inspector */}
        <section className="column-inspector">
          <div className="panel inspector-panel">
            <div className="panel-header inspector-header">
              <div className="panel-title-group">
                <span className="panel-step">02</span>
                <span className="panel-title">COMPILER PIPELINE INSPECTOR</span>
              </div>

              <div className="inspector-tabs">
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

            <div className="inspector-stage-content">
              {activeTab === 'Tokens' && (
                <TokenTable tokens={compilerResult?.tokens} />
              )}

              {activeTab === 'AST' && (
                <ASTVisualizer ast={compilerResult?.ast} grammar={grammar} />
              )}

              {activeTab === 'Symbol Table' && (
                <SymbolTableView symbols={compilerResult?.symbols} />
              )}

              {activeTab === 'IR (TAC)' && (
                <IRViewer
                  tac={compilerResult?.tac}
                  quadruples={compilerResult?.quadruples}
                />
              )}

              {activeTab === 'Optimizer' && (
                <OptimizerViewer
                  originalTac={compilerResult?.tac}
                  optimizedTac={compilerResult?.optimized}
                  optimizations={compilerResult?.optimizations}
                />
              )}

              {activeTab === 'Registers & Asm' && (
                <RegisterViewer
                  allocation={compilerResult?.allocation}
                  assembly={compilerResult?.assembly}
                />
              )}

              {activeTab === 'WAT / Wasm' && (
                <WatViewer wat={compilerResult?.wat} />
              )}

              {activeTab === 'Output & Console' && (
                <ConsoleOutput
                  output={executionInfo?.output || []}
                  executionInfo={executionInfo}
                  onRun={handleRun}
                  isRunning={isRunning}
                  onClear={() => setExecutionInfo(null)}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-col">
            <strong>Architecture</strong>
            <span>Handwritten Scanner → Recursive-Descent Parser → Multi-Scope Symbol Table → TAC IR → Constant Optimizer → Graph-Coloring RegAlloc → WAT Emitter → Browser Wasm VM</span>
          </div>
          <div className="footer-col">
            <strong>Standards & Tooling</strong>
            <span>W3C WebAssembly MVP · WABT Toolchain · React 18 · Vite · Zero external network dependencies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
