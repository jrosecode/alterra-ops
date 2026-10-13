"""CPU depth-buffered views of the exact exported mesh, not AI reference images."""
import json,math,os
import numpy as np
from PIL import Image, ImageDraw
from pathlib import Path
raw=json.load(open(os.environ.get('MODEL_RENDER_DATA','../model-render-data.json')))
positions=[];normals=[];colors=[]
for g in raw:
 p=np.array(g['positions']).reshape(-1,3,3); n=np.array(g['normals']).reshape(-1,3,3).mean(axis=1)
 c=np.array([int(g['color'][i:i+2],16) for i in [1,3,5]])
 positions.append(p);normals.append(n);colors.append(np.tile(c,(len(p),1)))
p=np.concatenate(positions); n=np.concatenate(normals);c=np.concatenate(colors)
light=np.array([-0.55,.8,-.35]);light/=np.linalg.norm(light)
shade=np.clip(.70+.30*np.maximum(0,n@light),.55,1)
colors=np.clip(c*shade[:,None],0,255).astype('uint8')
views={'front':(math.pi,.38),'rear':(0,.40),'left':(3.85,.55),'right':(2.43,.55),'top':(math.pi,math.pi/2-.001)}
for name,(a,e) in views.items():
 eye=np.array([math.cos(a)*math.cos(e),math.sin(e),math.sin(a)*math.cos(e)])
 right=np.cross([0,1,0],eye);right/=np.linalg.norm(right);up=np.cross(eye,right)
 visible=n@eye>.0001
 tri=p[visible];col=colors[visible];xy=np.stack([tri@right,-tri@up],axis=-1)
 lo=xy.min(axis=(0,1));hi=xy.max(axis=(0,1));W,H=1800,1040;scale=min((W-130)/(hi[0]-lo[0]),(H-150)/(hi[1]-lo[1]));xy=(xy-(lo+hi)/2)*scale+[W/2,H/2]
 depth=tri@eye
 pixels=np.full((H,W,3),[224,229,223],dtype=np.uint8);zbuffer=np.full((H,W),-np.inf)
 for i,t in enumerate(xy):
  xmin=max(0,int(np.floor(t[:,0].min())));xmax=min(W-1,int(np.ceil(t[:,0].max())))
  ymin=max(0,int(np.floor(t[:,1].min())));ymax=min(H-1,int(np.ceil(t[:,1].max())))
  if xmax<xmin or ymax<ymin:continue
  (x0,y0),(x1,y1),(x2,y2)=t;den=(y1-y2)*(x0-x2)+(x2-x1)*(y0-y2)
  if abs(den)<1e-8:continue
  yy,xx=np.mgrid[ymin:ymax+1,xmin:xmax+1];xx=xx+.5;yy=yy+.5
  a=((y1-y2)*(xx-x2)+(x2-x1)*(yy-y2))/den;b=((y2-y0)*(xx-x2)+(x0-x2)*(yy-y2))/den;cc=1-a-b
  zz=a*depth[i,0]+b*depth[i,1]+cc*depth[i,2];old=zbuffer[ymin:ymax+1,xmin:xmax+1]
  mask=(a>=-1e-7)&(b>=-1e-7)&(cc>=-1e-7)&(zz>old)
  old[mask]=zz[mask];pixels[ymin:ymax+1,xmin:xmax+1][mask]=col[i]
 im=Image.fromarray(pixels)
 im.save(f'assets/previews/{name}.jpg',quality=92,optimize=True)
 print(name,len(tri),flush=True)
