/**
 * Re-export wrapper for backwards compatibility.
 * Core compiler modules are organized under src/compiler/.
 */

export * from './compiler/index.js';
export { compile, grammar, runWat } from './compiler/index.js';
