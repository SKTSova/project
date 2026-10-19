import { StudyMaterialItem } from '../types';

export interface StudyTopicOption {
  id: string;
  title: string;
  grade: string;
  description: string;
  iconEmoji: string;
}

export const STUDY_TOPIC_OPTIONS: StudyTopicOption[] = [
  {
    id: 'topic-este-lipit',
    title: 'Este - Lipit & Chất béo',
    grade: 'Hóa học 12',
    description: 'Khái niệm, đồng phân, phản ứng xà phòng hóa và ứng dụng chất béo.',
    iconEmoji: '🧪',
  },
  {
    id: 'topic-oxh-khu',
    title: 'Phản ứng Oxi hóa - Khử & Pin điện hóa',
    grade: 'Hóa học 10',
    description: 'Xác định số oxi hóa, phương pháp thăng bằng electron, dãy điện hóa.',
    iconEmoji: '⚡',
  },
  {
    id: 'topic-can-bang-ph',
    title: 'Cân bằng hóa học & Dung dịch chất điện li',
    grade: 'Hóa học 11',
    description: 'Độ pH, thuyết axit-bazơ Brønsted, phản ứng trao đổi ion.',
    iconEmoji: '💧',
  },
  {
    id: 'topic-kim-loai',
    title: 'Đại cương Kim loại & Hợp chất Nhôm, Sắt',
    grade: 'Hóa học 12',
    description: 'Tính chất hóa học chung, phản ứng nhiệt nhôm, hợp chất lưỡng tính.',
    iconEmoji: '🔩',
  },
  {
    id: 'topic-cacbohidrat',
    title: 'Cacbohiđrat (Glucozơ, Saccarozơ, Tinh bột)',
    grade: 'Hóa học 12',
    description: 'Phản ứng tráng bạc, thủy phân, phản ứng màu với iot.',
    iconEmoji: '🌾',
  },
  {
    id: 'topic-nguyen-tu',
    title: 'Cấu tạo nguyên tử & Bảng tuần hoàn',
    grade: 'Hóa học 10',
    description: 'Cấu hình electron, bán kính nguyên tử, độ âm điện và tính kim loại.',
    iconEmoji: '⚛️',
  },
];

export const SAMPLE_TEXT_SNIPPETS = [
  {
    label: 'Mẫu 1: Tóm tắt phản ứng Este hóa & Xà phòng hóa',
    title: 'Ghi chép lý thuyết: Phản ứng Este hóa & Xà phòng hóa',
    topicId: 'topic-este-lipit',
    content: `1. Phản ứng Este hóa:
CH3COOH + C2H5OH ⇄ CH3COOC2H5 + H2O (Xúc tác: H2SO4 đặc, đun nóng t°)
- Đặc điểm: Là phản ứng thuận nghịch, tỏa ít nhiệt.
- Vai trò H2SO4 đặc: Vừa là chất xúc tác, vừa hút nước làm cân bằng chuyển dịch sang chiều thuận tạo este thơm.

2. Phản ứng Thủy phân trong môi trường kiềm (Xà phòng hóa):
RCOOR' + NaOH → RCOONa + R'OH (Phản ứng một chiều)
(C17H35COO)3C3H5 + 3NaOH → 3C17H35COONa (xà phòng) + C3H5(OH)3 (glixerol)

3. Lưu ý quan trọng bài thi THPT:
- Este fomat (HCOOR) có khả năng tham gia phản ứng tráng bạc.
- Triolein (C17H33COO)3C3H5 làm mất màu dung dịch Brom (chất béo không no).`,
  },
  {
    label: 'Mẫu 2: Dấu hiệu nhận biết kết tủa & hiện tượng đặc trưng',
    title: 'Sổ tay bỏ túi: Màu sắc kết tủa và khí nhận biết',
    topicId: 'topic-kim-loai',
    content: `- BaSO4: Kết tủa trắng tinh thể, không tan trong axit mạnh (HCl, HNO3).
- AgCl: Kết tủa trắng vón, hóa đen chậm ngoài ánh sáng mặt trời.
- Fe(OH)2: Kết tủa trắng xanh, để ngoài không khí hóa nâu đỏ do tạo Fe(OH)3:
  4Fe(OH)2 + O2 + 2H2O → 4Fe(OH)3 (nâu đỏ).
- Cu(OH)2: Kết tủa màu xanh lam, tan trong glixerol tạo dung dịch phức màu xanh lam thẫm.
- Al(OH)3: Kết tủa keo trắng, tan được trong dung dịch kiềm dư (tính lưỡng tính).`,
  },
  {
    label: 'Mẫu 3: 4 bước cân bằng phản ứng Oxi hóa - Khử',
    title: 'Phương pháp ghi nhớ: Các bước cân bằng electron',
    topicId: 'topic-oxh-khu',
    content: `Bước 1: Xác định số oxi hóa của các nguyên tố thay đổi trước và sau phản ứng.
Bước 2: Viết quá trình oxi hóa (nhường e) và quá trình khử (nhận e).
Bước 3: Tìm hệ số thích hợp cho chất khử và chất oxi hóa sao cho: Tổng e nhường = Tổng e nhận.
Bước 4: Đặt hệ số vào phương trình và đếm kiểm tra lại theo thứ tự: Kim loại → Phi kim → Hiđro → Oxi.`,
  },
];

