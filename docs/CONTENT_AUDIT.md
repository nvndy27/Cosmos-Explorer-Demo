# Kiểm kê giới hạn nội dung — AUDIT-001

**Ngày kiểm kê:** 2026-11-05 (Asia/Ho_Chi_Minh)  
**Phạm vi:** audit cấu trúc nội bộ của catalog đang chạy, snapshot nâng cấp 2.2, snapshot ảnh ngoại hành tinh, manifest ảnh và `DATA_POLICY.md`. Đây không phải kiểm định thiên văn, xác nhận tính đúng của số liệu hay kiểm tra khả dụng hiện thời của URL.

## Cách tái kiểm

Đã đọc `AGENTS.md`, `docs/PRODUCT.md`, `docs/WORK_RULES.md`, `docs/REQUIREMENTS.md`, `docs/ROADMAP.md`, `docs/DATA_POLICY.md`, cùng các tệp dữ liệu nêu trên. Các lệnh đếm thực dùng từ thư mục gốc:

```sh
rtk proxy node - <<'JS'
const fs=require('fs'),vm=require('vm'),c={};vm.createContext(c);
vm.runInContext(fs.readFileSync('cosmos-explorer/catalog.js','utf8')+';globalThis.out=data;',c);
vm.runInContext(fs.readFileSync('cosmos-explorer/catalog-expanded.js','utf8')+';globalThis.out=data;',c);
const a=c.out;
console.log('records',a.length);
console.log('classes',Object.fromEntries([...new Set(a.map(x=>x.classification||x.category||'∅'))].map(k=>[k,a.filter(x=>(x.classification||x.category||'∅')===k).length])));
for(const k of ['radius','equatorialRadius','mass','period','distance','temperature']){
 let present=0,nullv=0,falsec=0,defs={},units={};
 for(const x of a){const m=x.measurements?.[k];if(m===undefined)continue;present++;
  if(m===null||m.value===null)nullv++;if(m&&m.comparable===false)falsec++;
  if(m){const d=m.definition||'∅',u=m.unit||'∅';defs[d]=(defs[d]||0)+1;units[u]=(units[u]||0)+1}}
 console.log(k,{present,missing:a.length-present,nullv,comparableFalse:falsec,defs,units});
}
console.log('reviewed dates',Object.fromEntries([...new Set(a.map(x=>x.reviewed||'∅'))].map(k=>[k,a.filter(x=>(x.reviewed||'∅')===k).length])));
console.log('images',a.filter(x=>x.image).length,'without image',a.filter(x=>!x.image).length);
console.log('imageKind',Object.fromEntries([...new Set(a.map(x=>x.imageKind||'∅'))].map(k=>[k,a.filter(x=>(x.imageKind||'∅')===k).length])));
JS
rtk proxy python3 - <<'PY'
import json,collections
from pathlib import Path
m=json.loads(Path('cosmos-explorer/data/image-manifest.json').read_text())['images']
print('manifest images',len(m),'kind',collections.Counter(x.get('imageKind','∅') for x in m))
print('manifest dates',collections.Counter(x.get('retrieved','∅') for x in m))
for f in ['cosmos-explorer/data/upgrade22-snapshot.json','cosmos-explorer/data/exoplanet-image-snapshot.json']:
 d=json.loads(Path(f).read_text()); print(f,'retrieved',d.get('retrieved'))
 if 'newRecords' in d: print('newRecords',len(d['newRecords']))
 if isinstance(d.get('provenance'),list):
  print('image provenance',len(d['provenance']),'scope',collections.Counter(x.get('imageScope','∅') for x in d['provenance']))
PY
```

Kết quả: catalog có **138 hồ sơ**: planet 8, exoplanet 37, star 10, galaxy 41, field 1, moon 11, dwarf 5, nebula 10, blackhole 2, cluster 13. Tất cả 138 hồ sơ mang `reviewed: 2026-10-21`. Snapshot upgrade có 30 `newRecords`; manifest có 126 mục, tất cả ghi ngày lấy 2026-10-21. Snapshot ảnh ngoại hành tinh có 37 provenance entries cùng ngày đó; phạm vi khai báo gồm 20 `object`, 16 `generic`, 1 `system`.

