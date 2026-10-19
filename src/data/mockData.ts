import { ChemistryTopic, MockQuizItem, MockFlashcardItem, MockChatMessage, ChemicalEquationItem } from '../types';

export const APP_INFO = {
  name: 'ScienceQuiz',
  subject: 'Hóa học',
  version: 'v0.1',
  shellType: 'App Shell (Khung Giao Diện Tĩnh)',
  targetGrade: 'THPT (Lớp 10, 11, 12)',
  personalSpaceSlogan: 'Đây là không gian ôn tập cá nhân của bạn',
  welcomeMessage: 'Chào mừng bạn đến với hệ thống ôn thi Hóa học cá nhân - ScienceQuiz',
  welcomeSub: 'Không gian học tập cá nhân hóa: Tra cứu phương trình phản ứng (PTHH) và luyện tập trắc nghiệm Hóa học.',
};

export const MOCK_STUDENT_PROFILE = {
  name: 'Nguyễn Minh Quân',
  role: 'Học sinh Lớp 11A1',
  school: 'THPT Chuyên Khoa Học Tự Nhiên',
  currentStreak: '3 ngày',
  todayStudyTime: '25 phút',
  targetGoal: 'Ôn tập học kỳ I & ĐGNL',
  personalNote: 'Mục tiêu hôm nay: Ôn chắc 10 PTHH Oxi hóa - khử và 15 câu trắc nghiệm Este - Lipit.',
};

// Danh sách các Phương trình Hóa học (PTHH) trọng tâm THPT (Dữ liệu mẫu tĩnh)
export const STATIC_CHEMICAL_EQUATIONS: ChemicalEquationItem[] = [
  {
    id: 'pthh-01',
    code: 'PTHH-OK-01',
    name: 'Đồng tác dụng với axit nitric loãng',
    category: 'Oxi hóa - Khử',
    equation: '3Cu + 8HNO₃ (loãng) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O',
    condition: 'Nhiệt độ thường hoặc đun nhẹ',
    phenomenon: 'Kim loại Cu tan dần, dung dịch chuyển sang màu xanh lam, có khí không màu thoát ra hóa nâu trong không khí (NO → NO₂).',
    significance: 'Phản ứng kinh điển trong đề thi THPT Quốc gia về chất khử tác dụng với axit có tính oxi hóa mạnh.',
  },
  {
    id: 'pthh-02',
    code: 'PTHH-HC-01',
    name: 'Phản ứng Este hóa giữa Axit axetic và Ancol etylic',
    category: 'Hữu cơ',
    equation: 'CH₃COOH + C₂H₅OH ⇄ CH₃COOC₂H₅ + H₂O',
    condition: 'H₂SO₄ đặc, đun nóng nhẹ (t° ~ 65-70°C)',
    phenomenon: 'Hỗn hợp sau phản ứng tách lớp, lớp chất lỏng nhẹ hơn nổi lên trên có mùi thơm dễ chịu của este etyl axetat.',
    significance: 'Phản ứng thuận nghịch, H₂SO₄ đặc đóng vai trò chất xúc tác và hút nước làm cân bằng dịch chuyển sang phải.',
  },
  {
    id: 'pthh-03',
    code: 'PTHH-DP-01',
    name: 'Phản ứng nhiệt nhôm điều chế kim loại',
    category: 'Nhiệt nhôm & Điện phân',
    equation: '2Al + Fe₂O₃ → Al₂O₃ + 2Fe',
    condition: 'Nhiệt độ cao (t° > 1000°C, dùng dây Mg làm ngòi)',
    phenomenon: 'Phản ứng tỏa nhiệt dữ dội, hỗn hợp phát sáng chói lọi, sắt sinh ra ở trạng thái nóng chảy.',
    significance: 'Dùng hàn đường ray xe lửa tại chỗ và điều chế các kim loại khó nóng chảy.',
  },
  {
    id: 'pthh-04',
    code: 'PTHH-HC-02',
    name: 'Phản ứng tráng bạc của Glucozơ (Anđehit)',
    category: 'Hữu cơ',
    equation: 'CH₂OH[CHOH]₄CHO + 2[Ag(NH₃)₂]OH → CH₂OH[CHOH]₄COONH₄ + 2Ag↓ + 3NH₃ + H₂O',
    condition: 'Đun cách thủy nhẹ trong ống nghiệm sạch',
    phenomenon: 'Thành ống nghiệm xuất hiện lớp kim loại Bạc (Ag) sáng bóng như gương.',
    significance: 'Chứng minh nhóm chức anđehit (-CHO) trong phân tử Glucozơ, bài tập nhận biết trọng tâm.',
  },
  {
    id: 'pthh-05',
    code: 'PTHH-VC-01',
    name: 'Oxi hóa Sắt(II) hiđroxit trong không khí ẩm',
    category: 'Vô cơ',
    equation: '4Fe(OH)₂ (trắng xanh) + O₂ + 2H₂O → 4Fe(OH)₃↓ (nâu đỏ)',
    condition: 'Để ngoài không khí ẩm',
    phenomenon: 'Kết tủa màu trắng xanh chuyển dần sang màu nâu đỏ đặc trưng của Fe(OH)₃.',
    significance: 'Minh họa tính không bền và tính khử mạnh của hợp chất Fe(II).',
  },
  {
    id: 'pthh-06',
    code: 'PTHH-VC-02',
    name: 'Sản xuất Axit Sunfuric - Giai đoạn chuyển hóa SO₃',
    category: 'Vô cơ',
    equation: 'SO₃ + H₂O → H₂SO₄',
    condition: 'Phản ứng tỏa nhiệt mạnh',
    phenomenon: 'SO₃ tan mãnh liệt trong nước tỏa nhiều nhiệt; trong công nghiệp dùng H₂SO₄ đặc hấp thụ SO₃ tạo Oleum (H₂SO₄.nSO₃).',
    significance: 'Mắt xích quan trọng trong chu trình tiếp xúc điều chế axit sunfuric công nghiệp.',
  },
];

