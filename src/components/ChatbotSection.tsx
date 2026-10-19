import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Sparkles,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Plus,
  Trash2,
  RotateCcw,
  Database,
  Bot,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StudyPackQASeed, StudyMaterialItem, GeneratedStudyPack } from '../types';
import { STUDY_TOPIC_OPTIONS } from '../data/materialsData';
import { generateQASeedsByTopic } from '../data/studyPackData';
import {
  loadQASeeds,
  saveQASeeds,
  resetQASeedsToDefault,
  loadStudyMaterials,
} from '../utils/storage';
import { GroundedChatbotScreen } from './GroundedChatbotScreen';

interface ChatbotSectionProps {
  onTriggerComingSoon?: (featureName: string, scheduledVersion: string, description: string) => void;
  materials?: StudyMaterialItem[];
  studyPacks?: GeneratedStudyPack[];
  activePackId?: string;
  onNavigateToStudyPack?: () => void;
  onNavigateToMaterials?: () => void;
}

const INTENT_OPTIONS: StudyPackQASeed['intentTag'][] = [
  'Giải thích bản chất',
  'So sánh phân biệt',
  'Ứng dụng thực tế',
  'Bẫy thường gặp',
];

export const ChatbotSection: React.FC<ChatbotSectionProps> = ({
  materials: propsMaterials,
  studyPacks,
  activePackId,
  onNavigateToStudyPack,
  onNavigateToMaterials,
}) => {
  const materials = propsMaterials ?? loadStudyMaterials();

  // Chế độ xem: "grounded_chat" (Gia sư ôn bài Grounded - Mặc định) hoặc "qa_seeds" (Ngân hàng Q&A Seeds)
  const [activeViewMode, setActiveViewMode] = useState<'grounded_chat' | 'qa_seeds'>('grounded_chat');

  // State danh sách Q&A Seed khởi tạo + tự động đồng bộ LocalStorage
  const [qaSeeds, setQaSeeds] = useState<StudyPackQASeed[]>(loadQASeeds);

  // Chủ đề học tập hiện tại (mặc định lấy theo học liệu đầu tiên của học sinh)
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    materials[0]?.topicId || STUDY_TOPIC_OPTIONS[0]?.id || 'topic-este-lipit'
  );
  const [intentFilter, setIntentFilter] = useState<'all' | StudyPackQASeed['intentTag']>('all');
  const [selectedSeedId, setSelectedSeedId] = useState<string>('');

  // Trạng thái sinh Q&A Seed mới
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form tự thêm 1 Q&A Seed mới từ thắc mắc thật của học sinh
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newIntent, setNewIntent] = useState<StudyPackQASeed['intentTag']>('Giải thích bản chất');
  const [newShortAnswer, setNewShortAnswer] = useState<string>('');
  const [newFollowUp, setNewFollowUp] = useState<string>('');

  // Lưu tự động vào LocalStorage khi danh sách Q&A Seed thay đổi
  useEffect(() => {
    saveQASeeds(qaSeeds);
  }, [qaSeeds]);

  const currentTopicObj =
    STUDY_TOPIC_OPTIONS.find((t) => t.id === selectedTopicId) || STUDY_TOPIC_OPTIONS[0];

  const filteredSeeds = qaSeeds.filter((s) =>
    intentFilter === 'all' ? true : s.intentTag === intentFilter
  );

  const previewSeed =
    qaSeeds.find((s) => s.id === selectedSeedId) || filteredSeeds[0] || qaSeeds[0];

  const handleGenerateQASeedsForCurrentTopic = async () => {
    const topicTitle = currentTopicObj?.title || 'Este - Lipit & Phản ứng Xà phòng hóa';
    const matchingMaterials = materials.filter((m) => m.topicId === selectedTopicId);

    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/ai/generate-qa-seeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle,
          gradeLevel: currentTopicObj?.grade || 'Lớp 7 - Lớp 12',
          materials: matchingMaterials.length > 0 ? matchingMaterials : materials.slice(0, 2),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.qaSeeds) && data.qaSeeds.length > 0) {
          const aiSeeds: StudyPackQASeed[] = data.qaSeeds.map(
            (raw: Partial<StudyPackQASeed>, idx: number) => ({
              id: `qa-ai-${Date.now()}-${idx}`,
              order: idx + 1,
              studentQuestion:
                raw.studentQuestion || `Câu hỏi gợi mở thực tế #${idx + 1} về ${topicTitle}?`,
              intentTag: INTENT_OPTIONS.includes(raw.intentTag as StudyPackQASeed['intentTag'])
                ? (raw.intentTag as StudyPackQASeed['intentTag'])
                : INTENT_OPTIONS[idx % INTENT_OPTIONS.length],
              aiSeedAnswer:
                raw.aiSeedAnswer || 'Câu trả lời ngắn khởi tạo giải thích trọng tâm bản chất.',
              followUpPrompt:
                raw.followUpPrompt || 'Câu hỏi gợi mở tiếp theo để đào sâu kiến thức.',
            })
          );

          setQaSeeds((prev) =>
            [...aiSeeds, ...prev].slice(0, 20).map((item, idx) => ({
              ...item,
              order: idx + 1,
            }))
          );
          if (aiSeeds[0]) setSelectedSeedId(aiSeeds[0].id);
          setStatusMessage(
            `Đã khởi tạo ${aiSeeds.length} Q&A Seed cho chủ đề "${topicTitle}" (bằng Gemini AI) và lưu vào LocalStorage.`
          );
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // Chuyển sang ngân hàng Q&A Seed theo chủ đề chuẩn sư phạm
    }

    const generated = generateQASeedsByTopic(selectedTopicId, topicTitle);
    setQaSeeds((prev) =>
      [...generated, ...prev].slice(0, 20).map((item, idx) => ({
        ...item,
        order: idx + 1,
      }))
    );
    if (generated[0]) setSelectedSeedId(generated[0].id);
    setStatusMessage(
      `Đã tạo ${generated.length} Q&A Seed bám sát thắc mắc thật của học sinh cho chủ đề "${topicTitle}" và lưu vào LocalStorage.`
    );
    setIsGenerating(false);
  };

  const handleAddCustomSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newShortAnswer.trim()) return;

    const customSeed: StudyPackQASeed = {
      id: `qa-custom-${Date.now()}`,
      order: 1,
      studentQuestion: newQuestion.trim(),
      intentTag: newIntent,
      aiSeedAnswer: newShortAnswer.trim(),
      followUpPrompt:
        newFollowUp.trim() ||
        'Nếu thay đổi điều kiện phản ứng thì hiện tượng trên sẽ thay đổi thế nào?',
    };

    setQaSeeds((prev) =>
      [customSeed, ...prev].map((s, idx) => ({ ...s, order: idx + 1 }))
    );
    setSelectedSeedId(customSeed.id);
    setNewQuestion('');
    setNewShortAnswer('');
    setNewFollowUp('');
    setShowAddForm(false);
    setStatusMessage('Đã thêm Q&A Seed mới vào danh sách khởi tạo (Lưu LocalStorage).');
  };

  const handleDeleteSeed = (id: string) => {
    setQaSeeds((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, order: idx + 1 }))
    );
  };

  const handleResetDefault = () => {
    const defaults = resetQASeedsToDefault();
    setQaSeeds(defaults);
    if (defaults[0]) setSelectedSeedId(defaults[0].id);
    setStatusMessage('Đã khôi phục bộ Q&A Seed khởi tạo mặc định vào LocalStorage.');
  };

  return (
    <div id="tutor-module-container" className="space-y-6">
      {/* THANH ĐIỀU HƯỚNG CHUYỂN ĐỔI CHẾ ĐỘ: GROUNDED CHATBOT vs Q&A SEEDS */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c0f18] border border-amber-500/30 max-w-xl mx-auto shadow-xl">
        <button
          type="button"
          id="tab-btn-grounded-chat"
          onClick={() => setActiveViewMode('grounded_chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeViewMode === 'grounded_chat'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bot className="h-4 w-4 shrink-0" />
          <span>🤖 Gia Sư Grounded Chatbot</span>
        </button>

        <button
          type="button"
          id="tab-btn-qa-seeds"
          onClick={() => setActiveViewMode('qa_seeds')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeViewMode === 'qa_seeds'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          <span>🌱 Q&A Seeds ({qaSeeds.length})</span>
        </button>
      </div>

      {activeViewMode === 'grounded_chat' ? (
        <GroundedChatbotScreen
          materials={materials}
          studyPacks={studyPacks}
          activePackId={activePackId}
          onNavigateToStudyPack={onNavigateToStudyPack}
          onNavigateToMaterials={onNavigateToMaterials}
        />
      ) : (
        <>
          {/* BANNER GỢI Ý CHUYỂN SANG GROUNDED CHATBOT */}
          <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-[#12182b] via-[#1a213a] to-[#12182b] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Bạn muốn giải đáp thắc mắc và ôn bài trực tiếp?</span>
              </div>
              <p className="text-xs text-slate-300">
                Chuyển sang <strong>Gia Sư Grounded Chatbot</strong> để hỏi - đáp thông minh, trả lời nghiêm ngặt dựa trên 3 nguồn: <em>Học liệu gốc (sources), Phân tích sơ bộ (analysisPreview) và Study Pack</em>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveViewMode('grounded_chat')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs whitespace-nowrap transition cursor-pointer"
            >
              <span>Vào Grounded Chatbot ngay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Header & Scope Notice */}
          <div className="rounded-3xl border border-amber-500/35 bg-gradient-to-br from-[#121624] via-[#171b2e] to-[#111420] p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-bold uppercase tracking-wider">
              <MessageSquarePlus className="h-4 w-4 text-amber-400" />
              <span>Buổi 3 • Khởi Tạo Q&A Seed Cho Chủ Đề Học Tập Hiện Tại</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-300 flex items-center gap-1 normal-case font-semibold">
                <Database className="h-3.5 w-3.5" />
                Đã lưu {qaSeeds.length} Q&A Seed (LocalStorage)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Danh Sách Q&A Seed — Câu Hỏi Gợi Mở & Câu Trả Lời Ngắn Ban Đầu
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              <strong className="text-amber-300">Phạm vi Buổi 3:</strong> Khởi tạo danh sách các câu hỏi mà{' '}
              <span className="text-white font-semibold">học sinh thật sự hay thắc mắc</span> về chủ đề đang học kèm câu trả lời ngắn ban đầu để chuẩn bị dữ liệu nền cho{' '}
              <span className="text-emerald-300 font-semibold">Chatbot hỗ trợ ôn bài ở buổi sau</span>{' '}
              <span className="text-slate-400">(Chưa cần chatbot hội thoại hoàn chỉnh & không đi sang Buổi 5)</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              id="btn-open-custom-qaseed"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1a2136] hover:bg-[#232c47] text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddForm ? 'Đóng khung thêm' : '+ Thêm câu hỏi Q&A Seed'}</span>
            </button>

            <button
              type="button"
              id="btn-reset-qaseeds"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#151928] hover:bg-rose-950/50 text-slate-300 hover:text-rose-200 border border-white/10 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Khôi phục mẫu</span>
            </button>
          </div>
        </div>

        {/* Bộ điều khiển tạo Q&A Seed theo chủ đề học tập hiện tại */}
        <div className="rounded-2xl bg-[#0b0e18] border border-amber-500/25 p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-7 space-y-1.5">
              <label
                htmlFor="qaseed-topic-select"
                className="block text-xs font-bold text-slate-300"
              >
                Chủ đề học tập hiện tại cần khởi tạo Q&A Seed:
              </label>
              <select
                id="qaseed-topic-select"
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full rounded-xl bg-[#131828] border border-amber-500/30 px-3.5 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
              >
                {STUDY_TOPIC_OPTIONS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title} ({topic.grade})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <button
                type="button"
                id="btn-generate-qaseeds"
                disabled={isGenerating}
                onClick={handleGenerateQASeedsForCurrentTopic}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:brightness-110 transition disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang khởi tạo Q&A Seed...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>✨ Tạo Q&A Seed Cho Chủ Đề Này</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              Ưu tiên câu hỏi thực tế học sinh hay hỏi: Giải thích hiện tượng · Phân biệt chất · Ứng dụng đời sống · Bẫy kiểm tra
            </span>
            <span className="text-amber-300 font-semibold">
              Chế độ: Khởi tạo Seed (Chưa mở hội thoại tự do)
            </span>
          </div>
        </div>

        {statusMessage && (
          <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between gap-2">
            <span>✓ {statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-emerald-300 hover:text-white font-bold"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Form tự thêm Q&A Seed mới */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomSeed}
            className="rounded-2xl bg-[#0d111d] border border-amber-400/40 p-4 sm:p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-amber-300">
                + Thêm Câu Hỏi Thắc Mắc Thực Tế Vào Bộ Q&A Seed
              </h3>
              <span className="text-xs text-slate-400">Chuẩn bị cho Chatbot buổi sau</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Câu hỏi mà học sinh thật sự thắc mắc về chủ đề *:
                </label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="VD: Tại sao khi thủy phân este trong môi trường axit thì phản ứng không hoàn toàn?"
                  className="w-full rounded-xl bg-[#14192b] border border-amber-500/30 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nhóm mục đích hỏi:
                </label>
                <select
                  value={newIntent}
                  onChange={(e) =>
                    setNewIntent(e.target.value as StudyPackQASeed['intentTag'])
                  }
                  className="w-full rounded-xl bg-[#14192b] border border-amber-500/30 px-3 py-2 text-xs text-white"
                >
                  {INTENT_OPTIONS.map((intent) => (
                    <option key={intent} value={intent}>
                      {intent}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1">
                Câu trả lời ngắn ban đầu (Initial Seed Answer) *:
              </label>
              <textarea
                rows={2}
                required
                value={newShortAnswer}
                onChange={(e) => setNewShortAnswer(e.target.value)}
                placeholder="VD: Vì phản ứng thủy phân este trong axit là phản ứng thuận nghịch (2 chiều), sản phẩm axit và ancol sinh ra lại tác dụng ngược với nhau tạo este..."
                className="w-full rounded-xl bg-[#14192b] border border-emerald-500/30 p-3 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Câu hỏi gợi mở tiếp theo (Follow-up Prompt):
              </label>
              <input
                type="text"
                value={newFollowUp}
                onChange={(e) => setNewFollowUp(e.target.value)}
                placeholder="VD: Muốn phản ứng thủy phân este xảy ra hoàn toàn 1 chiều thì ta thay axit bằng dung dịch gì?"
                className="w-full rounded-xl bg-[#14192b] border border-amber-500/30 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 rounded-xl bg-white/5 text-xs text-slate-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                Lưu Q&A Seed
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bộ lọc theo loại thắc mắc của học sinh & Danh sách Q&A Seeds */}
      <div className="rounded-3xl border border-amber-500/25 bg-[#101422] p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all' as const, label: `Tất cả Q&A Seed (${qaSeeds.length})` },
              { id: 'Giải thích bản chất' as const, label: 'Giải thích bản chất' },
              { id: 'So sánh phân biệt' as const, label: 'So sánh phân biệt' },
              { id: 'Ứng dụng thực tế' as const, label: 'Ứng dụng thực tế' },
              { id: 'Bẫy thường gặp' as const, label: 'Bẫy thường gặp' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setIntentFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  intentFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#161c2e] text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Nhấn vào một Q&A Seed bất kỳ để xem trước kịch bản khởi tạo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredSeeds.map((seed, idx) => {
            const isSelected = previewSeed?.id === seed.id;
            return (
              <div
                key={seed.id}
                onClick={() => setSelectedSeedId(seed.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSeedId(seed.id);
                  }
                }}
                className={`rounded-2xl border p-5 space-y-3 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#172036] border-amber-400 shadow-lg'
                    : 'bg-[#14192b] border-amber-500/25 hover:border-amber-400/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 tabular-nums">
                      Q&A Seed #{idx + 1}
                    </span>
                    <span>·</span>
                    <span className="text-amber-300 font-bold">{seed.intentTag}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-300 font-semibold">
                      Dữ liệu khởi tạo Chatbot buổi sau
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSeed(seed.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Xóa Q&A Seed này"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Câu hỏi thực tế của học sinh */}
                <h4 className="text-sm sm:text-base font-bold text-white flex items-start gap-2 leading-snug">
                  <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-1" />
                  <span>Câu hỏi học sinh: “{seed.studentQuestion}”</span>
                </h4>

                {/* Câu trả lời ngắn ban đầu */}
                <div className="rounded-xl bg-[#0a0d16] border border-emerald-500/25 p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <strong className="text-emerald-300">Câu trả lời ngắn ban đầu (Seed Answer): </strong>
                  {seed.aiSeedAnswer}
                </div>

                {/* Câu hỏi gợi mở tiếp theo */}
                <div className="text-xs text-amber-200/90 flex items-center gap-2 pt-0.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>
                    <strong>Câu hỏi gợi mở tiếp theo:</strong> “{seed.followUpPrompt}”
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Khung xem trước 1 lượt khởi tạo (Seed Preview — Chưa mở Chatbot hoàn chỉnh) */}
        {previewSeed && (
          <div className="rounded-2xl border border-amber-500/30 bg-[#0b0e18] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Bot className="h-4 w-4 text-amber-400" />
                <span>
                  Xem Trước Kịch Bản Mồi (Seed Preview) Chuẩn Bị Cho Chatbot Ở Buổi Sau
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Chỉ ở mức khởi tạo Buổi 3 • Chưa mở hội thoại tự do
              </span>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="rounded-xl bg-[#141a2c] border border-amber-500/25 p-3 text-amber-100">
                <strong className="text-amber-300">[Học sinh bấm chọn câu hỏi gợi mở]: </strong>
                {previewSeed.studentQuestion}
              </div>
              <div className="rounded-xl bg-[#101d24] border border-emerald-500/30 p-3 text-slate-200">
                <strong className="text-emerald-300">[Phản hồi ngắn khởi tạo từ Q&A Seed]: </strong>
                {previewSeed.aiSeedAnswer}
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};
