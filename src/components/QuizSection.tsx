import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  Database,
  RefreshCw,
  Trash2,
  Plus,
  GraduationCap,
  Check,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import {
  StudyMaterialItem,
  StudyPackPracticeQuestion,
  PracticeQuestionFormat,
  GeneratedStudyPack,
} from '../types';
import { STUDY_TOPIC_OPTIONS } from '../data/materialsData';
import { generateBasicPracticeQuestionsByTopicAndGrade } from '../data/studyPackData';
import {
  loadPracticeQuestions,
  savePracticeQuestions,
  resetPracticeQuestionsToDefault,
  loadStudyMaterials,
} from '../utils/storage';
import { QuizModeScreen } from './QuizModeScreen';

interface QuizSectionProps {
  onTriggerComingSoon?: (featureName: string, scheduledVersion: string, description: string) => void;
  materials?: StudyMaterialItem[];
  studyPacks?: GeneratedStudyPack[];
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  materials: propsMaterials,
  studyPacks,
}) => {
  const materials = propsMaterials ?? loadStudyMaterials();

  // Mode: "quiz_mode" (mặc định) hoặc "question_bank"
  const [activeViewMode, setActiveViewMode] = useState<'quiz_mode' | 'question_bank'>('quiz_mode');

  // State danh sách câu hỏi luyện tập cơ bản + Lưu tự động vào LocalStorage
  const [questions, setQuestions] = useState<StudyPackPracticeQuestion[]>(loadPracticeQuestions);

  // State bộ chọn Chủ đề đang học & Lớp của học sinh ("phù hợp học sinh lớp [điền ở đây]")
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    STUDY_TOPIC_OPTIONS[0]?.id || 'topic-este-lipit'
  );
  const [gradeInput, setGradeInput] = useState<string>('Lớp 9');
  const [formatFilter, setFormatFilter] = useState<'all' | PracticeQuestionFormat>('all');

  // State tiến trình tạo câu hỏi mới
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // State tự kiểm tra nhẹ nhàng (chưa game hóa mạnh, chỉ giúp học sinh tự đối chiếu khi ôn bài trên trường)
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [userDraftAnswers, setUserDraftAnswers] = useState<Record<string, string>>({});

  // State form tự thêm 1 câu hỏi ôn bài mới vào LocalStorage
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newFormat, setNewFormat] = useState<PracticeQuestionFormat>('short_answer');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newAnswerText, setNewAnswerText] = useState<string>('');
  const [newExplanationText, setNewExplanationText] = useState<string>('');

  // Tự động đồng bộ danh sách câu hỏi vào LocalStorage mỗi khi thay đổi
  useEffect(() => {
    savePracticeQuestions(questions);
  }, [questions]);

  const currentTopicObj =
    STUDY_TOPIC_OPTIONS.find((t) => t.id === selectedTopicId) || STUDY_TOPIC_OPTIONS[0];

  const handleToggleReveal = (id: string) => {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRevealAll = () => {
    if (revealedIds.length === questions.length) {
      setRevealedIds([]);
    } else {
      setRevealedIds(questions.map((q) => q.id));
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) =>
      prev
        .filter((q) => q.id !== id)
        .map((q, idx) => ({ ...q, order: idx + 1 }))
    );
  };

  const handleResetDefaultQuestions = () => {
    const defaults = resetPracticeQuestionsToDefault();
    setQuestions(defaults);
    setRevealedIds([]);
    setUserDraftAnswers({});
    setStatusBanner('Đã khôi phục ngân hàng 12 câu hỏi luyện tập cơ bản chuẩn vào LocalStorage.');
  };

  // Hàm tạo bộ câu hỏi luyện tập cơ bản (4 dạng) cho chủ đề đang học + Lưu LocalStorage
  const handleGenerateQuestionsForTopic = async () => {
    const cleanGrade = gradeInput.trim() || 'Lớp 9';
    const topicTitle = currentTopicObj?.title || 'Hóa học & Khoa học Tự nhiên';
    const relatedMaterials = materials.filter((m) => m.topicId === selectedTopicId);

    setIsGenerating(true);
    setStatusBanner(null);

    try {
      const response = await fetch('/api/ai/generate-practice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle,
          gradeLevel: cleanGrade,
          materials: relatedMaterials.length > 0 ? relatedMaterials : materials.slice(0, 2),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const normalized: StudyPackPracticeQuestion[] = data.questions.map(
            (q: Partial<StudyPackPracticeQuestion>, idx: number) => {
              const fmt: PracticeQuestionFormat =
                q.format === 'true_false' ||
                q.format === 'fill_blank' ||
                q.format === 'short_answer'
                  ? q.format
                  : 'multiple_choice';
              return {
                id: `pq-ai-${Date.now()}-${idx}`,
                order: idx + 1,
                format: fmt,
                formatLabel:
                  fmt === 'multiple_choice'
                    ? `Dạng Lựa chọn (${cleanGrade} • ${topicTitle})`
                    : fmt === 'true_false'
                    ? `Dạng Đúng/Sai (${cleanGrade} • ${topicTitle})`
                    : fmt === 'fill_blank'
                    ? `Dạng Điền từ ngắn (${cleanGrade} • ${topicTitle})`
                    : `Dạng Hỏi-Đáp ngắn (${cleanGrade} • ${topicTitle})`,
                cognitiveLevel:
                  q.cognitiveLevel === 'Nhận biết' || q.cognitiveLevel === 'Vận dụng cơ bản'
                    ? q.cognitiveLevel
                    : 'Thông hiểu',
                question: q.question || '',
                formulaContext: q.formulaContext,
                options: Array.isArray(q.options) ? q.options : undefined,
                sampleAnswer: q.sampleAnswer || '',
                explanation: q.explanation || '',
              };
            }
          );

          setQuestions((prev) =>
            [...normalized, ...prev].map((item, i) => ({ ...item, order: i + 1 }))
          );
          setFormatFilter('all');
          setStatusBanner(
            `Đã tạo mới ${normalized.length} câu hỏi luyện tập cơ bản (Đúng/Sai, Lựa chọn, Điền từ, Hỏi-đáp ngắn) cho chủ đề "${topicTitle}" (${cleanGrade}) và lưu vào LocalStorage!`
          );
          setIsGenerating(false);
          return;
        }
      }

      // Bộ sinh chuẩn theo chuyên đề bám sát kiến thức thật trên trường
      const generatedSet = generateBasicPracticeQuestionsByTopicAndGrade(
        selectedTopicId,
        topicTitle,
        cleanGrade
      );
      setQuestions((prev) =>
        [...generatedSet, ...prev].map((item, i) => ({ ...item, order: i + 1 }))
      );
      setFormatFilter('all');
      setStatusBanner(
        `Đã tạo bộ ${generatedSet.length} câu hỏi ôn bài cơ bản (4 dạng) bám sát chủ đề "${topicTitle}" cho học sinh ${cleanGrade} và lưu vào LocalStorage!`
      );
    } catch {
      const generatedSet = generateBasicPracticeQuestionsByTopicAndGrade(
        selectedTopicId,
        topicTitle,
        cleanGrade
      );
      setQuestions((prev) =>
        [...generatedSet, ...prev].map((item, i) => ({ ...item, order: i + 1 }))
      );
      setFormatFilter('all');
      setStatusBanner(
        `Đã tạo bộ ${generatedSet.length} câu hỏi ôn bài cơ bản (4 dạng) cho chủ đề "${topicTitle}" (${cleanGrade}) và lưu vào LocalStorage!`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newAnswerText.trim()) return;

    const cleanGrade = gradeInput.trim() || 'Lớp 9';
    const customItem: StudyPackPracticeQuestion = {
      id: `pq-custom-${Date.now()}`,
      order: 1,
      format: newFormat,
      formatLabel:
        newFormat === 'multiple_choice'
          ? `Dạng Lựa chọn (${cleanGrade})`
          : newFormat === 'true_false'
          ? `Dạng Đúng / Sai (${cleanGrade})`
          : newFormat === 'fill_blank'
          ? `Dạng Điền từ ngắn (${cleanGrade})`
          : `Dạng Hỏi - Đáp ngắn (${cleanGrade})`,
      cognitiveLevel: 'Thông hiểu',
      question: newQuestionText.trim(),
      options:
        newFormat === 'true_false' ? ['Đúng (True)', 'Sai (False)'] : undefined,
      sampleAnswer: newAnswerText.trim(),
      explanation:
        newExplanationText.trim() ||
        'Câu hỏi tự bổ sung để ôn bài kiểm tra trên lớp.',
    };

    setQuestions((prev) =>
      [customItem, ...prev].map((item, idx) => ({ ...item, order: idx + 1 }))
    );
    setNewQuestionText('');
    setNewAnswerText('');
    setNewExplanationText('');
    setShowAddForm(false);
    setStatusBanner('Đã thêm câu hỏi ôn tập mới vào danh sách và lưu LocalStorage!');
  };

  const filteredQuestions =
    formatFilter === 'all'
      ? questions
      : questions.filter((q) => q.format === formatFilter);

  return (
    <div id="quiz-module-container" className="space-y-6">
      {/* 0. CHUYỂN ĐỔI CHẾ ĐỘ: QUIZ MODE (LUYỆN THI TỪNG CÂU) VS NGÂN HÀNG CÂU HỎI */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0f1322] rounded-2xl border border-amber-500/30 shadow-lg">
        <button
          type="button"
          id="tab-btn-quiz-mode"
          onClick={() => setActiveViewMode('quiz_mode')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeViewMode === 'quiz_mode'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>🎯 Chế Độ Quiz Mode (Luyện Thi Từng Câu)</span>
        </button>

        <button
          type="button"
          id="tab-btn-question-bank"
          onClick={() => setActiveViewMode('question_bank')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeViewMode === 'question_bank'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="h-4 w-4 shrink-0" />
          <span>📚 Ngân Hàng & Tạo Câu Hỏi ({questions.length})</span>
        </button>
      </div>

      {activeViewMode === 'quiz_mode' ? (
        <QuizModeScreen
          questions={questions}
          studyPacks={studyPacks}
          onExitQuizMode={() => setActiveViewMode('question_bank')}
        />
      ) : (
        <>
          {/* BANNER GỢI Ý CHUYỂN SANG QUIZ MODE */}
          <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-[#12182b] via-[#1a213a] to-[#12182b] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Sẵn sàng kiểm tra năng lực bản thân?</span>
              </div>
              <p className="text-xs text-slate-300">
                Làm bài thi từng câu ở <strong>Quiz Mode</strong>: Có ô nhập/chọn câu trả lời, nút kiểm tra kết quả ngay và chấm điểm tự động.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveViewMode('quiz_mode')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs whitespace-nowrap transition cursor-pointer"
            >
              <span>Vào Quiz Mode ngay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 1. HEADER & LOCALSTORAGE STATUS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-500/25 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm">
                  04
                </span>
                <h2 className="text-xl font-bold text-white">
                  Bộ Câu Hỏi Luyện Tập Cơ Bản Đa Dạng (Ôn Bài Trên Trường)
                </h2>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <Database className="h-3.5 w-3.5 text-emerald-400" />
                  Đã lưu {questions.length} câu hỏi (LocalStorage)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Hỗ trợ 4 dạng câu hỏi cơ bản (<strong>Lựa chọn, Đúng/Sai, Điền từ ngắn, Hỏi-đáp ngắn</strong>) bám sát kiến thức thật trong sách giáo khoa để ôn bài đầu giờ & kiểm tra 15 phút.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddForm((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161b2e] hover:bg-[#1f2640] text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddForm ? 'Đóng form thêm' : 'Thêm câu hỏi tự soạn'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultQuestions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121624] hover:bg-white/5 text-slate-300 hover:text-amber-300 border border-amber-500/25 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                <span>Khôi phục mẫu</span>
              </button>
            </div>
          </div>

      {/* 2. BẢNG TẠO BỘ CÂU HỎI LUYỆN TẬP THEO CHỦ ĐỀ & LỚP HỌC */}
      <div className="rounded-3xl border border-amber-500/30 bg-[#0e121e] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Tạo Bộ Câu Hỏi Luyện Tập Cơ Bản Cho Chủ Đề Đang Học</span>
          </div>
          <span className="text-xs text-slate-400">
            Ưu tiên câu hỏi bám sát công thức, PTHH và hiện tượng thực tế trên lớp
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Chọn chủ đề đang học */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chủ đề / Chuyên đề đang học trên trường:
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {STUDY_TOPIC_OPTIONS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.iconEmoji} {topic.title} ({topic.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Điền hoặc chọn Lớp của học sinh ("phù hợp học sinh lớp [điền ở đây]") */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phù hợp học sinh lớp (Nhập/Chọn):
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder="VD: Lớp 8, Lớp 9, Lớp 12..."
                className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Nút bấm Tạo bộ câu hỏi 4 dạng */}
          <div className="md:col-span-4">
            <button
              type="button"
              id="btn-generate-basic-practice-questions"
              disabled={isGenerating}
              onClick={handleGenerateQuestionsForTopic}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(245,192,66,0.3)] hover:brightness-110 disabled:opacity-50 transition whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Đang tạo 4 dạng câu hỏi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Tạo bộ câu hỏi ({gradeInput || 'Lớp 9'})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gợi ý chọn nhanh Lớp 7 -> Lớp 12 */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
            Chọn nhanh khối lớp:
          </span>
          {['Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map((gr) => (
            <button
              key={gr}
              type="button"
              onClick={() => setGradeInput(gr)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                gradeInput === gr
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-[#141929] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {gr}
            </button>
          ))}
        </div>

        {statusBanner && (
          <div className="rounded-2xl bg-emerald-950/50 border border-emerald-500/40 p-3 flex items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-emerald-300 hover:text-white font-bold px-2"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* FORM TỰ THÊM CÂU HỎI ÔN TẬP MỚI (TÙY CHỌN) */}
      {showAddForm && (
        <form
          onSubmit={handleAddCustomQuestion}
          className="rounded-2xl border border-amber-400/40 bg-[#121728] p-5 space-y-3.5"
        >
          <div className="text-sm font-bold text-amber-300">
            + Tự thêm câu hỏi ôn bài trên trường vào LocalStorage
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Dạng câu hỏi:</label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value as PracticeQuestionFormat)}
                className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3 py-2 text-xs text-white"
              >
                <option value="multiple_choice">1. Lựa chọn (Trắc nghiệm)</option>
                <option value="true_false">2. Đúng / Sai</option>
                <option value="fill_blank">3. Điền từ / công thức ngắn</option>
                <option value="short_answer">4. Hỏi - Đáp ngắn</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">Nội dung câu hỏi:</label>
              <input
                type="text"
                required
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="VD: Vì sao khí CO₂ làm đục nước vôi trong dư Ca(OH)₂?"
                className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Đáp án ngắn gọn:</label>
              <input
                type="text"
                required
                value={newAnswerText}
                onChange={(e) => setNewAnswerText(e.target.value)}
                placeholder="VD: Do tạo kết tủa trắng CaCO₃↓"
                className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Giải thích / PTHH minh họa:</label>
              <input
                type="text"
                value={newExplanationText}
                onChange={(e) => setNewExplanationText(e.target.value)}
                placeholder="VD: CO₂ + Ca(OH)₂ → CaCO₃↓ (trắng) + H₂O"
                className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Lưu câu hỏi vào LocalStorage
            </button>
          </div>
        </form>
      )}

      {/* 3. THANH LỌC 4 DẠNG CÂU HỎI CƠ BẢN & NÚT HIỆN ĐÁP ÁN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#101422] p-3.5 rounded-2xl border border-amber-500/25">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all' as const, label: `Tất cả (${questions.length})` },
            {
              id: 'multiple_choice' as const,
              label: `Lựa chọn (${questions.filter((q) => q.format === 'multiple_choice').length})`,
            },
            {
              id: 'true_false' as const,
              label: `Đúng/Sai (${questions.filter((q) => q.format === 'true_false').length})`,
            },
            {
              id: 'fill_blank' as const,
              label: `Điền từ ngắn (${questions.filter((q) => q.format === 'fill_blank').length})`,
            },
            {
              id: 'short_answer' as const,
              label: `Hỏi-đáp ngắn (${questions.filter((q) => q.format === 'short_answer').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFormatFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                formatFilter === tab.id
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleRevealAll}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#181f34] hover:bg-[#222b46] text-amber-300 border border-amber-500/30 text-xs font-bold transition self-start sm:self-auto whitespace-nowrap cursor-pointer"
        >
          {revealedIds.length === questions.length ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Ẩn tất cả đáp án</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Xem tất cả đáp án ({questions.length})</span>
            </>
          )}
        </button>
      </div>

      {/* 4. DANH SÁCH CÂU HỎI LUYỆN TẬP CƠ BẢN (4 DẠNG) */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isRevealed = revealedIds.includes(q.id);
          const userDraft = userDraftAnswers[q.id] || '';

          return (
            <div
              key={q.id}
              className="rounded-2xl border border-amber-500/25 bg-[#121626] p-5 space-y-3.5 shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-amber-400 tabular-nums">
                    Câu #{q.order}
                  </span>
                  <span>·</span>
                  <span className="text-amber-200 font-bold">{q.formatLabel}</span>
                  <span>·</span>
                  <span className="text-emerald-300">Mức độ: {q.cognitiveLevel}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleReveal(q.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1b2238] hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>Ẩn đáp án</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>Đối chiếu đáp án</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                    title="Xóa câu hỏi này khỏi LocalStorage"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {q.question}
              </h3>

              {/* Ngữ cảnh PTHH nếu có */}
              {q.formulaContext && (
                <div className="rounded-xl bg-[#080b12] border border-amber-500/25 p-3 font-mono text-xs sm:text-sm text-amber-300 font-semibold">
                  ⚗️ {q.formulaContext}
                </div>
              )}

              {/* Tương tác nhẹ nhàng theo từng dạng câu hỏi để học sinh tự nhẩm/ôn bài */}
              {(q.format === 'multiple_choice' || q.format === 'true_false') &&
                q.options &&
                q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, idx) => {
                      const isSelectedOption = userDraft === opt;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setUserDraftAnswers((prev) => ({ ...prev, [q.id]: opt }));
                            if (!isRevealed) handleToggleReveal(q.id);
                          }}
                          className={`text-left rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium border transition flex items-center justify-between cursor-pointer ${
                            isSelectedOption
                              ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold'
                              : 'bg-[#0b0e18] border-white/10 text-slate-200 hover:border-amber-500/40'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelectedOption && (
                            <Check className="h-4 w-4 text-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

              {(q.format === 'fill_blank' || q.format === 'short_answer') && (
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={userDraft}
                    onChange={(e) =>
                      setUserDraftAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder={
                      q.format === 'fill_blank'
                        ? 'Nhập thử từ khóa / công thức hóa học cần điền...'
                        : 'Gõ nhanh ý trả lời nháp của em trước khi xem đáp án...'
                    }
                    className="flex-1 rounded-xl bg-[#090c14] border border-white/15 px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {!isRevealed && userDraft.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleToggleReveal(q.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer"
                    >
                      Kiểm tra đáp án
                    </button>
                  )}
                </div>
              )}

              {/* Hộp hiển thị đáp án & lời giải chuẩn */}
              {isRevealed && (
                <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/40 p-4 space-y-1.5 mt-2">
                  <div className="text-xs sm:text-sm font-bold text-emerald-300">
                    ✓ Đáp án chuẩn: {q.sampleAnswer}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <strong className="text-amber-300">Giải thích kiến thức: </strong>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
};
