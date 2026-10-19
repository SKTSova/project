import React from 'react';
import { Award, Flame, CheckCircle, TrendingUp, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { STATIC_PROGRESS_STATS, MOCK_STUDENT_PROFILE } from '../data/mockData';

interface StatsSectionProps {
  onTriggerComingSoon: (featureName: string, scheduledVersion: string, description: string) => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ onTriggerComingSoon }) => {
  const stats = STATIC_PROGRESS_STATS;
  const student = MOCK_STUDENT_PROFILE;

  const handleStatClick = (statName: string) => {
    onTriggerComingSoon(
      `Thống kê học tập: ${statName}`,
      'v0.2 (Hệ thống dữ liệu học sinh)',
      'Biểu đồ theo dõi tiến độ học tập thực tế, lịch sử làm bài và gợi ý bù đắp lỗ hổng kiến thức sẽ được kích hoạt ở bản v0.2.'
    );
  };

  return (
    <div id="progress-module-container" className="space-y-6">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-white">
              Tiến Độ Học Tập Cá Nhân (Khung Mẫu v0.1)
            </h2>
            <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
              Dữ liệu mô phỏng
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Khung tổng quan hiệu quả ôn tập môn Hóa học cho học sinh {student.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-rose-950/50 px-3.5 py-1.5 text-xs font-bold text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-md shadow-rose-950/30">
            <Flame className="h-4 w-4 fill-rose-500 text-rose-500" />
            Chuỗi học mẫu: {stats.studyStreakDays} ngày
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          id="stat-card-questions"
          onClick={() => handleStatClick('Số câu hỏi trắc nghiệm')}
          className="rounded-2xl border border-amber-500/20 bg-[#0e121d] p-5 shadow-lg hover:border-amber-400/60 hover:bg-[#121625] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Câu hỏi đã luyện</span>
            <span className="rounded bg-gradient-to-r from-amber-400 to-yellow-400 px-1.5 py-0.2 text-[10px] text-slate-950 font-black">Soon</span>
          </div>
          <div className="text-2xl font-black text-white group-hover:text-amber-300 transition">{stats.questionsAttempted}</div>
          <p className="text-[11px] text-slate-400 mt-2">Dữ liệu mẫu khởi đầu v0.1</p>
        </div>

        <div
          id="stat-card-topics"
          onClick={() => handleStatClick('Chuyên đề hoàn thành')}
          className="rounded-2xl border border-amber-500/20 bg-[#0e121d] p-5 shadow-lg hover:border-amber-400/60 hover:bg-[#121625] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Chuyên đề hoàn thành</span>
            <span className="rounded bg-gradient-to-r from-amber-400 to-yellow-400 px-1.5 py-0.2 text-[10px] text-slate-950 font-black">Soon</span>
          </div>
          <div className="text-2xl font-black text-white group-hover:text-amber-300 transition">{stats.topicsCompleted}</div>
          <p className="text-[11px] text-slate-400 mt-2">Chờ kết nối kết quả bài thi</p>
        </div>

        <div
          id="stat-card-accuracy"
          onClick={() => handleStatClick('Tỷ lệ chính xác')}
          className="rounded-2xl border border-amber-500/20 bg-[#0e121d] p-5 shadow-lg hover:border-amber-400/60 hover:bg-[#121625] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Tỷ lệ làm đúng</span>
            <span className="rounded bg-gradient-to-r from-amber-400 to-yellow-400 px-1.5 py-0.2 text-[10px] text-slate-950 font-black">Soon</span>
          </div>
          <div className="text-2xl font-black text-amber-400 group-hover:text-amber-300 transition">{stats.averageAccuracy}</div>
          <p className="text-[11px] text-slate-400 mt-2">Chưa tính điểm trong v0.1</p>
        </div>

        <div
          id="stat-card-time"
          onClick={() => handleStatClick('Thời gian ôn tập')}
          className="rounded-2xl border border-amber-500/20 bg-[#0e121d] p-5 shadow-lg hover:border-amber-400/60 hover:bg-[#121625] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Thời gian ôn tập</span>
            <span className="rounded bg-gradient-to-r from-amber-400 to-yellow-400 px-1.5 py-0.2 text-[10px] text-slate-950 font-black">Soon</span>
          </div>
          <div className="text-2xl font-black text-white group-hover:text-amber-300 transition">{student.todayStudyTime}</div>
          <p className="text-[11px] text-slate-400 mt-2">Chỉ số mô phỏng</p>
        </div>

      </div>

      {/* Progress Chart Placeholder Frame */}
      <div className="rounded-3xl border border-amber-500/25 bg-[#0e121d] p-6 shadow-xl shadow-black/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Biểu Đồ Phân Tích Kỹ Năng Môn Hóa</h3>
            <p className="text-xs text-slate-400">Khung giả lập biểu đồ năng lực theo từng dạng bài</p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-3 py-1 text-xs font-black text-slate-950 shadow-md">
            Coming Soon (v0.2)
          </span>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-amber-500/25 bg-[#07090f]/70 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#141826] border border-amber-500/30 text-amber-400 shadow-md">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Khung Hiển Thị Biểu Đồ Thống Kê</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Tại các bản cập nhật sau (v0.2+), hệ thống sẽ vẽ radar biểu đồ năng lực học sinh (Lý thuyết vô cơ, Hóa hữu cơ, Bài tập tính toán, Đọc đồ thị).
          </p>
          <button
            onClick={() => handleStatClick('Mở chi tiết biểu đồ năng lực')}
            className="text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-2 rounded-xl hover:brightness-110 transition inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <span>Xem chi tiết thiết kế</span>
            <span className="text-[10px] text-slate-900 font-extrabold">(Coming Soon)</span>
          </button>
        </div>
      </div>

    </div>
  );
};
