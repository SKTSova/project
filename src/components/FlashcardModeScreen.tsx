import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Shuffle,
  Lightbulb,
  Link2,
  Database,
  Filter,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
} from 'lucide-react';
import { StudyPackFlashcard, GeneratedStudyPack } from '../types';
import {
  loadFlashcards,
  saveFlashcards,
  loadStudyPacks,
} from '../utils/storage';
import { MULTI_SUBJECT_FLASHCARD_PRESETS } from '../data/studyPackData';

interface FlashcardModeScreenProps {
  cards?: StudyPackFlashcard[];
  studyPacks?: GeneratedStudyPack[];
  onExitFlashcardMode?: () => void;
  onAddNewCard?: (newCard: StudyPackFlashcard) => void;
}

// Khóa lưu trạng thái ôn Flashcard Mode vào LocalStorage
const FLASHCARD_MODE_SESSION_STORAGE_KEY = 'sciencequiz_flashcard_mode_session_v1';
const FLASHCARD_MASTERED_STORAGE_KEY = 'sciencequiz_flashcard_mastered_ids_v1';

export const FlashcardModeScreen: React.FC<FlashcardModeScreenProps> = ({
  cards: propCards,
  studyPacks: propStudyPacks,
  onExitFlashcardMode,
}) => {
  // 1. NGUỒN THẺ: TỪ PROPS, STUDY PACKS HOẶC LOCALSTORAGE
  const allSavedCards = useMemo(() => {
    return propCards && propCards.length > 0 ? propCards : loadFlashcards();
  }, [propCards]);

  const allStudyPacks = useMemo(() => {
    return propStudyPacks && propStudyPacks.length > 0 ? propStudyPacks : loadStudyPacks();
  }, [propStudyPacks]);

  // Bộ chọn nguồn thẻ: 'all_saved', mã preset đa môn ('fc-preset-...'), hoặc mã Study Pack ('pack-...')
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all_saved');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'flip_card' | 'side_by_side'>('flip_card');
  const [isReverseStudy, setIsReverseStudy] = useState<boolean>(false); // Đảo mặt: học từ Mặt sau → đoán Mặt trước
  const [showHint, setShowHint] = useState<boolean>(false);

  // Danh sách ID thẻ đã thuộc (Mastered)
  const [masteredCardIds, setMasteredCardIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(FLASHCARD_MASTERED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Bộ lọc tiến độ: 'all' | 'unmastered' | 'mastered'
  const [masteryFilter, setMasteryFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');

  // Lấy danh sách thẻ theo nguồn đã chọn
  const rawDeckCards = useMemo(() => {
    let list: StudyPackFlashcard[] = [];
    if (selectedSourceId === 'all_saved') {
      list = allSavedCards;
    } else if (selectedSourceId.startsWith('fc-preset-')) {
      const preset = MULTI_SUBJECT_FLASHCARD_PRESETS.find((p) => p.id === selectedSourceId);
      list = preset ? preset.cards : allSavedCards;
    } else {
      const matchedPack = allStudyPacks.find((p) => p.id === selectedSourceId);
      list = matchedPack ? matchedPack.flashcards : allSavedCards;
    }

    if (categoryFilter !== 'all') {
      list = list.filter((c) => c.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }
    return list;
  }, [selectedSourceId, categoryFilter, allSavedCards, allStudyPacks]);

  // Lọc theo trạng thái đã thuộc / chưa thuộc
  const activeDeckCards = useMemo(() => {
    if (masteryFilter === 'mastered') {
      return rawDeckCards.filter((c) => masteredCardIds.includes(c.id));
    }
    if (masteryFilter === 'unmastered') {
      return rawDeckCards.filter((c) => !masteredCardIds.includes(c.id));
    }
    return rawDeckCards;
  }, [rawDeckCards, masteryFilter, masteredCardIds]);

  // Chỉ số thẻ hiện tại và trạng thái lật thẻ
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [flipCount, setFlipCount] = useState<number>(0);

  // Form tự thêm thẻ mới đa môn
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>('Hóa học');
  const [newCategory, setNewCategory] = useState<string>('Khái niệm & Định nghĩa');
  const [newFrontPrompt, setNewFrontPrompt] = useState<string>('');
  const [newFrontHint, setNewFrontHint] = useState<string>('');
  const [newBackAnswer, setNewBackAnswer] = useState<string>('');
  const [newBackFormula, setNewBackFormula] = useState<string>('');
  const [newMemoryHook, setNewMemoryHook] = useState<string>('');

  // Lưu danh sách ID đã thuộc vào LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FLASHCARD_MASTERED_STORAGE_KEY, JSON.stringify(masteredCardIds));
    } catch {
      // ignore
    }
  }, [masteredCardIds]);

  // Xáo trộn ngẫu nhiên thứ tự thẻ
  const [shuffledCards, setShuffledCards] = useState<StudyPackFlashcard[] | null>(null);
  const effectiveCards = shuffledCards || activeDeckCards;

  // Reset shuffled cards khi đổi bộ lọc hoặc nguồn
  useEffect(() => {
    setShuffledCards(null);
  }, [selectedSourceId, categoryFilter, masteryFilter]);

  // Điều chỉnh currentIndex nếu danh sách thay đổi
  useEffect(() => {
    if (currentIndex >= effectiveCards.length) {
      setCurrentIndex(Math.max(0, effectiveCards.length - 1));
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [effectiveCards.length, currentIndex]);

  // Thẻ hiện tại
  const currentCard: StudyPackFlashcard | undefined = effectiveCards[currentIndex];
  const isCurrentMastered = currentCard ? masteredCardIds.includes(currentCard.id) : false;

  // Lật thẻ
  const handleFlipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
    setFlipCount((prev) => prev + 1);
  }, []);

  // Chuyển thẻ kế tiếp
  const handleNextCard = useCallback(() => {
    if (currentIndex < effectiveCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [currentIndex, effectiveCards.length]);

  // Chuyển thẻ trước
  const handlePrevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [currentIndex]);

  // Đánh dấu đã thuộc / chưa thuộc
  const handleToggleMastery = useCallback((cardId: string, forceStatus?: boolean) => {
    setMasteredCardIds((prev) => {
      const isAlready = prev.includes(cardId);
      const shouldBeMastered = forceStatus !== undefined ? forceStatus : !isAlready;
      if (shouldBeMastered && !isAlready) {
        return [...prev, cardId];
      }
      if (!shouldBeMastered && isAlready) {
        return prev.filter((id) => id !== cardId);
      }
      return prev;
    });
  }, []);

  const handleShuffleDeck = () => {
    const copy = [...activeDeckCards];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setShuffledCards(copy);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleResetOrder = () => {
    setShuffledCards(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Hỗ trợ phím tắt bàn phím tiện lợi khi tự học
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang nhập liệu trong input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlipCard();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === '1' && currentCard) {
        // Phím 1: Chưa thuộc
        handleToggleMastery(currentCard.id, false);
      } else if (e.key === '2' && currentCard) {
        // Phím 2: Đã thuộc
        handleToggleMastery(currentCard.id, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlipCard, handleNextCard, handlePrevCard, handleToggleMastery, currentCard]);

  // Thêm thẻ thủ công
  const handleCreateNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrontPrompt.trim() || !newBackAnswer.trim()) return;

    const newCard: StudyPackFlashcard = {
      id: `fc-custom-${Date.now()}`,
      order: allSavedCards.length + 1,
      category: `${newCategory} • ${newSubject}`,
      frontPrompt: newFrontPrompt.trim(),
      frontHint: newFrontHint.trim() || undefined,
      backAnswer: newBackAnswer.trim(),
      backFormula: newBackFormula.trim() || undefined,
      memoryHook: newMemoryHook.trim() || undefined,
      sourceRef: `Thẻ tự soạn • Môn ${newSubject}`,
    };

    saveFlashcards([newCard, ...allSavedCards]);
    setShowAddModal(false);
    setNewFrontPrompt('');
    setNewFrontHint('');
    setNewBackAnswer('');
    setNewBackFormula('');
    setNewMemoryHook('');
    setSelectedSourceId('all_saved');
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Thống kê tiến độ ôn
  const totalDeckCount = effectiveCards.length;
  const masteredCount = effectiveCards.filter((c) => masteredCardIds.includes(c.id)).length;
  const unmasteredCount = totalDeckCount - masteredCount;
  const masteryPercentage =
    totalDeckCount > 0 ? Math.round((masteredCount / totalDeckCount) * 100) : 0;

  if (effectiveCards.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-[#0d101a] p-8 text-center space-y-4">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Chưa có thẻ Flashcard nào phù hợp</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          {masteryFilter !== 'all'
            ? 'Không có thẻ nào trong bộ lọc này. Hãy chuyển sang xem tất cả thẻ.'
            : 'Hãy chọn môn học khác hoặc thêm thẻ mới để bắt đầu ôn tập.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setMasteryFilter('all');
            setCategoryFilter('all');
            setSelectedSourceId('all_saved');
          }}
          className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
        >
          Xem tất cả thẻ Flashcard đã lưu
        </button>
      </div>
    );
  }

  return (
    <div id="flashcard-mode-container" className="space-y-6">
      {/* 1. HEADER FLASHCARD MODE & BỘ ĐIỀU KHIỂN CHỌN MÔN HỌC */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#101424] via-[#14182b] to-[#10131e] p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-bold uppercase tracking-wider">
              <Layers className="h-4 w-4 text-amber-400" />
              <span>Chế Độ Flashcard • Ghi Nhớ Nhanh 2 Mặt</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-300 flex items-center gap-1 font-semibold normal-case">
                <Database className="h-3.5 w-3.5" />
                Đa Môn Học (Hóa học, KHTN, Vật lý, Sinh học, Toán học...)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Phòng Ôn Thẻ Ghi Nhớ: Lật Thẻ, Đối Chiếu & Nhớ Sâu
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Phương pháp Active Recall: Đọc kỹ <strong>Mặt trước</strong>, tự nhẩm khái niệm/công thức trước khi <strong>Lật sang Mặt sau</strong> để kiểm chứng và củng cố trí nhớ dài hạn.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#192138] hover:bg-[#232c4a] text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Thêm thẻ mới</span>
            </button>

            {onExitFlashcardMode && (
              <button
                type="button"
                onClick={onExitFlashcardMode}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161a2c] hover:bg-[#202740] text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition cursor-pointer"
              >
                <span>Xem Ngân hàng thẻ</span>
              </button>
            )}
          </div>
        </div>

        {/* Thanh chọn Nguồn Thẻ & Môn Học */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Chọn Môn học / Bộ thẻ */}
          <div className="md:col-span-6 space-y-1">
            <label htmlFor="flashcard-source-select" className="block text-xs font-bold text-slate-300">
              Chọn Môn học & Bộ thẻ Flashcard:
            </label>
            <select
              id="flashcard-source-select"
              value={selectedSourceId}
              onChange={(e) => {
                setSelectedSourceId(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowHint(false);
                setShuffledCards(null);
              }}
              className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all_saved">
                Tất cả thẻ đã lưu ({allSavedCards.length} thẻ)
              </option>

              <optgroup label="📚 Bộ mẫu đa môn học (Chuẩn kiến thức)">
                {MULTI_SUBJECT_FLASHCARD_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    [{preset.subjectName}] {preset.topicTitle} ({preset.cards.length} thẻ)
                  </option>
                ))}
              </optgroup>

              {allStudyPacks.length > 0 && (
                <optgroup label="📁 Từ Study Pack của bạn">
                  {allStudyPacks.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.title} ({pack.flashcards.length} thẻ)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Lọc Thể loại ưu tiên */}
          <div className="md:col-span-3 space-y-1">
            <span className="block text-xs font-bold text-slate-300">
              Nhóm thẻ ưu tiên:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Đủ 4 nhóm cốt lõi</option>
              <option value="Khái niệm">1. Khái niệm & Định nghĩa</option>
              <option value="Phân biệt">2. Phân biệt nhanh</option>
              <option value="Ví dụ">3. Ví dụ minh họa</option>
              <option value="Quy tắc">4. Quy tắc & Lưu ý</option>
            </select>
          </div>

          {/* Chế độ hiển thị: Lật 3D vs Song song */}
          <div className="md:col-span-3 space-y-1">
            <span className="block text-xs font-bold text-slate-300">
              Cách hiển thị 2 mặt:
            </span>
            <div className="flex items-center p-1 rounded-xl bg-[#090c14] border border-amber-500/30 text-xs">
              <button
                type="button"
                onClick={() => setViewLayout('flip_card')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition text-center cursor-pointer ${
                  viewLayout === 'flip_card'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🔄 Lật thẻ 3D
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('side_by_side')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition text-center cursor-pointer ${
                  viewLayout === 'side_by_side'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                📖 Song song
              </button>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ & Các nút thao tác bổ trợ */}
        <div className="rounded-2xl bg-[#0a0d16] border border-white/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-300 flex-wrap">
            <span>
              Thẻ hiện tại:{' '}
              <strong className="text-amber-300 font-mono text-sm tabular-nums">
                {currentIndex + 1} / {totalDeckCount}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Đã thuộc: {masteredCount} / {totalDeckCount} ({masteryPercentage}%)
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">
              Lượt lật: <strong className="text-white font-mono">{flipCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bộ lọc đã thuộc / chưa thuộc */}
            <div className="flex items-center gap-1 bg-[#121626] p-1 rounded-xl border border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => setMasteryFilter('all')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  masteryFilter === 'all'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Tất cả ({rawDeckCards.length})
              </button>
              <button
                type="button"
                onClick={() => setMasteryFilter('unmastered')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  masteryFilter === 'unmastered'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-300 hover:text-rose-300'
                }`}
              >
                Chưa thuộc ({rawDeckCards.length - rawDeckCards.filter((c) => masteredCardIds.includes(c.id)).length})
              </button>
              <button
                type="button"
                onClick={() => setMasteryFilter('mastered')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  masteryFilter === 'mastered'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-300 hover:text-emerald-300'
                }`}
              >
                Đã thuộc ({rawDeckCards.filter((c) => masteredCardIds.includes(c.id)).length})
              </button>
            </div>

            {/* Xáo trộn */}
            <button
              type="button"
              onClick={shuffledCards ? handleResetOrder : handleShuffleDeck}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                shuffledCards
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                  : 'bg-[#14192a] text-slate-300 hover:text-white border-white/10'
              }`}
              title="Xáo trộn ngẫu nhiên thứ tự thẻ"
            >
              <Shuffle className="h-3 w-3" />
              <span>{shuffledCards ? 'Hủy xáo' : 'Xáo trộn'}</span>
            </button>
          </div>
        </div>

        {/* Thanh chọn nhanh số thứ tự thẻ (Card Navigator Palette) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {effectiveCards.map((c, idx) => {
            const isCurrent = idx === currentIndex;
            const isMastered = masteredCardIds.includes(c.id);

            let style = 'bg-[#121624] text-slate-400 border-white/10 hover:border-amber-400/50';
            if (isMastered) {
              style = 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-bold';
            }
            if (isCurrent) {
              style += ' ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0d14]';
            }

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsFlipped(false);
                  setShowHint(false);
                }}
                title={`Thẻ ${idx + 1}: ${c.category}`}
                className={`h-8 min-w-8 px-2 rounded-xl text-xs font-mono font-bold border transition flex items-center justify-center shrink-0 cursor-pointer tabular-nums ${style}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KHU VỰC THẺ FLASHCARD TẬP TRUNG (LẬT 3D HOẶC SONG SONG) */}
      {currentCard && (
        <div className="space-y-4">
          {/* CHẾ ĐỘ 1: LẬT THẺ 3D (FOCUS FLIP MODE) */}
          {viewLayout === 'flip_card' ? (
            <div
              id="flashcard-interactive-card"
              onClick={handleFlipCard}
              className="relative cursor-pointer select-none rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#121628] via-[#161c33] to-[#111422] p-7 sm:p-9 shadow-2xl transition-all duration-300 hover:border-amber-400 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group"
            >
              {/* HEADER CỦA MẶT THẺ */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black text-xs tabular-nums">
                    {currentIndex + 1}
                  </span>

                  {/* Nhãn mặt trước / mặt sau to rõ ràng */}
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide uppercase border flex items-center gap-1.5 ${
                      !isFlipped
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {!isFlipped ? (
                      <>
                        <span>☀️ MẶT TRƯỚC: CÂU HỎI & KHÁI NIỆM</span>
                      </>
                    ) : (
                      <>
                        <span>🌙 MẶT SAU: ĐÁP ÁN & BẢN CHẤT</span>
                      </>
                    )}
                  </span>

                  <span className="text-slate-400 text-xs font-semibold">
                    {currentCard.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Trạng thái đã thuộc */}
                  {isCurrentMastered ? (
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Đã thuộc</span>
                    </span>
                  ) : (
                    <span className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                      Chưa thuộc
                    </span>
                  )}

                  <span className="text-xs text-slate-400 group-hover:text-amber-300 transition hidden sm:inline">
                    (Nhấn chuột hoặc phím Space để lật)
                  </span>
                </div>
              </div>

              {/* NỘI DUNG MẶT THẺ */}
              <div className="my-auto py-6 space-y-5">
                {!isFlipped ? (
                  /* ================= MẶT TRƯỚC ================= */
                  <div className="space-y-4 animate-fadeIn">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4" />
                      <span>Câu hỏi ôn nhanh / Khái niệm gợi nhớ:</span>
                    </div>

                    <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed text-balance">
                      {currentCard.frontPrompt}
                    </h3>

                    {/* Gợi ý nhẩm (Hint) */}
                    {currentCard.frontHint && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint((prev) => !prev);
                        }}
                        className="rounded-2xl bg-[#090c14] border border-amber-500/25 p-3.5 text-xs transition cursor-pointer max-w-xl"
                      >
                        <div className="flex items-center justify-between text-amber-300 font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5" />
                            Gợi ý nhẩm tư duy (Active Recall)
                          </span>
                          <span className="text-[11px] underline">
                            {showHint ? 'Ẩn gợi ý' : 'Nhấn để xem gợi ý'}
                          </span>
                        </div>
                        {showHint ? (
                          <p className="text-slate-300 leading-relaxed pt-1 border-t border-white/5">
                            {currentCard.frontHint}
                          </p>
                        ) : (
                          <p className="text-slate-500 italic text-[11px]">
                            Thử nhẩm định nghĩa hoặc quy tắc trong đầu trước khi lật mặt sau...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ================= MẶT SAU ================= */
                  <div className="space-y-4 animate-fadeIn">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Đáp án cô đọng & Bản chất cốt lõi:</span>
                    </div>

                    <div className="text-base sm:text-xl font-semibold text-white leading-relaxed whitespace-pre-line">
                      {currentCard.backAnswer}
                    </div>

                    {/* Công thức hoặc Phương trình nổi bật */}
                    {currentCard.backFormula && (
                      <div className="rounded-2xl bg-[#090c14] border border-emerald-500/30 p-3.5 font-mono text-xs sm:text-sm text-emerald-300 font-semibold max-w-2xl">
                        ⚗️ {currentCard.backFormula}
                      </div>
                    )}

                    {/* Mẹo ghi nhớ dài hạn */}
                    {currentCard.memoryHook && (
                      <div className="rounded-2xl bg-amber-400/10 border border-amber-400/30 p-3.5 text-xs text-amber-200 font-medium max-w-2xl flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 block mb-0.5">
                            Mẹo ghi nhớ nhanh (Memory Hook):
                          </strong>
                          <span>{currentCard.memoryHook}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FOOTER CỦA THẺ */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-400 flex items-center gap-1.5">
                  {currentCard.sourceRef ? (
                    <span className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
                      <Link2 className="h-3 w-3 text-amber-400" />
                      {currentCard.sourceRef}
                    </span>
                  ) : (
                    <span>Thẻ Flashcard 2 mặt</span>
                  )}
                </div>

                <div className="text-amber-300 font-bold flex items-center gap-1">
                  <span>{!isFlipped ? 'Nhấn để lật xem Mặt sau →' : '← Nhấn để úp về Mặt trước'}</span>
                </div>
              </div>
            </div>
          ) : (
            /* CHẾ ĐỘ 2: XEM SONG SONG 2 MẶT CÙNG LÚC (SIDE-BY-SIDE MODE) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MẶT TRƯỚC */}
              <div className="rounded-3xl border border-amber-500/30 bg-[#121628] p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                      ☀️ MẶT TRƯỚC (CÂU HỎI)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{currentIndex + 1}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {currentCard.frontPrompt}
                  </h3>

                  {currentCard.frontHint && (
                    <div className="rounded-xl bg-[#090c14] border border-amber-500/20 p-3 text-xs text-slate-300">
                      <strong className="text-amber-300 block mb-1">Gợi ý nhẩm:</strong>
                      {currentCard.frontHint}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  {currentCard.sourceRef}
                </div>
              </div>

              {/* MẶT SAU */}
              <div className="rounded-3xl border border-emerald-500/40 bg-[#121a28] p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                      🌙 MẶT SAU (ĐÁP ÁN)
                    </span>
                    <span className="text-xs text-emerald-300 font-bold">
                      {currentCard.category}
                    </span>
                  </div>

                  <div className="text-sm sm:text-base font-semibold text-white leading-relaxed whitespace-pre-line">
                    {currentCard.backAnswer}
                  </div>

                  {currentCard.backFormula && (
                    <div className="rounded-xl bg-[#090c14] border border-emerald-500/30 p-3 font-mono text-xs text-emerald-300 font-semibold">
                      ⚗️ {currentCard.backFormula}
                    </div>
                  )}

                  {currentCard.memoryHook && (
                    <div className="rounded-xl bg-amber-400/10 border border-amber-400/30 p-3 text-xs text-amber-200">
                      <strong className="text-amber-300 block mb-0.5">Mẹo nhớ:</strong>
                      {currentCard.memoryHook}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  Đối chiếu Active Recall
                </div>
              </div>
            </div>
          )}

          {/* 3. THANH ĐIỀU HƯỚNG THẺ & NÚT TỰ ĐÁNH GIÁ (CHƯA THUỘC / ĐÃ THUỘC) */}
          <div className="rounded-3xl border border-white/10 bg-[#0e1220] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            {/* Cặp nút Đánh giá mức độ nhớ */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleMastery(currentCard.id, false)}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                  !isCurrentMastered
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-900/30'
                    : 'bg-[#151928] text-rose-300 hover:bg-rose-950/40 border-rose-500/30'
                }`}
                title="Nhấn phím 1 để đánh dấu Chưa thuộc"
              >
                <XCircle className="h-4 w-4" />
                <span>Chưa thuộc (Phím 1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMastery(currentCard.id, true)}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                  isCurrentMastered
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md shadow-emerald-900/30'
                    : 'bg-[#151928] text-emerald-300 hover:bg-emerald-950/40 border-emerald-500/30'
                }`}
                title="Nhấn phím 2 để đánh dấu Đã thuộc"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Đã thuộc (Phím 2)</span>
              </button>
            </div>

            {/* Nút lật & Điều hướng Thẻ Trước / Thẻ Tiếp Theo */}
            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={handleFlipCard}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1b2238] hover:bg-[#242c4a] text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold transition cursor-pointer"
                title="Phím Space để lật thẻ"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Lật thẻ (Space)</span>
              </button>

              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrevCard}
                className="inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-2xl bg-[#151a2b] hover:bg-[#1d233a] text-slate-300 hover:text-white border border-white/10 text-xs sm:text-sm font-bold disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Phím ← để về thẻ trước"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Trước</span>
              </button>

              <button
                type="button"
                disabled={currentIndex >= effectiveCards.length - 1}
                onClick={handleNextCard}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-md"
                title="Phím → để sang thẻ tiếp theo"
              >
                <span>Thẻ tiếp theo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL TỰ THÊM THẺ MỚI PHÙ HỢP NHIỀU MÔN HỌC */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl border border-amber-500/40 bg-[#121626] p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-sm">
                  +
                </span>
                <h3 className="text-lg font-bold text-white">Thêm Thẻ Flashcard 2 Mặt Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>

            <form onSubmit={handleCreateNewCard} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Môn học:</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 p-2.5 text-white"
                  >
                    <option value="Hóa học">Hóa học</option>
                    <option value="Khoa học Tự nhiên">Khoa học Tự nhiên (KHTN)</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Lịch sử - Địa lý">Lịch sử - Địa lý</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nhóm thẻ:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 p-2.5 text-white"
                  >
                    <option value="Khái niệm & Định nghĩa">Khái niệm & Định nghĩa</option>
                    <option value="Phân biệt nhanh">Phân biệt nhanh</option>
                    <option value="Ví dụ minh họa">Ví dụ minh họa</option>
                    <option value="Quy tắc & Lưu ý">Quy tắc & Lưu ý</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-bold mb-1">
                  ☀️ Mặt trước: Câu hỏi / Khái niệm cần nhớ (*):
                </label>
                <input
                  type="text"
                  required
                  value={newFrontPrompt}
                  onChange={(e) => setNewFrontPrompt(e.target.value)}
                  placeholder="VD: Công thức tính nhiệt lượng tỏa ra trên điện trở R theo định luật Jun-Lenxơ?"
                  className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 p-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Gợi ý nhẩm (Active Recall Hint - không bắt buộc):
                </label>
                <input
                  type="text"
                  value={newFrontHint}
                  onChange={(e) => setNewFrontHint(e.target.value)}
                  placeholder="VD: Mối quan hệ giữa I bình phương, R và thời gian t."
                  className="w-full rounded-xl bg-[#090c14] border border-white/10 p-2.5 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">
                  🌙 Mặt sau: Đáp án cô đọng & Bản chất cốt lõi (*):
                </label>
                <textarea
                  rows={3}
                  required
                  value={newBackAnswer}
                  onChange={(e) => setNewBackAnswer(e.target.value)}
                  placeholder="Nội dung mặt sau ngắn gọn, chính xác..."
                  className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 p-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Công thức / Phương trình (nếu có):
                  </label>
                  <input
                    type="text"
                    value={newBackFormula}
                    onChange={(e) => setNewBackFormula(e.target.value)}
                    placeholder="VD: Q = I² × R × t"
                    className="w-full rounded-xl bg-[#090c14] border border-white/10 p-2.5 text-white placeholder:text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Mẹo ghi nhớ (Memory hook):
                  </label>
                  <input
                    type="text"
                    value={newMemoryHook}
                    onChange={(e) => setNewMemoryHook(e.target.value)}
                    placeholder="VD: I bình nhân R nhân t (Jun bằng Jun)."
                    className="w-full rounded-xl bg-[#090c14] border border-white/10 p-2.5 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#161a28] text-slate-300 hover:text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  Lưu thẻ vào LocalStorage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
