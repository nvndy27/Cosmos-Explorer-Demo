'use strict';
// Pure selection logic: no DOM, API calls, coercion of missing values, or mixed definitions.
const ExplorerModel=(()=>{
 const labels={planet:'Hành tinh',dwarf:'Hành tinh lùn',moon:'Vệ tinh',exoplanet:'Ngoại hành tinh',star:'Ngôi sao',galaxy:'Thiên hà',nebula:'Tinh vân',cluster:'Cụm sao',blackhole:'Hố đen',field:'Trường quan sát'};
 const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase();
 const valid=m=>m&&Number.isFinite(m.value)&&m.value>0&&!m.limit&&m.comparable!==false;
 const signature=m=>valid(m)?m.definition+'|'+m.unit:null;
 const comparable=(objects,key)=>{const values=objects.map(o=>o.measurements?.[key]??null),present=values.filter(valid),keys=new Set(present.map(signature));return {values,compatible:keys.size<=1&&present.length>=2,signature:keys.size===1?signature(present[0]):null,present:present.length}};
 function filter(records,state={},saved=[]){
  let result=records.filter(o=>(!state.query||normalize([o.name,o.id,...[].concat(o.aliases||[])].join(' ')).includes(normalize(state.query)))&&(!state.classification||o.classification===state.classification)&&(!state.system||o.system===state.system)&&(!state.saved||saved.includes(o.id))&&(!state.observed||Boolean(o.image)&&o.imageKind!=='illustration'));
  const scopes={radius:['radius','mean_radius','km'],transit:['radius','transit_radius','R⊕'],distance:['distance','distance_from_sun','pc']};
  if(scopes[state.sort]){const [key,definition,unit]=scopes[state.sort];result=result.filter(o=>{const m=o.measurements?.[key];return valid(m)&&m.definition===definition&&m.unit===unit}).sort((a,b)=>a.measurements[key].value-b.measurements[key].value)}
  else result.sort((a,b)=>a.name.localeCompare(b.name,'vi',{numeric:true}));
  return result;
 }
 function toggle(ids,id){if(ids.includes(id))return {ids:ids.filter(x=>x!==id),error:null};if(ids.length>=4)return {ids,error:'Chỉ chọn tối đa 4 thiên thể. Bỏ chọn một mục để thêm mục khác.'};return {ids:[...ids,id],error:null}}
 const format=(m)=>!m||m.value===null||!Number.isFinite(m.value)?'Chưa có dữ liệu':(m.limit===1?'≤ ':m.limit===-1?'≥ ':'')+(Math.abs(m.value)>=1e9||(m.value!==0&&Math.abs(m.value)<.001)?m.value.toLocaleString('vi-VN',{notation:'scientific',maximumFractionDigits:4}).replace('E',' × 10^'):m.value.toLocaleString('vi-VN',{maximumSignificantDigits:6}))+' '+m.unit;
 const imageLabel=o=>o.imageKind==='illustration'?(o.imageScope==='generic'?'Minh họa đại diện':'Minh họa nghệ thuật'):o.imageKind==='reconstruction'?'Ảnh tái dựng':o.imageKind==='composite'?'Ảnh tổng hợp':'Ảnh từ quan sát';
 return {labels,normalize,valid,signature,comparable,filter,toggle,format,imageLabel};
})();
