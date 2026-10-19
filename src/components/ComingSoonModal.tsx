import React from 'react';
import { Sparkles, Clock, CheckCircle2, X } from 'lucide-react';
import { ComingSoonFeature } from '../types';

interface ComingSoonModalProps {
  feature: ComingSoonFeature | null;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ feature, onClose }) => {
  // Hỗ trợ bấm phím Escape để đóng nhanh
  React.useEffect(() => {
    if (!feature) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feature, onClose]);

  if (!feature) return null;

  return (
    <div
      id="coming-soon-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="coming-soon-dialog"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0e121d] p-6 shadow-2xl border border-amber-500/40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-coming-soon"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          aria-label="Đóng cửa sổ"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30">
            <Clock className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 px-3 py-1 text-xs font-black shadow-md">
              <Sparkles className="h-3 w-3" />
              <span>LỘ TRÌNH PHÁT TRIỂN • {feature.scheduledVersion}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Tính năng: {feature.featureName}
            </h3>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 mb-6 bg-[#141826] p-4 rounded-2xl border border-amber-500/20">
          <p className="leading-relaxed">{feature.description}</p>
          <div className="flex items-start gap-2 pt-2.5 border-t border-amber-500/20 text-xs text-amber-200/90">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Lưu ý sư phạm:</strong> Hệ thống hiện đang tập trung toàn lực vào các tính năng ôn tập cốt lõi (Học liệu gốc, Preview AI Đã Hiểu Gì, Flashcard 2 mặt, Quiz 4 dạng cơ bản & Gia sư Grounded Chatbot).
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            id="btn-confirm-coming-soon"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 px-4 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            Đã hiểu, tiếp tục ôn tập
          </button>
        </div>
      </div>
    </div>
  );
};
