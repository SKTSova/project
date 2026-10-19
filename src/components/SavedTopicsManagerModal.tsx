import React, { useState } from 'react';
import {
  X,
  Save,
  FolderOpen,
  Edit2,
  Trash2,
  Check,
  Calendar,
  Layers,
  BookOpen,
  HelpCircle,
  FileText,
  Sparkles,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  Database,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import {
  StudyMaterialItem,
  GeneratedStudyPack,
  StudyTopicSnapshot,
} from '../types';

interface SavedTopicsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMaterials: StudyMaterialItem[];
  currentStudyPack: GeneratedStudyPack | null;
  onSaveCurrentSnapshot: (customShortName?: string, customNote?: string) => void;
  onRestoreSnapshot: (snapshot: StudyTopicSnapshot) => void;
  savedSnapshots: StudyTopicSnapshot[];
  onUpdateSnapshots: (snapshots: StudyTopicSnapshot[]) => void;
  onResetDefaultSnapshots?: () => void;
}

export const SavedTopicsManagerModal: React.FC<SavedTopicsManagerModalProps> = ({
  isOpen,
  onClose,
  currentMaterials,
  currentStudyPack,
  onSaveCurrentSnapshot,
  onRestoreSnapshot,
  savedSnapshots,
  onUpdateSnapshots,
  onResetDefaultSnapshots,
}) => {
  // Input tạo mới tên ngắn
  const [newShortName, setNewShortName] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // State chỉnh sửa tên ngắn inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // State xác nhận xóa
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Hỗ trợ phím Escape đóng modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultSuggestedName =
    currentStudyPack?.topicTitle ||
    currentMaterials[0]?.topicTitle ||
    'Chủ đề ôn tập mới';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newShortName.trim() || defaultSuggestedName;
    onSaveCurrentSnapshot(finalName);
    setNewShortName('');
    setSaveSuccessMsg(`Đã lưu thành công snapshot working copy "${finalName}"!`);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  const startEditing = (snapshot: StudyTopicSnapshot) => {
    setEditingId(snapshot.id);
    setEditingName(snapshot.shortName);
  };

  const handleSaveRename = (id: string) => {
    if (!editingName.trim()) return;
    const updated = savedSnapshots.map((item) =>
      item.id === id ? { ...item, shortName: editingName.trim() } : item
    );
    onUpdateSnapshots(updated);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updated = savedSnapshots.filter((item) => item.id !== id);
    onUpdateSnapshots(updated);
    setDeletingId(null);
  };

  return (
    <div
      id="saved-topics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="saved-topics-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-amber-500/40 bg-[#0d101a] shadow-[0_0_50px_rgba(245,192,66,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-amber-500/20 bg-gradient-to-r from-[#121626] via-[#161a2e] to-[#121626]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-rose-600 to-amber-600 text-slate-950 font-black shadow-lg shadow-rose-950/40 border border-amber-300/40 text-xl">
              💾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Quản Lý Môn Học & Bộ Ôn Tập Đã Lưu
                </h3>
                <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
                  Snapshot v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Lưu đầy đủ snapshot working copy hiện tại (Học liệu, Phân tích AI, Study Pack) · Mở là khôi phục tức thì
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. KHUNG LƯU CHỦ ĐỀ HIỆN TẠI (SAVE WORKING COPY SNAPSHOT) */}
          <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-br from-[#121727] via-[#151c30] to-[#111422] p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Save className="h-4 w-4 text-amber-400" />
                <span>Lưu chủ đề / môn học đang ôn tập hiện tại</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Database className="h-3 w-3" />
                Lưu trọn vẹn snapshot working copy (không chỉ lưu tên)
              </span>
            </div>

            {/* Chi tiết nội dung working copy chuẩn bị lưu */}
            <div className="rounded-xl bg-[#090c14] border border-white/10 p-3.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-slate-400 block text-[11px]">Chủ đề & Môn:</span>
                <strong className="text-white truncate block mt-0.5">
                  {currentStudyPack?.topicTitle || 'Este - Lipit'}
                </strong>
                <span className="text-amber-300 text-[11px]">
                  ({currentStudyPack?.gradeLevel || 'Lớp 12'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">1. Học liệu gốc:</span>
                <strong className="text-emerald-300 block mt-0.5">
                  {currentMaterials.length} nguồn văn bản/ảnh
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">2. Ý chính & PTHH:</span>
                <strong className="text-amber-300 block mt-0.5">
                  {currentStudyPack?.keyPoints?.length || 0} mục trọng tâm
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">3. Flashcard & Câu hỏi:</span>
                <strong className="text-sky-300 block mt-0.5">
                  {currentStudyPack?.flashcards?.length || 0} thẻ · {currentStudyPack?.practiceQuestions?.length || 0} câu
                </strong>
              </div>
            </div>

            {/* Form đặt tên ngắn và bấm Lưu */}
            <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={newShortName}
                  onChange={(e) => setNewShortName(e.target.value)}
                  placeholder={`Đặt tên ngắn (ví dụ: "${defaultSuggestedName}")...`}
                  className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-semibold"
                />
              </div>

              <button
                type="submit"
                id="btn-save-topic-snapshot-action"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/20 whitespace-nowrap active:scale-98"
              >
                <Save className="h-4 w-4" />
                <span>Lưu chủ đề này</span>
              </button>
            </form>

            {saveSuccessMsg && (
              <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-2.5 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* 2. DANH SÁCH CÁC BỘ ÔN TẬP / MÔN ĐÃ LƯU */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FolderOpen className="h-4 w-4 text-amber-400" />
                  <span>Danh sách môn & bộ ôn tập đã lưu ({savedSnapshots.length})</span>
                </h4>
                <span className="text-xs text-slate-400">
                  (Mở lại trang vẫn còn nguyên vẹn)
                </span>
              </div>

              {onResetDefaultSnapshots && (
                <button
                  type="button"
                  onClick={onResetDefaultSnapshots}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-300 transition cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Khôi phục các môn mẫu</span>
                </button>
              )}
            </div>

            {savedSnapshots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400 space-y-2">
                <AlertCircle className="h-8 w-8 text-amber-400/60 mx-auto" />
                <p className="text-xs sm:text-sm font-medium">
                  Chưa có bộ ôn tập nào được lưu. Hãy bấm nút <strong>“Lưu chủ đề này”</strong> ở trên để lưu snapshot hiện tại!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {savedSnapshots.map((item) => {
                  const isEditing = editingId === item.id;
                  const isConfirmingDelete = deletingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-[#121626] hover:border-amber-500/30 p-4 transition space-y-3 shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Tên ngắn & Môn học */}
                        <div className="flex-1 space-y-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2 max-w-md">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-1 rounded-lg bg-[#090c14] border border-amber-400 px-3 py-1.5 text-xs text-white font-bold focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(item.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                              >
                                Lưu
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="rounded-lg bg-amber-400/15 text-amber-300 text-xs font-black px-2.5 py-0.5 border border-amber-400/30">
                                {item.subject || 'Hóa học'}
                              </span>
                              <h5 className="text-base font-black text-white hover:text-amber-200 transition">
                                {item.shortName}
                              </h5>
                              <button
                                type="button"
                                onClick={() => startEditing(item)}
                                className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-white/5 transition cursor-pointer"
                                title="Đổi tên ngắn"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                            <span>Chủ đề: <strong className="text-slate-300">{item.topicTitle}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="h-3 w-3 text-slate-500" />
                              {item.metadata.savedAtFormatted || 'Gần đây'}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">{item.metadata.gradeLevel}</span>
                          </div>
                        </div>

                        {/* NÚT THAO TÁC: MỞ & XÓA */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 p-1 rounded-xl">
                              <span className="text-[11px] text-rose-300 px-2 font-medium">Xác nhận xóa?</span>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
                              >
                                Xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setDeletingId(item.id)}
                                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-950/30 transition cursor-pointer"
                                title="Xóa môn này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onRestoreSnapshot(item);
                                  onClose();
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition shadow-md shadow-emerald-950/40 cursor-pointer active:scale-98"
                              >
                                <FolderOpen className="h-4 w-4" />
                                <span>Mở bộ này</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Thông số snapshot 4 mục rõ ràng */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5 text-[11px]">
                        <div className="bg-[#0b0e18] p-2 rounded-xl border border-white/5 flex items-center gap-1.5 text-slate-300">
                          <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span><strong>{item.sources.length}</strong> học liệu gốc</span>
                        </div>
                        <div className="bg-[#0b0e18] p-2 rounded-xl border border-white/5 flex items-center gap-1.5 text-slate-300">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span><strong>{item.studyPack.keyPoints?.length || 0}</strong> ý chính & PTHH</span>
                        </div>
                        <div className="bg-[#0b0e18] p-2 rounded-xl border border-white/5 flex items-center gap-1.5 text-slate-300">
                          <Layers className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                          <span><strong>{item.studyPack.flashcards?.length || 0}</strong> thẻ Flashcard</span>
                        </div>
                        <div className="bg-[#0b0e18] p-2 rounded-xl border border-white/5 flex items-center gap-1.5 text-slate-300">
                          <HelpCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span><strong>{item.studyPack.practiceQuestions?.length || 0}</strong> câu hỏi trắc nghiệm</span>
                        </div>
                      </div>

                      {/* Trích xuất ngắn summary */}
                      {item.analysisPreview?.coreTheme && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic bg-[#0a0d16] px-2.5 py-1 rounded-lg">
                          “{item.analysisPreview.coreTheme}”
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-white/10 bg-[#0a0d16] text-xs text-slate-400">
          <span>Dữ liệu được lưu trữ bền vững trên LocalStorage của trình duyệt này.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141829] hover:bg-[#1a2036] text-slate-300 hover:text-white font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
