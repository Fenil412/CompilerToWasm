/**
 * WebAssembly Runtime Executor.
 * Compiles WebAssembly Text (WAT) to binary using WABT,
 * instantiates the module via browser WebAssembly API,
 * and intercepts console print() operations.
 */

export async function runWasm(wat) {
  const startTime = performance.now();
  const printed = [];

  try {
    // Dynamic import of wabt toolchain
    const wabtModule = await import('wabt');
    const wabtFactory = wabtModule.default || wabtModule;
    const wabtApi = await wabtFactory();

    // Compile WAT to binary WebAssembly
    const parsedModule = wabtApi.parseWat('program.wat', wat);
    const { buffer } = parsedModule.toBinary({ log: false, write_debug_names: true });

    // Host environment import object
    const importObject = {
      env: {
        print: (val) => {
          const num = Number(val);
          // Format integers cleanly (e.g. 42 instead of 42.0)
          const formatted = Number.isInteger(num) ? num : parseFloat(num.toFixed(6));
          printed.push(formatted);
        }
      }
    };

    // Instantiate and execute in WebAssembly virtual machine
    const { instance } = await WebAssembly.instantiate(buffer, importObject);

    if (typeof instance.exports.run === 'function') {
      instance.exports.run();
    } else {
      throw new Error("Compiled WebAssembly module does not export a 'run' function.");
    }

    const endTime = performance.now();
    const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

    return {
      output: printed,
      executionTimeMs,
      binarySizeBytes: buffer.length,
      success: true
    };
  } catch (err) {
    const endTime = performance.now();
    return {
      output: printed,
      executionTimeMs: parseFloat((endTime - startTime).toFixed(3)),
      error: err.message || String(err),
      success: false
    };
  }
}
