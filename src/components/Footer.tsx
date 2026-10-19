import React from 'react';
import { FlaskConical, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { APP_INFO } from '../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="mt-16 border-t border-amber-500/20 bg-[#07090f] py-10 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20">
              <FlaskConical className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wide">{APP_INFO.name}</span>
                <span className="text-xs bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-400/30">
                  ⚗️ Môn {APP_INFO.subject}
                </span>
                <span className="text-xs bg-rose-600/20 text-rose-300 font-bold px-2 py-0.5 rounded-md border border-rose-500/30">
                  {APP_INFO.version} (Khung Tĩnh)
                </span>
              </div>
              <p className="text-xs text-amber-100/60 mt-0.5">
                Hệ thống ôn thi Hóa học cá nhân • “Đây là không gian ôn tập cá nhân của bạn”
              </p>
            </div>
          </div>

          {/* Compliance Badge Checklist */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 bg-[#121624] border border-amber-500/20 px-2.5 py-1 rounded-lg text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              Chỉ dựng UI & Dữ liệu mẫu tĩnh
            </span>
            <span className="inline-flex items-center gap-1 bg-[#121624] border border-amber-500/20 px-2.5 py-1 rounded-lg text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              Không sinh dữ liệu học tập thật
            </span>
            <span className="inline-flex items-center gap-1 bg-[#121624] border border-rose-500/20 px-2.5 py-1 rounded-lg text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
              Gắn nhãn Coming Soon đầy đủ
            </span>
          </div>

        </div>

        <div className="mt-8 border-t border-amber-500/15 pt-6 text-center text-xs text-slate-500">
          ScienceQuiz v0.1 • Thiết kế phong cách Champions Vàng Gold & Ruby • Các tính năng logic (Quiz, Flashcard, Q&A) sẵn sàng cho các buổi tiếp theo.
        </div>
      </div>
    </footer>
  );
};