// Danh sách các câu hỏi Quiz Trắc nghiệm Hóa học mẫu tĩnh
export const STATIC_QUIZ_QUESTIONS: MockQuizItem[] = [
  {
    id: 'sample-quiz-01',
    number: 1,
    chapter: 'Chuyên đề: Oxi - Lưu huỳnh & Phản ứng tạo Axit',
    difficulty: 'Trung bình',
    question: 'Chất nào sau đây là oxit axit tác dụng với nước ở điều kiện thường tạo thành axit sunfuric (H₂SO₄)?',
    options: [
      { key: 'A', text: 'Khí sunfurơ', formula: 'SO₂' },
      { key: 'B', text: 'Lưu huỳnh trioxit', formula: 'SO₃' },
      { key: 'C', text: 'Khí cacbonic', formula: 'CO₂' },
      { key: 'D', text: 'Điphotpho pentaoxit', formula: 'P₂O₅' },
    ],
    staticExplanationPreview:
      '[PTHH giải thích mẫu tĩnh]: SO₃ + H₂O → H₂SO₄ (tỏa nhiều nhiệt). SO₃ là anhiđrit của axit sunfuric.',
  },
  {
    id: 'sample-quiz-02',
    number: 2,
    chapter: 'Chuyên đề: Este - Lipit & Phản ứng Hóa học Hữu cơ',
    difficulty: 'Dễ',
    question: 'Khi đun nóng hỗn hợp axit axetic (CH₃COOH) và ancol etylic (C₂H₅OH) có mặt H₂SO₄ đặc làm xúc tác, sản phẩm este thu được có tên gọi và công thức cấu tạo là gì?',
    options: [
      { key: 'A', text: 'Metyl axetat', formula: 'CH₃COOCH₃' },
      { key: 'B', text: 'Etyl axetat', formula: 'CH₃COOC₂H₅' },
      { key: 'C', text: 'Etyl fomat', formula: 'HCOOC₂H₅' },
      { key: 'D', text: 'Metyl fomat', formula: 'HCOOCH₃' },
    ],
    staticExplanationPreview:
      '[PTHH giải thích mẫu tĩnh]: CH₃COOH + C₂H₅OH ⇄ CH₃COOC₂H₅ + H₂O (Xúc tác H₂SO₄ đặc, t°). Sản phẩm là Etyl axetat.',
  },
  {
    id: 'sample-quiz-03',
    number: 3,
    chapter: 'Chuyên đề: Oxi hóa - Khử & Phản ứng Axit Nitric',
    difficulty: 'Nâng cao',
    question: 'Trong phản ứng: 3Cu + 8HNO₃ (loãng) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O, tỉ lệ số phân tử HNO₃ đóng vai trò chất oxi hóa so với số phân tử HNO₃ đóng vai trò môi trường là bao nhiêu?',
    options: [
      { key: 'A', text: 'Tỉ lệ 2 : 6 (rút gọn 1 : 3)', formula: '1 : 3' },
      { key: 'B', text: 'Tỉ lệ 3 : 8', formula: '3 : 8' },
      { key: 'C', text: 'Tỉ lệ 1 : 4', formula: '1 : 4' },
      { key: 'D', text: 'Tỉ lệ 2 : 8 (rút gọn 1 : 4)', formula: '1 : 4' },
    ],
    staticExplanationPreview:
      '[PTHH giải thích mẫu tĩnh]: Có 2 phân tử HNO₃ bị khử tạo 2NO (chất oxi hóa) và 6 phân tử HNO₃ tạo muối Cu(NO₃)₂ (môi trường). Tỉ lệ là 2 : 6 = 1 : 3.',
  },
];

export const STATIC_QUIZ_SAMPLE = STATIC_QUIZ_QUESTIONS[0];

