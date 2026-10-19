import React, { useState, useEffect } from 'react';
import {
  Key,
  X,
  Eye,
  EyeOff,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Lock,
  Server,
  Info,
  Check,
} from 'lucide-react';
import {
  loadLocalGeminiApiKey,
  saveLocalGeminiApiKey,
} from '../utils/storage';

interface GeminiLocalKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChange?: (newKey: string) => void;
}

export const GeminiLocalKeySettingsModal: React.FC<GeminiLocalKeySettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyChange,
}) => {
  const [currentKey, setCurrentKey] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  // Khởi tạo key từ localStorage mỗi khi mở modal & hỗ trợ phím Escape
  useEffect(() => {
    if (isOpen) {
      const stored = loadLocalGeminiApiKey();
      setCurrentKey(stored);
      setInputKey(stored);
      setShowKeyText(false);
      setIsConfirmingDelete(false);
      setFeedbackMessage(null);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mask key hiển thị (chỉ hiển thị 6 ký tự đầu và 4 ký tự cuối)
  const getMaskedKey = (key: string): string => {
    if (!key) return '';
    if (key.length <= 10) return '••••••••••••';
    return `${key.slice(0, 6)}••••••••••••••••••••••••${key.slice(-4)}`;
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputKey.trim();

    if (!trimmed) {
      setFeedbackMessage({
        type: 'error',
        text: 'Vui lòng nhập Gemini API key trước khi bấm lưu.',
      });
      return;
    }

    if (trimmed.length < 15) {
      setFeedbackMessage({
        type: 'error',
        text: 'Độ dài API key quá ngắn. Khóa Google AI Studio thông thường bắt đầu bằng "AIzaSy...".',
      });
      return;
    }

    saveLocalGeminiApiKey(trimmed);
    setCurrentKey(trimmed);
    if (onKeyChange) onKeyChange(trimmed);

    setFeedbackMessage({
      type: 'success',
      text: 'Đã lưu Gemini API key vào LocalStorage của trình duyệt này (chế độ local-only Round 5)!',
    });

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleDelete = () => {
    saveLocalGeminiApiKey('');
    setCurrentKey('');
    setInputKey('');
    setIsConfirmingDelete(false);
    if (onKeyChange) onKeyChange('');

    setFeedbackMessage({
      type: 'info',
      text: 'Đã xóa hoàn toàn API key khỏi trình duyệt hiện tại.',
    });

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleStartReplace = () => {
    setInputKey('');
    setShowKeyText(true);
    setFeedbackMessage({
      type: 'info',
      text: 'Hãy dán key mới vào ô bên dưới và bấm "Lưu Key Cục Bộ".',
    });
  };

  return (
    <div
      id="gemini-local-key-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="gemini-local-key-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl flex flex-col rounded-3xl border border-amber-500/40 bg-[#0d101a] shadow-[0_0_60px_rgba(245,192,66,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* 1. MODAL HEADER */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-amber-500/25 bg-gradient-to-r from-[#121626] via-[#161a2e] to-[#121626]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-950/40 border border-amber-300/40">
              <Key className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Cài Đặt Gemini API Key
                </h3>
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-black text-amber-300 border border-amber-400/40">
                  Chế độ Local-Only (Round 5)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Quản lý khóa học tập cục bộ cho tính năng Re-generate Study Pack & AI Assistant
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

        {/* 2. MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* KHUNG CẢNH BÁO BẮT BUỘC: 4 TIÊU CHÍ AN TOÀN & ĐỊNH VỊ ROUND 5 */}
          <div
            id="round5-security-disclaimer-box"
            className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-[#1a150c] via-[#20180d] to-[#17120a] p-4 sm:p-5 space-y-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider border-b border-amber-500/20 pb-2">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Quy Chuẩn Bảo Mật Quan Trọng • Lưu Ý Dành Cho Học Sinh</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5 leading-relaxed">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-400/20 text-amber-300 font-mono text-[11px] font-bold mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-amber-200">Đây là API key cá nhân: </strong>
                  Khóa được cấp từ tài khoản Google AI Studio của riêng bạn để phục vụ việc học tập cá nhân.
                </div>
              </li>

              <li className="flex items-start gap-2.5 leading-relaxed">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-400/20 text-emerald-300 font-mono text-[11px] font-bold mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-emerald-300">Chỉ dùng cục bộ (Local-Only): </strong>
                  Key chỉ được lưu trên <code className="bg-[#0b0e18] px-1.5 py-0.5 rounded text-amber-300 font-mono">LocalStorage</code> của trình duyệt hiện tại. Ứng dụng không bao giờ commit key vào mã nguồn, không lưu vào cơ sở dữ liệu server.
                </div>
              </li>

              <li className="flex items-start gap-2.5 leading-relaxed">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-rose-400/20 text-rose-300 font-mono text-[11px] font-bold mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-rose-300">Chưa an toàn tuyệt đối khi deploy public: </strong>
                  Vì key nằm trên trình duyệt, nếu website công khai và ai đó dùng chung máy tính, họ có thể xem được mã bộ nhớ qua DevTools. Không nên dùng key có gắn thẻ tín dụng không hạn mức.
                </div>
              </li>

              <li className="flex items-start gap-2.5 leading-relaxed">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-400/20 text-sky-300 font-mono text-[11px] font-bold mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-sky-300">Lộ trình nâng cấp: </strong>
                  <strong className="text-white underline decoration-sky-400 underline-offset-2">Round 6 mới là vòng chuyển sang proxy an toàn hơn</strong> (Backend Proxy Server sẽ che giấu key hoàn toàn và bảo vệ bí mật tuyệt đối).
                </div>
              </li>
            </ul>
          </div>

          {/* TRẠNG THÁI HIỆN TẠI CỦA KEY */}
          <div className="rounded-2xl bg-[#111524] border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Trạng thái khóa trên trình duyệt:</span>
              </span>

              {currentKey ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Đã cài đặt key local-only</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-white/10">
                  <span>Chưa cài đặt (Dùng cấu hình mặc định)</span>
                </span>
              )}
            </div>

            {currentKey ? (
              <div className="flex items-center justify-between gap-2 bg-[#090c14] border border-white/10 rounded-xl p-3 text-xs">
                <div className="min-w-0 flex-1 font-mono text-slate-300 truncate">
                  {showKeyText ? currentKey : getMaskedKey(currentKey)}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowKeyText((prev) => !prev)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                    title={showKeyText ? 'Ẩn key' : 'Hiện key'}
                  >
                    {showKeyText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleStartReplace}
                    className="px-2.5 py-1 rounded-lg bg-[#182033] hover:bg-amber-400 hover:text-slate-950 text-slate-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer"
                  >
                    Thay key
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed italic bg-[#090c14] p-3 rounded-xl border border-white/5">
                Chưa có khóa cục bộ nào được gán. Hãy dán API key của bạn vào ô bên dưới nếu bạn muốn dùng Gemini API riêng cho mình.
              </p>
            )}
          </div>

          {/* Ô NHẬP KEY & CÁC HÀNH ĐỘNG (LƯU / THAY / XÓA) */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label
                htmlFor="gemini-local-key-input"
                className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between"
              >
                <span>Nhập hoặc dán Gemini API Key (Bắt đầu bằng AIzaSy...):</span>
                {inputKey && (
                  <span className="text-[11px] font-normal text-slate-400">
                    Độ dài: {inputKey.length} ký tự
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  id="gemini-local-key-input"
                  type={showKeyText ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full rounded-xl bg-[#090c14] border border-amber-500/35 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                  title={showKeyText ? 'Ẩn ký tự' : 'Hiện ký tự'}
                >
                  {showKeyText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* THÔNG BÁO PHẢN HỒI */}
            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : feedbackMessage.type === 'error'
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    : 'bg-sky-950/60 border-sky-500/40 text-sky-200'
                }`}
              >
                {feedbackMessage.type === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
                {feedbackMessage.type === 'error' && (
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                {feedbackMessage.type === 'info' && (
                  <Info className="h-4 w-4 text-sky-400 shrink-0" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            {/* NHÓM NÚT HÀNH ĐỘNG: LƯU, THAY, XÓA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                {currentKey && !isConfirmingDelete && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa key khỏi máy</span>
                  </button>
                )}

                {isConfirmingDelete && (
                  <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 p-1 rounded-xl">
                    <span className="text-[11px] text-rose-200 px-2 font-medium">Xác nhận xóa?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Xác nhận
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1a2133] text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  id="btn-save-gemini-local-key"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
                >
                  <Save className="h-4 w-4" />
                  <span>{currentKey ? 'Cập Nhật / Lưu Key' : 'Lưu Key Cục Bộ'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 3. MODAL FOOTER */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#090c14] text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-400" />
            Lưu trong bộ nhớ cục bộ trình duyệt (Local-Only Storage)
          </span>
          <span className="text-amber-400/80 font-mono">Round 5 Spec</span>
        </div>
      </div>
    </div>
  );
};
