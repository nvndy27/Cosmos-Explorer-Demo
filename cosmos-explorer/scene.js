'use strict';
// All positions and sizes here are illustrative. No ephemeris or Gaia coordinates.
let overviewHits=[],overviewKey='';
const solarIds=['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'];
const solarPhase=[.4,2.7,4.8,1.7,3.6,5.5,.9,2.2];
const previewCache=new Map();
function objectSeed(id){let s=2166136261;for(const c of id)s=Math.imul(s^c.charCodeAt(0),16777619);return s>>>0}
function smoothNoise(x,y,seed){const s=(seed%997)*.013;return .5+.22*Math.sin(x*3.1+Math.sin(y*2.2+s))+.16*Math.cos(y*4.3-x*1.7+s)+.09*Math.sin(x*8.7+y*6.3+s*2)+.045*Math.cos(x*16.1-y*13.4+s*3)}
function spherePalette(type){return ({earth:[30,104,160],mars:[169,76,47],venus:[202,157,99],mercury:[132,132,132],moon:[142,145,148],jupiter:[190,145,105],saturn:[198,175,128],uranus:[119,181,190],neptune:[63,112,181],pluto:[160,129,111],trappist:[151,111,82]})[type]||[155,134,114]}
function sphereTextureFor(o){
 const key=o.id||o.type;if(previewCache.has(key))return previewCache.get(key);
 const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const g=canvas.getContext('2d'),image=g.createImageData(size,size),base=spherePalette(o.type==='exoplanet'?'trappist':o.type),seed=objectSeed(o.id||o.type),gas=['jupiter','saturn','uranus','neptune'].includes(o.type),earth=o.id==='earth',mars=o.id==='mars';
 const light=[-.48,-.36,.80],lightLen=Math.hypot(...light);for(let i=0;i<3;i++)light[i]/=lightLen;
 for(let py=0;py<size;py++)for(let px=0;px<size;px++){
  const nx=(px+.5-size/2)/(size/2),ny=(py+.5-size/2)/(size/2),d=nx*nx+ny*ny;if(d>=1)continue;
  const nz=Math.sqrt(1-d),lon=Math.atan2(nx,nz),lat=Math.asin(-ny),warp=smoothNoise(lon,lat,seed),cloud=smoothNoise(lon*1.8+1.4,lat*2.1-1,seed+19);let rgb;
  if(gas){const bands=Math.sin(lat*(o.type==='jupiter'?35:27)+warp*3.4+Math.sin(lon*3.2)*.55);const turbulence=(warp-.5)*76;const v=bands*.5+turbulence/110;rgb=base.map((c,k)=>c+v*(k===0?24:k===1?20:15));if(o.type==='jupiter'&&Math.hypot((lon-.36)*Math.cos(lat),(lat+.12))<.16){rgb=[177,91,61].map((c,k)=>c+(warp-.5)*24)} }
  else if(earth){const land=smoothNoise(lon*1.2+Math.sin(lat*2)*.4,lat*1.8,seed+7)>.51;rgb=land?(warp>.61?[185,164,116]:[72,135,91]):[17+cloud*22,78+cloud*37,139+cloud*59];if(cloud>.69)rgb=rgb.map(c=>c*.68+215*.32)}
  else if(mars){const terrain=smoothNoise(lon*1.15,lat*1.45,seed+5);rgb=terrain>.62?[194,117,74]:terrain<.34?[116,62,48]:base.map(c=>c+(warp-.5)*42)}
  else if(o.type==='venus'){const bands=Math.sin(lat*22+warp*3+lon*1.8);rgb=[base[0]+bands*18,base[1]+bands*16,base[2]+bands*10]}
  else {const mottling=(warp-.5)*48;rgb=base.map(c=>c+mottling)}
  const diffuse=Math.max(0,nx*light[0]+ny*light[1]+nz*light[2]),terminator=.12+.88*Math.pow(diffuse,.72),spec=Math.pow(Math.max(0,nx*light[0]+ny*light[1]+nz*light[2]),22)*18,limb=.78+.22*nz,at=(py*size+px)*4;
  for(let channel=0;channel<3;channel++)image.data[at+channel]=Math.max(0,Math.min(255,(rgb[channel]*terminator+spec)*limb));image.data[at+3]=255;
 }
 g.putImageData(image,0,0);previewCache.set(key,canvas);return canvas;
}
function ringBand(g,r,frontOnly){
 g.save();g.rotate(-.31);if(frontOnly){g.beginPath();g.rect(-r*2,0,4*r,2*r);g.clip()}
 const outerX=r*1.84,outerY=r*.87,innerX=r*.91,innerY=r*.43;g.beginPath();g.ellipse(0,0,outerX,outerY,0,0,Math.PI*2);g.ellipse(0,0,innerX,innerY,0,0,Math.PI*2,true);const band=g.createLinearGradient(0,-outerY,0,outerY);band.addColorStop(0,'#bcae8b');band.addColorStop(.23,'#6c6558');band.addColorStop(.39,'#d9caa7');band.addColorStop(.54,'#efe2c2');band.addColorStop(.7,'#8c806a');band.addColorStop(1,'#c9b991');g.fillStyle=band;g.globalAlpha=.86;g.fill('evenodd');
 g.globalAlpha=.48;g.strokeStyle='#f2e5c3';g.lineWidth=Math.max(1,r*.018);for(const f of [1.13,1.29,1.48,1.62,1.75]){g.beginPath();g.ellipse(0,0,r*f,r*f*.47,0,0,Math.PI*2);g.stroke()}g.restore();
}
function paintPlanet(g,o,x,y,r){
 const texture=sphereTextureFor(o),atmosphere=['earth','venus','jupiter','saturn','uranus','neptune'].includes(o.type)||o.type==='exoplanet';
 if(o.type==='saturn'){g.save();g.translate(x,y);ringBand(g,r,false);g.restore()}
 if(atmosphere){const halo=g.createRadialGradient(x,y,r*.78,x,y,r*1.16);halo.addColorStop(0,'#9fdcff12');halo.addColorStop(.86,'#9fdcff0a');halo.addColorStop(1,'#9fdcff00');g.fillStyle=halo;g.beginPath();g.arc(x,y,r*1.16,0,Math.PI*2);g.fill()}
 g.save();if(o.id==='haumea'){g.translate(x,y);g.rotate(-.25);g.scale(1.35,.7);g.drawImage(texture,-r,-r,2*r,2*r)}else g.drawImage(texture,x-r,y-r,2*r,2*r);g.restore();
 if(atmosphere){g.save();g.strokeStyle=o.type==='mars'?'#e7a07955':'#b9e5ff75';g.lineWidth=Math.max(1,r*.035);g.shadowColor='#8bc9ee';g.shadowBlur=r*.11;g.beginPath();g.arc(x,y,r-g.lineWidth*.45,0,Math.PI*2);g.stroke();g.restore()}
 if(o.type==='saturn'){g.save();g.translate(x,y);ringBand(g,r,true);g.restore()}
}
function starColor(o){const k=o.temperature;return k?(k>7500?'#d3e6ff':k>6000?'#fff3d1':k>4800?'#ffddaa':'#ffb278'):o.id==='proxima'?'#ff9f76':'#ffe9af'}
function paintStar(g,o,x,y,r){
 const color=starColor(o),halo=g.createRadialGradient(x,y,r*.3,x,y,r*3.5);halo.addColorStop(0,color+'a0');halo.addColorStop(.35,color+'24');halo.addColorStop(1,color+'00');g.fillStyle=halo;g.beginPath();g.arc(x,y,r*3.5,0,Math.PI*2);g.fill();
 const disk=g.createRadialGradient(x-r*.22,y-r*.2,0,x,y,r);disk.addColorStop(0,'#fffdf2');disk.addColorStop(.5,color);disk.addColorStop(1,o.id==='proxima'?'#b64e2c':'#db833e');g.fillStyle=disk;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
 if(r>25){const random=rnd(objectSeed(o.id));g.save();g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.clip();for(let i=0;i<900;i++){const a=random()*Math.PI*2,d=Math.sqrt(random())*r;g.fillStyle=i%3?'#fff4ce17':'#863b171c';g.beginPath();g.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,random()*r*.026+.5,0,Math.PI*2);g.fill()}g.restore();g.strokeStyle=color+'90';g.lineWidth=1;for(let i=0;i<15;i++){const a=i*Math.PI*2/15;g.beginPath();g.ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r,r*.1,r*.035,a,0,Math.PI);g.stroke()}}
}
function paintGalaxy(g,o,x,y,r){
 const random=rnd(objectSeed(o.id));const elliptical=o.type==='elliptical',irregular=o.type==='irregular';g.save();g.translate(x,y);g.rotate(-.35);g.scale(1,elliptical?.68:.54);g.globalCompositeOperation='screen';
 const halo=g.createRadialGradient(0,0,0,0,0,r);halo.addColorStop(0,'#ffe4bb80');halo.addColorStop(.2,'#e2cbb630');halo.addColorStop(1,'#829bc100');g.fillStyle=halo;g.fillRect(-r,-r,r*2,r*2);
 const count=r>50?1400:100;for(let i=0;i<count;i++){const d=Math.pow(random(),elliptical?1.6:.7)*r,a=elliptical?random()*Math.PI*2:((i%3)*Math.PI*2/3+d/r*5+(random()-.5)*(irregular?3:.6));g.fillStyle=i%5?'#bdd7f097':'#ffe0b9d0';g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d,.4+random()*(r>50?1.2:.6),0,Math.PI*2);g.fill()}g.restore();
}
function paintNebula(g,o,x,y,r){
 const random=rnd(objectSeed(o.id));g.save();g.globalCompositeOperation='screen';for(let i=0;i<65;i++){const a=random()*Math.PI*2,d=random()*r*.8,cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d*.65,rr=r*(.15+random()*.35),v=g.createRadialGradient(cx,cy,0,cx,cy,rr);v.addColorStop(0,i%2?'#bb679d30':'#5ec6c72c');v.addColorStop(1,'#00000000');g.fillStyle=v;g.fillRect(cx-rr,cy-rr,rr*2,rr*2)}g.restore();
 if(o.type==='planetarynebula'){g.strokeStyle='#87d2df85';g.lineWidth=r*.14;g.beginPath();g.ellipse(x,y,r*.55,r*.42,-.3,0,Math.PI*2);g.stroke();g.fillStyle='#effaff';g.beginPath();g.arc(x,y,Math.max(1,r*.025),0,Math.PI*2);g.fill()}
}
function paintCluster(g,o,x,y,r){
 const random=rnd(objectSeed(o.id));const open=o.type==='opencluster';g.save();g.globalCompositeOperation='screen';for(let i=0;i<(r>50?700:70);i++){const a=random()*Math.PI*2,d=Math.pow(random(),open?.6:1.7)*r;g.fillStyle=i%3?'#c7e2ffbd':'#ffe0b5e0';g.beginPath();g.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,.4+random()*(r>50?1.6:.9),0,Math.PI*2);g.fill()}g.restore();
}
function paintHole(g,x,y,r){g.save();g.translate(x,y);g.rotate(-.25);g.shadowColor='#f5b661';g.shadowBlur=r*.22;g.strokeStyle='#ffc987';g.lineWidth=r*.12;g.beginPath();g.ellipse(0,0,r*1.5,r*.36,0,0,Math.PI*2);g.stroke();g.fillStyle='#02040a';g.beginPath();g.arc(0,0,r*.62,0,Math.PI*2);g.fill();g.strokeStyle='#ffe6ae';g.lineWidth=Math.max(1,r*.04);g.stroke();g.beginPath();g.ellipse(0,0,r*1.5,r*.36,0,0,Math.PI);g.stroke();g.restore()}
function paintObject(g,o,x,y,r){
 if(o.type==='star'){paintStar(g,o,x,y,r);return}
 if(['galaxy','elliptical','irregular'].includes(o.type)){paintGalaxy(g,o,x,y,r);return}
 if(['cluster','opencluster'].includes(o.type)){paintCluster(g,o,x,y,r);return}
 if(['nebula','planetarynebula','remnant','deep'].includes(o.type)){paintNebula(g,o,x,y,r);return}
 if(o.type==='blackhole'){paintHole(g,x,y,r);return}
 paintPlanet(g,o,x,y,r);
}
function renderDetailArt(o){
 const c=$('detailCanvas');c.width=720;c.height=440;const g=c.getContext('2d');g.fillStyle='#050b15';g.fillRect(0,0,720,440);
 const random=rnd(objectSeed(o.id));for(let i=0;i<170;i++){g.fillStyle=i%4?'#afc8e173':'#f5d7b594';g.beginPath();g.arc(random()*720,random()*440,.3+random(),0,Math.PI*2);g.fill()}
 paintObject(g,o,360,220,o.type==='saturn'?105:['nebula','galaxy','elliptical','cluster','opencluster','irregular','deep','remnant'].includes(o.type)?170:117);
 $('photoWrap').dataset.kind=o.type;$('fallbackPlanet').style.display='none';
}
function overviewObjects(){
 if(level==='solar')return solarIds.map(obj);
 const group=data.filter(o=>o.level===level);const selected=obj(current);const items=group.slice(0,14);if(!items.some(o=>o.id===current)&&selected)items[items.length-1]=selected;return items;
}
function syncOverviewTargets(items){
 const key=level+':'+items.map(o=>o.id).join(',');if(key===overviewKey)return;overviewKey=key;
 const container=$('sceneTargets');container.innerHTML=items.map(o=>`<button class="scene-target" data-scene="${o.id}" aria-label="Xem hồ sơ ${o.name}"><span>${o.name}</span></button>`).join('');
 container.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.scene)));
}
function drawOverview(){
 const items=overviewObjects();syncOverviewTargets(level==='solar'&&!items.some(o=>o.id===current)?[...items,obj(current)]:items);overviewHits=[];
 const cx=W*.5+dragX*12,cy=H*.59+dragY*9,R=Math.min(W*.41,H*.31)*zoom;
 if(level==='solar'){
  paintStar(ctx,{id:'sun',type:'star'},cx,cy,Math.max(9,R*.063));
  items.forEach((o,i)=>{const orbit=R*(.17+i*.115),phase=solarPhase[i]+angle*(.04/(1+i*.35)),x=cx+Math.cos(phase)*orbit,y=cy+Math.sin(phase)*orbit*.65;ctx.strokeStyle=o.id===current?'#9ac7dc66':'#7b9ab42b';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,orbit,orbit*.65,0,0,Math.PI*2);ctx.stroke();const sizes=[3.4,4.6,4.8,3.9,11,9.4,7,6.8];const r=sizes[i]*clamp(R/245,.65,1.2);paintObject(ctx,o,x,y,r);markOverview(o,x,y,r);if(o.id==='earth'&&current==='moon'){paintObject(ctx,obj('moon'),x+21,y-15,2);markOverview(obj('moon'),x+21,y-15,2)}});
  if(current==='pluto'){const orbit=R*1.11,a=3.9,x=cx+Math.cos(a)*orbit,y=cy+Math.sin(a)*orbit*.65;ctx.strokeStyle='#7b9ab42b';ctx.beginPath();ctx.ellipse(cx,cy,orbit,orbit*.65,0,0,Math.PI*2);ctx.stroke();paintObject(ctx,obj('pluto'),x,y,3);markOverview(obj('pluto'),x,y,3)}
  ctx.fillStyle='#d2b887';ctx.font='14px "DM Sans",sans-serif';ctx.textAlign='center';ctx.fillText('Mặt Trời',cx,cy+31);
 }else if(level==='milky'){
  paintGalaxy(ctx,obj('milky'),cx,cy,R*.92);markOverview(obj('milky'),cx,cy,18);
 }else{
  const cols=W<430?3:items.length<=6?3:4,rows=Math.ceil(items.length/cols),areaW=Math.min(W-64,660)*zoom,areaH=Math.min(H*.41,360)*zoom;
  items.forEach((o,i)=>{const x=cx+(i%cols-(cols-1)/2)*areaW/cols,y=cy+(Math.floor(i/cols)-(rows-1)/2)*areaH/Math.max(rows,1);const r=o.type==='star'?8+((objectSeed(o.id)%5)):['cluster','opencluster'].includes(o.type)?22:o.type==='blackhole'?19:24;paintObject(ctx,o,x,y,r);markOverview(o,x,y,r)});
 }
}
function markOverview(o,x,y,r){
 if(o.id===current){ctx.strokeStyle='#c5eaff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,Math.max(r+6,12),0,Math.PI*2);ctx.stroke()}
 overviewHits.push({id:o.id,x,y,r});const target=$('sceneTargets').querySelector(`[data-scene="${o.id}"]`);if(target){target.style.left=x+'px';target.style.top=(level==='solar'&&y<H*.59+dragY*9?y-Math.max(r,8)-38:y+Math.max(r,8)+9)+'px';target.classList.toggle('selected',o.id===current);target.setAttribute('aria-pressed',String(o.id===current))}
}
