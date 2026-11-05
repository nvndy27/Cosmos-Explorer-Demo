# Dữ liệu và tư liệu khoa học

Ngày biên tập: 2026-10-21. `cosmos-explorer/catalog.js` và `catalog-expanded.js` là dữ liệu chạy của ứng dụng. `catalog-expanded.js` được dựng từ snapshot trong `cosmos-explorer/data/`. Bản 2.2 có 138 hồ sơ và 126 hình ảnh cục bộ (90 tư liệu từ quan sát/tổng hợp/tái dựng, 36 minh họa nghệ thuật). Trường `source` áp dụng cho hồ sơ và thông số; `references` và `papers` bổ sung nguồn quan sát/nghiên cứu; `reviewed` ghi ngày biên tập. Đây là bản ghi tuyển chọn, không tự cập nhật.

## Nguồn
- Hệ Mặt Trời: NASA Science, trang Facts theo từng đối tượng. Số liệu làm tròn; không dùng số vệ tinh hay thông số chưa kiểm chứng mới.
- TRAPPIST-1e: [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/overview/TRAPPIST-1e), [NASA về Webb 2025](https://science.nasa.gov/missions/webb/nasa-webb-looks-at-earth-sized-habitable-zone-exoplanet-trappist-1-e/), [Gillon 2017](https://doi.org/10.1038/nature21360), [DREAMS 2025](https://arxiv.org/abs/2509.05414). Không khẳng định phát hiện sự sống, nước hay khí quyển. Trang Archive qua công cụ mở trực tiếp bị timeout; kết quả tìm kiếm Archive xác nhận chu kỳ ~6,1 ngày, bán kính ~0,92 Trái Đất và xác nhận quá cảnh năm 2017.
- Ngân Hà: [ESA Gaia](https://www.esa.int/Science_Exploration/Space_Science/Gaia), [nội dung DR3](https://www.cosmos.esa.int/web/gaia/dr3), [Gaia Collaboration 2023](https://doi.org/10.1051/0004-6361/202243940). 1,806 tỷ là số nguồn có độ sáng G trong DR3, không phải số ngôi sao ứng dụng dựng hoặc tổng số sao Ngân Hà. Trang Cosmos chặn truy cập trực tiếp qua công cụ (451), tóm tắt tìm kiếm nguồn chính thức được dùng để đối chiếu.
- M42, M1, M51: danh mục Hubble Messier của NASA.
- Sgr A*, M87*: ESO/EHT và bài báo EHT 2022/2019 được liên kết trong từng hồ sơ.

## Phân loại ảnh
| Mục | Tư liệu | Ghi công |
|---|---|---|
| orion | Ảnh quan sát Hubble tổng hợp qua bộ lọc; màu hiển thị có xử lý khoa học. | NASA, ESA, M. Robberto (Space Telescope Science Institute/ESA) and the Hubble Space Telescope Orion Treasury Project Team |
| whirlpool | Ảnh quan sát Hubble tổng hợp qua bộ lọc; màu hiển thị có xử lý khoa học. | NASA, ESA, S. Beckwith (STScI) and the Hubble Heritage Team (STScI/AURA) |
| sgr | Ảnh EHT tái dựng từ dữ liệu vô tuyến, gán màu cường độ; không phải ảnh ánh sáng khả kiến. | EHT Collaboration |
| m87 | Ảnh EHT tái dựng từ dữ liệu vô tuyến, gán màu cường độ; không phải ảnh ánh sáng khả kiến. | EHT Collaboration |
| deep | Webb/NIRCam: quan sát hồng ngoại, tổng hợp qua bộ lọc và gán màu; đây là trường ảnh gồm các thiên hà ở nhiều khoảng cách. | NASA, ESA, CSA, STScI |

Link trang tư liệu và file ảnh nằm trong `imageSource` và `image`. Bản 2.1 lưu 78 ảnh WebP cục bộ, tối đa 800×800 px; chỉ đổi kích thước/định dạng, không sinh thêm nội dung ảnh. `imageRemote` giữ URL tải nguồn. `data/image-manifest.json` lưu nguồn, tác giả, phân loại, chú thích và SHA-256 của mỗi ảnh. Điều kiện sử dụng nguồn vẫn áp dụng; không coi mọi ảnh trên NASA/ESO là thuộc phạm vi công cộng.

Tất cả Canvas, quỹ đạo, điểm sao nền, bề mặt hành tinh và ảnh dự phòng là **minh họa nghệ thuật của ứng dụng**. Không phải dữ liệu Gaia, bản đồ bề mặt chính xác, ray tracing tương đối tính hay vị trí thời gian thực. Cảnh hố đen không mô phỏng vật lý; ảnh EHT riêng mới là tái dựng từ quan sát.

## Thêm dữ liệu
1. Đọc nguồn gốc và kiểm tra đối tượng được xác nhận.
2. Ghi giá trị, đơn vị, định nghĩa (trung bình/xích đạo), sai số khi cần và tham chiếu.
3. Không trộn giá trị từ nhiều nghiên cứu thành một kết quả mới.
4. Xác định ảnh, tác giả, bước sóng, gán màu/tái dựng và điều kiện sử dụng.
5. Cập nhật ngày biên tập thật, chạy kiểm tra và ghi giới hạn còn lại.

## Snapshot bản 2.1
- `data/messier-snapshot.json`: 59 hồ sơ NASA Hubble Messier, gồm khoảng cách, cấp sao biểu kiến, chòm sao, loại thiên thể, ngày lấy, hash trang, nguồn ảnh và ghi công. Các trang được đọc/tách trường theo cấu trúc nguồn; không tự điền trường thiếu. Danh sách chọn và nguồn gốc được lưu trong cùng file. Trích đoạn ghi chú ảnh tối đa 45 từ, hiển thị nguyên văn, không giả là bản dịch.
- `data/exoplanet-snapshot.json`: truy vấn và 20 dòng từ bảng Planetary Systems (`ps`) của NASA Exoplanet Archive, chỉ bộ mặc định `default_flag=1`, cờ tranh luận `pl_controv_flag=0`; có bán kính, chu kỳ, khoảng cách và các thông số sao đã dùng. Các giá trị thuộc cùng dòng PS, không ghép từ bảng composite. Truy vấn đầy đủ và URL TAP được lưu để tái tạo.
- `data/exoplanet-records.json`: 20 hồ sơ hành tinh và 8 hồ sơ sao chủ được biên tập từ snapshot trên. Không suy ra thành phần, bề mặt, khí quyển hoặc khả năng có sự sống từ bán kính. Sai số cần tra tại Archive và bài báo gốc; snapshot chỉ chứa các cột đã truy vấn.
- pc là parsec; R⊕ là bán kính Trái Đất, R☉ là bán kính Mặt Trời, K là kelvin. Cấp sao biểu kiến không phải độ sáng tuyệt đối. Không dùng thông số sao làm bán kính hành tinh.
- Các nguồn mới được lấy trực tiếp qua HTTPS thành công trong phiên này. Những hạn chế truy cập Archive/Cosmos ghi ở mục cũ là lịch sử đối chiếu bản 2.0, không phải trạng thái của lần lấy PS bản 2.1.

## Phân biệt tư liệu bổ sung
- Trái Đất: Blue Marble 2007 tổng hợp dữ liệu vệ tinh, không phải một lần chụp duy nhất.
- Mặt Trời: SDO/AIA 304 cực tím được gán màu.
- Proxima: ảnh Hubble của điểm sáng và nhiễu xạ, không phải ảnh phân giải bề mặt.
- Webb/SMACS 0723: ảnh trường quan sát hồng ngoại tổng hợp và gán màu.
- Mỗi ảnh hành tinh có tàu quan sát và ghi chú xử lý riêng trong hồ sơ.
- Minh họa Canvas của ứng dụng không phải ảnh quan sát. Ngoại hành tinh nay có tư liệu NASA/ESO cục bộ; xem đợt bổ sung hình bên dưới.

## Tái tạo
Công cụ biên tập trong `scripts/` cần Python, beautifulsoup4 và Pillow; ứng dụng chạy không cần các thư viện này. `refresh_catalog.py` đọc lại các trang Messier và ảnh; `refresh_exoplanets.py --fetch` lấy lại truy vấn PS đã lưu; bỏ `--fetch` để biên tập từ snapshot hiện có. Sau khi duyệt thay đổi, chạy `build_catalog.py`. `cache_images.py` phục hồi các ảnh cục bộ bị thiếu từ manifest. Không coi dữ liệu nguồn thay đổi là thay đổi đã được duyệt tự động.

## Snapshot và biên tập bản 2.2

`data/upgrade22-snapshot.json` chứa đúng 30 `newRecords`, 9 hồ sơ nâng cấp (8 hành tinh và TRAPPIST-1e), metadata cho 108 ID cũ và provenance nguồn. `scripts/build_catalog.py` đọc snapshot này để sinh `catalog-expanded.js`; không sửa trực tiếp tệp sinh tự động. `docs/inventory-2.2.json` ghi ID được giữ và 30 ID mới.

- Hành tinh lùn: Ceres, Eris, Haumea, Makemake; không thêm lại Diêm Vương.
- Vệ tinh: Europa, Io, Ganymede, Callisto, Titan, Enceladus, Triton, Charon, Phobos, Deimos; Mặt Trăng cũ giữ ID `moon`.
- TRAPPIST-1 b/c/d/f/g/h; e giữ ID `trappist`.
- 10 ngoại hành tinh khác: 55 Cnc e, GJ 1214 b, GJ 436 b, K2-18 b, Kepler-16 b, Kepler-22 b, LHS 1140 b, TOI-700 d, WASP-12 b, bet Pic b. Không thêm sao chủ vào số hồ sơ hành tinh mới. Kepler-186 f không xuất hiện trong tập truy vấn loại cờ tranh luận, nên không chọn; không kết luận từ đó rằng nó chưa được xác nhận.

### Nguồn và cách lấy

- Tám hành tinh và các hành tinh lùn dùng [NASA/JPL — Planetary Physical Parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html): bán kính trung bình khác xích đạo; mass đổi đúng hệ số kg từ đầu cột. Chu kỳ JPL theo năm được đổi sang ngày với quy ước năm Julian = 365,25 ngày; ghi chú nằm ở đại lượng. Giá trị/sai số thô của bảng được giữ trong provenance, không ghép với một bán kính khác để suy mật độ.
- Vệ tinh dùng [NASA/JPL — Satellite Physical Parameters](https://ssd.jpl.nasa.gov/sats/phys_par/) cho bán kính trung bình và GM. **GM không phải khối lượng**; không dùng GM làm kg, không tự lấy G để điền khối lượng. Khối lượng/chu kỳ chưa biên tập được để null.
- Nội dung và lịch sử dùng các trang NASA của từng đối tượng, NASA về vệ tinh Galileo/Mars, NASA/ESA về Huygens, các trang NASA/Kepler/Webb và nguồn ảnh. URL và hash trang đã lấy được lưu trong provenance; nguồn bổ sung liên kết trong hồ sơ.
- 17 dòng Archive (16 hành tinh mới và e cũ) lấy từ **PSCompPars**, cờ `pl_controv_flag=0`. Truy vấn đầy đủ/URL/raw rows nằm trong `provenance.exoplanets`. Mỗi bán kính, khối lượng và chu kỳ giữ link tham chiếu trường tương ứng. Nguồn liên kết tương đối của Archive được giải thành URL tuyệt đối theo máy chủ Archive.
- PSCompPars có thể dùng nhiều bài báo hoặc giá trị tính toán trong cùng dòng. Bản 2.2 không tuyên bố cả dòng là một nghiệm vật lý tự nhất quán; không dùng các trường đó để tính một mật độ hoặc kết luận thành phần mới. Bản PS 20 dòng cũ vẫn giữ provenance riêng. Xem [cách Archive chọn/tính giá trị](https://exoplanetarchive.ipac.caltech.edu/docs/pscp_calc.html).

### Hợp đồng đại lượng

`measurements` lưu số hoặc trường null, đơn vị, định nghĩa và nguồn. Một đại lượng đã lưu nhưng bị giới hạn có `limit`; một đại lượng chưa đủ căn cứ so sánh có `comparable:false`. UI không phân tích chuỗi để tự suy số và không thay null bằng 0. “Chưa có dữ liệu” nghĩa là chưa được đối chiếu/tích hợp trong bản biên tập này.

- `mean_radius`, `equatorial_radius`, `transit_radius` và `catalog_radius` là các định nghĩa khác nhau. Không suy phương pháp đo bán kính chỉ từ phương pháp **phát hiện** hành tinh. Các bán kính danh mục chưa xác minh phương pháp vẫn được hiển thị kèm nguồn nhưng loại khỏi biểu đồ/sắp xếp bán kính tương thích.
- Khối lượng `mass`, `mass_estimate`, `minimum_mass`, `mass_from_radius` được tách rõ. Kepler-22 b có giới hạn trên; TOI-700 d dùng quan hệ khối lượng–bán kính của Archive. Các giới hạn và phép suy này không được làm phép đo độc lập trong biểu đồ chung.
- `equilibrium_temperature` là nhiệt độ cân bằng mô hình, không phải nhiệt độ bề mặt đo được.
- Khoảng cách thư viện chỉ sắp xếp các hệ có định nghĩa khoảng cách từ Mặt Trời và đơn vị pc. Không trộn khoảng cách quỹ đạo/AU hoặc diễn giải số từ chuỗi Messier cũ.
- So sánh chỉ đối chiếu cùng định nghĩa/đơn vị với ít nhất hai giá trị phù hợp. Bán kính vẽ thanh **tuyến tính**, không ép chiều dài tối thiểu, không dùng log, không diễn giải là diện tích/thể tích. Giá trị thiếu hiển thị riêng. Không tự đổi M⊕ sang kg hoặc coi bán kính quá cảnh là trung bình để ép có biểu đồ.

### Hình ảnh 2.2

Thêm 11 ảnh cục bộ: Ceres và 10 vệ tinh mới. Nguồn, tác giả, URL và cách xử lý giữ trong snapshot và manifest. Ceres là bản chiếu từ ảnh Dawn; Charon là ghép các bộ lọc với màu tăng cường; Triton/Enceladus là mosaic. Phân loại không bị đổi thành ảnh chụp duy nhất khi build. Ba hành tinh lùn còn lại dùng minh họa của Cosmos Explorer; ngoại hành tinh được bổ sung hình NASA/ESO trong đợt cập nhật bên dưới. Haumea minh họa hình kéo dài nhưng không phải mô hình địa hình hoặc kích thước chính xác.

Mỗi ảnh trong `data/image-manifest.json` có ID, file, URL tải, nguồn, ghi công, phân loại, chú thích, ngày lấy và SHA-256. `scripts/validate_catalog.cjs` kiểm tra đủ 126 file và hash. Khi ảnh lỗi, cả hồ sơ và thẻ ghi “Minh họa đồ họa · Cosmos Explorer”; ghi công ảnh gốc được phân biệt với đồ họa dự phòng.

### Giới hạn biên tập còn lại

Chưa chuẩn hóa tất cả đại lượng cho 108 hồ sơ cũ, chưa biên tập đủ khối lượng/chu kỳ vệ tinh hoặc sai số để hiển thị chi tiết. Sai số nguồn được tra tại bảng/bài báo và provenance khi đã có; biểu đồ hiện không vẽ dải sai số. Số liệu là snapshot, không tự cập nhật API hoặc cam kết link ngoài luôn hoạt động. Đây không phải kiểm định thiên văn độc lập.

## Bổ sung hình ngoại hành tinh — 2026-10-21

`data/exoplanet-image-snapshot.json` là snapshot biên tập cho 37 hồ sơ ngoại hành tinh; builder áp dụng sau snapshot nội dung 2.2. Có 36 minh họa và 1 ảnh quan sát: trong đó 20 minh họa cho đối tượng/hệ cụ thể, 16 ảnh đại diện chung theo loại lấy đúng hình mà danh mục NASA dùng cho hồ sơ đó. Nhãn “Minh họa đại diện” và chú thích luôn nêu giới hạn; không gọi hình chung là bề mặt riêng đã xác nhận. Bộ lọc ảnh quan sát loại cả 36 minh họa.

Kepler-16 b: NASA/JPL-Caltech PIA14724; Kepler-22 b: NASA/JPL-Caltech/Ames PIA14883. Các hình K2-18 b, WASP-43 b, WASP-17 b, GJ 1214 b dùng trang asset NASA với họa sĩ/nhóm khoa học được ghi công; LHS 1140 b dùng ESO/spaceengine.org. Beta Pictoris b dùng ảnh ESO/VLT/NACO 4,05 µm ann1037d: điểm sáng hồng ngoại, sao chủ bị che, không phải ảnh phân giải bề mặt. TOI-700 d được minh họa bằng ảnh toàn hệ TOI 700 PIA23408 và ghi rõ phạm vi. Trang danh mục không nêu họa sĩ riêng thì ghi NASA Science là đơn vị công bố, không tự gán tác giả.

Nguồn/URL tải/hash nguồn và file, ngày, phạm vi minh họa, ghi công được lưu trong snapshot/manifest. Chỉ đổi kích thước tối đa 1000×1000 và định dạng WebP chất lượng 87; không sinh ảnh hoặc thêm chi tiết. Manifest ghi thông số chuyển đổi để `cache_images.py` khôi phục ảnh. Ghi công ESO được mở sẵn trên thẻ, liên kết trang nguồn; chỉ đổi kích thước/định dạng, theo [CC BY 4.0 của ESO](https://www.eso.org/public/outreach/copyright/). Quy định [NASA Images and Media](https://www.nasa.gov/nasa-brand-center/images-and-media/) và ghi công của nguồn vẫn áp dụng.