export const SAMPLE_IMAGE_PRESETS = [
  {
    title: 'Ảnh chụp vở ghi: Sơ đồ tư duy Este - Lipit',
    topicId: 'topic-este-lipit',
    caption: 'Sơ đồ nhánh tóm tắt tính chất vật lý, điều chế và ứng dụng của Este trong công nghiệp hương liệu.',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Ảnh chụp trang sách giáo khoa: Bảng tính tan & Dãy điện hóa',
    topicId: 'topic-oxh-khu',
    caption: 'Bảng tra cứu thế điện cực chuẩn và thứ tự các cặp oxi hóa - khử thường gặp trong đề thi.',
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Ảnh chụp phòng thí nghiệm: Phản ứng tráng bạc tráng gương',
    topicId: 'topic-cacbohidrat',
    caption: 'Thí nghiệm Glucozơ tác dụng với thuốc thử Tollens [Ag(NH3)2]OH tạo lớp bạc sáng bóng trên thành ống nghiệm.',
    imageUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
  },
];

export const SAMPLE_URL_PRESETS = [
  {
    title: 'Video bài giảng: Chuyên đề Este & Bài toán xà phòng hóa',
    url: 'https://www.youtube.com/watch?v=chem-este-thpt-lesson',
    topicId: 'topic-este-lipit',
    description: 'Thầy giáo phân tích các bẫy đề thi về este no đơn chức mạch hở và este của phenol.',
  },
  {
    title: 'Bài viết tổng hợp: Kỹ thuật bảo toàn khối lượng và bảo toàn electron',
    url: 'https://hoahoc247.vn/chuyen-de/bao-toan-electron-va-khoi-luong-thpt',
    topicId: 'topic-oxh-khu',
    description: 'Tài liệu chi tiết 20 dạng toán kim loại phản ứng với axit HNO3 và H2SO4 đặc nóng.',
  },
  {
    title: 'Thư viện bài tập: 50 câu trắc nghiệm lý thuyết đếm hợp chất hữu cơ',
    url: 'https://onthithpt.edu.vn/hoa-hoc-12/50-cau-ly-thuyet-dem-este-lipit',
    topicId: 'topic-este-lipit',
    description: 'Dạng bài đếm số đồng phân, số chất tác dụng với NaOH, đun nóng tạo kết tủa.',
  },
];

