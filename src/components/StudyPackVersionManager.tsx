import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  AlertCircle,
  Eye,
  Key,
  Check,
} from 'lucide-react';
import { GeneratedStudyPack } from '../types';

interface StudyPackVersionManagerProps {
  studyPacks: GeneratedStudyPack[];
  activePackId: string;
  onSelectPackId: (id: string) => void;
  onDeletePack: (id: string) => void;
  onRegeneratePack: () => void;
  isRegenerating: boolean;
  activeTopicId?: string;
  localApiKey?: string;
  onUpdateLocalApiKey?: (key: string) => void;
  onOpenKeySettings?: () => void;
}

export const StudyPackVersionManager: React.FC<StudyPackVersionManagerProps> = ({
  studyPacks,
  activePackId,
  onSelectPackId,
  onDeletePack,
  onRegeneratePack,
  isRegenerating,
  activeTopicId,
  localApiKey = '',
  onUpdateLocalApiKey,
  onOpenKeySettings,
}) => {
  // Lọc theo chủ đề hiện tại hoặc xem tất cả
  const [filterScope, setFilterScope] = useState<'current_topic' | 'all'>('current_topic');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);
  const [tempKeyInput, setTempKeyInput] = useState<string>(localApiKey);

  const activePack = studyPacks.find((p) => p.id === activePackId) || studyPacks[0];
  const targetTopicId = activeTopicId || activePack?.topicId;

  // Lọc danh sách packs
  const filteredPacks = filterScope === 'current_topic' && targetTopicId
    ? studyPacks.filter((p) => p.topicId === targetTopicId)
    : studyPacks;

  // Sắp xếp version: Mới nhất lên đầu
  const sortedPacks = [...filteredPacks].sort((a, b) => {
    const timeA = a.createdAtTimestamp || (a.versionNumber ? a.versionNumber * 100000 : 0);
    const timeB = b.createdAtTimestamp || (b.versionNumber ? b.versionNumber * 100000 : 0);
    return timeB - timeA;
  });

  const newestPackId = sortedPacks[0]?.id;

  const handleDelete = (id: string) => {
    if (studyPacks.length <= 1) {
      alert('Không thể xóa version duy nhất còn lại của ứng dụng.');
      return;
    }
    onDeletePack(id);
    setDeletingId(null);
  };

  return (
    <div
      id="study-pack-version-manager-panel"
      className="rounded-3xl border border-amber-500/35 bg-gradient-to-br from-[#101424] via-[#14182c] to-[#10131e] p-5 sm:p-6 shadow-xl space-y-4"
    >
      {/* 1. HEADER KHU VỰC QUẢN LÝ VERSION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Layers className="h-4 w-4 text-amber-400" />
            <span>Khu Vực Quản Lý Version (Lịch Sử Tái Sinh & Cũ / Mới)</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-300 font-semibold normal-case">
              {sortedPacks.length} phiên bản
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Danh Sách Các Phiên Bản Của Chủ Đề: <span className="text-amber-300">{activePack?.topicTitle || 'Hóa học'}</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Mỗi lần Re-generate sẽ tự động tạo một version mới (làm mới Summary, Quiz, Flashcard, Q&A) mà{' '}
            <strong className="text-emerald-300">không làm mất học liệu nguồn ban đầu</strong>. Học sinh có thể mở lại version cũ bất cứ lúc nào để so sánh hoặc học tiếp.
          </p>
        </div>

        {/* NÚT THAO TÁC RE-GENERATE & PHẠM VI XEM */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
          <div className="flex items-center rounded-xl bg-[#090c14] border border-white/10 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterScope('current_topic')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterScope === 'current_topic'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chủ đề này ({studyPacks.filter((p) => p.topicId === targetTopicId).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({studyPacks.length})
            </button>
          </div>

          {(onOpenKeySettings || onUpdateLocalApiKey) && (
            <button
              type="button"
              onClick={() => {
                if (onOpenKeySettings) {
                  onOpenKeySettings();
                } else {
                  setShowKeyConfig((prev) => !prev);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                localApiKey
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#090c14] text-slate-400 hover:text-white border-white/10'
              }`}
              title="Cài đặt Gemini API key local-only (Round 5 • Chỉ lưu trên trình duyệt này)"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>{localApiKey ? 'Key: Local Đã Lưu' : 'Cài Key Local (Round 5)'}</span>
            </button>
          )}

          <button
            type="button"
            id="btn-trigger-regenerate-study-pack"
            disabled={isRegenerating}
            onClick={onRegeneratePack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-98 whitespace-nowrap"
            title="Làm mới Summary, Quiz, Flashcard, Q&A từ nguồn học liệu gốc và tạo version mới"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>
              {isRegenerating ? 'Đang Re-generate...' : '🔄 Re-generate Version Mới'}
            </span>
          </button>
        </div>
      </div>

      {/* DRAWER CẤU HÌNH GEMINI API KEY LOCAL-ONLY NẾU HỌC SINH MỞ */}
      {showKeyConfig && onUpdateLocalApiKey && (
        <div className="rounded-2xl bg-[#090c15] border border-amber-500/30 p-4 space-y-2.5 text-xs animate-in fade-in">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-amber-400" />
              Gemini API Key Local-Only (Lưu trữ cục bộ trên trình duyệt, không gửi ra ngoài):
            </span>
            <span className="text-slate-400 text-[11px]">
              Tùy chọn • Nếu để trống, hệ thống sẽ tự động dùng cấu hình chuẩn của server
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
              placeholder="Dán AI Studio Gemini API Key của bạn (AIzaSy...)"
              className="flex-1 rounded-xl bg-[#121626] border border-white/15 px-3.5 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => {
                onUpdateLocalApiKey(tempKeyInput.trim());
                setShowKeyConfig(false);
              }}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              Lưu Key Local
            </button>
            {localApiKey && (
              <button
                type="button"
                onClick={() => {
                  setTempKeyInput('');
                  onUpdateLocalApiKey('');
                }}
                className="px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              >
                Xóa Key
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. DANH SÁCH CÁC VERSION (DỄ NHẬN BIẾT CŨ/MỚI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sortedPacks.map((pack, idx) => {
          const isActive = pack.id === activePackId;
          const isNewest = pack.id === newestPackId;
          const isConfirmingDelete = deletingId === pack.id;
          const versionNum = pack.versionNumber || (sortedPacks.length - idx);

          return (
            <div
              key={pack.id}
              className={`rounded-2xl border p-4 transition space-y-3 flex flex-col justify-between relative ${
                isActive
                  ? 'border-amber-400 bg-gradient-to-br from-[#171e33] to-[#131728] shadow-[0_0_25px_rgba(245,192,66,0.15)] ring-1 ring-amber-400/40'
                  : 'border-white/10 bg-[#0d101b] hover:border-amber-500/30'
              }`}
            >
              <div className="space-y-2">
                {/* Header card version: Badges */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-black font-mono border ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-white/5 text-amber-300 border-white/10'
                      }`}
                    >
                      v{versionNum}
                    </span>

                    {isNewest ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">
                        Mới nhất
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 text-slate-400">
                        Phiên bản cũ
                      </span>
                    )}

                    {pack.generationMethod === 'gemini-ai' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-sky-300 bg-sky-950/40 border border-sky-500/30">
                        AI Re-gen
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400">
                        Bản chuẩn
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                      <CheckCircle2 className="h-3 w-3 text-amber-400" />
                      <span>Đang học</span>
                    </span>
                  )}
                </div>

                {/* Tiêu đề version */}
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                  {pack.title}
                </h4>

                {/* Thời gian tạo & nguồn gốc */}
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                    <span className="truncate">{pack.generatedAt || 'Ban đầu'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <FileText className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>Nguồn gốc: {pack.sourceMaterialIds?.length || 2} học liệu ban đầu (giữ nguyên)</span>
                  </div>
                </div>

                {/* Thống kê 4 thành phần nội dung làm mới */}
                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/5 text-[11px] text-slate-300 text-center font-mono">
                  <div className="bg-[#080b12] p-1 rounded-lg">
                    <span className="text-amber-400 font-bold">{pack.keyPoints?.length || 0}</span> Ý chính
                  </div>
                  <div className="bg-[#080b12] p-1 rounded-lg">
                    <span className="text-sky-400 font-bold">{pack.flashcards?.length || 0}</span> Thẻ
                  </div>
                  <div className="bg-[#080b12] p-1 rounded-lg">
                    <span className="text-emerald-400 font-bold">{pack.practiceQuestions?.length || 0}</span> Câu hỏi
                  </div>
                </div>
              </div>

              {/* Nút hành động: Mở & Xóa */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 p-1 rounded-xl w-full justify-between">
                    <span className="text-[11px] text-rose-300 px-1 font-medium">Xác nhận xóa?</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(pack.id)}
                        className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition cursor-pointer"
                      >
                        Xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-0.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-[11px] transition cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={studyPacks.length <= 1}
                      onClick={() => setDeletingId(pack.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition cursor-pointer disabled:opacity-20"
                      title="Xóa version này"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {isActive ? (
                      <span className="text-[11px] font-bold text-amber-300/80 px-2 py-1">
                        ✓ Version đang hiển thị
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectPackId(pack.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#141b2e] hover:bg-amber-400 hover:text-slate-950 text-slate-200 border border-amber-500/30 text-xs font-bold transition cursor-pointer active:scale-98"
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        <span>Mở version này</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
