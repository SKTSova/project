import React, { useState, useEffect } from 'react';
import {
  Layers,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  RotateCcw,
  Database,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { StudyPackFlashcard, StudyMaterialItem, GeneratedStudyPack } from '../types';
import {
  MULTI_SUBJECT_FLASHCARD_PRESETS,
  generateBasicFlashcardsBySubjectAndTopic,
} from '../data/studyPackData';
import {
  loadFlashcards,
  saveFlashcards,
  resetFlashcardsToDefault,
} from '../utils/storage';
import { FlashcardModeScreen } from './FlashcardModeScreen';

interface FlashcardSectionProps {
  onTriggerComingSoon?: (featureName: string, scheduledVersion: string, description: string) => void;
  materials?: StudyMaterialItem[];
  studyPacks?: GeneratedStudyPack[];
}

const PRIORITY_CATEGORIES = [
  'Khái niệm & Định nghĩa',
  'Phân biệt nhanh',
  'Ví dụ minh họa',
  'Quy tắc & Lưu ý',
] as const;

export const FlashcardSection: React.FC<FlashcardSectionProps> = ({
  studyPacks,
}) => {
  // Quản lý danh sách Flashcard cơ bản + tự động lưu LocalStorage
  const [cards, setCards] = useState<StudyPackFlashcard[]>(loadFlashcards);

  // Chế độ xem: "flashcard_mode" (Mặc định) hoặc "flashcard_bank" (Ngân hàng thẻ)
  const [activeViewMode, setActiveViewMode] = useState<'flashcard_mode' | 'flashcard_bank'>('flashcard_mode');

  // Bộ chọn Môn học & Chủ đề (Phù hợp nhiều môn học: Hóa học, KHTN, Vật lý, Sinh học, Toán học...)
  const [selectedSubject, setSelectedSubject] = useState<string>('Hóa học');
  const [topicInput, setTopicInput] = useState<string>('Este - Lipit & Phản ứng Xà phòng hóa');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Chế độ ôn nhanh: Thẻ tiêu điểm (Deck) + Lưới toàn bộ thẻ
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFocusCardFlipped, setIsFocusCardFlipped] = useState<boolean>(false);
  const [flippedGridIds, setFlippedGridIds] = useState<string[]>([]);
  const [rememberedIds, setRememberedIds] = useState<string[]>([]);

  // Trạng thái sinh thẻ bằng AI / Preset
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form tự thêm thẻ Flashcard 2 mặt mới
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('Khái niệm & Định nghĩa');
  const [newFrontPrompt, setNewFrontPrompt] = useState<string>('');
  const [newFrontHint, setNewFrontHint] = useState<string>('');
  const [newBackAnswer, setNewBackAnswer] = useState<string>('');
  const [newBackFormula, setNewBackFormula] = useState<string>('');
  const [newMemoryHook, setNewMemoryHook] = useState<string>('');

  // Tự động lưu vào LocalStorage khi danh sách thẻ thay đổi
  useEffect(() => {
    saveFlashcards(cards);
  }, [cards]);

  const filteredCards = cards.filter((c) => {
    if (categoryFilter === 'all') return true;
    return c.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const currentFocusCard =
    filteredCards[activeCardIndex] || filteredCards[0] || cards[0];

  const handleSelectPreset = (presetId: string) => {
    const preset = MULTI_SUBJECT_FLASHCARD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedSubject(preset.subjectName);
    setTopicInput(preset.topicTitle);

    const formattedCards = preset.cards.map((c, idx) => ({
      ...c,
      id: `${c.id}-${Date.now()}-${idx}`,
      order: idx + 1,
      category: c.category.includes(preset.subjectName)
        ? c.category
        : `${c.category} • ${preset.subjectName}`,
    }));

    setCards((prev) => {
      const merged = [...formattedCards, ...prev].slice(0, 24).map((item, i) => ({
        ...item,
        order: i + 1,
      }));
      return merged;
    });
    setActiveCardIndex(0);
    setIsFocusCardFlipped(false);
    setStatusMessage(
      `Đã nạp ${formattedCards.length} thẻ Flashcard môn ${preset.subjectName} (${preset.topicTitle}) vào đầu danh sách & lưu LocalStorage.`
    );
  };

  const handleGenerateFlashcards = async () => {
    const cleanSubject = selectedSubject.trim() || 'Hóa học';
    const cleanTopic = topicInput.trim() || 'Kiến thức trọng tâm';
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: cleanSubject,
          topicTitle: cleanTopic,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.cards) && data.cards.length > 0) {
          const aiCards: StudyPackFlashcard[] = data.cards.map(
            (raw: Partial<StudyPackFlashcard>, idx: number) => ({
              id: `fc-ai-${Date.now()}-${idx}`,
              order: idx + 1,
              category: `${raw.category || PRIORITY_CATEGORIES[idx % PRIORITY_CATEGORIES.length]} • ${cleanSubject}`,
              frontPrompt: raw.frontPrompt || `Câu hỏi ôn nhanh #${idx + 1} (${cleanTopic})`,
              frontHint: raw.frontHint || 'Nhẩm định nghĩa hoặc quy tắc cốt lõi trước khi lật thẻ.',
              backAnswer: raw.backAnswer || 'Nội dung mặt sau ngắn gọn, dễ hiểu.',
              backFormula: raw.backFormula || undefined,
              memoryHook: raw.memoryHook || 'Nhớ từ khóa cốt lõi và điều kiện áp dụng.',
            })
          );

          setCards((prev) =>
            [...aiCards, ...prev].slice(0, 24).map((c, idx) => ({ ...c, order: idx + 1 }))
          );
          setActiveCardIndex(0);
          setIsFocusCardFlipped(false);
          setStatusMessage(
            `Đã tạo ${aiCards.length} thẻ Flashcard cơ bản môn ${cleanSubject} — "${cleanTopic}" (bằng Gemini AI) và lưu vào LocalStorage.`
          );
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // Chuyển sang bộ tạo Flashcard chuẩn theo cấu trúc 4 nhóm ưu tiên
    }

    const generated = generateBasicFlashcardsBySubjectAndTopic(cleanSubject, cleanTopic);
    setCards((prev) =>
      [...generated, ...prev].slice(0, 24).map((c, idx) => ({ ...c, order: idx + 1 }))
    );
    setActiveCardIndex(0);
    setIsFocusCardFlipped(false);
    setStatusMessage(
      `Đã tạo ${generated.length} thẻ Flashcard cơ bản môn ${cleanSubject} — "${cleanTopic}" (Đủ 4 nhóm: Khái niệm, Phân biệt, Ví dụ, Quy tắc/Lưu ý) và lưu LocalStorage.`
    );
    setIsGenerating(false);
  };

  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrontPrompt.trim() || !newBackAnswer.trim()) return;

    const customCard: StudyPackFlashcard = {
      id: `fc-custom-${Date.now()}`,
      order: 1,
      category: `${newCategory} • ${selectedSubject}`,
      frontPrompt: newFrontPrompt.trim(),
      frontHint: newFrontHint.trim() || undefined,
      backAnswer: newBackAnswer.trim(),
      backFormula: newBackFormula.trim() || undefined,
      memoryHook: newMemoryHook.trim() || undefined,
    };

    setCards((prev) =>
      [customCard, ...prev].map((c, idx) => ({ ...c, order: idx + 1 }))
    );
    setActiveCardIndex(0);
    setIsFocusCardFlipped(false);
    setNewFrontPrompt('');
    setNewFrontHint('');
    setNewBackAnswer('');
    setNewBackFormula('');
    setNewMemoryHook('');
    setShowAddForm(false);
    setStatusMessage('Đã thêm thẻ Flashcard 2 mặt mới và lưu vào LocalStorage.');
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => {
      const updated = prev
        .filter((c) => c.id !== id)
        .map((c, idx) => ({ ...c, order: idx + 1 }));
      return updated;
    });
    setActiveCardIndex(0);
  };

  const handleResetDefault = () => {
    const defaults = resetFlashcardsToDefault();
    setCards(defaults);
    setActiveCardIndex(0);
    setIsFocusCardFlipped(false);
    setFlippedGridIds([]);
    setStatusMessage('Đã khôi phục ngân hàng Flashcard cơ bản mặc định vào LocalStorage.');
  };

  const toggleGridCardFlip = (id: string) => {
    setFlippedGridIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFlipAllGrid = () => {
    if (flippedGridIds.length === filteredCards.length) {
      setFlippedGridIds([]);
    } else {
      setFlippedGridIds(filteredCards.map((c) => c.id));
    }
  };

  const toggleRemembered = (id: string) => {
    setRememberedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div id="flashcard-module-container" className="space-y-6">
      {/* 0. CHUYỂN ĐỔI CHẾ ĐỘ: FLASHCARD MODE (ÔN TẬP TỪNG THẺ) VS NGÂN HÀNG THẺ */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0f1322] rounded-2xl border border-amber-500/30 max-w-xl mx-auto shadow-inner">
        <button
          type="button"
          id="tab-btn-flashcard-mode"
          onClick={() => setActiveViewMode('flashcard_mode')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeViewMode === 'flashcard_mode'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="h-4 w-4 shrink-0" />
          <span>🎯 Chế Độ Luyện Thẻ (Flashcard Mode)</span>
        </button>

        <button
          type="button"
          id="tab-btn-flashcard-bank"
          onClick={() => setActiveViewMode('flashcard_bank')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeViewMode === 'flashcard_bank'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="h-4 w-4 shrink-0" />
          <span>📚 Ngân Hàng & Tạo Thẻ ({cards.length})</span>
        </button>
      </div>

      {activeViewMode === 'flashcard_mode' ? (
        <FlashcardModeScreen
          cards={cards}
          studyPacks={studyPacks}
          onExitFlashcardMode={() => setActiveViewMode('flashcard_bank')}
        />
      ) : (
        <>
          {/* BANNER GỢI Ý CHUYỂN SANG FLASHCARD MODE */}
          <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-[#12182b] via-[#1a213a] to-[#12182b] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Sẵn sàng luyện phản xạ Active Recall?</span>
              </div>
              <p className="text-xs text-slate-300">
                Ôn luyện từng thẻ trong <strong>Flashcard Mode</strong>: Lật thẻ 3D, đánh giá mức độ nhớ và theo dõi tiến độ đa môn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveViewMode('flashcard_mode')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs whitespace-nowrap transition cursor-pointer"
            >
              <span>Vào Flashcard Mode ngay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Header Module */}
          <div className="rounded-3xl border border-amber-500/35 bg-gradient-to-br from-[#121624] via-[#171b2e] to-[#111420] p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-bold uppercase tracking-wider">
              <Layers className="h-4 w-4 text-amber-400" />
              <span>Buổi 3 • Tạo & Ôn Tập Nhanh Flashcard Cơ Bản (Đa Môn Học)</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-300 flex items-center gap-1 normal-case font-semibold">
                <Database className="h-3.5 w-3.5" />
                Đã lưu {cards.length} thẻ trong LocalStorage
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Thẻ Ghi Nhớ Flashcard 2 Mặt — Ngắn Gọn, Dễ Ôn Nhanh
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              Mỗi thẻ gồm <strong className="text-amber-300">Mặt trước (Câu hỏi / Khái niệm gợi nhớ)</strong> và{' '}
              <strong className="text-emerald-300">Mặt sau (Đáp án cô đọng, Công thức & Mẹo nhớ)</strong>. Ưu tiên 4 nhóm cốt lõi:{' '}
              <span className="text-amber-200 font-semibold">
                Khái niệm & Định nghĩa · Ví dụ minh họa · Phân biệt nhanh · Quy tắc & Lưu ý
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              id="btn-open-custom-flashcard"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1a2136] hover:bg-[#232c47] text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddForm ? 'Đóng khung tạo thẻ' : '+ Tự thêm thẻ 2 mặt'}</span>
            </button>

            <button
              type="button"
              id="btn-reset-flashcards"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#151928] hover:bg-rose-950/50 text-slate-300 hover:text-rose-200 border border-white/10 text-xs font-semibold transition cursor-pointer"
              title="Khôi phục bộ thẻ mẫu ban đầu"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Khôi phục mẫu</span>
            </button>
          </div>
        </div>

        {/* Bộ tạo Flashcard theo Môn học & Chủ đề */}
        <div className="rounded-2xl bg-[#0b0e18] border border-amber-500/25 p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3 space-y-1.5">
              <label
                htmlFor="flashcard-subject-select"
                className="block text-xs font-bold text-slate-300"
              >
                1. Chọn môn học:
              </label>
              <select
                id="flashcard-subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-xl bg-[#131828] border border-amber-500/30 px-3 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
              >
                <option value="Hóa học">Hóa học (THCS & THPT)</option>
                <option value="Khoa học Tự nhiên">Khoa học Tự nhiên (Lớp 7 - 9)</option>
                <option value="Vật lý">Vật lý (Công thức & Định luật)</option>
                <option value="Sinh học">Sinh học (Cơ chế & Phân biệt)</option>
                <option value="Toán học">Toán học (Đại số & Hình học)</option>
              </select>
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <label
                htmlFor="flashcard-topic-input"
                className="block text-xs font-bold text-slate-300"
              >
                2. Chủ đề bài học cần tạo Flashcard:
              </label>
              <input
                id="flashcard-topic-input"
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="VD: Este - Lipit, Nguyên tử & Hóa trị, Định luật Ôm, ADN & ARN..."
                className="w-full rounded-xl bg-[#131828] border border-amber-500/30 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-4">
              <button
                type="button"
                id="btn-generate-flashcards"
                disabled={isGenerating}
                onClick={handleGenerateFlashcards}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:brightness-110 transition disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang tạo bộ thẻ 2 mặt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>✨ Tạo Bộ Flashcard Cơ Bản</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Gợi ý nhanh các bộ thẻ mẫu đa môn học */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              Nạp nhanh bộ thẻ mẫu đa môn:
            </span>
            {MULTI_SUBJECT_FLASHCARD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className="px-2.5 py-1 rounded-lg bg-[#14192b] hover:bg-[#1e2640] text-amber-200 border border-amber-500/25 font-medium transition cursor-pointer"
              >
                {preset.subjectName}: {preset.topicTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Thông báo trạng thái */}
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

        {/* Khung tự thêm thẻ Flashcard 2 mặt */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomCard}
            className="rounded-2xl bg-[#0d111d] border border-amber-400/40 p-4 sm:p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-bold text-amber-300">
                + Tự Tạo Thẻ Flashcard 2 Mặt Mới (Lưu LocalStorage)
              </h3>
              <span className="text-xs text-slate-400">Ngắn gọn, ưu tiên 1 ý cốt lõi / thẻ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nhóm nội dung ưu tiên:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl bg-[#14192b] border border-amber-500/30 px-3 py-2 text-xs text-white"
                >
                  {PRIORITY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gợi ý ngắn ở Mặt trước (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={newFrontHint}
                  onChange={(e) => setNewFrontHint(e.target.value)}
                  placeholder="VD: Chú ý điều kiện nhiệt độ và xúc tác..."
                  className="w-full rounded-xl bg-[#14192b] border border-amber-500/30 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Mặt trước (Câu hỏi / Khái niệm cần nhẩm) *:
                </label>
                <textarea
                  rows={2}
                  required
                  value={newFrontPrompt}
                  onChange={(e) => setNewFrontPrompt(e.target.value)}
                  placeholder="VD: Phân biệt hiện tượng khi cho Quỳ tím vào dung dịch Axit và dung dịch Bazơ?"
                  className="w-full rounded-xl bg-[#14192b] border border-amber-500/30 p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Mặt sau (Đáp án ngắn gọn, dễ hiểu) *:
                </label>
                <textarea
                  rows={2}
                  required
                  value={newBackAnswer}
                  onChange={(e) => setNewBackAnswer(e.target.value)}
                  placeholder="VD: Axit (pH < 7) làm quỳ tím hóa ĐỎ; Bazơ (pH > 7) làm quỳ tím hóa XANH."
                  className="w-full rounded-xl bg-[#14192b] border border-emerald-500/30 p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Công thức / Biểu thức / Ví dụ ngắn (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={newBackFormula}
                  onChange={(e) => setNewBackFormula(e.target.value)}
                  placeholder="VD: Axit → Đỏ | Bazơ → Xanh"
                  className="w-full rounded-xl bg-[#14192b] border border-amber-500/30 px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mẹo nhớ nhanh 1 dòng (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={newMemoryHook}
                  onChange={(e) => setNewMemoryHook(e.target.value)}
                  placeholder="VD: Nhớ câu: Axit Đỏ - Bazơ Xanh."
                  className="w-full rounded-xl bg-[#14192b] border border-amber-500/30 px-3 py-2 text-xs text-white"
                />
              </div>
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
                Lưu thẻ Flashcard
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Khu vực 1: Chế độ Ôn Nhanh Từng Thẻ (Interactive 2-Sided Focus Deck) */}
      {currentFocusCard && (
        <div className="rounded-3xl border border-amber-500/30 bg-[#0e121d] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-amber-400 uppercase tracking-wider">
                Chế Độ Ôn Nhanh Từng Thẻ
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-semibold tabular-nums">
                Thẻ {activeCardIndex + 1} / {filteredCards.length}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-200 font-semibold">{currentFocusCard.category}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleRemembered(currentFocusCard.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rememberedIds.includes(currentFocusCard.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#161c2e] text-slate-300 hover:text-amber-300 border border-white/10'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {rememberedIds.includes(currentFocusCard.id)
                    ? 'Đã thuộc thẻ này'
                    : 'Đánh dấu Đã thuộc'}
                </span>
              </button>
            </div>
          </div>

          {/* 2 Mặt Trực Quan: Mặt Trước & Mặt Sau */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mặt Trước (Front) */}
            <div
              onClick={() => setIsFocusCardFlipped((prev) => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFocusCardFlipped((prev) => !prev);
                }
              }}
              className="rounded-2xl border-2 border-amber-500/35 bg-[#131829] p-5 flex flex-col justify-between min-h-[220px] cursor-pointer hover:border-amber-400 transition"
            >
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold border-b border-white/10 pb-2.5">
                <span>MẶT TRƯỚC (FRONT) — CÂU HỎI / KHÁI NIỆM</span>
                <span className="font-mono">#{currentFocusCard.order}</span>
              </div>

              <div className="my-auto py-4 space-y-2.5">
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {currentFocusCard.frontPrompt}
                </h3>
                {currentFocusCard.frontHint && (
                  <p className="text-xs text-amber-200/85 italic">
                    💡 Gợi ý nhẩm: {currentFocusCard.frontHint}
                  </p>
                )}
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Tự nhẩm câu trả lời trước khi nhìn Mặt sau</span>
                <span className="text-amber-300 font-bold">Nhấn để lật →</span>
              </div>
            </div>

            {/* Mặt Sau (Back) */}
            <div
              onClick={() => setIsFocusCardFlipped((prev) => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFocusCardFlipped((prev) => !prev);
                }
              }}
              className={`rounded-2xl border-2 p-5 flex flex-col justify-between min-h-[220px] cursor-pointer transition ${
                isFocusCardFlipped
                  ? 'border-emerald-400/60 bg-gradient-to-br from-[#132226] to-[#161c2e]'
                  : 'border-dashed border-amber-500/30 bg-[#0a0d16]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-2.5">
                <span className="text-emerald-300">
                  MẶT SAU (BACK) — ĐÁP ÁN NGẮN GỌN & QUY TẮC
                </span>
                <span className="text-amber-300">
                  {isFocusCardFlipped ? 'Đang mở' : 'Nhấn để mở'}
                </span>
              </div>

              {isFocusCardFlipped ? (
                <div className="my-auto py-3 space-y-2.5">
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line font-medium">
                    {currentFocusCard.backAnswer}
                  </p>
                  {currentFocusCard.backFormula && (
                    <div className="rounded-xl bg-[#070910] border border-amber-500/30 p-2.5 font-mono text-xs text-amber-300 font-semibold">
                      {currentFocusCard.backFormula}
                    </div>
                  )}
                  {currentFocusCard.memoryHook && (
                    <p className="text-xs text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-xl p-2">
                      🧠 <strong>Mẹo nhớ nhanh:</strong> {currentFocusCard.memoryHook}
                    </p>
                  )}
                </div>
              ) : (
                <div className="my-auto py-8 text-center space-y-2">
                  <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                    Mặt sau đang ẩn để bạn tự nhẩm câu trả lời
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Nhấn vào đây để lật xem Mặt sau</span>
                  </span>
                </div>
              )}

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Trình bày ngắn gọn • Dễ ôn nhanh</span>
                <span className="text-emerald-300 font-semibold">
                  {isFocusCardFlipped ? 'Nhấn để úp lại' : 'Hiện đáp án'}
                </span>
              </div>
            </div>
          </div>

          {/* Thanh điều hướng Thẻ trước / Lật thẻ / Thẻ tiếp theo */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveCardIndex((prev) =>
                  prev > 0 ? prev - 1 : Math.max(0, filteredCards.length - 1)
                );
                setIsFocusCardFlipped(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161c2e] hover:bg-[#1f2740] text-slate-200 border border-white/10 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Thẻ trước</span>
            </button>

            <button
              type="button"
              id="btn-flip-focus-flashcard"
              onClick={() => setIsFocusCardFlipped((prev) => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{isFocusCardFlipped ? 'Úp Mặt Sau' : 'Lật Xem Mặt Sau'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCardIndex((prev) =>
                  prev < filteredCards.length - 1 ? prev + 1 : 0
                );
                setIsFocusCardFlipped(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161c2e] hover:bg-[#1f2740] text-slate-200 border border-white/10 text-xs font-bold transition cursor-pointer"
            >
              <span>Thẻ tiếp theo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Khu vực 2: Bộ lọc 4 nhóm ưu tiên & Danh sách toàn bộ thẻ 2 mặt */}
      <div className="rounded-3xl border border-amber-500/25 bg-[#101422] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-500/20 pb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `Tất cả (${cards.length})` },
              { id: 'Khái niệm', label: 'Khái niệm & Định nghĩa' },
              { id: 'Phân biệt', label: 'Phân biệt nhanh' },
              { id: 'Ví dụ', label: 'Ví dụ minh họa' },
              { id: 'Quy tắc', label: 'Quy tắc & Lưu ý' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(tab.id);
                  setActiveCardIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#161c2e] text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleFlipAllGrid}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#181e30] hover:bg-[#222a42] text-amber-300 border border-amber-500/30 text-xs font-bold transition self-start lg:self-auto cursor-pointer"
          >
            {flippedGridIds.length === filteredCards.length ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span>Úp tất cả về Mặt trước</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Lật xem tất cả Mặt sau</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card, idx) => {
            const isFlipped = flippedGridIds.includes(card.id);
            return (
              <div
                key={card.id}
                onClick={() => toggleGridCardFlip(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleGridCardFlip(card.id);
                  }
                }}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition cursor-pointer select-none ${
                  isFlipped
                    ? 'bg-gradient-to-br from-[#16222a] to-[#1a1f33] border-emerald-400/50 shadow-lg'
                    : 'bg-[#14192b] border-amber-500/25 hover:border-amber-400/60'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                    <span>
                      Thẻ #{idx + 1} · <strong className="text-amber-300">{card.category}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={isFlipped ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                        {isFlipped ? 'Mặt sau' : 'Mặt trước'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Xóa thẻ này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {!isFlipped ? (
                    <div className="space-y-2 py-1">
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {card.frontPrompt}
                      </h4>
                      {card.frontHint && (
                        <p className="text-xs text-amber-200/80 italic">💡 {card.frontHint}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 py-1">
                      <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line">
                        {card.backAnswer}
                      </p>
                      {card.backFormula && (
                        <div className="rounded-xl bg-[#090c14] border border-amber-500/30 p-2 font-mono text-xs text-amber-300 font-semibold">
                          {card.backFormula}
                        </div>
                      )}
                      {card.memoryHook && (
                        <p className="text-xs text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-xl p-2">
                          🧠 <strong>Mẹo nhớ:</strong> {card.memoryHook}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Nhấn vào thẻ để lật Mặt trước ↔ Mặt sau</span>
                  <span className="text-amber-300 font-semibold">
                    {isFlipped ? '← Xem Mặt trước' : 'Xem Mặt sau →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