## Đại lượng: độ phủ và tính so sánh

Mỗi hồ sơ hiện đều có khóa cho sáu đại lượng dưới `measurements`; con số “thiếu” ở bảng là giá trị null, không phải thiếu khóa. `comparable:false` được đếm riêng. Mẫu số là 138 hồ sơ; số lượng theo định nghĩa/đơn vị chỉ tính các giá trị có object measurement.

| Đại lượng | Có giá trị / null | Có `comparable:false` | Định nghĩa và đơn vị đã tích hợp |
|---|---:|---:|---|
| `radius` | 61 / 77 | 6 | 24 `mean_radius` km; 31 `transit_radius` R⊕; 6 `catalog_radius` R⊕ |
| `equatorialRadius` | 12 / 126 | 0 | 12 `equatorial_radius` km |
| `mass` | 30 / 108 | 1 | 13 `mass` kg; 16 `mass_estimate` M⊕; 1 `mass_from_radius` M⊕ |
| `period` | 50 / 88 | 0 | 50 `orbital_period` ngày |
| `distance` | 37 / 101 | 0 | 37 `distance_from_sun` pc |
| `temperature` | 17 / 121 | 0 | 17 `equilibrium_temperature` K |

Các giá trị trong cùng một cột vẫn không mặc nhiên so sánh được. Bán kính trộn bán kính trung bình, bán kính quá cảnh và bán kính danh mục; khác cả đơn vị. Sáu bản ghi có cờ không comparable ở bán kính là `exo-hd-189733-b`, `exo-hd-209458-b`, `exo-hd-149026-b`, `exo-55-cnc-e`, `exo-gj-436-b`, `exo-bet-pic-b`. Khối lượng TOI-700 d có `mass_from_radius` và cờ không comparable; không nên trình bày như phép đo khối lượng độc lập. `mass_estimate` cũng được phân loại riêng với `mass`; chưa được gộp để suy đại lượng khác.

Các null biểu thị **chưa tích hợp/biên tập trong snapshot này**, theo hợp đồng `DATA_POLICY.md`; chúng không chứng minh đại lượng đó chưa được khoa học biết. Cụ thể, `equatorialRadius` chỉ hiện có cho một phần hồ sơ hành tinh Hệ Mặt Trời; khối lượng/chu kỳ vệ tinh được chính sách ghi là chưa biên tập đầy đủ. Khoảng cách pc ở đây chỉ được chuẩn hóa cho nhóm ngoại hành tinh/hệ chủ; không có khoảng cách cùng định nghĩa cho toàn bộ catalog. Không kết luận thêm về mức độ có thể biết của từng đối tượng.

## Provenance và ngày

- Mọi hồ sơ có `source`; 41 hồ sơ có trường `statSources`, còn 97 hồ sơ không có trường này ở cấp catalog. Không có nghĩa 97 hồ sơ hoàn toàn không có nguồn đại lượng: nguồn có thể nằm trực tiếp trong object `measurements`, `references`, `papers` hoặc provenance snapshot. Đây là điểm cần biên tập/tra cứu lại theo từng trường, không thể đánh giá bằng URL hiện diện.
- 138/138 hồ sơ ghi `reviewed: 2026-10-21`; manifest 126/126 ghi `retrieved: 2026-10-21`. Snapshot nâng cấp và snapshot ảnh ngoại hành tinh cũng ghi ngày đó. Ngày này là ngày ghi trong dữ liệu; lần audit hiện tại chỉ thống kê tệp, không đọc lại nguồn web.
- URL, hash trang và provenance là dấu vết để tái kiểm, không phải bằng chứng rằng nội dung nguồn đã được đọc trong lần audit này, URL còn hoạt động, hay thông số hiện hành. Không xác nhận độc lập các nguồn hoặc trị số.

## Phạm vi tư liệu hình

