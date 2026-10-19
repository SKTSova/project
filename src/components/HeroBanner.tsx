import React from 'react';
import { Award, FlaskConical, Atom, TestTubes, Layers, MessageSquare, ShieldAlert, Sparkles, UserCheck, BookOpen, Clock, Flame } from 'lucide-react';
import { NavTabId } from '../types';
import { MOCK_STUDENT_PROFILE, APP_INFO } from '../data/mockData';

interface HeroBannerProps {
  onSelectTab: (tab: NavTabId) => void;
  onTriggerComingSoon?: (featureName: string, scheduledVersion: string, description: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectTab }) => {
  return (
    <section id="hero-banner-section" className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#090b10] via-[#121624] to-[#1a111a] text-white p-6 sm:p-8 md:p-9 shadow-2xl mb-8 border border-amber-500/35 shadow-black/80">
      {/* Champions Aura glow: Ruby Red kill spark & Prestige Gold glow */}
      <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 top-0 h-40 w-40 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl">
        
        {/* Top Badges with Champions Styling */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/40 backdrop-blur-xs">
            <span className="text-sm">🏆</span>
            {APP_INFO.name} • Chuyên đề Khoa Học & Hóa Học
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 ring-1 ring-emerald-500/50 backdrop-blur-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Hệ Thống Ôn Thi Hoàn Chỉnh
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#131724] px-3 py-1 text-xs font-medium text-slate-200 border border-amber-500/25">
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            Bàn học cá nhân: <strong className="text-amber-200 font-semibold ml-1">{MOCK_STUDENT_PROFILE.name}</strong>
          </span>
        </div>

        {/* Primary Emphasized Message & Welcome Greeting */}
        <div className="mb-5">
          <div className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-1.5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Không Gian Ôn Tập Cá Nhân Hóa • Môn Hóa Học & KHTN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Chào mừng bạn đến với hệ thống ôn thi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">Hóa học</span> cá nhân
          </h1>
          <p className="text-sm sm:text-base text-amber-100/90 font-medium mt-1.5 flex items-center gap-2">
            <span className="text-base">⚗️</span>
            <span>“Đây là không gian ôn tập cá nhân của bạn — Nơi tra cứu và rèn luyện các Phương Trình Hóa Học & Câu Hỏi Quiz”</span>
          </p>
        </div>

        {/* Focused Chemistry Subject Clarification Card */}
        <div className="rounded-2xl bg-[#0e121d]/90 border border-amber-500/30 p-4 sm:p-5 mb-5 backdrop-blur-md shadow-inner">
          <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm sm:text-base mb-1.5">
            <FlaskConical className="h-5 w-5 text-amber-400 shrink-0" />
            <span>⚗️ Trọng tâm chuyên môn: Phương Trình Hóa Học (PTHH), Flashcard & Trắc Nghiệm THPT</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hệ thống thiết kế chuẩn hóa cho học sinh ôn thi môn <strong>Hóa học & Khoa học Tự nhiên</strong>: củng cố <strong>các phương trình phản ứng hóa học (PTHH)</strong> kinh điển (Oxi hóa - khử, Este hóa, Phản ứng tráng bạc, Nhiệt nhôm, Nhận biết ion) cùng hệ thống <strong>câu hỏi trắc nghiệm lý thuyết, luyện thẻ Flashcard & Gia sư AI bám sát tài liệu</strong>.
          </p>
        </div>

        {/* Quick action: Input Study Materials & AI Study Pack Preview (Buổi 2 & Buổi 3) */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#171b28] via-[#221622] to-[#171b28] p-4 border border-amber-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-lg shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 text-lg shrink-0 border border-amber-400/30">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">Luồng Học Tập Thông Minh: Nguồn Học Liệu → Preview “AI Đã Hiểu Gì” (Summary & Key Points)</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Tạo nhanh Summary ngắn gọn, Key Points cốt lõi và Study Pack 5 bước từ học liệu đã lưu (tự động lưu LocalStorage).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-hero-goto-ai-preview"
              onClick={() => onSelectTab('ai-preview')}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black transition shadow-[0_0_15px_rgba(245,192,66,0.3)] hover:brightness-110 whitespace-nowrap cursor-pointer"
            >
              <span>Xem Preview “AI Đã Hiểu Gì” (Buổi 3) →</span>
            </button>
            <button
              type="button"
              id="btn-hero-goto-materials"
              onClick={() => onSelectTab('materials')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121624] hover:bg-[#191f32] text-amber-300 border border-amber-500/35 text-xs font-bold transition whitespace-nowrap cursor-pointer"
            >
              <span>Quản lý học liệu</span>
            </button>
          </div>
        </div>

        {/* Key Quick Navigation Cards (Champions Tactical Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          
          {/* Card 1: Quiz Trọng tâm */}
          <button
            id="btn-hero-quiz-link"
            onClick={() => onSelectTab('quiz')}
            className="group flex flex-col justify-between p-4 rounded-2xl bg-[#111420] hover:bg-[#161a29] border border-emerald-500/30 hover:border-emerald-400 text-left transition shadow-xs hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-400/20 text-emerald-300 group-hover:scale-105 transition-transform border border-emerald-400/30">
                <TestTubes className="h-4 w-4 text-emerald-300" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2 py-0.5 text-[10px] tracking-wide shadow-xs">
                ✓ Luyện tập 4 dạng
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-1">
                <span>🧪</span> 1. Câu hỏi Quiz Hóa Học
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Trắc nghiệm lý thuyết & phản ứng THPT
              </div>
            </div>
          </button>

          {/* Card 2: Sổ tay PTHH Trọng tâm */}
          <button
            id="btn-hero-equations-link"
            onClick={() => onSelectTab('equations')}
            className="group flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-br from-[#161a28] to-[#221622] hover:from-[#1b2032] hover:to-[#2b1b2d] border border-amber-400/50 hover:border-amber-300 text-left transition shadow-xs hover:shadow-[0_0_20px_rgba(245,192,66,0.25)] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-400/30 text-amber-200 group-hover:scale-105 transition-transform border border-amber-400/40">
                <FlaskConical className="h-4 w-4 text-amber-300" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black px-2 py-0.5 text-[10px] tracking-wide shadow-xs">
                ⚗️ Trọng tâm PTHH
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-200 transition flex items-center gap-1">
                <span>⚗️</span> 2. Sổ Tay PTHH Trọng Tâm
              </div>
              <div className="text-[11px] text-amber-200/80 mt-1">
                Hiện tượng, điều kiện & phản ứng cốt lõi
              </div>
            </div>
          </button>

          {/* Card 3: Flashcard */}
          <button
            id="btn-hero-flashcards-link"
            onClick={() => onSelectTab('flashcards')}
            className="group flex flex-col justify-between p-4 rounded-2xl bg-[#111420] hover:bg-[#161a29] border border-amber-500/25 hover:border-amber-400 text-left transition shadow-xs hover:shadow-[0_0_20px_rgba(245,192,66,0.15)] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 group-hover:scale-105 transition-transform border border-amber-400/30">
                <Layers className="h-4 w-4 text-amber-300" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2 py-0.5 text-[10px] tracking-wide shadow-xs">
                ✓ Luyện lật thẻ 2 mặt
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition flex items-center gap-1">
                <span>⚛️</span> 3. Thẻ Ghi Nhớ Flashcard
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Lật thẻ, mẹo nhớ & phân biệt chất
              </div>
            </div>
          </button>

          {/* Card 4: AI Tutor */}
          <button
            id="btn-hero-tutor-link"
            onClick={() => onSelectTab('tutor')}
            className="group flex flex-col justify-between p-4 rounded-2xl bg-[#111420] hover:bg-[#161a29] border border-sky-500/25 hover:border-sky-400 text-left transition shadow-xs hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-sky-400/20 text-sky-300 group-hover:scale-105 transition-transform border border-sky-400/30">
                <MessageSquare className="h-4 w-4 text-sky-300" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold px-2 py-0.5 text-[10px] tracking-wide shadow-xs">
                ✓ Gia sư Grounded AI
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-sky-300 transition flex items-center gap-1">
                <span>🔬</span> 4. Gia Sư Ôn Bài Grounded
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Hỏi đáp chuẩn xác từ 3 nguồn học liệu
              </div>
            </div>
          </button>

        </div>

      </div>
    </section>
  );
};

