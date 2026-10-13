const fs=require('node:fs');
fs.mkdirSync('dist',{recursive:true});
for(const p of ['index.html','viewer.js','dashboard.css'])fs.copyFileSync(p,'dist/'+p);
fs.cpSync('vendor','dist/vendor',{recursive:true});
fs.mkdirSync('dist/assets',{recursive:true});
for(const p of ['alterra-building.glb','model-layout.json'])fs.copyFileSync('assets/'+p,'dist/assets/'+p);
fs.cpSync('assets/previews','dist/assets/previews',{recursive:true});
console.log('Packaged dashboard, viewer, model, fallback views and licensed dependencies in dist/.');
