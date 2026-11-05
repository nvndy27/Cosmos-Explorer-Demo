#!/usr/bin/env python3
"""Build a reviewed NASA snapshot. Needs beautifulsoup4 and Pillow; no runtime deps.
Re-run deliberately: scientific values may change. Review generated snapshot before release.
"""
import concurrent.futures, datetime, hashlib, html, io, json, re, sys, urllib.parse, urllib.request
from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'cosmos-explorer'
CACHE=Path('/tmp/cosmos-source-cache');CACHE.mkdir(exist_ok=True)
BASE='https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/'
TODAY=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'CosmosExplorerEducational/2.1','Accept':'text/html,image/*,application/json'})
 with urllib.request.urlopen(req,timeout=60) as response:return response.read()
def page(url):
 p=CACHE/(hashlib.sha256(url.encode()).hexdigest()+'.html')
 if not p.exists():p.write_bytes(fetch(url))
 return p.read_bytes()
def photograph(url,id):
 # Keep source provenance; downsample only, never synthesize observational pixels.
 parts=urllib.parse.urlsplit(url);query=dict(urllib.parse.parse_qsl(parts.query))
 if 'dynamicimage' in url:query.update(w='900',h='900',fit='clip');url=urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query)))
 target=ROOT/'assets/observations'/f'{id}.webp'
 if not target.exists():
  im=Image.open(io.BytesIO(fetch(url))).convert('RGB');im.thumbnail((800,800));im.save(target,'WEBP',quality=84)
 return str(target.relative_to(ROOT)),url
