import json,sys,re,hashlib,html,urllib.parse,urllib.request,datetime
from pathlib import Path
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]/'cosmos-explorer'
snapshot=json.loads((root/'data/exoplanet-snapshot.json').read_text())
if '--fetch' in sys.argv:
 with urllib.request.urlopen(snapshot['url'],timeout=90) as response:snapshot['rows']=json.load(response)
 snapshot['retrieved']=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
rows=snapshot['rows'];date=snapshot['retrieved'];records=[]
def fmt(v):return f'{v:,.3f}'.rstrip('0').rstrip('.').replace(',',' ').replace('.',',')
def ref(row):
 s=BeautifulSoup(row['pl_refname'],'html.parser');a=s.find('a');return [[a.get_text(' ',strip=True),a['href']]] if a else []
methods={'Transit':'Quá cảnh','Radial Velocity':'Vận tốc xuyên tâm','Imaging':'Chụp trực tiếp','Transit Timing Variations':'Biến thiên thời điểm quá cảnh'}
for i,row in enumerate(rows):
 name=row['pl_name'];url='https://exoplanetarchive.ipac.caltech.edu/overview/'+urllib.parse.quote(name,safe='');common={'source':url,'references':[['NASA Exoplanet Archive — dữ liệu hệ hành tinh',url]],'papers':ref(row),'reviewed':date,'radius':row['pl_rade'],'status':'ĐÃ XÁC NHẬN','visualType':'ĐỒ HỌA MINH HỌA','image':None,'photoCaption':'Minh họa nghệ thuật của ứng dụng, không phải ảnh quan sát bề mặt.','color':['#bd9e7b','#8aaebd','#b99acb','#cfa887'][i%4]}
 record=dict(common,id='exo-'+re.sub('[^a-z0-9]+','-',name.lower()).strip('-'),name=name,small='Ngoại hành tinh đã xác nhận',level='exoplanets',category='Ngoại hành tinh · '+row['hostname'],kicker='NASA Exoplanet Archive',type='exoplanet',aliases=row['hostname'],summary=f'Ngoại hành tinh quanh {row["hostname"]}; chu kỳ quỹ đạo khoảng {fmt(row["pl_orbper"])} ngày.',stats=[['Chu kỳ quỹ đạo',fmt(row['pl_orbper'])+' ngày'],['Bán kính',fmt(row['pl_rade'])+' R⊕'],['Khoảng cách hệ sao',fmt(row['sy_dist'])+' pc'],['Năm công bố phát hiện',str(row['disc_year'])]],fact='Phương pháp phát hiện được lưu trong Archive: '+methods.get(row['discoverymethod'],row['discoverymethod'])+'. Bán kính trong hồ sơ được biểu diễn theo bán kính Trái Đất (R⊕).',research='Bản ghi lấy từ bảng Planetary Systems (PS), chỉ chọn bộ tham số default_flag=1 và pl_controv_flag=0. Các giá trị thuộc cùng bộ tham số tham chiếu của Archive; bài báo được liên kết bên dưới.',limits='Giá trị được làm tròn để hiển thị; sai số và tham chiếu đầy đủ nằm trong Archive. Bán kính không đủ để suy ra thành phần, khí quyển, nước hoặc sự sống. Minh họa không mô tả bề mặt đã quan sát.')
 records.append(record)
seen=set()
for row in rows:
 host=row['hostname']
 if host in seen:continue
 seen.add(host)
 if len(seen)>8:break
 url='https://exoplanetarchive.ipac.caltech.edu/overview/'+urllib.parse.quote(host,safe='')
 records.append(dict(id='star-'+re.sub('[^a-z0-9]+','-',host.lower()).strip('-'),name=host,small='Sao có hành tinh được xác nhận',level='nearby',category='Sao chủ · NASA Exoplanet Archive',kicker='Một hệ hành tinh đã biết',type='star',temperature=row['st_teff'],color='#f2d2a3',summary=f'Ngôi sao chủ của {row["pl_name"]}; thông số được ghi nhận trong NASA Exoplanet Archive.',stats=[['Nhiệt độ hiệu dụng',fmt(row['st_teff'])+' K'],['Bán kính sao',fmt(row['st_rad'])+' R☉'],['Khoảng cách',fmt(row['sy_dist'])+' pc'],['Hành tinh tham chiếu',row['pl_name']]],radius=None,status='ĐÃ QUAN SÁT',visualType='ĐỒ HỌA MINH HỌA',fact='R☉ là đơn vị bán kính Mặt Trời; nhiệt độ hiệu dụng không phải nhiệt độ lõi sao.',research='Các thông số sao được lấy cùng bộ tham số mặc định với hành tinh trong bảng PS. Tham chiếu gốc của bộ số liệu được liên kết trong hồ sơ.',limits='Đây là minh họa ngôi sao, không phải ảnh chụp trực tiếp đĩa sao. Quầng sáng và màu sắc không dùng để suy ra kích thước góc, độ sáng biểu kiến hoặc cấu trúc bề mặt.',source=url,references=[['NASA Exoplanet Archive — hệ sao',url]],papers=ref(row),reviewed=date,photoCaption='Minh họa nghệ thuật của ngôi sao; không phải ảnh quan sát.'))
(root/'data/exoplanet-snapshot.json').write_text(json.dumps(dict(snapshot,retrieved=date,table='ps',recordCount=len(rows)),ensure_ascii=False,indent=2))
(root/'data/exoplanet-records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2));print('PLANETS',len(rows),'HOST STARS',len(records)-len(rows))
