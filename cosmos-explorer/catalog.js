'use strict';
const data=[
{id:'earth',name:'Trái Đất',small:'Hành tinh thứ ba',level:'solar',category:'HÀNH TINH · HỆ MẶT TRỜI',kicker:'NGÔI NHÀ CỦA CHÚNG TA',summary:'Thế giới xanh duy nhất được biết chắc chắn có sự sống.',type:'earth',color:'#5ca8df',status:'ĐÃ QUAN SÁT',visualType:'ẢNH MÔ PHỎNG',stats:[['Cách Mặt Trời','1 AU'],['Chu kỳ quỹ đạo','365,25 ngày'],['Bán kính','6.371 km'],['Vệ tinh tự nhiên','1']],radius:1,fact:'Nước ở thể lỏng bao phủ khoảng 71% bề mặt Trái Đất.',research:'Trái Đất là hành tinh đá, có khí quyển chủ yếu gồm nitơ và ôxy. Nước lỏng trên bề mặt là điều kiện nổi bật đối với sự sống.',limits:'Mô hình thể hiện hình dạng và màu sắc minh họa; không tái hiện dữ liệu thời tiết, địa hình hoặc thời gian thực.',source:'https://science.nasa.gov/earth/',photoCaption:'Đồ họa mô phỏng Trái Đất; không phải ảnh vệ tinh trực tiếp tại thời điểm xem.'},
{id:'mars',name:'Sao Hỏa',small:'Hành tinh đỏ',level:'solar',category:'HÀNH TINH · HỆ MẶT TRỜI',kicker:'HÀNH TINH ĐỎ',summary:'Sa mạc đá, núi lửa khổng lồ và dấu vết của nước trong quá khứ.',type:'mars',color:'#d38a69',status:'ĐÃ QUAN SÁT',visualType:'MÔ PHỎNG ĐỒ HỌA',stats:[['Cách Mặt Trời','~1,52 AU'],['Chu kỳ quỹ đạo','687 ngày'],['Bán kính','~3.390 km'],['Vệ tinh tự nhiên','2']],radius:.532,fact:'Olympus Mons trên Sao Hỏa là một trong những núi lửa lớn nhất được biết đến trong Hệ Mặt Trời.',research:'Tàu quỹ đạo và robot tự hành đã tìm thấy nhiều bằng chứng địa chất cho thấy Sao Hỏa từng có nước lỏng trên bề mặt.',limits:'Chưa có bằng chứng xác nhận sự sống hiện tại trên Sao Hỏa. Mô hình không mô phỏng địa hình chính xác.',source:'https://science.nasa.gov/mars/',photoCaption:'Mô phỏng màu sắc và bề mặt Sao Hỏa, không phải bản đồ địa hình chính xác.'},
{id:'jupiter',name:'Sao Mộc',small:'Hành tinh khí khổng lồ',level:'solar',category:'HÀNH TINH · HỆ MẶT TRỜI',kicker:'GÃ KHỔNG LỒ CỦA HỆ MẶT TRỜI',summary:'Những dải mây cuộn xoáy và các cơn bão kéo dài hàng thế kỷ.',type:'jupiter',color:'#d3aa79',status:'ĐÃ QUAN SÁT',visualType:'MÔ PHỎNG ĐỒ HỌA',stats:[['Cách Mặt Trời','~5,2 AU'],['Chu kỳ quỹ đạo','~11,86 năm'],['Bán kính','~69.911 km'],['Loại thiên thể','Khí khổng lồ']],radius:10.97,fact:'Vết Đỏ Lớn là cơn bão khổng lồ đã được con người quan sát trong nhiều thế kỷ.',research:'Sao Mộc chủ yếu gồm hydro và heli. Sứ mệnh Juno nghiên cứu cấu trúc, khí quyển và từ trường của hành tinh.',limits:'Màu các dải mây được mô phỏng nghệ thuật, không phải bản đồ bão theo thời gian thực.',source:'https://science.nasa.gov/jupiter/',photoCaption:'Mô phỏng các dải mây và ánh sáng trên Sao Mộc.'},
{id:'saturn',name:'Sao Thổ',small:'Hành tinh có vành đai',level:'solar',category:'HÀNH TINH · HỆ MẶT TRỜI',kicker:'VƯƠNG QUỐC NHỮNG VÀNH ĐAI',summary:'Các vành đai băng và đá khiến hành tinh khí này nổi bật.',type:'saturn',color:'#d8c092',status:'ĐÃ QUAN SÁT',visualType:'MÔ PHỎNG ĐỒ HỌA',stats:[['Cách Mặt Trời','~9,58 AU'],['Chu kỳ quỹ đạo','~29,45 năm'],['Bán kính','~58.232 km'],['Đặc điểm','Vành đai băng/đá']],radius:9.14,fact:'Những vành đai rộng lớn của Sao Thổ chủ yếu gồm vô số hạt băng và mảnh vật chất.',research:'Dữ liệu từ tàu Cassini cho thấy hệ vành đai và các mặt trăng của Sao Thổ có nhiều cấu trúc phức tạp.',limits:'Góc nghiêng và kết cấu vành đai trong mô hình mang tính minh họa, không phải quỹ đạo tức thời.',source:'https://science.nasa.gov/saturn/',photoCaption:'Đồ họa minh họa bề mặt và các vành đai Sao Thổ.'},
{id:'trappist',name:'TRAPPIST-1e',small:'Ngoại hành tinh đã xác nhận',level:'nearby',category:'NGOẠI HÀNH TINH · HỆ TRAPPIST-1',kicker:'MỘT THẾ GIỚI XA XÔI',summary:'Một hành tinh đá ngoài Hệ Mặt Trời, cách chúng ta khoảng 40 năm ánh sáng.',type:'trappist',color:'#ce9d79',status:'ĐÃ XÁC NHẬN',visualType:'NGHỆ THUẬT MINH HỌA',stats:[['Khoảng cách từ Trái Đất','~40 năm ánh sáng'],['Chu kỳ quỹ đạo','~6,1 ngày'],['Bán kính','~0,92 × Trái Đất'],['Vị trí','Vùng có thể có nước lỏng']],radius:.92,fact:'TRAPPIST-1e nằm trong vùng có thể có nước lỏng nếu nó có khí quyển phù hợp. Điều này không đồng nghĩa đã phát hiện nước hoặc sự sống.',research:'TRAPPIST-1e được xác nhận qua phương pháp quá cảnh, phát hiện năm 2017. Kính James Webb đang khảo sát liệu hành tinh này có khí quyển hay không.',limits:'Chưa có kết luận chắc chắn về sự tồn tại của khí quyển, nước lỏng trên bề mặt hoặc sự sống. Hình NASA là minh họa nghệ thuật, không phải ảnh chụp bề mặt.',source:'https://science.nasa.gov/exoplanet-catalog/trappist-1-e/',photoCaption:'Ảnh minh họa nghệ thuật của NASA/ESA/CSA/STScI; chưa chụp trực tiếp bề mặt TRAPPIST-1e.'},
{id:'proxima',name:'Proxima Centauri',small:'Ngôi sao lân cận',level:'nearby',category:'SAO LÙN ĐỎ · CHÒM SAO BÁN NHÂN MÃ',kicker:'NGÔI SAO GẦN NHẤT',summary:'Ngôi sao gần Hệ Mặt Trời nhất, một sao lùn đỏ mờ trong Bán Nhân Mã.',type:'star',color:'#e58a6c',status:'ĐÃ QUAN SÁT',visualType:'MÔ PHỎNG ĐỒ HỌA',stats:[['Khoảng cách','~4,24 năm ánh sáng'],['Loại sao','Sao lùn đỏ'],['Chòm sao','Bán Nhân Mã'],['Ngoại hành tinh','Có hành tinh xác nhận']],radius:null,fact:'Dù là ngôi sao gần nhất, Proxima Centauri vẫn không nhìn thấy bằng mắt thường do quá mờ.',research:'Proxima Centauri là thành viên của hệ sao Alpha Centauri. Các quan sát đã phát hiện ngoại hành tinh quay quanh nó, trong đó có Proxima Centauri b.',limits:'Màu sắc và kích thước ngôi sao trên màn hình chỉ là hiệu ứng nghệ thuật; không thể suy ra độ sáng thực từ hình.',source:'https://science.nasa.gov/exoplanets/',photoCaption:'Hình mô phỏng một sao lùn đỏ, không phải ảnh trực tiếp của Proxima Centauri.'},
{id:'milky',name:'Ngân Hà',small:'Thiên hà của chúng ta',level:'milky',category:'THIÊN HÀ XOẮN ỐC · MILKY WAY',kicker:'NGÔI NHÀ GIỮA VŨ TRỤ',summary:'Một thiên hà khổng lồ chứa Hệ Mặt Trời và hàng tỷ ngôi sao.',type:'galaxy',color:'#b5c4ed',status:'ĐÃ NGHIÊN CỨU',visualType:'MÔ HÌNH CẤU TRÚC',stats:[['Đường kính ước tính','~100.000 năm ánh sáng'],['Kiểu thiên hà','Xoắn ốc có thanh'],['Vị trí Mặt Trời','Nhánh Orion'],['Trung tâm','Sagittarius A*']],radius:null,fact:'Chúng ta nằm bên trong Ngân Hà, nên không thể chụp một bức ảnh toàn cảnh Ngân Hà từ bên ngoài như với Andromeda.',research:'Dữ liệu từ ESA Gaia giúp lập bản đồ vị trí và chuyển động của rất nhiều ngôi sao thuộc Ngân Hà; cấu trúc xoắn ốc được suy ra từ các quan sát.',limits:'Hình Ngân Hà nhìn từ ngoài là mô phỏng khoa học; vị trí, số lượng và độ sáng các chấm sao trong demo không phải dữ liệu Gaia thực tế.',source:'https://www.esa.int/Science_Exploration/Space_Science/Gaia',photoCaption:'Hình mô phỏng cấu trúc Ngân Hà, không phải ảnh chụp toàn thiên hà từ bên ngoài.'},
{id:'andromeda',name:'Andromeda (M31)',small:'Thiên hà xoắn ốc',level:'galaxies',category:'THIÊN HÀ XOẮN ỐC · M31',kicker:'HÀNG XÓM CỦA NGÂN HÀ',summary:'Một thiên hà xoắn ốc khổng lồ, có thể quan sát trên bầu trời đêm.',type:'galaxy',color:'#d2b5a6',status:'ĐÃ QUAN SÁT',visualType:'ẢNH QUAN SÁT HUBBLE',stats:[['Khoảng cách','~2,5 triệu năm ánh sáng'],['Tên danh mục','Messier 31'],['Kiểu thiên hà','Xoắn ốc'],['Chòm sao','Tiên Nữ']],radius:null,fact:'Ánh sáng Andromeda mà chúng ta nhìn thấy ngày nay đã rời thiên hà này từ khoảng 2,5 triệu năm trước.',research:'Kính Hubble đã quan sát vô số ngôi sao trong Andromeda, từ đó hỗ trợ nghiên cứu lịch sử hình thành sao của thiên hà.',limits:'Ảnh Hubble là ảnh tổng hợp qua các bộ lọc, không nhất thiết tương ứng màu sắc mà mắt thường nhìn thấy.',source:'https://science.nasa.gov/asset/hubble/andromeda-galaxy/',photoCaption:'Ảnh tổng hợp quan sát của Hubble/NASA/ESA, có xử lý màu khoa học.'},
{id:'deep',name:'Trường sâu Webb',small:'Các thiên hà rất xa',level:'deep',category:'TRƯỜNG SÂU VŨ TRỤ · JAMES WEBB',kicker:'NHÌN VÀO QUÁ KHỨ VŨ TRỤ',summary:'Những chấm sáng nhỏ trong ảnh sâu hé lộ vô số thiên hà xa xôi.',type:'deep',color:'#c4b5e5',status:'ĐÃ QUAN SÁT',visualType:'ĐỒ HỌA MINH HỌA',stats:[['Kính thiên văn','James Webb'],['Quan sát','Hồng ngoại'],['Đối tượng','Các thiên hà xa'],['Ý nghĩa','Ánh sáng quá khứ']],radius:null,fact:'Nhìn càng xa trong không gian, chúng ta thường đang nhìn ánh sáng phát ra từ càng lâu về trước.',research:'Kính James Webb sử dụng các thiết bị hồng ngoại để quan sát những thiên hà xa xôi và nghiên cứu vũ trụ sơ khai.',limits:'Nền vũ trụ của bản demo chỉ là minh họa; không biểu diễn ảnh trường sâu Webb hay bản đồ vị trí 3D của thiên hà thật.',source:'https://science.nasa.gov/mission/webb/',photoCaption:'Đồ họa minh họa vùng vũ trụ sâu, không phải ảnh trường sâu thực của Webb.'}
];