Catalog hiện có ảnh cục bộ ở 126/138 hồ sơ; 12 không có trường `image`: Ngân Hà, tám hồ sơ sao chủ (`star-hd-189733`, `star-hd-209458`, `star-wasp-80`, `star-hd-149026`, `star-wasp-43`, `star-kelt-7`, `star-k2-33`, `star-hat-p-26`) và ba hành tinh lùn Eris/Haumea/Makemake. Đây là thiếu tích hợp ảnh cục bộ trong catalog, không phải khẳng định không tồn tại ảnh phù hợp.

Manifest chia 126 ảnh theo `imageKind`: 83 observation, 36 illustration, 5 composite, 2 reconstruction. Nhãn classification/caption cần được xem cùng loại này: “observation” vẫn có thể là ảnh xử lý màu; “reconstruction” không phải ảnh khả kiến. Snapshot ngoại hành tinh khai báo 20 ảnh minh họa đối tượng, 16 ảnh minh họa đại diện chung và 1 ảnh phạm vi hệ; không gán hình đại diện chung thành bề mặt riêng đã quan sát. 101 hồ sơ không có `imageScope` ở catalog; scope chi tiết nói trên chỉ kiểm kê được cho 37 hồ sơ của snapshot ảnh ngoại hành tinh.

## Năm ưu tiên biên tập

1. **Chuẩn hóa bán kính cho so sánh:** lập danh sách hồ sơ có giá trị/null theo nhóm đối tượng; giữ riêng mean/equatorial/transit/catalog radius, đơn vị, cờ comparable và nguồn từng trường. Ưu tiên không “điền cho đủ”; bắt đầu với nhãn giải thích các nhóm hiện trộn trong 61 giá trị.
2. **Rà khối lượng và chu kỳ vệ tinh:** đối chiếu nguồn gốc từng vệ tinh; giữ GM khác khối lượng, không đổi GM thành kg khi chưa có căn cứ và không suy chu kỳ từ dữ liệu khác. Tách rõ còn thiếu tích hợp với không tìm thấy nguồn đã được đọc.
3. **Hoàn thiện provenance của 97 hồ sơ thiếu `statSources`:** đối chiếu nguồn riêng từng thông số, định nghĩa, đơn vị, giới hạn/sai số và ngày đọc thật; rà trùng/lệch giữa `measurements`, `references`, `papers` và ghi chú.
4. **Bổ sung phạm vi ảnh cho 101 hồ sơ chưa có `imageScope` và đánh giá 12 hồ sơ thiếu ảnh:** ghi rõ đối tượng/hệ/đại diện chung, quan sát/tái dựng/minh họa, bước sóng/xử lý, tác giả và điều kiện sử dụng; quyết định biên tập cho ảnh dự phòng mà không tự gán tư liệu.
5. **Ưu tiên rà nguồn cũ và ngày đối chiếu:** 138 hồ sơ cùng mang ngày 2026-10-21. Lập lượt rà theo nhóm ưu tiên từ các mục 1–4, chỉ cập nhật ngày khi người biên tập thực sự mở/đọc nguồn và ghi kết quả/giới hạn; không dùng xác thực URL hay hash thay cho việc đọc.

## Lệnh kiểm tra đã chạy và giới hạn

Đã dùng các lệnh trên để đọc/đếm catalog, snapshot và manifest; đọc JSON bằng Python và nạp hai tệp catalog trong Node VM để lấy dữ liệu sau khi thực thi. Một lệnh đếm đầu tiên lỗi do `data` là biến lexical; lệnh kế tiếp đã expose biến trong cùng VM và chạy được. Một lần đếm cờ cũng lỗi khi gặp giá trị measurement null; lần sửa đã guard null và cho ra các số tại báo cáo. Không thay dữ liệu để xử lý các lỗi lệnh.

Không chạy smoke/validator/browser: tác vụ chỉ yêu cầu audit cấu trúc nội bộ và không sửa ứng dụng/dữ liệu; báo cáo không tuyên bố đã kiểm tra ảnh hiển thị, hash trên đĩa, liên kết ngoài hoặc tính đúng thiên văn. Giới hạn còn lại: kết quả phụ thuộc snapshot cục bộ ngày 2026-10-21; cờ `comparable` thiếu không được diễn giải thành chứng nhận so sánh được; nội dung nguồn và quyền sử dụng ảnh cần người biên tập kiểm tra từ nguồn gốc.
