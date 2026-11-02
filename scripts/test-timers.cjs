const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function load(file, dependencies, globals = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { module, exports: module.exports, require: name => dependencies[name], ...globals });
  return module.exports;
}
const timing = load('src/utils/timing.ts', {});
const { getTimerSnapshot: snapshot } = timing;
assert.equal(snapshot(0, 30, 1).remainingSeconds, 30);
assert.equal(snapshot(0, 30, 29999).remainingSeconds, 1);
assert.equal(snapshot(0, 30, 29999).complete, false);
assert.equal(snapshot(0, 30, 30000).complete, true);
assert.equal(snapshot(0, 30, 45000).elapsedSeconds, 30);
assert.equal(snapshot(0, 0, 45000, true).elapsedSeconds, 45);
assert.equal(snapshot(0, 0, 45000, true).complete, false);
assert.equal(snapshot(0, 0, 0).complete, true);
assert.equal(snapshot(1000, 30, 0).remainingSeconds, 30);
assert.equal(timing.isPerSideDuration({ targetDuration: 60, targetDescription: '1 min each side' }), true);
assert.equal(timing.isPerSideDuration({ targetReps: 10, targetDescription: '10 each side' }), false);

// Small hook harness: exercise the actual timer lifecycle with a controlled clock.
function harness(target, openEnded = false) {
  let now = 0, cursor = 0, pendingEffect, cleanup, interval, listener;
  let effectDeps;
  const slots = [];
  const appState = { currentState: 'active', addEventListener: (_, fn) => {
    listener = fn;
    return { remove: () => { listener = undefined; } };
  } };
  const react = {
    useRef: initial => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useState: initial => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], value => { slots[i] = value; }];
    },
    useEffect: (fn, deps) => {
      if (!effectDeps || deps.some((v, i) => v !== effectDeps[i])) {
        pendingEffect = fn;
        effectDeps = deps;
      }
    },
  };
  const { useWorkoutTimer } = load('src/hooks/useWorkoutTimer.ts', {
    react, 'react-native': { AppState: appState }, '../utils/timing': timing,
  }, { Date: { now: () => now }, setInterval: fn => { interval = fn; return 1; }, clearInterval: () => { interval = undefined; } });
  let calls = [];
  let callback = value => calls.push(value);
  function render() {
    cursor = 0;
    const result = useWorkoutTimer(target, openEnded, callback);
    if (pendingEffect) { cleanup?.(); const effect = pendingEffect; pendingEffect = undefined; cleanup = effect(); }
    return result;
  }
  render();
  return {
    render, calls,
    advance(ms) { now = ms; interval?.(); },
    state(value) { appState.currentState = value; listener?.(value); },
    replaceCallback(fn) { callback = fn; render(); },
    unmount() { cleanup(); assert.equal(interval, undefined); assert.equal(listener, undefined); },
  };
}
let timer = harness(30);
timer.advance(250);
assert.equal(timer.render().remainingSeconds, 30);
timer.state('background');
timer.advance(45000);
assert.equal(timer.calls.length, 0);
timer.state('active');
assert.deepEqual(timer.calls, [30]);
timer.advance(46000);
timer.render().stop();
assert.deepEqual(timer.calls, [30]);
timer.unmount();
timer = harness(30);
timer.advance(12500);
let latest;
timer.replaceCallback(value => { latest = value; });
timer.render().stop();
assert.equal(latest, 12);
assert.equal(timer.calls.length, 0);
timer.unmount();
timer = harness(0, true);
timer.advance(7200000);
assert.equal(timer.render().elapsedSeconds, 7200);
assert.equal(timer.calls.length, 0);
timer.render().stop();
assert.deepEqual(timer.calls, [7200]);
timer.unmount();
timer = harness(0);
assert.deepEqual(timer.calls, [0]);
timer.unmount();
console.log('PASS: countdown boundaries, delayed ticks, background/foreground, callback replacement, single completion, manual stop, max-time, zero rest, cleanup.');
