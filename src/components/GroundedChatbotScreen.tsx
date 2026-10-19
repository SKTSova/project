import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
  Link2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileText,
  Layers,
  HelpCircle as QuestionIcon,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import {
  StudyMaterialItem,
  GeneratedStudyPack,
  GroundedChatMessage,
} from '../types';
import { askGroundedChatbot } from '../data/groundedChatEngine';
import { loadStudyMaterials, loadStudyPacks } from '../utils/storage';
import { STUDY_TOPIC_OPTIONS } from '../data/materialsData';

interface GroundedChatbotScreenProps {
  materials?: StudyMaterialItem[];
  studyPacks?: GeneratedStudyPack[];
  activePackId?: string;
  onNavigateToStudyPack?: () => void;
  onNavigateToMaterials?: () => void;
}

const CHAT_HISTORY_STORAGE_KEY = 'sciencequiz_grounded_chat_history_v2';

export const GroundedChatbotScreen: React.FC<GroundedChatbotScreenProps> = ({
  materials: propMaterials,
  studyPacks: propStudyPacks,
  activePackId: propActivePackId,
  onNavigateToStudyPack,
  onNavigateToMaterials,
}) => {
  const materials = useMemo(() => {
    return propMaterials && propMaterials.length > 0 ? propMaterials : loadStudyMaterials();
  }, [propMaterials]);

  const studyPacks = useMemo(() => {
    return propStudyPacks && propStudyPacks.length > 0 ? propStudyPacks : loadStudyPacks();
  }, [propStudyPacks]);

  // Chọn chủ đề học tập hiện tại để Grounding
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    if (propActivePackId) {
      const p = studyPacks.find((item) => item.id === propActivePackId);
      if (p) return p.topicId;
    }
    return materials[0]?.topicId || studyPacks[0]?.topicId || 'topic-este-lipit';
  });

  // Tìm Study Pack tương ứng với chủ đề đã chọn
  const activeStudyPack = useMemo(() => {
    return (
      studyPacks.find((p) => p.topicId === selectedTopicId) ||
      studyPacks.find((p) => p.id === propActivePackId) ||
      studyPacks[0] ||
      null
    );
  }, [studyPacks, selectedTopicId, propActivePackId]);

  // Lọc danh sách học liệu thuộc chủ đề hiện tại
  const topicMaterials = useMemo(() => {
    const list = materials.filter((m) => m.topicId === selectedTopicId);
    return list.length > 0 ? list : materials;
  }, [materials, selectedTopicId]);

  const currentTopicObj =
    STUDY_TOPIC_OPTIONS.find((t) => t.id === selectedTopicId) ||
    { id: selectedTopicId, title: activeStudyPack?.topicTitle || 'Chủ đề hiện tại', grade: 'Lớp 7 - 12' };

  // Khởi tạo lịch sử chat từ LocalStorage hoặc tin nhắn chào mừng mặc định
  const [messages, setMessages] = useState<GroundedChatMessage[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`${CHAT_HISTORY_STORAGE_KEY}_${selectedTopicId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }

    return [
      {
        id: 'msg-welcome-0',
        sender: 'assistant',
        text: `Chào em! Thầy/cô là Trợ lý Học tập Grounded AI cho chủ đề "${currentTopicObj.title}".\n\nThầy/cô sẽ đồng hành cùng em ôn tập, giải thích hiện tượng, đối chiếu phản ứng và giải đáp các câu hỏi trong phạm vi học liệu đã cung cấp. Nếu câu hỏi nằm ngoài tài liệu, thầy/cô sẽ thông báo rõ để em tập trung đúng trọng tâm bài học nhé!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isOutOfScope: false,
        citedSources: ['Học liệu gốc đã nạp', 'Màn hình AI đã hiểu gì', 'Study Pack hiện tại'],
        suggestedFollowUps: activeStudyPack?.qaSeeds?.slice(0, 3).map((s) => s.studentQuestion) || [
          'Giải thích cơ chế và hiện tượng của phản ứng chính?',
          'Làm sao phân biệt các chất trong bài kiểm tra?',
        ],
      },
    ];
  });

  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Tự động lưu lịch sử theo chủ đề vào LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        `${CHAT_HISTORY_STORAGE_KEY}_${selectedTopicId}`,
        JSON.stringify(messages)
      );
    } catch {
      // ignore
    }
  }, [messages, selectedTopicId]);

  // Khi đổi chủ đề, nạp lịch sử tương ứng hoặc reset tin nhắn chào mừng
  const handleTopicChange = (newTopicId: string) => {
    setSelectedTopicId(newTopicId);
    try {
      const raw = localStorage.getItem(`${CHAT_HISTORY_STORAGE_KEY}_${newTopicId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    const targetTopicObj =
      STUDY_TOPIC_OPTIONS.find((t) => t.id === newTopicId) || { title: 'Chủ đề mới' };
    const matchedPack = studyPacks.find((p) => p.topicId === newTopicId);

    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Đã chuyển sang chủ đề "${targetTopicObj.title}". Thầy/cô đã sẵn sàng giải đáp và hỗ trợ em ôn bài dựa trên tài liệu học liệu và Study Pack của chủ đề này!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isOutOfScope: false,
        citedSources: ['Tài liệu chủ đề: ' + targetTopicObj.title],
        suggestedFollowUps: matchedPack?.qaSeeds?.slice(0, 3).map((s) => s.studentQuestion) || [
          'Khái niệm cốt lõi của bài này là gì?',
          'Các công thức và lưu ý quan trọng cần nhớ?',
        ],
      },
    ]);
  };

  // Gửi câu hỏi
  const handleSendMessage = async (textToSend?: string) => {
    const questionText = (textToSend || inputQuestion).trim();
    if (!questionText || isSending) return;

    const userMsg: GroundedChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsSending(true);

    try {
      const response = await askGroundedChatbot(
        questionText,
        currentTopicObj.title,
        topicMaterials,
        activeStudyPack,
        [...messages, userMsg]
      );

      const botMsg: GroundedChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isOutOfScope: response.isOutOfScope,
        citedSources: response.citedSources,
        suggestedFollowUps: response.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: GroundedChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp hoặc đường truyền đang bị gián đoạn. Em hãy đặt câu hỏi liên quan đến kiến thức đã học trong tài liệu nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isOutOfScope: true,
        citedSources: [],
        suggestedFollowUps: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // Xóa lịch sử đối thoại
  const handleClearHistory = () => {
    const defaultWelcome: GroundedChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'assistant',
      text: `Đã làm mới cuộc hội thoại ôn bài cho chủ đề "${currentTopicObj.title}". Em có thể đặt câu hỏi hoặc chọn các câu hỏi gợi ý bên dưới để ôn tập nhé!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOutOfScope: false,
      citedSources: ['Học liệu gốc', 'Study Pack hiện tại'],
      suggestedFollowUps: activeStudyPack?.qaSeeds?.slice(0, 3).map((s) => s.studentQuestion) || [],
    };
    setMessages([defaultWelcome]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${CHAT_HISTORY_STORAGE_KEY}_${selectedTopicId}`);
      } catch {
        // ignore
      }
    }
  };

  // Danh sách các câu hỏi gợi ý nhanh lấy từ Q&A Seeds & Practice Questions của Study Pack
  const quickQuestions = useMemo(() => {
    const list: string[] = [];
    if (activeStudyPack?.qaSeeds) {
      activeStudyPack.qaSeeds.forEach((s) => list.push(s.studentQuestion));
    }
    if (activeStudyPack?.practiceQuestions) {
      activeStudyPack.practiceQuestions.slice(0, 2).forEach((q) => {
        list.push(`Làm sao giải quyết câu hỏi: "${q.question.slice(0, 60)}..."?`);
      });
    }
    return list.slice(0, 4);
  }, [activeStudyPack]);

  return (
    <div id="grounded-chatbot-container" className="space-y-5">
      {/* 1. HEADER CHỦ ĐỀ HIỆN TẠI & PHẠM VI GROUNDING MINH BẠCH */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#101424] via-[#14182b] to-[#10131e] p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-bold uppercase tracking-wider">
              <Bot className="h-4 w-4 text-amber-400" />
              <span>Trợ Lý Ôn Bài Grounded AI • Bám Sát Tài Liệu</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-300 flex items-center gap-1 font-semibold normal-case">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Chỉ trả lời trong phạm vi học liệu đã cung cấp
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Gia Sư Ảo Đồng Hành: Ôn Tập & Đào Sâu Bản Chất Kiến Thức
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Trợ lý được cố định chặt chẽ (Grounded) trên 3 nguồn dữ liệu:{' '}
              <strong className="text-amber-300">Sources (Học liệu gốc)</strong>,{' '}
              <strong className="text-emerald-300">Analysis Preview (AI đã hiểu gì)</strong> và{' '}
              <strong className="text-amber-200">Study Pack (Ý chính, Flashcard, Câu hỏi, Q&A Seeds)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161a2c] hover:bg-[#202740] text-slate-300 hover:text-amber-300 border border-white/10 text-xs font-semibold transition cursor-pointer"
              title="Xóa lịch sử và bắt đầu cuộc đối thoại mới"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Làm mới hội thoại</span>
            </button>
          </div>
        </div>

        {/* Thanh chọn Chủ đề ôn tập & Thống kê 3 nguồn Grounding */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 space-y-1">
            <label htmlFor="grounded-topic-select" className="block text-xs font-bold text-slate-300">
              Chủ đề học tập hiện tại đang ôn:
            </label>
            <select
              id="grounded-topic-select"
              value={selectedTopicId}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3.5 py-2 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {STUDY_TOPIC_OPTIONS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title} ({topic.grade})
                </option>
              ))}
            </select>
          </div>

          {/* 3 Thẻ nguồn Grounded minh bạch */}
          <div className="md:col-span-7 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-[#0b0e18] border border-white/10 flex flex-col justify-center">
              <span className="text-amber-400 font-bold font-mono text-sm">
                {topicMaterials.length}
              </span>
              <span className="text-[11px] text-slate-400">1. Học liệu gốc</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0b0e18] border border-emerald-500/25 flex flex-col justify-center">
              <span className="text-emerald-400 font-bold font-mono text-sm">
                {activeStudyPack?.summary?.aiDetectedConcepts?.length || 5}
              </span>
              <span className="text-[11px] text-slate-400">2. Khái niệm sơ bộ</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0b0e18] border border-amber-500/25 flex flex-col justify-center">
              <span className="text-amber-300 font-bold font-mono text-sm">
                {(activeStudyPack?.keyPoints?.length || 0) + (activeStudyPack?.flashcards?.length || 0) + (activeStudyPack?.practiceQuestions?.length || 0)}
              </span>
              <span className="text-[11px] text-slate-400">3. Mục Study Pack</span>
            </div>
          </div>
        </div>

        {/* Thông báo quy định phạm vi nghiêm ngặt */}
        <div className="rounded-2xl bg-amber-400/10 border border-amber-400/30 p-3 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold text-amber-300">Quy tắc giới hạn phạm vi bắt buộc:</span>
            <p>
              Nếu câu hỏi không có trong tài liệu hoặc không suy ra được từ tài liệu đã nạp, Trợ lý sẽ trả lời chính xác:{' '}
              <strong className="text-white bg-black/40 px-1.5 py-0.5 rounded border border-amber-400/40">
                “Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp.”
              </strong>{' '}
              để đảm bảo không bị lan man hay sai lệch bài học.
            </p>
          </div>
        </div>
      </div>

      {/* 2. KHUNG HỘI THOẠI & LỊCH SỬ HỎI ĐÁP */}
      <div className="rounded-3xl border border-white/10 bg-[#0d101a] shadow-2xl flex flex-col h-[560px] sm:h-[620px] overflow-hidden">
        {/* VÙNG HIỂN THỊ LỊCH SỬ TIN NHẮN */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-md ${
                    isUser
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}
                >
                  {isUser ? 'Em' : <Bot className="h-5 w-5" />}
                </div>

                {/* Bong bóng tin nhắn */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 space-y-2.5 ${
                    isUser
                      ? 'bg-amber-400/15 border border-amber-400/40 text-amber-100 rounded-tr-sm'
                      : msg.isOutOfScope
                      ? 'bg-rose-950/30 border border-rose-500/40 text-rose-100 rounded-tl-sm'
                      : 'bg-[#14192b] border border-white/10 text-slate-100 rounded-tl-sm'
                  }`}
                >
                  {/* Header tin nhắn */}
                  <div className="flex items-center justify-between gap-2 text-[11px] pb-1 border-b border-white/5">
                    <span className="font-bold">
                      {isUser ? 'Câu hỏi của học sinh' : 'Trợ lý Học tập Grounded AI'}
                    </span>
                    <span className="text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Nhãn Ngoài phạm vi hoặc Đã kiểm chứng */}
                  {!isUser && (
                    <div className="pt-0.5">
                      {msg.isOutOfScope ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/35">
                          <AlertCircle className="h-3 w-3" />
                          <span>Ngoài phạm vi tài liệu đã cung cấp</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/35">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Đã đối chiếu & trích dẫn từ tài liệu</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Nội dung câu trả lời */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-balance">
                    {msg.text}
                  </div>

                  {/* Căn cứ trích dẫn nguồn (Cited Sources) */}
                  {!isUser && msg.citedSources && msg.citedSources.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                      <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        <span>Căn cứ trích dẫn từ tài liệu:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citedSources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-[#0b0e18] px-2.5 py-1 rounded-lg border border-amber-500/25 text-[11px] text-slate-300 font-mono"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Câu hỏi gợi mở ôn tập tiếp theo */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>Gợi ý đào sâu kiến thức tiếp theo:</span>
                      </div>
                      <div className="space-y-1">
                        {msg.suggestedFollowUps.map((promptText, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSendMessage(promptText)}
                            className="w-full text-left p-2 rounded-xl bg-[#090d16] hover:bg-[#121829] border border-emerald-500/20 text-slate-300 hover:text-white text-xs transition flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="line-clamp-2">💬 {promptText}</span>
                            <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isSending && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-md">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div className="rounded-3xl rounded-tl-sm p-4 bg-[#14192b] border border-white/10 text-slate-300 text-xs flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
                <span>Đang đối chiếu tài liệu & soạn câu trả lời ôn bài...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* THANH GỢI Ý CÂU HỎI NHANH (QUICK SEED PROMPTS) */}
        {quickQuestions.length > 0 && (
          <div className="bg-[#0b0e18] border-t border-white/10 p-2.5 sm:px-4 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] text-amber-300 font-bold shrink-0 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              <span>Hỏi nhanh:</span>
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isSending}
                className="bg-[#121626] hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-white/10 px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs font-semibold shrink-0 disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* 3. KHUNG NHẬP CÂU HỎI (INPUT AREA) */}
        <div className="border-t border-amber-500/30 bg-[#0f1322] p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isSending}
              placeholder={`Đặt câu hỏi về "${currentTopicObj.title}" trong phạm vi tài liệu...`}
              className="flex-1 rounded-2xl bg-[#090c14] border border-amber-500/30 px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputQuestion.trim() || isSending}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md"
            >
              <span>Gửi</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 px-1">
            <span>Nhấn Enter để gửi câu hỏi · Chỉ hỏi nội dung có trong tài liệu học</span>
            <span className="text-amber-400 font-semibold">Tự động lưu lịch sử hội thoại</span>
          </div>
        </div>
      </div>
    </div>
  );
};
