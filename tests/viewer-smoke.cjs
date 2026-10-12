// CPU smoke checks only. This does not replace real-browser visual acceptance.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const THREE = {...require('three')};
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    clientWidth: 980, clientHeight: 800, style: {}, handlers: {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    prepend() {}, setPointerCapture() {},
  });
  return elements.get(id);
}
THREE.WebGLRenderer = class {
  constructor() { this.domElement = element('canvas'); }
  setPixelRatio() {} setSize() {} render() {}
};
const context = vm.createContext({THREE, window: {THREE},
  document: {getElementById: element, addEventListener() {}},
  devicePixelRatio: 1, addEventListener() {}, requestAnimationFrame() {},
  setTimeout() {}, clearTimeout() {}, console,
});
const html = fs.readFileSync('index.html', 'utf8');
const source = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x => x[1]).join('\n').replace(/start\(\);\s*$/, '');
vm.runInContext(source, context);
vm.runInContext('init3D()', context);
assert.equal(vm.runInContext('meshes.size', context), 283);
vm.runInContext("select('A-101')", context);
assert.equal(vm.runInContext("meshes.get('A-101').material.opacity", context), .14);
const camera = vm.runInContext('camera', context);
const before = camera.projectionMatrix.elements.slice();
element('canvas').handlers.wheel({preventDefault() {}, deltaY: -100});
assert.notDeepEqual(camera.projectionMatrix.elements, before, 'wheel must change orthographic projection');
element('cameraViews').handlers.click({target: {closest: () => ({dataset: {view: 'front'}})}});
assert.equal(vm.runInContext('orbit.target.x', context), 0);
assert.equal(camera.zoom, 1);
element('scene').clientWidth = 390;
element('scene').clientHeight = 440;
vm.runInContext('resize()', context);
assert.ok(camera.right - camera.left >= 174.99, 'narrow viewport must preserve horizontal fit');
assert.ok(camera.top - camera.bottom >= 144.99, 'narrow viewport must preserve vertical fit');
console.log('PASS: initialization, 283 unit targets, selection, orthographic zoom, preset reset, narrow viewport fit. Rendering is mocked; visual acceptance remains pending.');
