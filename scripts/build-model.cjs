/* Reproducible conceptual architectural asset. Coordinates traced from IMG_9520.
 * Uniform scale preserves freehand proportions; dimensions and units are not surveyed. */
const THREE=require('three'),fs=require('fs');
const points=[[282,95],[402,95],[674,50],[681,223],[673,244],[524,252],[523,373],[541,422],[707,424],[713,642],[534,645],[531,807],[544,942],[722,955],[729,1213],[459,1200],[459,1281],[477,1517],[753,1526],[780,1670],[357,1680],[326,1673],[313,1630],[301,1430],[296,1112],[478,1115],[480,1003],[340,1009],[317,941],[293,700],[293,621],[364,602],[474,597],[482,530],[480,497],[351,497],[306,483],[296,423],[287,230]];
const footprint=points.map(([x,z])=>[(x-530)*.095,(z-866)*.095]);
const materials=[],chunks=[],targets=[];let currentCategory='architecture';
const mat=(name,color,roughness=.8,metalness=0)=>{const m={name,color,roughness,metalness};materials.push(m);return materials.length-1};
const brick=mat('Warm brick','#996454'),cream=mat('Limestone cladding','#c8c0ae'),trim=mat('Window surrounds','#dedbd0'),glass=mat('Recessed glazing','#384b53',.25,.15),glassLit=mat('Interior curtains','#888b7e'),rail=mat('Graphite railings','#39434a',.65,.15),roof=mat('Roof membrane','#b6bab4'),concrete=mat('Paving','#aaa89b'),asphalt=mat('Asphalt','#434e53'),grass=mat('Planting','#536b51'),leaf=mat('Tree canopy','#516649'),trunk=mat('Tree trunk','#605449'),mechanical=mat('Rooftop mechanical','#838e8c'),line=mat('Parking markings','#c5c4b3'),water=mat('Brick mortar','#ac8270');
function add(g,m,x=0,y=0,z=0,angle=0,name=''){
 const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,angle,0)),new THREE.Vector3(1,1,1));
 g=g.index?g.toNonIndexed():g;g.applyMatrix4(matrix);chunks.push({geometry:g,material:m,category:currentCategory,name});
}
const box=(w,h,d,x,y,z,m,a=0,name='')=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,a,name);
function inside(x,z){let b=false;for(let i=0,j=footprint.length-1;i<footprint.length;j=i++){const a=footprint[i],c=footprint[j];if((a[1]>z)!=(c[1]>z)&&x<(c[0]-a[0])*(z-a[1])/(c[1]-a[1])+a[0])b=!b}return b}
const shape=new THREE.Shape(footprint.map(p=>new THREE.Vector2(...p)));
const shell=new THREE.ExtrudeGeometry(shape,{depth:12.8,bevelEnabled:false,steps:1,curveSegments:1});shell.rotateX(Math.PI/2);shell.translate(0,12.8,0);add(shell,cream,0,0,0,0,'continuous-shell');
// Earcut triangulation of the exact same polygon; one exposed roof cap.
const cap=new THREE.ShapeGeometry(new THREE.Shape(footprint.map(([x,z])=>new THREE.Vector2(x,-z))));cap.rotateX(-Math.PI/2);
cap.translate(0,12.82,0);cap.computeVertexNormals();add(cap,roof,0,0,0,0,'roof');
let bays=[];
for(let i=0;i<footprint.length;i++){
 const [x,z]=footprint[i],[qx,qz]=footprint[(i+1)%footprint.length],dx=qx-x,dz=qz-z,L=Math.hypot(dx,dz),tx=dx/L,tz=dz/L,nx=tz,nz=-tx,a=-Math.atan2(dz,dx);
 const place=(w,h,d,t,y,off,m)=>box(w,h,d,x+dx*t+nx*off,y,z+dz*t+nz*off,m,a);
 place(L+.04,.46,.28,.5,13.04,0,trim);
 place(L,.18,.34,.5,.15,0,concrete);
 const count=Math.floor(L/2.85);if(count<1)continue;
 const bw=L/count;
 for(let j=0;j<count;j++){
  const t=(j+.5)/count,group=Math.floor(j/3),isBrick=(group+i)%3!==1;
  place(bw-.025,12.55,.08,t,6.38,.065,isBrick?brick:cream);
  // Masonry bed joints and siding courses provide material scale without bright gloss.
  for(let y=.34;y<12.6;y+=isBrick?.28:.40)add(new THREE.PlaneGeometry(bw-.03,.014),isBrick?water:concrete,x+dx*t+nx*.12,y,z+dz*t+nz*.12,a+Math.PI);
  const balcony=(group+i)%3===1 && j%3===1 && bw>2.9;
  for(let f=0;f<4;f++){
   const yy=1.7+f*3.12,ww=balcony?1.85:1.35;
   place(ww+.24,2.03,.18,t,yy,.19,trim);
   place(ww,1.8,.09,t,yy,.295,(j+i+f)%11===0?glassLit:glass);
   place(.055,1.8,.07,t,yy,.36,trim);place(ww,.055,.07,t,yy-.07,.36,trim);
   place(ww+.28,.09,.35,t,yy-1.07,.25,concrete);
   if(balcony&&f>0){
    const fy=f*3.12+.35;
    place(2.55,.16,1.65,t,fy,.94,concrete);
    place(2.55,.07,.06,t,fy+1.04,1.75,rail);
    for(let k=-5;k<=5;k++)box(.035,.92,.035,x+dx*t+nx*1.75+tx*k*.235,fy+.52,z+dz*t+nz*1.75+tz*k*.235,rail);
    for(const sign of [-1,1]){box(.05,.065,1.5,x+dx*t+nx*.98+tx*sign*1.23,fy+1.04,z+dz*t+nz*.98+tz*sign*1.23,rail,a);}
   }
  }
  bays.push({x:x+dx*t+nx*.46,z:z+dz*t+nz*.46,a,width:Math.min(2.6,bw-.18)});
 }
}
// Small rooftop condensers, distributed only where all corners lie within roof.
for(let z=-72;z<74;z+=6.6)for(let x=-19;x<20;x+=5.8){if(![[-1.8,-1.8],[-1.8,1.8],[1.8,-1.8],[1.8,1.8]].every(([a,b])=>inside(x+a,z+b)))continue;box(1.3,.55,1.45,x,13.12,z,mechanical);box(.82,.06,.92,x,13.43,z,rail);}
for(const [x,z] of [[-8,-67],[-11,-24],[-11,26],[-7,72]])if(inside(x,z)){box(3,2.0,3.2,x,13.8,z,cream);box(3.25,.15,3.45,x,14.87,z,trim);}
// Entry canopy at a central portion of the Toledo frontage.
box(4.7,.2,2.9,-24.5,3.0,6,rail);box(.14,3,.14,-25.7,1.5,4,rail);box(.14,3,.14,-25.7,1.5,8,rail);
currentCategory='site';
box(88,.35,179,0,-.43,0,grass);
box(12,.08,179,-36,-.2,0,asphalt);box(4.2,.1,179,-28,-.16,0,concrete);
box(15,.08,179,34,-.2,0,asphalt);box(2.4,.1,179,25.3,-.16,0,concrete);
// Sidewalk access at both ends and across courtyard openings.
box(58,.1,2.4,0,-.16,-82,concrete);box(58,.1,2.4,0,-.16,82,concrete);
for(let z=-83;z<85;z+=7.0){box(.12,.012,3,-36,-.14,z,line);box(5.2,.012,.1,38,-.14,z,line);}
for(let z=-78;z<82;z+=14){box(.4,2.4,.4,-25.3,1.0,z,trunk);add(new THREE.IcosahedronGeometry(1.55,1),leaf,-25.3,3.1,z);}
for(let z=-65;z<70;z+=14){for(const x of [-6,16])if(!inside(x,z)){box(.32,2,.32,x,.85,z,trunk);add(new THREE.IcosahedronGeometry(1.7,1),leaf,x,2.8,z);}}
for(let z=-76;z<80;z+=10){box(3.8,.65,1.8,35,.35,z, z%3?rail:cream);box(2.2,.45,1.65,35,.88,z,glass);}
// Schematic facade markers: evenly sampled, unique 71/71/71/70 per floor.
for(let f=0;f<4;f++)for(let i=0;i<(f===3?70:71);i++){const b=bays[Math.floor(i*bays.length/71)];targets.push({...b,y:1.7+f*3.12,floor:f+1,index:f*71+i});}
// Merge by material and category: bounded draw calls, reusable glTF 2.0 asset.
const groups=new Map();for(const c of chunks){const key=c.category+':'+c.material;if(!groups.has(key))groups.set(key,{...c,parts:[]});groups.get(key).parts.push(c.geometry);}
const gltf={asset:{version:'2.0',generator:'Alterra reproducible sketch reconstruction'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'Alterra concept — schematic units',children:[]}],meshes:[],materials:materials.map(m=>{const c=new THREE.Color(m.color).convertSRGBToLinear();return {name:m.name,pbrMetallicRoughness:{baseColorFactor:[c.r,c.g,c.b,1],metallicFactor:m.metalness,roughnessFactor:m.roughness},doubleSided:false}}),buffers:[],bufferViews:[],accessors:[],extras:{footprint,targets,floors:4,approximations:'Freehand footprint. Facade rhythms, roof equipment, landscape and unit mapping are conceptual.'}};
let offset=0,buffers=[];const renderData=[];
function attribute(arr,type,min,max){const b=Buffer.from(arr.buffer);gltf.bufferViews.push({buffer:0,byteOffset:offset,byteLength:b.length,target:34962});buffers.push(b);offset+=b.length;const a={bufferView:gltf.bufferViews.length-1,componentType:5126,count:arr.length/(type==='VEC2'?2:3),type};if(min){a.min=min;a.max=max}gltf.accessors.push(a);return gltf.accessors.length-1;}
for(const group of groups.values()){
 let pos=[],nor=[];for(const g of group.parts){pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array)}
 const p=new Float32Array(pos),n=new Float32Array(nor),mn=[Infinity,Infinity,Infinity],mx=[-Infinity,-Infinity,-Infinity];for(let i=0;i<p.length;i++) {mn[i%3]=Math.min(mn[i%3],p[i]);mx[i%3]=Math.max(mx[i%3],p[i]);}
 const pi=attribute(p,'VEC3',mn,mx),ni=attribute(n,'VEC3');gltf.meshes.push({name:group.category+' / '+materials[group.material].name,primitives:[{attributes:{POSITION:pi,NORMAL:ni},material:group.material}]});gltf.nodes.push({mesh:gltf.meshes.length-1});gltf.nodes[0].children.push(gltf.nodes.length-1);
 renderData.push({positions:pos,normals:nor,color:materials[group.material].color,category:group.category});
}
const binary=Buffer.concat(buffers);gltf.buffers=[{byteLength:binary.length}];
let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);const bh=Buffer.alloc(8);bh.writeUInt32LE(binary.length,0);bh.writeUInt32LE(0x004e4942,4);
fs.writeFileSync('assets/alterra-building.glb',Buffer.concat([header,json,bh,binary]));
fs.writeFileSync('assets/model-layout.json',JSON.stringify({footprint,targets,bounds:{width:88,length:179,height:15},version:'sketch-v2',approximations:gltf.extras.approximations},null,2));
if(process.env.MODEL_RENDER_DATA)fs.writeFileSync(process.env.MODEL_RENDER_DATA,JSON.stringify(renderData));
console.log(`${chunks.length} source parts → ${gltf.meshes.length} meshes; ${binary.length/1024|0} KB buffer; ${targets.length} schematic targets`);