// Dữ liệu mẫu tĩnh cho phần Flashcard
export const STATIC_FLASHCARD_SAMPLE: MockFlashcardItem = {
  id: 'sample-fc-01',
  number: 1,
  totalCards: 15,
  category: 'Kim loại nhóm B & Hóa trị',
  front: {
    elementName: 'Sắt (Ferrum)',
    symbol: 'Fe',
    atomicNumber: 26,
    prompt: 'Các số oxi hóa phổ biến của Sắt (Fe) trong các hợp chất hóa học thường gặp là gì?',
  },
  back: {
    answer: 'Các số oxi hóa thường gặp là +2 và +3 (đôi khi có +6).',
    valency: 'Hóa trị II và III',
    commonReactions: [
      'Fe + 2HCl → FeCl₂ + H₂↑ (Muối Sắt II)',
      '2Fe + 3Cl₂ → 2FeCl₃ (Muối Sắt III)',
    ],
  },
};

// Dữ liệu mẫu tĩnh cho phần Trợ lý AI Hỏi đáp (Q&A)
export const STATIC_CHAT_HISTORY: MockChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'student',
    senderName: 'Học sinh',
    timestamp: '08:42 AM',
    content: 'Thưa trợ lý, tại sao khi thả một mẩu nhỏ kim loại Natri (Na) vào chậu nước có pha vài giọt phenolphtalein thì mẩu Na chạy tròn và dung dịch chuyển sang màu hồng?',
  },
  {
    id: 'msg-02',
    sender: 'assistant',
    senderName: 'Gia sư AI ScienceQuiz (Mẫu tĩnh v0.1)',
    timestamp: '08:42 AM',
    content:
      '[Phản hồi mẫu tĩnh]: Natri có tính khử rất mạnh, phản ứng mãnh liệt với nước sinh ra khí Hiđro đẩy mẩu Natri di chuyển. Nhiệt lượng tỏa ra lớn làm mẩu Na nóng chảy thành giọt tròn. Dung dịch kiềm sinh ra (NaOH) làm chỉ thị phenolphtalein hóa hồng.',
    equation: '2Na + 2H₂O → 2NaOH + H₂↑',
  },
];

// Danh mục chủ đề Hóa học mẫu (Đang biên soạn)
export const STATIC_CHEMISTRY_TOPICS: ChemistryTopic[] = [
  {
    id: 'topic-01',
    code: 'HH-10-01',
    title: 'Cấu tạo nguyên tử & Bảng tuần hoàn',
    grade: 'Lớp 10',
    lessonCount: 14,
    description: 'Hạt nhân nguyên tử, lớp vỏ electron, quy luật biến đổi tuần hoàn các tính chất hóa học.',
    formulaSample: '1s² 2s² 2p⁶ 3s¹',
    tag: 'Đại cương',
  },
  {
    id: 'topic-02',
    code: 'HH-10-02',
    title: 'Liên kết hóa học & Năng lượng liên kết',
    grade: 'Lớp 10',
    lessonCount: 10,
    description: 'Liên kết ion, liên kết cộng hóa trị có cực/không cực, liên kết hydro và tương tác van der Waals.',
    formulaSample: 'H-O-H ··· O',
    tag: 'Liên kết',
  },
  {
    id: 'topic-03',
    code: 'HH-10-03',
    title: 'Phản ứng Oxi hóa - Khử & Tốc độ phản ứng',
    grade: 'Lớp 10',
    lessonCount: 12,
    description: 'Xác định số oxi hóa, chất khử, chất oxi hóa, cân bằng phản ứng electron và các yếu tố ảnh hưởng.',
    formulaSample: 'v = k[A]ᵃ[B]ᵇ',
    tag: 'Động học',
  },
  {
    id: 'topic-04',
    code: 'HH-11-01',
    title: 'Cân bằng hóa học & Dung dịch chất điện li',
    grade: 'Lớp 11',
    lessonCount: 15,
    description: 'Thuyết Arrhenius, thuyết Brønsted-Lowry, độ pH, chất chỉ thị màu và tính tan của muối.',
    formulaSample: 'pH = -lg[H⁺]',
    tag: 'Điện li',
  },
  {
    id: 'topic-05',
    code: 'HH-12-01',
    title: 'Este - Lipit & Hợp chất Carbonhydrate',
    grade: 'Lớp 12',
    lessonCount: 18,
    description: 'Phản ứng este hóa, xà phòng hóa chất béo, phân loại Glucozơ, Fructozơ, Saccarozơ, Tinh bột.',
    formulaSample: 'RCOOR\' + NaOH',
    tag: 'Hữu cơ',
  },
  {
    id: 'topic-06',
    code: 'HH-12-02',
    title: 'Đại cương kim loại & Dãy điện hóa',
    grade: 'Lớp 12',
    lessonCount: 16,
    description: 'Tính chất vật lý chung của kim loại, ăn mòn hóa học/điện hóa, thứ tự cặp oxi hóa - khử.',
    formulaSample: 'Fe³⁺ + 1e ⇄ Fe²⁺',
    tag: 'Vô cơ',
  },
];

export const STATIC_PROGRESS_STATS = {
  questionsAttempted: '0 / 150',
  topicsCompleted: '0 / 12',
  averageAccuracy: '-- %',
  studyStreakDays: 3,
  systemStatus: 'App Shell v0.1 Hoạt động bình thường',
};