export const INITIAL_STUDY_MATERIALS: StudyMaterialItem[] = [
  {
    id: 'mat-001',
    type: 'text',
    title: 'Ghi chép cốt lõi: Phản ứng Este hóa & Xà phòng hóa',
    subject: 'Hóa học',
    grade: 'Lớp 12',
    topicId: 'topic-este-lipit',
    topicTitle: 'Este - Lipit & Chất béo',
    content: `1. Phản ứng este hóa:
CH3COOH + C2H5OH ⇄ CH3COOC2H5 + H2O (H2SO4 đặc, đun nóng nhẹ 65-70°C)
- Đặc điểm: Phản ứng thuận nghịch (hai chiều), este etyl axetat mùi thơm nhẹ nổi lên trên mặt nước.
- Vai trò kép của H2SO4 đặc: Vừa làm chất xúc tác tăng tốc độ, vừa hút nước để đẩy cân bằng sang phải.

2. Phản ứng xà phòng hóa (Thủy phân trong kiềm):
RCOOR' + NaOH →(t°) RCOONa + R'OH (Phản ứng một chiều hoàn toàn)
(C17H35COO)3C3H5 (Tristearin rắn) + 3NaOH →(t°) 3C17H35COONa (xà phòng) + C3H5(OH)3 (glixerol)
- Cuối phản ứng thêm dung dịch NaCl bão hòa để tách muối xà phòng nhẹ nổi lên trên.

3. Phản ứng đặc trưng cần phân biệt:
- Este của axit fomic (HCOOR) có nhóm -CHO đầu mạch nên tham gia phản ứng tráng bạc tạo 2Ag↓.
- Chất béo không no Triolein (C17H33COO)3C3H5 ở thể lỏng, cộng tối đa 3Br2 làm mất màu nước brom.`,
    noteOrCaption: 'Ghi chép nhanh từ vở học trên lớp tiết 1 ngày 18/09.',
    createdAt: 'Hôm nay, 08:30',
    wordCount: 145,
    tags: ['Lý thuyết trọng tâm', 'PTHH Hữu cơ'],
  },
  {
    id: 'mat-002',
    type: 'image',
    title: 'Ảnh chụp trang vở: Sơ đồ tư duy các nhánh phản ứng Este',
    subject: 'Hóa học',
    grade: 'Lớp 12',
    topicId: 'topic-este-lipit',
    topicTitle: 'Este - Lipit & Chất béo',
    content: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    noteOrCaption: 'Sơ đồ so sánh nhiệt độ sôi: Axit RCOOH > Ancol ROH > Este RCOOR\' (do este không có liên kết hiđro liên phân tử).',
    createdAt: 'Hôm qua, 16:45',
    tags: ['Ảnh vở ghi', 'Sơ đồ tư duy'],
  },
  {
    id: 'mat-003',
    type: 'url',
    title: 'Video bài giảng: Phương pháp giải nhanh bài toán Oxi hóa - Khử',
    subject: 'Hóa học',
    grade: 'Lớp 10',
    topicId: 'topic-oxh-khu',
    topicTitle: 'Phản ứng Oxi hóa - Khử & Pin điện hóa',
    content: 'https://www.youtube.com/watch?v=chem-oxh-khu-thpt',
    noteOrCaption: 'Quy tắc Khử cho - O nhận, định luật bảo toàn electron ∑n_e(nhường) = ∑n_e(nhận) và 4 bước cân bằng phương trình Cu + HNO3 loãng.',
    createdAt: '19/09/2026',
    tags: ['Video bài giảng', 'Bài tập mẫu'],
  },
  {
    id: 'mat-004',
    type: 'text',
    title: 'Mẹo nhớ nhanh: Dãy điện hóa kim loại theo câu vè dân gian',
    subject: 'Hóa học',
    grade: 'Lớp 12',
    topicId: 'topic-kim-loai',
    topicTitle: 'Đại cương Kim loại & Hợp chất Nhôm, Sắt',
    content: `Khi Nào Ba Cần May Áo Giáp Sắt Nhớ Sang Phố Hỏi Cửa Hàng Á Phi Âu.
- Thứ tự tính khử của kim loại giảm dần từ trái sang phải:
  K > Na > Ba > Ca > Mg > Al > Zn > Fe > Ni > Sn > Pb > H > Cu > Hg > Ag > Pt > Au.
- Thứ tự tính oxi hóa của cation kim loại tăng dần:
  K⁺ < Na⁺ < ... < Fe²⁺ < Cu²⁺ < Fe³⁺ < Ag⁺.
* Chú ý: Cặp Fe³⁺/Fe²⁺ đứng sau Cu²⁺/Cu nhưng đứng trước Ag⁺/Ag (Cu + 2FeCl3 → CuCl2 + 2FeCl2; Fe + 3AgNO3 dư → Fe(NO3)3 + 3Ag↓).`,
    noteOrCaption: 'Câu thần chú thuộc lòng để làm câu hỏi trắc nghiệm đếm cặp oxi hóa khử.',
    createdAt: '17/09/2026',
    wordCount: 124,
    tags: ['Mẹo học bài', 'Dãy điện hóa'],
  },
  {
    id: 'mat-005',
    type: 'text',
    title: 'Ghi chép KHTN Lớp 7-8: Cấu tạo Nguyên tử, Hóa trị & Bảo toàn Khối lượng',
    subject: 'Khoa học Tự nhiên',
    grade: 'Lớp 7 - 8',
    topicId: 'topic-nguyen-tu',
    topicTitle: 'Cấu tạo nguyên tử & Bảng tuần hoàn',
    content: `1. Cấu tạo nguyên tử (KHTN 7):
- Hạt nhân ở tâm gồm Proton (p, điện tích +1) và Neutron (n, không mang điện).
- Lớp vỏ gồm các Electron (e, điện tích -1). Nguyên tử trung hòa điện nên Số p = Số e = Z.
- Khối lượng nguyên tử tập trung ở hạt nhân: A ≈ p + n (amu).

2. Quy tắc Hóa trị (KHTN 7):
- Hợp chất 2 nguyên tố AₓBᵧ (hóa trị a, b): x × a = y × b ⇒ tỉ lệ chỉ số x/y = b/a (tối giản).

3. Định luật Bảo toàn Khối lượng (KHTN 8):
- Trong phản ứng hóa học, chỉ liên kết giữa các nguyên tử thay đổi, còn số nguyên tử mỗi nguyên tố giữ nguyên.
- Công thức: m_tham_gia = m_sản_phẩm (VD: m_CaCO3 = m_CaO + m_CO2↑).`,
    noteOrCaption: 'Tóm tắt trọng tâm ôn kiểm tra giữa kỳ môn Khoa học Tự nhiên THCS (Lớp 7 - 8).',
    createdAt: '20/09/2026',
    wordCount: 138,
    tags: ['KHTN 7-8', 'Nền tảng cơ bản'],
  },
];
