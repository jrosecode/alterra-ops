/* Tests real GLB parsing/cameras; renderer is mocked. Not visual acceptance. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const THREE={...require('three')};global.THREE=THREE;require('../vendor/GLTFLoader.js');
const validator=require('gltf-validator'),asset=fs.readFileSync('assets/alterra-building.glb');
const elements=new Map();function element(id){if(!elements.has(id))elements.set(id,{clientWidth:980,clientHeight:800,style:{},handlers:{},hidden:false,addEventListener(n,f){this.handlers[n]=f},prepend(){},setAttribute(){},remove(){},setPointerCapture(){}});return elements.get(id)}
THREE.WebGLRenderer=class{constructor(){this.domElement=element('canvas')}setPixelRatio(){}setSize(){}render(){}dispose(){}};
const context=vm.createContext({THREE,window:{THREE},document:{getElementById:element,querySelectorAll:()=>[],addEventListener(){}},devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},console,ResizeObserver:class{observe(){}},fetch:async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('assets/model-layout.json','utf8'))})});
let html=fs.readFileSync('index.html','utf8'),source=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(x=>x.trim()!=='start();').join('\n');
vm.runInContext(source,context);vm.runInContext(fs.readFileSync('viewer.js','utf8'),context);
(async()=>{
 const report=await validator.validateBytes(asset,{uri:'alterra-building.glb',maxIssues:20});
 assert.equal(report.issues.numErrors,0,JSON.stringify(report.issues));assert.equal(report.issues.numWarnings,0,JSON.stringify(report.issues));
 const parsed=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(asset.buffer.slice(asset.byteOffset,asset.byteOffset+asset.length),'',resolve,reject));
 let count=0;parsed.scene.traverse(o=>{if(o.isMesh){count++;const p=o.geometry.attributes.position.array;assert.ok([...p].every(Number.isFinite));}});assert.equal(count,19);
 // Isolate network, retaining real GLTFLoader parsing above.
 THREE.GLTFLoader=class{load(url,done){assert.equal(url,'assets/alterra-building.glb');done(parsed)}};
 await vm.runInContext('init3D()',context);assert.equal(vm.runInContext('viewMode',context),'webgl');assert.equal(vm.runInContext('meshes.size',context),283);
 vm.runInContext("select('A-101')",context);assert.equal(vm.runInContext("meshes.get('A-101').material.opacity",context),.65);
 const camera=vm.runInContext('camera',context),before=camera.projectionMatrix.elements.slice();element('canvas').handlers.wheel({preventDefault(){},deltaY:-100});assert.notDeepEqual(camera.projectionMatrix.elements,before);
 vm.runInContext("setView('front')",context);assert.equal(camera.zoom,1);
 vm.runInContext("showModelFallback('test only')",context);assert.equal(element('modelPreview').hidden,false);vm.runInContext("setView('rear')",context);assert.equal(element('modelPreview').src,'assets/previews/rear.jpg');
 const layout=JSON.parse(fs.readFileSync('assets/model-layout.json'));assert.equal(layout.targets.length,283);assert.equal(new Set(layout.targets.map(t=>[t.x,t.y,t.z].join(','))).size,283);
 console.log('PASS: Khronos GLB validation (0 errors/warnings), real glTF parsing, 19 merged meshes, 283 unique targets, selection, zoom/reset, fallback switching. WebGL rendering remains unverified.');
})().catch(e=>{console.error(e);process.exitCode=1});