TYPES={'Globular Cluster':('Cụm sao cầu','clusters','cluster'),'Open Cluster':('Cụm sao mở','clusters','opencluster'),'Spiral Galaxy':('Thiên hà xoắn ốc','galaxies','galaxy'),'Elliptical Galaxy':('Thiên hà elip','galaxies','elliptical'),'Lenticular Galaxy':('Thiên hà thấu kính','galaxies','elliptical'),'Irregular Galaxy':('Thiên hà bất quy tắc','galaxies','irregular'),'Planetary Nebula':('Tinh vân hành tinh','nebula','planetarynebula'),'Nebula':('Tinh vân','nebula','nebula'),'Emission Nebula':('Tinh vân phát xạ','nebula','nebula'),'Reflection Nebula':('Tinh vân phản xạ','nebula','nebula'),'Supernova Remnant':('Tàn dư siêu tân tinh','nebula','remnant')}
def messier(n):
 url=BASE+f'messier-{n}/';raw=page(url);soup=BeautifulSoup(raw,'html.parser')
 fields={}
 for h in soup.find_all('h2'):
  key=h.get_text(' ',strip=True).lower()
  if key in ['distance','apparent magnitude','constellation','object type']:fields[key]=h.find_next('p').get_text(' ',strip=True)
 if len(fields)!=4:raise ValueError(f'M{n}: incomplete {fields}')
 original_type=fields['object type'];kind,level,type=TYPES.get(original_type,('Đối tượng danh mục Messier','deep','deep'))
 if original_type not in TYPES:
  if 'Galaxy' in original_type:kind,level,type='Thiên hà','galaxies','galaxy'
  elif 'Cluster' in original_type:kind,level,type='Cụm sao','clusters','cluster'
  elif 'Nebula' in original_type:kind,level,type='Tinh vân','nebula','nebula'
 h=soup.find('h2',string=lambda x:x and x.strip().lower()=='object type');fig=h.find_next('figure');img=fig.find('img');caption=fig.find_next('figcaption');credit=caption.find(class_='hds-credits')
 if not credit or not credit.get_text(strip=True):raise ValueError(f'M{n}: missing credit')
 imgurl=img.get('src');local,download=photograph(imgurl,f'messier-{n}')
 desc=caption.find(class_='hds-caption-text');source_note=' '.join((desc.get_text(' ',strip=True) if desc else '').split()[:45])
 dist=fields['distance'].replace('light-years','năm ánh sáng').replace('light years','năm ánh sáng')
 record={'id':f'messier-{n}','name':f'Messier {n} (M{n})','aliases':f'M{n} Messier{n} {original_type}', 'small':kind,'level':level,'category':kind+' · Hubble Messier','kicker':'Danh mục Hubble · NASA','summary':f'{kind} trong chòm sao {fields["constellation"]}; khoảng cách NASA ghi nhận là {dist}.','type':type,'color':'#b8cfee' if level!='nebula' else '#d89ebc','status':'ĐÃ QUAN SÁT','visualType':'ẢNH QUAN SÁT · XỬ LÝ MÀU','stats':[['Khoảng cách (xấp xỉ)',dist],['Cấp sao biểu kiến',fields['apparent magnitude']],['Chòm sao',fields['constellation']],['Phân loại NASA',original_type]],'radius':None,'fact':f'M{n} là ký hiệu trong danh mục Messier. Cấp sao biểu kiến được NASA công bố: {fields["apparent magnitude"]}; đây là thang độ sáng nhìn từ Trái Đất.','research':f'NASA phân loại M{n} là {original_type}. Hồ sơ Hubble cung cấp thông tin quan sát và ảnh tư liệu; xem nguồn để đọc nghiên cứu và ngữ cảnh đầy đủ.','sourceNote':source_note,'limits':'Khoảng cách là giá trị làm tròn từ trang NASA, không phải phép đo mới của ứng dụng. Ảnh Hubble có xử lý và phối màu qua bộ lọc; vùng chụp có thể chỉ bao phủ một phần đối tượng. Cảnh tổng quan không thể hiện tọa độ thật.','source':url,'references':[['NASA Hubble — hồ sơ, thông số và ảnh',url]],'papers':[],'image':local,'imageRemote':download,'imageSource':url,'credit':credit.get_text(' ',strip=True),'photoCaption':'Ảnh quan sát Hubble tổng hợp qua bộ lọc; màu hiển thị có xử lý khoa học.','imageAlt':img.get('alt',''),'reviewed':TODAY}
 return record,{'id':record['id'],'url':url,'retrieved':TODAY,'sha256':hashlib.sha256(raw).hexdigest(),'fields':fields,'imageOriginal':imgurl,'imageDownloaded':download,'credit':record['credit'],'sourceNote':source_note}
def main():
 index=page(BASE).decode();available=sorted({int(n) for n in re.findall(r'hubble-messier-catalog/messier-(\d+)/',index)}-{1,31,42,51})
 # A varied selection including famous galaxies, nebulae, open and globular clusters.
 priority=[8,16,17,20,27,57,76,78,33,32,49,58,59,60,61,63,64,65,66,74,77,81,82,83,84,85,86,87,88,89,90,91,94,95,96,98,99,100,101,102,104,105,106,108,109,110]
 chosen=list(dict.fromkeys([n for n in priority+available if n in available]))[:59]
 records=[];provenance=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  jobs={pool.submit(messier,n):n for n in chosen}
  for future in concurrent.futures.as_completed(jobs):
   n=jobs[future]
   try:r,p=future.result();records.append(r);provenance.append(p);print('OK',n,r['small'],flush=True)
   except Exception as e:print('FAILED',n,str(e),flush=True)
 records.sort(key=lambda r:int(r['id'].split('-')[1]));provenance.sort(key=lambda r:int(r['id'].split('-')[1]))
 (ROOT/'data/messier-snapshot.json').write_text(json.dumps({'retrieved':TODAY,'catalog':BASE,'selected':chosen,'records':records,'provenance':provenance},ensure_ascii=False,indent=2))
 if len(records)!=59:raise SystemExit(f'Incomplete: {len(records)}/59. Retry to reuse cache.')
 print('COMPLETE',len(records),flush=True)
if __name__=='__main__':main()
