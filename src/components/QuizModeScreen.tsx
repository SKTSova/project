import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Filter,
  BookOpen,
  GraduationCap,
  Database,
  Link2,
  Lightbulb,
  ListChecks,
  SlidersHorizontal,
} from 'lucide-react';
import {
  StudyPackPracticeQuestion,
  GeneratedStudyPack,
  PracticeQuestionFormat,
} from '../types';
import { loadPracticeQuestions, loadStudyPacks } from '../utils/storage';
import { getQuestionReviewTip } from '../data/studyPackData';

interface QuizModeScreenProps {
  questions?: StudyPackPracticeQuestion[];
  studyPacks?: GeneratedStudyPack[];
  onExitQuizMode?: () => void;
  onRefreshQuestions?: () => void;
}

// Khóa lưu trạng thái bài thi Quiz Mode vào LocalStorage để không mất dữ liệu khi F5
const QUIZ_SESSION_STORAGE_KEY = 'sciencequiz_quizmode_session_v3';

type FeedbackTimingMode = 'per_question' | 'after_turn';

interface QuizSessionState {
  answersByQuestionId: Record<string, string>;
  evaluationsByQuestionId: Record<string, { isChecked: boolean; isCorrect: boolean }>;
  currentQuestionIndex: number;
  selectedSourceId: string;
  feedbackTiming: FeedbackTimingMode;
  isQuizSubmitted: boolean;
}

