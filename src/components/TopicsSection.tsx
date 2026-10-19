import React from 'react';
import { BookOpen, Sparkles, Atom, FlaskConical, Dna, ArrowRight } from 'lucide-react';
import { STATIC_CHEMISTRY_TOPICS } from '../data/mockData';
import { ChemistryTopic } from '../types';

interface TopicsSectionProps {
  onTriggerComingSoon: (featureName: string, scheduledVersion: string, description: string) => void;
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ onTriggerComingSoon }) => {
  const topics = STATIC_CHEMISTRY_TOPICS;

  const handleTopicClick = (topic: ChemistryTopic) => {
    onTriggerComingSoon(
      `Chủ đề Hóa: ${topic.title}`,
      'v0.2 - v0.3 (Biên soạn học liệu)',
      `Ngân hàng câu hỏi lý thuyết, bài tập trắc nghiệm và flashcard chuyên đề [${topic.title}] đang được cấu trúc và sẽ phát hành ở phiên bản tiếp theo.`
    );
  };

  return (
    <div id="topics-module-container" className="space-y-6">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-white">
              Chuyên Đề Học Tập Môn Hóa Học (THPT)
            </h2>
            <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
              Khung cấu trúc mẫu
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Danh mục các chuyên đề Hóa học theo chương trình phổ thông dành cho học sinh ôn tập.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-[#0e121d] px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/25">
            Tổng số: {topics.length} chuyên đề mẫu
          </span>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((t) => (
          <div
            key={t.id}
            id={`topic-card-${t.id}`}
            onClick={() => handleTopicClick(t)}
            className="group rounded-3xl border border-amber-500/20 bg-[#0e121d] p-5 shadow-lg hover:border-amber-400/60 hover:bg-[#121625] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-lg bg-rose-600/20 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">
                  {t.grade}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 px-2 py-0.5 text-[10px] font-black shadow-xs">
                  Coming Soon • Buổi 2
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition mb-2">
                {t.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                {t.description}
              </p>
            </div>

            <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-[#141826] border border-amber-500/20 px-2 py-0.5 rounded text-[11px] text-amber-300 font-bold">
                  {t.formulaSample}
                </span>
                <span className="text-slate-400">({t.lessonCount} bài mẫu)</span>
              </div>

              <span className="flex items-center gap-1 font-bold text-amber-400 group-hover:translate-x-1 transition text-xs">
                Mở
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
