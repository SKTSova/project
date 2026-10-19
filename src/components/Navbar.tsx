import React from 'react';
import {
  FlaskConical,
  Atom,
  TestTubes,
  Layers,
  MessageSquare,
  Award,
  User,
  Sparkles,
  BookText,
  FolderPlus,
  Bot,
  FolderOpen,
  Key,
} from 'lucide-react';
import { NavTabId } from '../types';
import { MOCK_STUDENT_PROFILE } from '../data/mockData';

interface NavbarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onTriggerComingSoon: (featureName: string, scheduledVersion: string, description: string) => void;
  savedTopicsCount?: number;
  onOpenSavedTopics?: () => void;
  hasLocalApiKey?: boolean;
  onOpenKeySettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  savedTopicsCount,
  onOpenSavedTopics,
  hasLocalApiKey,
  onOpenKeySettings,
}) => {
  const navItems = [
    { id: 'overview' as NavTabId, label: 'Không gian của bạn', icon: Atom, tag: 'Chính' },
    { id: 'materials' as NavTabId, label: 'Nhập học liệu', icon: FolderPlus, tag: 'Buổi 2' },
    { id: 'ai-preview' as NavTabId, label: 'AI Đã Hiểu Gì', icon: Sparkles, tag: 'Buổi 3' },
    { id: 'quiz' as NavTabId, label: 'Luyện tập (Quiz Mode)', icon: TestTubes, tag: 'Quiz Mode' },
    { id: 'flashcards' as NavTabId, label: 'Luyện thẻ (Flashcard Mode)', icon: Layers, tag: 'Flashcard' },
    { id: 'tutor' as NavTabId, label: 'Gia sư ôn bài (Grounded Chat)', icon: Bot, tag: 'Grounded AI' },
    { id: 'equations' as NavTabId, label: 'Sổ tay PTHH', icon: FlaskConical, tag: 'Trọng tâm' },
    { id: 'topics' as NavTabId, label: 'Chuyên đề', icon: BookText, tag: 'Mẫu' },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-amber-500/25 bg-[#0a0d14]/95 backdrop-blur-md shadow-xl shadow-black/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand & Subject Badge */}
        <div className="flex items-center gap-3">
          <div 
            id="brand-logo" 
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-rose-600 to-amber-600 text-slate-950 shadow-lg shadow-rose-950/40 border border-amber-300/40"
          >
            <FlaskConical className="h-6 w-6 text-slate-950" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                Science<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Quiz</span>
              </span>
              <span className="rounded-lg bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
                ⚗️ KHTN & Đa Môn
              </span>
              <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/40">
                Buổi 3 • AI Study Pack
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Hệ thống ôn thi Hóa học cá nhân • <span className="text-amber-300/90 font-semibold">“Đây là không gian ôn tập của bạn”</span>
            </p>
          </div>
        </div>

        {/* Navigation tabs - Champions Tactical Bar */}
        <nav id="main-navigation" className="hidden md:flex items-center gap-1 rounded-xl bg-[#111420] p-1 border border-amber-500/20 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,192,66,0.35)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400/70'}`} />
                <span>{item.label}</span>
                {item.tag === 'Trọng tâm' && (
                  <span className={`rounded px-1 py-0.2 text-[9px] font-black ${
                    isActive ? 'bg-slate-950 text-amber-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    ★
                  </span>
                )}
                {item.tag === 'Mới' && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                    isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'
                  }`}>
                    Mới
                  </span>
                )}
                {item.tag === 'Soon' && (
                  <span className="rounded-full px-1.5 py-0.2 text-[9px] font-black bg-rose-600 text-white shadow-2xs">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Student Profile Widget & Saved Topics Shortcut */}
        <div className="flex items-center gap-2">
          {onOpenKeySettings && (
            <button
              type="button"
              id="navbar-btn-gemini-key-settings"
              onClick={onOpenKeySettings}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border ${
                hasLocalApiKey
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#141824] hover:bg-[#1a2134] border-amber-500/35 text-amber-300'
              }`}
              title="Cài đặt Gemini API Key (Chế độ Local-Only • Round 5)"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden lg:inline">Gemini Key</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  hasLocalApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400/60'
                }`}
              />
            </button>
          )}

          {onOpenSavedTopics && (
            <button
              type="button"
              id="navbar-btn-saved-topics"
              onClick={onOpenSavedTopics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1a2134] border border-amber-500/35 text-amber-300 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Quản lý các môn học & bộ ôn tập đã lưu"
            >
              <FolderOpen className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Môn đã lưu</span>
              <span className="rounded-full bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] font-black">
                {savedTopicsCount ?? 0}
              </span>
            </button>
          )}

          <div
            id="student-profile-chip"
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-[#121622] px-2.5 py-1.5 cursor-default shadow-xs"
            title="Góc học tập cá nhân"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-black text-slate-950">
              <User className="h-4 w-4 text-slate-950" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-amber-200 leading-tight">
                {MOCK_STUDENT_PROFILE.name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">
                Không gian cá nhân • {MOCK_STUDENT_PROFILE.role}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-amber-500/20 bg-[#0c0f17] gap-1.5 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs rounded-lg ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-xs'
                  : 'bg-[#141824] text-slate-300 border border-[#242b3d]'
              }`}
            >
              <span>{item.label}</span>
              {item.tag === 'Trọng tâm' && <span className="text-[9px] text-rose-400">★</span>}
              {item.tag === 'Mới' && <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded-full font-extrabold">Mới</span>}
              {item.tag === 'Soon' && <span className="text-[9px] bg-rose-600 text-white px-1 rounded-full font-black">Soon</span>}
            </button>
          );
        })}
      </div>
    </header>
  );
};