data.push(...[
  {
    "id": "mercury",
    "name": "Sao Thủy",
    "small": "Hành tinh đá",
    "level": "solar",
    "type": "mercury",
    "color": "#aaa49b",
    "category": "Hành tinh đá",
    "kicker": "Hành tinh đá",
    "summary": "Hành tinh nhỏ nhất và gần Mặt Trời nhất.",
    "stats": [
      [
        "Chu kỳ quỹ đạo",
        "88 ngày"
      ],
      [
        "Bán kính",
        "~2.440 km"
      ],
      [
        "Cách Mặt Trời",
        "~0,4 AU"
      ],
      [
        "Vệ tinh",
        "0"
      ]
    ],
    "fact": "Một ngày Mặt Trời trên Sao Thủy kéo dài 176 ngày Trái Đất.",
    "research": "Bề mặt có nhiều hố va chạm; lớp ngoại quyển rất mỏng không giữ được nhiệt ban đêm.",
    "source": "https://science.nasa.gov/mercury/facts/",
    "radius": 0.383,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "venus",
    "name": "Sao Kim",
    "small": "Hành tinh đá",
    "level": "solar",
    "type": "venus",
    "color": "#e6c390",
    "category": "Hành tinh đá",
    "kicker": "Hành tinh đá",
    "summary": "Một thế giới bị bao phủ bởi khí quyển dày và mây.",
    "stats": [
      [
        "Chu kỳ quỹ đạo",
        "~225 ngày"
      ],
      [
        "Bán kính",
        "~6.052 km"
      ],
      [
        "Cách Mặt Trời",
        "~0,72 AU"
      ],
      [
        "Vệ tinh",
        "0"
      ]
    ],
    "fact": "Sao Kim quay ngược chiều so với phần lớn hành tinh.",
    "research": "Hiệu ứng nhà kính mạnh khiến Sao Kim nóng hơn Sao Thủy. Chưa có bằng chứng thuyết phục về sự sống.",
    "source": "https://science.nasa.gov/venus/venus-facts/",
    "radius": 0.95,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "uranus",
    "name": "Sao Thiên Vương",
    "small": "Hành tinh băng khổng lồ",
    "level": "solar",
    "type": "uranus",
    "color": "#9dd9dd",
    "category": "Hành tinh băng khổng lồ",
    "kicker": "Hành tinh băng khổng lồ",
    "summary": "Thế giới xanh lục lam với trục quay nghiêng gần như nằm ngang.",
    "stats": [
      [
        "Chu kỳ quỹ đạo",
        "~84 năm"
      ],
      [
        "Đường kính xích đạo",
        "51.118 km"
      ],
      [
        "Cách Mặt Trời",
        "~19 AU"
      ],
      [
        "Độ nghiêng trục",
        "97,77°"
      ]
    ],
    "fact": "William Herschel phát hiện hành tinh này bằng kính thiên văn năm 1781.",
    "research": "Methane trong khí quyển hấp thụ ánh sáng đỏ, góp phần tạo màu xanh lục lam.",
    "source": "https://science.nasa.gov/uranus/facts/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "neptune",
    "name": "Sao Hải Vương",
    "small": "Hành tinh băng khổng lồ",
    "level": "solar",
    "type": "neptune",
    "color": "#719bd8",
    "category": "Hành tinh băng khổng lồ",
    "kicker": "Hành tinh băng khổng lồ",
    "summary": "Hành tinh thứ tám, lạnh và có những luồng gió rất mạnh.",
    "stats": [
      [
        "Chu kỳ quỹ đạo",
        "~165 năm"
      ],
      [
        "Đường kính xích đạo",
        "49.528 km"
      ],
      [
        "Cách Mặt Trời",
        "~30 AU"
      ],
      [
        "Tàu bay qua",
        "Voyager 2"
      ]
    ],
    "fact": "Vị trí của Sao Hải Vương được dự đoán bằng toán học trước khi được xác nhận năm 1846.",
    "research": "Voyager 2 bay qua năm 1989. Màu hiển thị ở đây là minh họa, không dùng để so sánh màu thực với Thiên Vương.",
    "source": "https://science.nasa.gov/neptune/neptune-facts/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "sun",
    "name": "Mặt Trời",
    "small": "Sao dãy chính",
    "level": "nearby",
    "type": "star",
    "color": "#ffbc68",
    "category": "Sao dãy chính",
    "kicker": "Sao dãy chính",
    "summary": "Ngôi sao cung cấp ánh sáng và năng lượng cho Hệ Mặt Trời.",
    "stats": [
      [
        "Loại thiên thể",
        "Ngôi sao"
      ],
      [
        "Thành phần chính",
        "Hydro, heli"
      ],
      [
        "Nguồn năng lượng",
        "Nhiệt hạch"
      ],
      [
        "Hệ hành tinh",
        "Hệ Mặt Trời"
      ]
    ],
    "fact": "Năng lượng được tạo ra khi hydro hợp nhất thành heli trong lõi.",
    "research": "Mặt Trời là khối plasma, không có bề mặt rắn như hành tinh đá.",
    "source": "https://science.nasa.gov/sun/facts/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "moon",
    "name": "Mặt Trăng",
    "small": "Vệ tinh tự nhiên",
    "level": "solar",
    "type": "moon",
    "color": "#b8b8b5",
    "category": "Vệ tinh tự nhiên",
    "kicker": "Vệ tinh tự nhiên",
    "summary": "Người bạn đồng hành tự nhiên của Trái Đất.",
    "stats": [
      [
        "Bán kính",
        "~1.740 km"
      ],
      [
        "Thiên thể mẹ",
        "Trái Đất"
      ],
      [
        "Bề mặt",
        "Đá"
      ],
      [
        "Khí quyển",
        "Ngoại quyển mỏng"
      ]
    ],
    "fact": "Mặt Trăng quay đồng bộ nên hầu như luôn hướng cùng một mặt về Trái Đất.",
    "research": "Các mẫu đá từ sứ mệnh Apollo giúp nghiên cứu lịch sử Mặt Trăng và Hệ Mặt Trời.",
    "source": "https://science.nasa.gov/moon/facts/",
    "radius": 0.273,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "pluto",
    "name": "Sao Diêm Vương",
    "small": "Hành tinh lùn",
    "level": "solar",
    "type": "pluto",
    "color": "#c2a997",
    "category": "Hành tinh lùn",
    "kicker": "Hành tinh lùn",
    "summary": "Thế giới băng và đá trong vành đai Kuiper.",
    "stats": [
      [
        "Phân loại",
        "Hành tinh lùn"
      ],
      [
        "Vùng",
        "Vành đai Kuiper"
      ],
      [
        "Tàu bay qua",
        "New Horizons"
      ],
      [
        "Năm bay qua",
        "2015"
      ]
    ],
    "fact": "Diêm Vương không thuộc tám hành tinh chính của Hệ Mặt Trời.",
    "research": "New Horizons ghi nhận núi băng và những đồng bằng giàu băng nitơ trên bề mặt.",
    "source": "https://science.nasa.gov/dwarf-planets/pluto/facts/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "orion",
    "name": "Tinh vân Orion",
    "small": "Vùng hình thành sao",
    "level": "nebula",
    "type": "nebula",
    "color": "#d69bbd",
    "category": "Vùng hình thành sao",
    "kicker": "Vùng hình thành sao",
    "summary": "Nơi những ngôi sao mới ra đời trong một đám mây khí và bụi.",
    "stats": [
      [
        "Khoảng cách",
        "~1.500 năm ánh sáng"
      ],
      [
        "Danh mục",
        "Messier 42"
      ],
      [
        "Chòm sao",
        "Orion"
      ],
      [
        "Loại",
        "Tinh vân"
      ]
    ],
    "fact": "Cụm sao Trapezium chiếu sáng và định hình vùng khí trung tâm.",
    "research": "Quan sát Hubble cho thấy các đĩa vật chất quanh sao trẻ, giúp nghiên cứu giai đoạn hình thành hệ hành tinh.",
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "crab",
    "name": "Tinh vân Con Cua",
    "small": "Tàn dư siêu tân tinh",
    "level": "nebula",
    "type": "nebula",
    "color": "#82ccd3",
    "category": "Tàn dư siêu tân tinh",
    "kicker": "Tàn dư siêu tân tinh",
    "summary": "Dấu tích của một ngôi sao đã bùng nổ.",
    "stats": [
      [
        "Khoảng cách",
        "~6.500 năm ánh sáng"
      ],
      [
        "Danh mục",
        "Messier 1"
      ],
      [
        "Chòm sao",
        "Kim Ngưu"
      ],
      [
        "Trung tâm",
        "Pulsar Con Cua"
      ]
    ],
    "fact": "Vụ nổ tạo nên tinh vân được các nhà thiên văn Trung Hoa ghi nhận năm 1054.",
    "research": "Một sao neutron quay nhanh ở trung tâm cung cấp năng lượng cho vật chất xung quanh.",
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-1/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời."
  },
  {
    "id": "whirlpool",
    "name": "Thiên hà Xoáy Nước",
    "small": "Thiên hà xoắn ốc",
    "level": "galaxies",
    "type": "galaxy",
    "color": "#a9bce7",
    "category": "Thiên hà xoắn ốc",
    "kicker": "Thiên hà xoắn ốc",
    "summary": "Những cánh tay xoắn chứa sao, khí và các dải bụi.",
    "stats": [
      [
        "Khoảng cách",
        "~31 triệu năm ánh sáng"
      ],
      [
        "Danh mục",
        "Messier 51"
      ],
      [
        "Chòm sao",
        "Chó Săn"
      ],
      [
        "Thiên hà đồng hành",
        "NGC 5195"
      ]
    ],
    "fact": "Các cánh tay xoắn là nơi hình thành nhiều ngôi sao mới.",
    "research": "Hubble giúp nghiên cứu cấu trúc bụi và hoạt động hình thành sao trong thiên hà này.",
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-51/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời.",
    "image": "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/hubble/releases/2011/01/STScI-01EVT4ZDTA6V9ASDFRHWCSK775.tif?w=768",
    "imageSource": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-51/",
    "credit": "NASA, ESA, M. Regan và B. Whitmore (STScI), R. Chandar (University of Toledo), S. Beckwith (STScI), Hubble Heritage Team (STScI/AURA)"
  },
  {
    "id": "sgr",
    "name": "Sagittarius A*",
    "small": "Hố đen siêu khối lượng",
    "level": "blackholes",
    "type": "blackhole",
    "color": "#efab65",
    "category": "Hố đen siêu khối lượng",
    "kicker": "Hố đen siêu khối lượng",
    "summary": "Hố đen tại trung tâm Ngân Hà.",
    "stats": [
      [
        "Khối lượng ước tính",
        "~4 triệu Mặt Trời"
      ],
      [
        "Vị trí",
        "Trung tâm Ngân Hà"
      ],
      [
        "Quan sát",
        "EHT · 1,3 mm"
      ],
      [
        "Ảnh công bố",
        "2022"
      ]
    ],
    "fact": "Vùng sáng trong ảnh EHT đến từ khí nóng xung quanh, không phải từ bên trong hố đen.",
    "research": "Ảnh được tái dựng từ giao thoa kế vô tuyến, dựa trên quan sát năm 2017. Màu cam là màu biểu diễn cường độ tín hiệu.",
    "source": "https://www.eso.org/public/images/eso2208-eht-mwa/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời.",
    "image": "https://cdn.eso.org/images/screen/eso2208-eht-mwa.jpg",
    "imageSource": "https://www.eso.org/public/images/eso2208-eht-mwa/",
    "credit": "EHT Collaboration",
    "papers": [
      [
        "EHT Collaboration (2022), First Sagittarius A* Results I",
        "https://doi.org/10.3847/2041-8213/ac6674"
      ]
    ]
  },
  {
    "id": "m87",
    "name": "M87*",
    "small": "Hố đen siêu khối lượng",
    "level": "blackholes",
    "type": "blackhole",
    "color": "#f2a653",
    "category": "Hố đen siêu khối lượng",
    "kicker": "Hố đen siêu khối lượng",
    "summary": "Hố đen nổi tiếng tại tâm thiên hà Messier 87.",
    "stats": [
      [
        "Khối lượng ước tính",
        "~6,5 tỷ Mặt Trời"
      ],
      [
        "Khoảng cách",
        "~55 triệu năm ánh sáng"
      ],
      [
        "Quan sát",
        "EHT · 1,3 mm"
      ],
      [
        "Ảnh đầu công bố",
        "2019"
      ]
    ],
    "fact": "Ảnh công bố năm 2019 cho thấy bóng hố đen được bao quanh bởi vùng phát xạ sáng.",
    "research": "EHT kết hợp các kính vô tuyến trên nhiều châu lục để tái dựng cấu trúc ở quy mô rất nhỏ trên bầu trời.",
    "source": "https://www.eso.org/public/news/eso1907/",
    "radius": null,
    "status": "ĐÃ QUAN SÁT",
    "visualType": "ĐỒ HỌA MINH HỌA",
    "photoCaption": "Đồ họa minh họa; mở nguồn để xem tư liệu quan sát.",
    "limits": "Hình dạng, màu sắc, chuyển động và khoảng cách trên màn hình chỉ mang tính minh họa; không dùng để suy ra vị trí trên bầu trời.",
    "image": "https://cdn.eso.org/images/screen/eso1907a.jpg",
    "imageSource": "https://www.eso.org/public/images/eso1907a/",
    "credit": "EHT Collaboration",
    "papers": [
      [
        "EHT Collaboration (2019), First M87 Results I",
        "https://doi.org/10.3847/2041-8213/ab0ec7"
      ]
    ]
  }
]);
// Biên tập và đối chiếu ngày 2026-10-21. Không phải bản sao toàn bộ Gaia/API trực tiếp.
const patches = {
 deep:{name:'SMACS 0723 · Trường sâu Webb',small:'Trường quan sát thiên hà',source:'https://science.nasa.gov/asset/webb/webbs-first-deep-field-unveiled-nircam-image/',summary:'Trường quan sát quanh cụm thiên hà SMACS 0723, được Webb ghi lại bằng hồng ngoại.',category:'TRƯỜNG QUAN SÁT · SMACS 0723',research:'Ảnh trường sâu đầu tiên của Webb được công bố tháng 7 năm 2022. Khối lượng cụm thiên hà làm lệch ánh sáng, phóng đại hình ảnh của các thiên hà ở phía sau.',limits:'Các thiên hà trong trường ảnh có khoảng cách khác nhau. Đồ họa ngẫu nhiên của ứng dụng không tái tạo vị trí, độ sáng hay thấu kính hấp dẫn trong ảnh quan sát.'},
 earth:{source:'https://science.nasa.gov/earth/facts/'},
 mars:{source:'https://science.nasa.gov/mars/facts/'},
 jupiter:{source:'https://science.nasa.gov/jupiter/facts/'},
 saturn:{source:'https://science.nasa.gov/saturn/facts/'},
 proxima:{statSources:[null,null,null,'https://science.nasa.gov/exoplanets/big-questions/'],source:'https://science.nasa.gov/image-article/apod-2016-january-18-proxima-centauri-the-closest-star/',references:[['NASA — ngoại hành tinh Proxima Centauri b','https://science.nasa.gov/exoplanets/big-questions/']]},
 trappist:{source:'https://exoplanetarchive.ipac.caltech.edu/overview/TRAPPIST-1e',references:[['NASA — hồ sơ hành tinh','https://science.nasa.gov/exoplanet-catalog/trappist-1-e/'],['NASA — quan sát Webb và giới hạn khí quyển (2025)','https://science.nasa.gov/missions/webb/nasa-webb-looks-at-earth-sized-habitable-zone-exoplanet-trappist-1-e/']],papers:[['Gillon et al. (2017), bảy hành tinh quanh TRAPPIST-1','https://doi.org/10.1038/nature21360'],['JWST-TST DREAMS (2025), phổ truyền qua TRAPPIST-1e','https://arxiv.org/abs/2509.05414']]},
 milky:{statSources:['https://www.esa.int/Science_Exploration/Space_Science/Gaia','https://www.cosmos.esa.int/web/gaia/dr3','https://www.esa.int/Science_Exploration/Space_Science/Gaia','https://www.eso.org/public/images/eso2208-eht-mwa/'],stats:[['Khảo sát tham chiếu','ESA Gaia DR3'],['Nguồn có độ sáng G','~1,806 tỷ'],['Kiểu thiên hà','Xoắn ốc có thanh'],['Trung tâm','Sagittarius A*']],references:[['ESA — nội dung Gaia DR3','https://www.cosmos.esa.int/web/gaia/dr3']],papers:[['Gaia Collaboration (2023), Gaia DR3: Summary','https://doi.org/10.1051/0004-6361/202243940']]},
 orion:{image:'https://cdn.eso.org/images/screen/eso1006a.jpg',imageSource:'https://www.eso.org/public/images/eso1006a/',credit:'ESO/J. Emerson/VISTA; Cambridge Astronomical Survey Unit',photoCaption:'Quan sát hồng ngoại VISTA; màu được gán để hiển thị dữ liệu ngoài vùng mắt nhìn thấy.'}
};
for (const item of data) {
 Object.assign(item, patches[item.id] || {});
 item.reviewed='2026-10-21';
 item.references=[['Nguồn hồ sơ và thông số',item.source],...(item.references||[])];
 item.papers=item.papers||[];
 if(item.image){item.visualType=item.type==='blackhole'?'ẢNH VÔ TUYẾN TÁI DỰNG':'ẢNH QUAN SÁT · XỬ LÝ MÀU';item.photoCaption=item.type==='blackhole'?'Ảnh EHT tái dựng từ dữ liệu vô tuyến, gán màu cường độ; không phải ảnh ánh sáng khả kiến.':item.photoCaption;if(item.id==='whirlpool')item.photoCaption='Hubble ACS: dữ liệu ánh sáng khả kiến tổng hợp qua các bộ lọc.';}
 else item.visualType='ĐỒ HỌA MINH HỌA';
}