export const QuizModeScreen: React.FC<QuizModeScreenProps> = ({
  questions: propQuestions,
  studyPacks: propStudyPacks,
  onExitQuizMode,
}) => {
  // 1. DỮ LIỆU NGUỒN: LẤY TỪ CÂU HỎI ĐÃ LƯU TRONG LOCALSTORAGE
  const allSavedQuestions = useMemo(() => {
    return propQuestions && propQuestions.length > 0 ? propQuestions : loadPracticeQuestions();
  }, [propQuestions]);

  const allStudyPacks = useMemo(() => {
    return propStudyPacks && propStudyPacks.length > 0 ? propStudyPacks : loadStudyPacks();
  }, [propStudyPacks]);

  // Bộ chọn nguồn câu hỏi: "all_saved" hoặc pack cụ thể
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all_saved');
  const [formatFilter, setFormatFilter] = useState<'all' | PracticeQuestionFormat>('all');

  // Chế độ xem kết quả: "per_question" (sau mỗi câu) hoặc "after_turn" (sau mỗi lượt quiz)
  const [feedbackTiming, setFeedbackTiming] = useState<FeedbackTimingMode>(() => {
    if (typeof window === 'undefined') return 'per_question';
    try {
      const raw = localStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed: QuizSessionState = JSON.parse(raw);
        if (parsed.feedbackTiming) return parsed.feedbackTiming;
      }
    } catch {
      // fallback
    }
    return 'per_question';
  });

  // Lọc danh sách câu hỏi dựa trên nguồn đã chọn
  const activeQuestionList = useMemo(() => {
    let list: StudyPackPracticeQuestion[] = [];
    if (selectedSourceId === 'all_saved') {
      list = allSavedQuestions;
    } else {
      const matchedPack = allStudyPacks.find((p) => p.id === selectedSourceId);
      list = matchedPack ? matchedPack.practiceQuestions : allSavedQuestions;
    }

    if (formatFilter !== 'all') {
      list = list.filter((q) => q.format === formatFilter);
    }
    return list;
  }, [selectedSourceId, formatFilter, allSavedQuestions, allStudyPacks]);

  // 2. STATE LƯU CÂU TRẢ LỜI RIÊNG BIỆT THEO TỪNG CÂU (KHÔNG DÙNG STATE CÂU CUỐI ĐỂ CHẤM)
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed: QuizSessionState = JSON.parse(raw);
        return parsed.answersByQuestionId || {};
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [evaluationsByQuestionId, setEvaluationsByQuestionId] = useState<
    Record<string, { isChecked: boolean; isCorrect: boolean }>
  >(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed: QuizSessionState = JSON.parse(raw);
        return parsed.evaluationsByQuestionId || {};
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed: QuizSessionState = JSON.parse(raw);
        return !!parsed.isQuizSubmitted;
      }
    } catch {
      // fallback
    }
    return false;
  });

  // Bộ lọc xem lại câu hỏi ở bảng kết quả cuối: 'all' | 'incorrect' | 'correct'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  // Tự động lưu trạng thái từng câu vào LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sessionData: QuizSessionState = {
        answersByQuestionId,
        evaluationsByQuestionId,
        currentQuestionIndex: currentIndex,
        selectedSourceId,
        feedbackTiming,
        isQuizSubmitted,
      };
      localStorage.setItem(QUIZ_SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch {
      // ignore
    }
  }, [
    answersByQuestionId,
    evaluationsByQuestionId,
    currentIndex,
    selectedSourceId,
    feedbackTiming,
    isQuizSubmitted,
  ]);

  // Điều chỉnh currentIndex nếu danh sách thay đổi
  useEffect(() => {
    if (currentIndex >= activeQuestionList.length) {
      setCurrentIndex(Math.max(0, activeQuestionList.length - 1));
    }
  }, [activeQuestionList.length, currentIndex]);

  // Câu hỏi hiện tại
  const currentQuestion: StudyPackPracticeQuestion | undefined = activeQuestionList[currentIndex];

  // Câu trả lời của học sinh cho câu hỏi HIỆN TẠI (lấy từ map riêng theo question.id)
  const currentAnswer = currentQuestion ? answersByQuestionId[currentQuestion.id] || '' : '';
  const currentEvaluation = currentQuestion
    ? evaluationsByQuestionId[currentQuestion.id] || { isChecked: false, isCorrect: false }
  : { isChecked: false, isCorrect: false };

  // 3. LOGIC ĐÁNH GIÁ ĐÚNG / SAI CỦA TỪNG CÂU HỎI
  const evaluateSingleQuestion = (
    q: StudyPackPracticeQuestion,
    answerText: string
  ): boolean => {
    const cleanUser = answerText.trim().toLowerCase();
    if (!cleanUser) return false;

    // A. Dạng trắc nghiệm lựa chọn (multiple_choice)
    if (q.format === 'multiple_choice') {
      const cleanSample = q.sampleAnswer.trim().toLowerCase();
      if (cleanUser === cleanSample) return true;
      const userLetter = cleanUser.charAt(0);
      const sampleLetter = cleanSample.charAt(0);
      if (['a', 'b', 'c', 'd'].includes(userLetter) && userLetter === sampleLetter) return true;
      return cleanSample.includes(cleanUser) || cleanUser.includes(cleanSample);
    }

    // B. Dạng Đúng / Sai (true_false)
    if (q.format === 'true_false') {
      const isUserTrue = cleanUser.includes('đúng') || cleanUser.includes('true');
      const isSampleTrue =
        q.sampleAnswer.toLowerCase().includes('đúng') || q.sampleAnswer.toLowerCase().includes('true');
      return isUserTrue === isSampleTrue;
    }

    // C. Dạng Điền từ ngắn (fill_blank)
    if (q.format === 'fill_blank') {
      if (q.AcceptableKeywords && q.AcceptableKeywords.length > 0) {
        return q.AcceptableKeywords.some((kw) => cleanUser.includes(kw.toLowerCase()));
      }
      const cleanSample = q.sampleAnswer.trim().toLowerCase();
      return cleanSample.includes(cleanUser) || cleanUser.includes(cleanSample);
    }

    // D. Dạng Hỏi - Đáp ngắn (short_answer)
    if (q.format === 'short_answer') {
      if (q.AcceptableKeywords && q.AcceptableKeywords.length > 0) {
        const matchesKeyword = q.AcceptableKeywords.some((kw) =>
          cleanUser.includes(kw.toLowerCase())
        );
        if (matchesKeyword) return true;
      }
      const cleanSample = q.sampleAnswer.trim().toLowerCase();
      return cleanUser.length >= 3 && (cleanSample.includes(cleanUser) || cleanUser.includes(cleanSample));
    }

    return false;
  };

  // Cập nhật câu trả lời CHO CÂU CỤ THỂ (không dùng state chung của câu cuối)
  const handleAnswerChange = (questionId: string, value: string, autoCheckIfPerQuestion = false) => {
    setAnswersByQuestionId((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Nếu học sinh đang ở chế độ xem kết quả ngay sau mỗi câu và chọn trắc nghiệm/đúng sai:
    if (feedbackTiming === 'per_question' && autoCheckIfPerQuestion && currentQuestion) {
      const isCorrect = evaluateSingleQuestion(currentQuestion, value);
      setEvaluationsByQuestionId((prev) => ({
        ...prev,
        [questionId]: {
          isChecked: true,
          isCorrect,
        },
      }));
    }
  };

  // 4. KIỂM TRA KẾT QUẢ CHO CÂU HIỆN TẠI (Per-question check)
  const handleCheckCurrentQuestion = () => {
    if (!currentQuestion) return;
    const answer = answersByQuestionId[currentQuestion.id] || '';
    const isCorrect = evaluateSingleQuestion(currentQuestion, answer);

    setEvaluationsByQuestionId((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        isChecked: true,
        isCorrect,
      },
    }));
  };

  // 5. KIỂM TRA TOÀN BỘ LƯỢT QUIZ (Chấm từng câu độc lập từ map answersByQuestionId)
  const handleSubmitAllQuiz = () => {
    const newEvaluations: Record<string, { isChecked: boolean; isCorrect: boolean }> = {};

    activeQuestionList.forEach((q) => {
      const ans = answersByQuestionId[q.id] || '';
      const isCorrect = evaluateSingleQuestion(q, ans);
      newEvaluations[q.id] = {
        isChecked: true,
        isCorrect,
      };
    });

    setEvaluationsByQuestionId(newEvaluations);
    setIsQuizSubmitted(true);
  };

  // Làm lại bài thi từ đầu
  const handleResetQuiz = () => {
    setAnswersByQuestionId({});
    setEvaluationsByQuestionId({});
    setCurrentIndex(0);
    setIsQuizSubmitted(false);
    setReviewFilter('all');
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  // Thống kê tiến độ & kết quả làm bài
  const totalQuestions = activeQuestionList.length;
  const answeredCount = activeQuestionList.filter(
    (q) => (answersByQuestionId[q.id] || '').trim().length > 0
  ).length;

  const correctCount = activeQuestionList.filter(
    (q) => evaluationsByQuestionId[q.id]?.isChecked && evaluationsByQuestionId[q.id]?.isCorrect
  ).length;

  const incorrectCount = activeQuestionList.filter(
    (q) =>
      evaluationsByQuestionId[q.id]?.isChecked &&
      !evaluationsByQuestionId[q.id]?.isCorrect &&
      (answersByQuestionId[q.id] || '').trim().length > 0
  ).length;

  const unansweredCount = activeQuestionList.filter(
    (q) => !(answersByQuestionId[q.id] || '').trim().length
  ).length;

  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Lọc danh sách câu hỏi ở bảng kết quả cuối lượt
  const filteredReviewQuestions = useMemo(() => {
    if (reviewFilter === 'incorrect') {
      return activeQuestionList.filter(
        (q) => evaluationsByQuestionId[q.id]?.isChecked && !evaluationsByQuestionId[q.id]?.isCorrect
      );
    }
    if (reviewFilter === 'correct') {
      return activeQuestionList.filter(
        (q) => evaluationsByQuestionId[q.id]?.isChecked && evaluationsByQuestionId[q.id]?.isCorrect
      );
    }
    return activeQuestionList;
  }, [reviewFilter, activeQuestionList, evaluationsByQuestionId]);

  if (activeQuestionList.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-[#0d101a] p-8 text-center space-y-4">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Chưa có câu hỏi nào trong bộ này</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Hãy chọn nguồn câu hỏi khác hoặc tạo bộ câu hỏi luyện tập mới từ nguồn học liệu đã lưu.
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedSourceId('all_saved');
            setFormatFilter('all');
          }}
          className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
        >
          Xem tất cả câu hỏi đã lưu
        </button>
      </div>
    );
  }

  return (
    <div id="quiz-mode-container" className="space-y-6">
      {/* 1. HEADER QUIZ MODE & LỰA CHỌN CHẾ ĐỘ XEM KẾT QUẢ */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#101424] via-[#14182b] to-[#10131e] p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Chế Độ Luyện Thi • Quiz Mode</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-300 flex items-center gap-1 font-semibold normal-case">
                <Database className="h-3.5 w-3.5" />
                Lưu từng câu riêng biệt (LocalStorage)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Phòng Luyện Thi Cá Nhân: Trả Lời & Xem Kết Quả Tự Học
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Hỗ trợ tự học hiệu quả: Xem phản hồi đúng/sai tức thì sau mỗi câu kèm <strong>gợi ý ngắn để ôn lại</strong>, hoặc làm trọn vẹn cả lượt rồi đối chiếu kết quả tổng thể ({correctCount}/{totalQuestions} câu đúng).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161a2c] hover:bg-[#202740] text-slate-300 hover:text-amber-300 border border-white/10 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Làm lại lượt này</span>
            </button>

            {onExitQuizMode && (
              <button
                type="button"
                onClick={onExitQuizMode}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1f263c] hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
              >
                <span>Thoát Quiz Mode</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. THANH ĐIỀU KHIỂN: CHẾ ĐỘ XEM KẾT QUẢ + CHỌN NGUỒN CÂU HỎI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* LỰA CHỌN CHẾ ĐỘ XEM KẾT QUẢ: SAU MỖI CÂU VS SAU CẢ LƯỢT QUIZ */}
          <div className="lg:col-span-5 space-y-1">
            <span className="block text-xs font-bold text-slate-300">
              Chế độ xem kết quả:
            </span>
            <div className="flex items-center p-1 rounded-xl bg-[#090c14] border border-amber-500/30">
              <button
                type="button"
                onClick={() => setFeedbackTiming('per_question')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedbackTiming === 'per_question'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>⚡ Xem sau mỗi câu</span>
                <span className="text-[10px] opacity-80">(Tự học)</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackTiming('after_turn')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedbackTiming === 'after_turn'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>📋 Xem sau cả lượt</span>
                <span className="text-[10px] opacity-80">(Thi thử)</span>
              </button>
            </div>
          </div>

          {/* Chọn Nguồn câu hỏi */}
          <div className="lg:col-span-4 space-y-1">
            <label htmlFor="quiz-source-select" className="block text-xs font-bold text-slate-300">
              Nguồn câu hỏi:
            </label>
            <select
              id="quiz-source-select"
              value={selectedSourceId}
              onChange={(e) => {
                setSelectedSourceId(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all_saved">
                Tất cả câu hỏi đã lưu ({allSavedQuestions.length} câu)
              </option>
              {allStudyPacks.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.title} ({pack.practiceQuestions.length} câu)
                </option>
              ))}
            </select>
          </div>

          {/* Lọc dạng câu hỏi */}
          <div className="lg:col-span-3 space-y-1">
            <span className="block text-xs font-bold text-slate-300">
              Dạng câu:
            </span>
            <select
              value={formatFilter}
              onChange={(e) => {
                setFormatFilter(e.target.value as any);
                setCurrentIndex(0);
              }}
              className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Đủ 4 dạng cơ bản</option>
              <option value="multiple_choice">1. Trắc nghiệm A/B/C/D</option>
              <option value="true_false">2. Nhận định Đúng/Sai</option>
              <option value="fill_blank">3. Điền từ ngắn</option>
              <option value="short_answer">4. Hỏi-đáp ngắn</option>
            </select>
          </div>
        </div>

        {/* Thanh tiến độ bài thi (Progress Tracker) */}
        <div className="rounded-2xl bg-[#0a0d16] border border-white/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-300 flex-wrap">
            <span>
              Câu hiện tại:{' '}
              <strong className="text-amber-300 font-mono text-sm tabular-nums">
                {currentIndex + 1} / {totalQuestions}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>
              Đã trả lời:{' '}
              <strong className="text-emerald-300 tabular-nums">
                {answeredCount} / {totalQuestions}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="bg-[#121626] px-2.5 py-1 rounded-lg border border-amber-500/25">
              Kết quả hiện tại:{' '}
              <strong className="text-amber-300 font-bold font-mono tabular-nums">
                {correctCount}/{totalQuestions} câu đúng
              </strong>
              {totalQuestions > 0 && (
                <span className="text-slate-400 font-normal ml-1">
                  ({scorePercentage}%)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isQuizSubmitted ? (
              <button
                type="button"
                id="btn-submit-all-quiz"
                onClick={handleSubmitAllQuiz}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs hover:brightness-110 transition cursor-pointer whitespace-nowrap shadow-md"
              >
                <span>Hoàn thành & Xem kết quả cả lượt</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('quiz-turn-summary-report');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition cursor-pointer"
              >
                <span>Xem báo cáo lượt thi ({correctCount}/{totalQuestions})</span>
              </button>
            )}
          </div>
        </div>

        {/* Thanh bảng chọn câu hỏi nhanh (Question Stepper Palette) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {activeQuestionList.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const hasAnswer = (answersByQuestionId[q.id] || '').trim().length > 0;
            const evalState = evaluationsByQuestionId[q.id];

            let badgeStyle = 'bg-[#121624] text-slate-400 border-white/10 hover:border-amber-400/50';
            if (evalState?.isChecked) {
              badgeStyle = evalState.isCorrect
                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-bold'
                : 'bg-rose-950/70 border-rose-400 text-rose-200 font-bold';
            } else if (hasAnswer) {
              badgeStyle = 'bg-amber-400/15 border-amber-400/60 text-amber-200 font-semibold';
            }

            if (isCurrent) {
              badgeStyle += ' ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0d14]';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                title={`Câu ${idx + 1}: ${q.formatLabel}`}
                className={`h-8 min-w-8 px-2 rounded-xl text-xs font-mono font-bold border transition flex items-center justify-center shrink-0 cursor-pointer tabular-nums ${badgeStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. KHU VỰC HIỂN THỊ CÂU HỎI ĐANG CHỌN (1 CÂU RÕ RÀNG) */}
      {currentQuestion && (
        <div className="rounded-3xl border border-amber-500/30 bg-[#121626] p-6 sm:p-7 shadow-xl space-y-6">
          {/* Metadata câu hỏi */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black text-xs tabular-nums">
                {currentIndex + 1}
              </span>
              <span className="text-amber-300 font-bold text-sm">
                {currentQuestion.formatLabel}
              </span>
              <span>·</span>
              <span className="text-emerald-300 font-medium">
                Mức độ: {currentQuestion.cognitiveLevel}
              </span>
              {currentQuestion.sourceRef && (
                <>
                  <span>·</span>
                  <span className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                    <Link2 className="h-3 w-3 text-amber-400" />
                    {currentQuestion.sourceRef}
                  </span>
                </>
              )}
            </div>

            {/* Trạng thái câu hiện tại */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Trạng thái:</span>
              {currentEvaluation.isChecked ? (
                <span
                  className={`inline-flex items-center gap-1 font-black px-2.5 py-0.5 rounded-lg border ${
                    currentEvaluation.isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                  }`}
                >
                  {currentEvaluation.isCorrect ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>ĐÚNG (Chính xác)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-rose-400" />
                      <span>SAI (Chưa chính xác)</span>
                    </>
                  )}
                </span>
              ) : currentAnswer.trim() ? (
                <span className="text-amber-300 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-500/25">
                  Đã trả lời (Chưa kiểm tra)
                </span>
              ) : (
                <span className="text-slate-500">Chưa trả lời</span>
              )}
            </div>
          </div>

          {/* Nội dung câu hỏi */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed text-balance">
              {currentQuestion.question}
            </h3>

            {currentQuestion.formulaContext && (
              <div className="rounded-2xl bg-[#090c14] border border-amber-500/25 p-4 font-mono text-xs sm:text-sm text-amber-300 font-semibold overflow-x-auto">
                ⚗️ {currentQuestion.formulaContext}
              </div>
            )}
          </div>

          {/* 4. Ô TRẢ LỜI / LỰA CHỌN PHÙ HỢP THEO TỪNG DẠNG */}
          <div className="pt-2 space-y-4">
            {/* Dạng 1: Trắc nghiệm 4 lựa chọn (A/B/C/D) */}
            {currentQuestion.format === 'multiple_choice' &&
              currentQuestion.options &&
              currentQuestion.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((optionText, optIdx) => {
                    const isSelected = currentAnswer === optionText;
                    const isChecked = currentEvaluation.isChecked;
                    const isCorrectOpt =
                      optionText.trim().toLowerCase() === currentQuestion.sampleAnswer.trim().toLowerCase() ||
                      currentQuestion.sampleAnswer.trim().toLowerCase().startsWith(optionText.trim().toLowerCase().slice(0, 2));

                    let style =
                      'bg-[#0b0e18] border-white/10 text-slate-200 hover:border-amber-400/50 hover:bg-[#101422]';
                    if (isChecked && isSelected) {
                      style = currentEvaluation.isCorrect
                        ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100 font-bold ring-1 ring-emerald-400'
                        : 'bg-rose-950/70 border-rose-400 text-rose-100 font-bold ring-1 ring-rose-400';
                    } else if (isChecked && isCorrectOpt) {
                      style = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold';
                    } else if (isSelected) {
                      style = 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold shadow-md';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleAnswerChange(currentQuestion.id, optionText, true)}
                        className={`text-left rounded-2xl border p-4 text-xs sm:text-sm transition flex items-start justify-between gap-3 cursor-pointer min-h-[52px] ${style}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs font-bold shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{optionText}</span>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-black shrink-0 mt-0.5">
                            {isChecked ? (currentEvaluation.isCorrect ? '✓ Đúng' : '✗ Sai') : '✓ Đã chọn'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Dạng 2: Nhận định Đúng / Sai */}
            {currentQuestion.format === 'true_false' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                {['Đúng (True)', 'Sai (False)'].map((choice) => {
                  const isSelected = currentAnswer === choice;
                  const isChecked = currentEvaluation.isChecked;

                  let style =
                    'bg-[#0b0e18] border-white/10 text-slate-200 hover:border-amber-400/50';
                  if (isChecked && isSelected) {
                    style = currentEvaluation.isCorrect
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-bold ring-1 ring-emerald-400'
                      : 'bg-rose-950/70 border-rose-400 text-rose-200 font-bold ring-1 ring-rose-400';
                  } else if (isSelected) {
                    style = 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold';
                  }

                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => handleAnswerChange(currentQuestion.id, choice, true)}
                      className={`rounded-2xl border p-4 text-sm sm:text-base font-bold transition flex items-center justify-center gap-2 cursor-pointer min-h-[56px] ${style}`}
                    >
                      <span>{choice}</span>
                      {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dạng 3: Điền từ / công thức ngắn vào chỗ trống [ ... ] */}
            {currentQuestion.format === 'fill_blank' && (
              <div className="space-y-2 max-w-2xl">
                <label className="block text-xs font-bold text-amber-300">
                  Nhập câu trả lời ngắn của em vào ô trống:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCheckCurrentQuestion();
                      }
                    }}
                    placeholder="VD: C3H5(OH)3, 8, Fe2O3, Etyl axetat..."
                    className="flex-1 rounded-2xl bg-[#090c14] border border-amber-500/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleCheckCurrentQuestion}
                    className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm whitespace-nowrap transition cursor-pointer"
                  >
                    Kiểm tra câu này
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Gợi ý: Điền đúng công thức phân tử, hệ số số nguyên hoặc tên gọi ngắn gọn.
                </p>
              </div>
            )}

            {/* Dạng 4: Hỏi - Đáp giải thích ngắn */}
            {currentQuestion.format === 'short_answer' && (
              <div className="space-y-2 max-w-2xl">
                <label className="block text-xs font-bold text-amber-300">
                  Viết câu trả lời ngắn của em (1 - 2 câu):
                </label>
                <textarea
                  rows={3}
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Gõ ngắn gọn bản chất hiện tượng hoặc phương pháp nhận biết trước khi đối chiếu đáp án..."
                  className="w-full rounded-2xl bg-[#090c14] border border-amber-500/30 p-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* 5. NÚT KIỂM TRA KẾT QUẢ VÀ NÚT CHUYỂN CÂU */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="btn-check-current-question"
                onClick={handleCheckCurrentQuestion}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-md"
              >
                Kiểm tra kết quả câu này
              </button>

              <button
                type="button"
                onClick={() => {
                  setEvaluationsByQuestionId((prev) => ({
                    ...prev,
                    [currentQuestion.id]: {
                      isChecked: !currentEvaluation.isChecked,
                      isCorrect: currentEvaluation.isCorrect,
                    },
                  }));
                }}
                className="px-3 py-2 rounded-xl bg-[#181f32] hover:bg-[#202942] text-slate-300 hover:text-amber-300 border border-white/10 text-xs font-semibold transition cursor-pointer"
              >
                {currentEvaluation.isChecked ? 'Ẩn lời giải' : 'Xem lời giải mẫu'}
              </button>
            </div>

            {/* Stepper trước / sau */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#14192b] hover:bg-[#1b223a] text-slate-300 hover:text-white border border-white/10 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Câu trước</span>
              </button>

              <button
                type="button"
                disabled={currentIndex >= activeQuestionList.length - 1}
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(activeQuestionList.length - 1, prev + 1))
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 6. PHẢN HỒI KẾT QUẢ SAU MỖI CÂU: ĐÚNG/SAI RÕ RÀNG + GỢI Ý NGẮN ĐỂ ÔN LẠI */}
          {currentEvaluation.isChecked && (
            <div
              className={`rounded-2xl p-4 sm:p-5 border space-y-3.5 transition-all ${
                currentEvaluation.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-400/60 text-emerald-100'
                  : 'bg-rose-950/40 border-rose-400/60 text-rose-100'
              }`}
            >
              {/* Tiêu đề Đúng / Sai */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {currentEvaluation.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  )}
                  <span className="font-black text-sm sm:text-base">
                    {currentEvaluation.isCorrect
                      ? '✓ Bạn đã trả lời ĐÚNG!'
                      : '✗ Bạn đã trả lời CHƯA CHÍNH XÁC! Hãy xem gợi ý ôn lại bên dưới.'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold">
                  Câu #{currentIndex + 1}
                </span>
              </div>

              {/* GỢI Ý NGẮN ĐỂ ÔN LẠI (QUICK REVIEW TIP) */}
              <div className="rounded-xl p-3.5 bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
                <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-black text-amber-300 block">
                    Gợi ý ngắn để ôn lại:
                  </span>
                  <p className="leading-relaxed">
                    {getQuestionReviewTip(currentQuestion)}
                  </p>
                </div>
              </div>

              {/* So sánh câu trả lời & Lời giải */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs sm:text-sm">
                <div>
                  <strong className="text-amber-300">Đáp án chuẩn: </strong>
                  <span className="font-semibold text-white">{currentQuestion.sampleAnswer}</span>
                </div>
                {currentAnswer && (
                  <div className="text-slate-300">
                    <strong>Câu trả lời của em: </strong>
                    <span className="italic">{currentAnswer}</span>
                  </div>
                )}
                <div className="text-slate-200 leading-relaxed pt-1">
                  <strong className="text-emerald-300">Giải thích chi tiết: </strong>
                  {currentQuestion.explanation}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. BẢNG KẾT QUẢ SAU MỖI LƯỢT QUIZ (CHI TIẾT, ĐÚNG SỐ CÂU ĐÚNG / TỔNG SỐ CÂU, TỰ HỌC TIỆN LỢI) */}
      {isQuizSubmitted && (
        <div
          id="quiz-turn-summary-report"
          className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#12182b] via-[#161c32] to-[#121626] p-6 sm:p-7 shadow-2xl space-y-6"
        >
          {/* Header Bảng kết quả */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black text-xl shadow-lg">
                <ListChecks className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Kết Quả Lượt Luyện Tập (Quiz Turn Summary)
                </h3>
                <p className="text-xs text-slate-300">
                  Phản ánh chính xác kết quả từng câu theo đúng bài làm của học sinh
                </p>
              </div>
            </div>

            {/* Chỉ số lớn: Số câu đúng / Tổng số câu & Tỷ lệ */}
            <div className="flex items-center gap-3 text-center self-start sm:self-auto">
              <div className="bg-[#0b0e18] px-4 py-3 rounded-2xl border border-emerald-500/35">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tabular-nums">
                  {correctCount} / {totalQuestions}
                </div>
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  Số câu đúng
                </div>
              </div>
              <div className="bg-[#0b0e18] px-4 py-3 rounded-2xl border border-amber-500/35">
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums">
                  {scorePercentage}%
                </div>
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Độ chính xác
                </div>
              </div>
            </div>
          </div>

          {/* Phân bổ kết quả theo 3 nhóm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{correctCount} câu trả lời đúng</span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                Kiến thức phần này đã nắm vững.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>{incorrectCount} câu trả lời chưa đúng</span>
              </div>
              <p className="text-[11px] text-rose-300/80">
                Hãy đọc kỹ gợi ý ôn lại bên dưới từng câu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1322] border border-white/10 text-slate-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-slate-200">
                <HelpCircle className="h-4 w-4 text-amber-400" />
                <span>{unansweredCount} câu chưa làm</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Có thể chọn câu để làm tiếp hoặc ôn lại.
              </p>
            </div>
          </div>

          {/* Bộ lọc xem lại danh sách câu hỏi trong lượt */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Xem danh sách:</span>
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#121626] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                Tất cả ({totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('incorrect')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  reviewFilter === 'incorrect'
                    ? 'bg-rose-500 text-white font-black'
                    : 'bg-[#121626] text-rose-300 hover:text-rose-200 border border-rose-500/25'
                }`}
              >
                Chỉ câu sai ({incorrectCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('correct')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  reviewFilter === 'correct'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-[#121626] text-emerald-300 hover:text-emerald-200 border border-emerald-500/25'
                }`}
              >
                Câu đúng ({correctCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetQuiz}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                Làm lại toàn bộ lượt này
              </button>
            </div>
          </div>

          {/* DANH SÁCH CHI TIẾT TỪNG CÂU KÈM GỢI Ý ÔN LẠI */}
          <div className="space-y-3 pt-1">
            {filteredReviewQuestions.map((q) => {
              const evalState = evaluationsByQuestionId[q.id];
              const ans = answersByQuestionId[q.id] || '';
              const isCorrect = evalState?.isCorrect;
              const hasDone = evalState?.isChecked;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-4 sm:p-5 space-y-3 transition ${
                    !hasDone
                      ? 'bg-[#0f1322] border-white/10'
                      : isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/35'
                      : 'bg-rose-950/20 border-rose-500/35'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">
                        Câu #{q.order}
                      </span>
                      <span>·</span>
                      <span className="text-slate-300 font-semibold">{q.formatLabel}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasDone && ans.trim() ? (
                        <span
                          className={`font-black px-2 py-0.5 rounded-md text-xs inline-flex items-center gap-1 ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Đúng</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Chưa đúng</span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md text-xs font-semibold inline-flex items-center gap-1">
                          <HelpCircle className="h-3 w-3 text-amber-400" />
                          <span>Chưa làm</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const idx = activeQuestionList.findIndex((item) => item.id === q.id);
                          if (idx !== -1) {
                            setCurrentIndex(idx);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
                      >
                        Chuyển đến câu này
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                    {q.question}
                  </p>

                  {/* Hiển thị so sánh đáp án */}
                  <div className="text-xs space-y-1 bg-[#090c14] p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-slate-400">Câu trả lời của em: </span>
                      <strong className={ans ? (isCorrect ? 'text-emerald-300' : 'text-rose-300') : 'text-slate-500 italic'}>
                        {ans || '(Chưa điền câu trả lời)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Đáp án chuẩn: </span>
                      <strong className="text-amber-300">{q.sampleAnswer}</strong>
                    </div>
                  </div>

                  {/* GỢI Ý NGẮN ÔN LẠI TRỰC DIỆN */}
                  <div className="rounded-xl p-3 bg-amber-400/10 border border-amber-400/25 text-amber-200 text-xs flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-amber-300 block">
                        Gợi ý ngắn để ôn lại:
                      </span>
                      <p className="leading-relaxed">
                        {getQuestionReviewTip(q)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
