import React, { useState } from 'react';
import { FlaskConical, Sparkles, Filter, Bookmark, HelpCircle, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { STATIC_CHEMICAL_EQUATIONS } from '../data/mockData';
import { ChemicalEquationItem } from '../types';

interface EquationsSectionProps {
  onTriggerComingSoon: (featureName: string, scheduledVersion: string, description: string) => void;
}

export const EquationsSection: React.FC<EquationsSectionProps> = ({ onTriggerComingSoon }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const equations = STATIC_CHEMICAL_EQUATIONS;

  const categories = ['Tất cả', 'Oxi hóa - Khử', 'Hữu cơ', 'Vô cơ', 'Nhiệt nhôm & Điện phân'];

  const filteredEquations = selectedCategory === 'Tất cả'
    ? equations
    : equations.filter(eq => eq.category === selectedCategory);

  const handleAction = (featureName: string) => {
    onTriggerComingSoon(
      `Sổ tay PTHH: ${featureName}`,
      'v0.2 (Tính năng đang xây dựng)',
      'Hệ thống tra cứu cơ chế phản ứng hóa học, cân bằng electron tự động và bài tập vận dụng sẽ được kích hoạt ở phiên bản tiếp theo.'
    );
  };

  return (
    <div id="equations-module-container" className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20">
              <FlaskConical className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </span>
            <h2 className="text-xl font-bold text-white">
              Sổ Tay Phương Trình Hóa Học Trọng Tâm (PTHH)
            </h2>
            <span className="rounded-full bg-rose-600/20 px-2.5 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/30">
              Trọng tâm ôn thi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tổng hợp các phương trình phản ứng hóa học cốt lõi, hiện tượng nhận biết và điều kiện phản ứng thường gặp trong đề thi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-[#0e121d] px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/25">
            Khung hiển thị mẫu tĩnh
          </span>
        </div>
      </div>

      {/* Category Filter Pills (UI Shell) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5 text-amber-400" />
          Phân loại:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-xs'
                : 'bg-[#141826] text-slate-300 hover:bg-[#1f2538] border border-amber-500/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equations Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEquations.map((item) => (
          <div
            key={item.id}
            id={`pthh-card-${item.id}`}
            className="rounded-3xl border border-amber-500/20 bg-[#0e121d] p-5 shadow-lg hover:border-amber-400/60 hover:bg-[#121625] transition flex flex-col justify-between group"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-[11px] font-bold text-rose-300 bg-rose-600/20 px-2 py-0.5 rounded-lg border border-rose-500/30">
                  {item.code}
                </span>
                <span className="text-[11px] font-bold text-amber-300 bg-[#1a1f33] px-2 py-0.5 rounded-lg border border-amber-500/15">
                  {item.category}
                </span>
              </div>

              {/* Title & Equation */}
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition mb-2">
                {item.name}
              </h3>

              {/* Big Styled Chemical Equation Box */}
              <div className="rounded-2xl bg-[#07090f] text-amber-300 border border-amber-500/30 p-3.5 font-mono text-xs sm:text-sm font-bold tracking-wide overflow-x-auto shadow-inner mb-3">
                {item.equation}
              </div>

              {/* Condition if present */}
              {item.condition && (
                <div className="flex items-start gap-1.5 text-xs text-amber-200 bg-[#141826] p-2.5 rounded-xl border border-amber-500/20 mb-2.5">
                  <span className="font-bold text-amber-400 shrink-0">⚗️ Điều kiện:</span>
                  <span>{item.condition}</span>
                </div>
              )}

              {/* Phenomenon */}
              <div className="text-xs text-slate-300 mb-2">
                <span className="font-bold text-white">🔍 Hiện tượng: </span>
                {item.phenomenon}
              </div>

              {/* Exam significance */}
              <div className="text-xs text-slate-400 italic mb-3">
                <span className="font-bold text-slate-300 not-italic">📌 Ý nghĩa ôn tập: </span>
                {item.significance}
              </div>
            </div>

            {/* Card Actions (Static UI Buttons labeled with prominent Coming Soon) */}
            <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between gap-2">
              <button
                onClick={() => handleAction(`Lưu PTHH ${item.code} vào sổ tay ôn tập`)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-xl border border-amber-500/25 transition font-semibold"
              >
                <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                <span>Lưu sổ tay</span>
              </button>

              <button
                onClick={() => handleAction(`Xem bài tập trắc nghiệm áp dụng PTHH ${item.code}`)}
                className="flex items-center gap-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 px-3.5 py-1.5 rounded-xl transition shadow-md shadow-amber-500/20"
              >
                <span>🧪 Luyện trắc nghiệm</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-950 text-amber-300 px-2 py-0.2 text-[10px] font-black shadow-xs">
                  Coming Soon • Buổi 2
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Notice */}
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-center gap-3">
        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-white">Lưu ý App Shell:</strong> Dữ liệu PTHH là danh mục mẫu tĩnh được thiết kế chuẩn xác để định hình cấu trúc học tập. Các thao tác ghi nhớ, tra cứu phản ứng tương tác và bài tập liên kết đều ở trạng thái <em>Tính năng đang xây dựng</em>.
        </span>
      </div>

    </div>
  );
};
