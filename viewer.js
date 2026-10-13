/* WebGL viewer with honest model-derived image fallback. No backend access. */
let modelLayout=null,viewMode='loading',activeView='left',showOverlay=false,viewZoom=1;
const views={front:{a:Math.PI,e:.38},rear:{a:0,e:.40},left:{a:3.85,e:.55},right:{a:2.43,e:.55},top:{a:Math.PI,e:Math.PI/2-.001}};
function viewerStatus(message){$('modelStatus').textContent=message;$('modelStatus').hidden=!message;}
function setView(name){
 activeView=name;Object.assign(orbit,views[name]);orbit.target={x:0,y:5,z:0};viewZoom=1;
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
 if(viewMode==='fallback'){$('modelPreview').src='assets/previews/'+name+'.jpg';$('modelPreview').alt='Conceptual building — '+({front:'Toledo Terrace',rear:'rear parking',left:'Dean Drive angle',right:'opposite angle',top:'roof footprint'}[name]);}
 resize();
}
function zoomBy(factor){viewZoom=Math.max(.65,Math.min(5,viewZoom*factor));resize();}
function showModelFallback(reason){
 viewMode='fallback';if(renderer){renderer.dispose();renderer.domElement.remove();renderer=null;}
 const img=$('modelPreview');img.hidden=false;
 viewerStatus('Static model views · interactive 3D unavailable on this device');
 $('viewerMode').textContent='MODEL PREVIEW';$('overlayToggle').disabled=true;
 $('viewerHint').textContent='Choose a view above · use the unit list to select an apartment';
 console.warn('Alterra viewer fallback:',reason);setView(activeView);
}
async function init3D(){
 viewerStatus('Loading architectural model…');
 $('cameraViews').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)setView(b.dataset.view);});
 $('zoomIn').addEventListener('click',()=>zoomBy(1.2));$('zoomOut').addEventListener('click',()=>zoomBy(1/1.2));$('resetView').addEventListener('click',()=>setView(activeView));
 $('overlayToggle').addEventListener('click',()=>{showOverlay=!showOverlay;$('overlayToggle').setAttribute('aria-pressed',showOverlay);recolor();});
 $('unitSelect').addEventListener('change',e=>{if(e.target.value)select(e.target.value)});
 const observer=new ResizeObserver(()=>resize());observer.observe($('scene'));
 try{
  const response=await fetch('assets/model-layout.json');if(!response.ok)throw Error('Model layout unavailable');modelLayout=await response.json();
  if(!window.THREE||!THREE.GLTFLoader)throw Error('3D engine unavailable');
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'default'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  renderer.domElement.setAttribute('aria-label','Interactive conceptual property model');renderer.domElement.setAttribute('tabindex','0');$('scene').prepend(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();showModelFallback('graphics context lost')});
  scene=new THREE.Scene();scene.background=new THREE.Color(0xdce3df);camera=new THREE.OrthographicCamera(-90,90,50,-50,.1,1000);
  scene.add(new THREE.HemisphereLight(0xeaf2ff,0x827866,.85));const sun=new THREE.DirectionalLight(0xfff2de,1.1);sun.position.set(-70,110,-40);scene.add(sun);
  const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().load('assets/alterra-building.glb',resolve,undefined,reject));
  root=gltf.scene;scene.add(root);root.traverse(o=>{if(o.isMesh)o.userData.architecture=true});
  raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
  store.units.forEach((u,i)=>{const t=modelLayout.targets[i];if(!t)return;const mesh=new THREE.Mesh(new THREE.BoxGeometry(t.width,2.5,.24),new THREE.MeshBasicMaterial({color:color(u),transparent:true,opacity:0,depthWrite:false}));mesh.position.set(t.x,t.y,t.z);mesh.rotation.y=t.a;mesh.userData.sel=u.id;meshes.set(u.id,mesh);scene.add(mesh);});
  brackets=new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(1,1,1)),0x318bca);brackets.visible=false;scene.add(brackets);
  const el=renderer.domElement,pointers=new Map();let pinch=0;
  el.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY,a:orbit.a,e:orbit.e,moved:false};el.setPointerCapture(e.pointerId);});
  el.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){const [p,q]=[...pointers.values()],d=Math.hypot(p.x-q.x,p.y-q.y);if(pinch)zoomBy(d/pinch);pinch=d;if(drag)drag.moved=true;return;}
   if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;orbit.a=drag.a-dx*.007;orbit.e=Math.max(.12,Math.min(Math.PI/2-.001,drag.e+dy*.005));
  });
  el.addEventListener('pointerup',e=>{if(pointers.size===1&&!drag?.moved&&!pinch)pick(e);pointers.delete(e.pointerId);drag=null;pinch=0;});
  el.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);drag=null;pinch=0;});
  el.addEventListener('wheel',e=>{e.preventDefault();zoomBy(Math.exp(-e.deltaY*.001))},{passive:false});
  el.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')orbit.a+=.1;if(e.key==='ArrowRight')orbit.a-=.1;if(e.key==='ArrowUp')orbit.e=Math.min(1.56,orbit.e+.08);if(e.key==='ArrowDown')orbit.e=Math.max(.12,orbit.e-.08);if(e.key==='+')zoomBy(1.2);if(e.key==='-')zoomBy(1/1.2);if(e.key==='Home')setView(activeView);});
  viewMode='webgl';$('modelPreview').hidden=true;$('viewerMode').textContent='LIVE 3D';viewerStatus('');setView(activeView);recolor();animate();
 }catch(error){showModelFallback(error.message);}
}
function resize(){
 const holder=$('scene');if(!holder)return;const w=Math.max(1,holder.clientWidth),h=Math.max(1,holder.clientHeight);
 if(viewMode==='fallback'){$('modelPreview').style.transform='scale('+viewZoom+')';return;}
 if(!camera||!renderer)return;const span=190,aspect=w/h;
 camera.left=-span/2;camera.right=span/2;camera.top=span/(2*aspect);camera.bottom=-camera.top;camera.zoom=viewZoom;camera.updateProjectionMatrix();renderer.setSize(w,h);
}
function animate(){if(viewMode!=='webgl'||!renderer)return;requestAnimationFrame(animate);const {a,e,target}=orbit;camera.position.set(target.x+Math.cos(a)*Math.cos(e)*220,target.y+Math.sin(e)*220,target.z+Math.sin(a)*Math.cos(e)*220);camera.lookAt(target.x,target.y,target.z);renderer.render(scene,camera);}
function pick(e){if(viewMode!=='webgl')return;const rect=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects([...meshes.values()]);if(!hits.length)return;const walls=raycaster.intersectObject(root,true);if(walls.length&&walls[0].distance+.65<hits[0].distance)return;select(hits[0].object.userData.sel);}
function select(id){if(!unit(id))return;selected=id;const m=meshes.get(id);if(m&&brackets){brackets.setFromObject(m);brackets.visible=true}render();recolor();$('unitSelect').value=id;}
function recolor(){store.units.forEach(u=>{const m=meshes.get(u.id);if(m){m.material.color.setHex(inspectionFlag(u.id)&&!openWO(u.id).some(w=>w.priority==='emergency')?0x9a75d9:color(u));m.material.opacity=selected===u.id?.65:showOverlay?.30:0}});}
