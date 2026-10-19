import React, { useState, useEffect } from 'react';
import { NavTabId, ComingSoonFeature, StudyMaterialItem, GeneratedStudyPack, StudyTopicSnapshot } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { StudyMaterialInputSection } from './components/StudyMaterialInputSection';
import { AIStudyPackPreviewSection } from './components/AIStudyPackPreviewSection';
import { QuizSection } from './components/QuizSection';
import { EquationsSection } from './components/EquationsSection';
import { FlashcardSection } from './components/FlashcardSection';
import { ChatbotSection } from './components/ChatbotSection';
import { TopicsSection } from './components/TopicsSection';
import { ComingSoonModal } from './components/ComingSoonModal';
import { SavedTopicsManagerModal } from './components/SavedTopicsManagerModal';
import { GeminiLocalKeySettingsModal } from './components/GeminiLocalKeySettingsModal';
import { Footer } from './components/Footer';
import { MOCK_STUDENT_PROFILE } from './data/mockData';
import { buildSynthesizedStudyPackFromMaterials } from './data/studyPackData';
import {
  loadStudyMaterials,
  saveStudyMaterials,
  resetStudyMaterialsToDefault,
  loadStudyPacks,
  saveStudyPacks,
  resetStudyPacksToDefault,
  loadSavedTopicSnapshots,
  saveSavedTopicSnapshots,
  buildInitialTopicSnapshots,
  savePracticeQuestions,
  saveFlashcards,
  saveQASeeds,
  loadLocalGeminiApiKey,
} from './utils/storage';
import {
  Layers,
  Award,
  MessageSquare,
  BookOpen,
  Sparkles,
  FlaskConical,
  Target,
  CheckCircle,
  ArrowRight,
  User,
  FolderPlus,
  Database,
  Save,
  FolderOpen,
  X,
  CheckCircle2,
  Key,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [comingSoonModal, setComingSoonModal] = useState<ComingSoonFeature | null>(null);

  // Quản lý State danh sách nguồn học liệu + Đồng bộ LocalStorage (Buổi 2)
  const [materials, setMaterials] = useState<StudyMaterialItem[]>(loadStudyMaterials);

  // Quản lý State danh sách Study Pack (Summary, Key Points, Flashcard, Câu hỏi, Q&A Seed) + LocalStorage (Buổi 3)
  const [studyPacks, setStudyPacks] = useState<GeneratedStudyPack[]>(loadStudyPacks);
  const [activePackId, setActivePackId] = useState<string>(() => {
    const initial = loadStudyPacks();
    return initial[0]?.id || 'pack-este-lipit-01';
  });

  // Quản lý danh sách Snapshot môn học / bộ ôn tập đã lưu + LocalStorage
  const [savedSnapshots, setSavedSnapshots] = useState<StudyTopicSnapshot[]>(loadSavedTopicSnapshots);
  const [isSavedTopicsModalOpen, setIsSavedTopicsModalOpen] = useState<boolean>(false);

  // Quản lý Gemini API Key local-only (Round 5)
  const [localApiKey, setLocalApiKey] = useState<string>(loadLocalGeminiApiKey);
  const [isKeySettingsModalOpen, setIsKeySettingsModalOpen] = useState<boolean>(false);

  const [restoredNotification, setRestoredNotification] = useState<{
    shortName: string;
    subject: string;
    topicTitle: string;
    sourceCount: number;
    keyPointCount: number;
    flashcardCount: number;
    questionCount: number;
    isSaveAction?: boolean;
  } | null>(null);

  // Tự động lưu vào LocalStorage khi danh sách học liệu thay đổi
  useEffect(() => {
    saveStudyMaterials(materials);
  }, [materials]);

  // Tự động lưu vào LocalStorage khi danh sách Study Pack thay đổi (Buổi 3)
  useEffect(() => {
    saveStudyPacks(studyPacks);
  }, [studyPacks]);

  // Tự động lưu danh sách snapshot vào LocalStorage
  useEffect(() => {
    saveSavedTopicSnapshots(savedSnapshots);
  }, [savedSnapshots]);

  const handleResetMaterials = () => {
    const defaultList = resetStudyMaterialsToDefault();
    setMaterials(defaultList);
  };

  const handleAddStudyPack = (newPack: GeneratedStudyPack) => {
    setStudyPacks((prev) => [newPack, ...prev]);
    setActivePackId(newPack.id);
  };

  const handleUpdateStudyPack = (updatedPack: GeneratedStudyPack) => {
    setStudyPacks((prev) =>
      prev.map((p) => (p.id === updatedPack.id ? updatedPack : p))
    );
    setActivePackId(updatedPack.id);
  };

  const handleResetStudyPacks = () => {
    const defaultPacks = resetStudyPacksToDefault();
    setStudyPacks(defaultPacks);
    if (defaultPacks[0]) {
      setActivePackId(defaultPacks[0].id);
    }
  };

  const handleDeleteStudyPack = (packId: string) => {
    if (studyPacks.length <= 1) {
      alert('Không thể xóa version duy nhất còn lại của ứng dụng.');
      return;
    }
    const remaining = studyPacks.filter((p) => p.id !== packId);
    setStudyPacks(remaining);
    if (activePackId === packId && remaining[0]) {
      setActivePackId(remaining[0].id);
    }
  };

  // Lưu Snapshot working copy hiện tại
  const handleSaveCurrentTopicSnapshot = (customShortName?: string, customNote?: string) => {
    const activePack = studyPacks.find((p) => p.id === activePackId) || studyPacks[0];
    const topicMaterials = materials.filter((m) => m.topicId === activePack?.topicId);
    const sourcesToSave = topicMaterials.length > 0 ? topicMaterials : materials;

    let subject = 'Hóa học';
    if (activePack?.topicId?.includes('khtn') || activePack?.gradeLevel?.includes('Lớp 7')) {
      subject = 'KHTN (Khoa học Tự nhiên)';
    } else if (activePack?.topicTitle?.toLowerCase().includes('vật lý')) {
      subject = 'Vật lý';
    } else if (activePack?.topicTitle?.toLowerCase().includes('sinh')) {
      subject = 'Sinh học';
    }

    const shortName = (customShortName || activePack?.topicTitle || 'Chủ đề ôn tập').trim();

    const snapshot: StudyTopicSnapshot = {
      id: `snapshot-${Date.now()}`,
      shortName,
      subject,
      topicId: activePack?.topicId || 'topic-current',
      topicTitle: activePack?.topicTitle || 'Chủ đề hiện tại',
      sources: sourcesToSave,
      analysisPreview: activePack?.summary || {
        overview: 'Tổng quan bài học',
        coreTheme: activePack?.topicTitle || '',
        targetGrade: activePack?.gradeLevel || 'Lớp 12',
        estimatedReadMinutes: 5,
        prerequisiteKnowledge: [],
        learningObjectives: [],
        aiDetectedConcepts: [],
      },
      studyPack: activePack,
      metadata: {
        savedAt: new Date().toISOString(),
        savedAtFormatted: new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        sourceCount: sourcesToSave.length,
        keyPointCount: activePack?.keyPoints?.length || 0,
        flashcardCount: activePack?.flashcards?.length || 0,
        questionCount: activePack?.practiceQuestions?.length || 0,
        qaSeedCount: activePack?.qaSeeds?.length || 0,
        gradeLevel: activePack?.gradeLevel || 'Lớp 12',
        version: 'v1.0',
        customNote: customNote || 'Đã lưu từ working copy hiện tại',
      },
    };

    setSavedSnapshots((prev) => [snapshot, ...prev.filter((s) => s.id !== snapshot.id)]);
    setRestoredNotification({
      shortName,
      subject,
      topicTitle: activePack?.topicTitle || '',
      sourceCount: sourcesToSave.length,
      keyPointCount: activePack?.keyPoints?.length || 0,
      flashcardCount: activePack?.flashcards?.length || 0,
      questionCount: activePack?.practiceQuestions?.length || 0,
      isSaveAction: true,
    });
  };

  // Mở / Khôi phục snapshot về working copy hiện tại
  const handleRestoreSnapshot = (snapshot: StudyTopicSnapshot) => {
    // 1. Cập nhật sources (Học liệu gốc)
    if (Array.isArray(snapshot.sources) && snapshot.sources.length > 0) {
      setMaterials(snapshot.sources);
    }

    // 2. Cập nhật Study Pack vào danh sách và kích hoạt
    if (snapshot.studyPack) {
      setStudyPacks((prev) => {
        const filtered = prev.filter((p) => p.id !== snapshot.studyPack.id);
        return [snapshot.studyPack, ...filtered];
      });
      setActivePackId(snapshot.studyPack.id);

      // 3. Đồng bộ câu hỏi và Flashcard để Quiz Mode và Flashcard Mode đổi ngay
      if (snapshot.studyPack.practiceQuestions?.length) {
        savePracticeQuestions(snapshot.studyPack.practiceQuestions);
      }
      if (snapshot.studyPack.flashcards?.length) {
        saveFlashcards(snapshot.studyPack.flashcards);
      }
      if (snapshot.studyPack.qaSeeds?.length) {
        saveQASeeds(snapshot.studyPack.qaSeeds);
      }
    }

    // 4. Kích hoạt thông báo đổi trạng thái UI rõ rệt
    setRestoredNotification({
      shortName: snapshot.shortName,
      subject: snapshot.subject,
      topicTitle: snapshot.topicTitle,
      sourceCount: snapshot.sources.length,
      keyPointCount: snapshot.studyPack?.keyPoints?.length || 0,
      flashcardCount: snapshot.studyPack?.flashcards?.length || 0,
      questionCount: snapshot.studyPack?.practiceQuestions?.length || 0,
      isSaveAction: false,
    });

    // 5. Chuyển sang màn hình overview
    setActiveTab('overview');
  };

  const handleResetDefaultSnapshots = () => {
    const defaults = buildInitialTopicSnapshots();
    setSavedSnapshots(defaults);
  };

  // Luồng tạo nhanh Summary & Key Points từ 1 hoặc nhiều học liệu trong danh sách (Lưu LocalStorage)
  const handleQuickGenerateSummaryFromMaterials = async (materialsToUse: StudyMaterialItem[]) => {
    const effective = materialsToUse.length > 0 ? materialsToUse : materials.slice(0, 2);
    const synthesized = buildSynthesizedStudyPackFromMaterials(
      effective,
      'Lớp 7 trở lên (Kết hợp nền tảng cơ bản & mở rộng)',
      `Summary & Key Points: ${effective[0]?.title || 'Học liệu đã chọn'}`
    );
    handleAddStudyPack(synthesized);
    setActiveTab('ai-preview');
  };

  const triggerComingSoon = (featureName: string, scheduledVersion: string, description: string) => {
    setComingSoonModal({
      featureName,
      scheduledVersion,
      description,
    });
  };

  const activeStudyPackObj = studyPacks.find((p) => p.id === activePackId) || studyPacks[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0c10] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTriggerComingSoon={triggerComingSoon}
        savedTopicsCount={savedSnapshots.length}
        onOpenSavedTopics={() => setIsSavedTopicsModalOpen(true)}
        hasLocalApiKey={!!localApiKey}
        onOpenKeySettings={() => setIsKeySettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main id="app-main-content" className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        
        {/* THÔNG BÁO KHÔI PHỤC HOẶC LƯU SNAPSHOT THÀNH CÔNG (HIỂN THỊ RÕ RÀNG TRÊN UI) */}
        {restoredNotification && (
          <div
            id="snapshot-restored-notification-banner"
            className={`mb-6 rounded-3xl border p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300 ${
              restoredNotification.isSaveAction
                ? 'border-amber-400/50 bg-gradient-to-r from-[#1f1b0f] via-[#292211] to-[#1f1b0f] shadow-[0_0_30px_rgba(245,192,66,0.15)]'
                : 'border-emerald-500/50 bg-gradient-to-r from-[#0c1f17] via-[#102920] to-[#0c1f17] shadow-[0_0_30px_rgba(16,185,129,0.18)]'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-950 font-black text-xl shadow-lg ${
                  restoredNotification.isSaveAction
                    ? 'bg-amber-400 shadow-amber-950/40'
                    : 'bg-emerald-400 shadow-emerald-950/40'
                }`}
              >
                {restoredNotification.isSaveAction ? '💾' : '✓'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      restoredNotification.isSaveAction
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {restoredNotification.subject}
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {restoredNotification.isSaveAction ? 'Đã lưu snapshot chủ đề:' : 'Đã khôi phục bộ ôn tập:'}{' '}
                    <span className="text-amber-300 font-mono font-bold">"{restoredNotification.shortName}"</span>
                  </h4>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  UI hiện tại đã đồng bộ trọn vẹn: <strong>{restoredNotification.sourceCount}</strong> học liệu gốc, <strong>{restoredNotification.keyPointCount}</strong> ý chính & PTHH, <strong>{restoredNotification.flashcardCount}</strong> thẻ flashcard và <strong>{restoredNotification.questionCount}</strong> câu hỏi kiểm tra.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('ai-preview')}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm"
              >
                Xem AI Đã Hiểu Gì
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="px-3.5 py-2 rounded-xl bg-[#14232b] hover:bg-[#1a2f3a] text-emerald-300 border border-emerald-500/30 font-bold text-xs transition cursor-pointer"
              >
                Vào Quiz Mode
              </button>
              <button
                type="button"
                onClick={() => setRestoredNotification(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Banner always available or focused */}
        {activeTab === 'overview' ? (
          <div className="space-y-10">
            <HeroBanner
              onSelectTab={setActiveTab}
              onTriggerComingSoon={triggerComingSoon}
            />

            {/* Personal Study Space Header Card - Champions Obsidian & Gold Trim */}
            <div id="personal-study-space-card" className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#11141e] via-[#161a27] to-[#11141e] p-5 sm:p-6 shadow-[0_0_30px_rgba(245,192,66,0.07)] relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-rose-600/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-rose-600 to-amber-600 text-slate-950 shrink-0 shadow-lg shadow-rose-900/30 text-2xl border border-amber-300/50">
                    🏆
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-400/15 text-amber-300 text-[11px] font-black px-2.5 py-0.5 border border-amber-400/30 tracking-wide uppercase">
                        👑 Không gian ôn thi cá nhân
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
                        <span>Học sinh: <strong className="text-amber-200">{MOCK_STUDENT_PROFILE.name}</strong> ({MOCK_STUDENT_PROFILE.role})</span>
                        <span className="text-amber-400/80">•</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          Đang học: {activeStudyPackObj?.topicTitle || 'Este - Lipit'}
                        </span>
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 flex items-center gap-2">
                      <span>Chào mừng bạn đến với hệ thống ôn thi Hóa học cá nhân</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                      “Đây là không gian ôn tập cá nhân của bạn” — Nơi tra cứu nhanh các Phương trình Hóa học (PTHH) trọng tâm và làm quen với ngân hàng câu hỏi trắc nghiệm ScienceQuiz.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 self-start md:self-auto flex-wrap">
                  {/* NÚT THAO TÁC SAVE & LOAD CHỦ ĐỀ / BỘ ÔN TẬP */}
                  <button
                    type="button"
                    id="btn-header-save-current-topic"
                    onClick={() => handleSaveCurrentTopicSnapshot()}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#141a2a] hover:bg-[#1d253c] text-amber-300 border border-amber-500/40 font-bold text-xs transition shadow-md cursor-pointer whitespace-nowrap active:scale-98"
                    title="Lưu trọn vẹn snapshot working copy hiện tại"
                  >
                    <Save className="h-4 w-4 text-amber-400" />
                    <span>Lưu chủ đề này</span>
                  </button>

                  <button
                    type="button"
                    id="btn-header-manage-saved-topics"
                    onClick={() => setIsSavedTopicsModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 text-amber-200 border border-amber-400/40 font-bold text-xs transition shadow-md cursor-pointer whitespace-nowrap active:scale-98"
                  >
                    <FolderOpen className="h-4 w-4 text-amber-400" />
                    <span>Môn đã lưu ({savedSnapshots.length})</span>
                  </button>

                  <button
                    type="button"
                    id="btn-header-gemini-key-settings"
                    onClick={() => setIsKeySettingsModalOpen(true)}
                    className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl border font-bold text-xs transition shadow-md cursor-pointer whitespace-nowrap active:scale-98 ${
                      localApiKey
                        ? 'bg-[#121c22] hover:bg-[#18262f] text-emerald-300 border-emerald-500/40'
                        : 'bg-[#141a2a] hover:bg-[#1d253c] text-amber-300 border-amber-500/40'
                    }`}
                    title="Cài đặt Gemini API Key cá nhân (Chế độ Local-Only • Round 5)"
                  >
                    <Key className="h-4 w-4 text-amber-400" />
                    <span>{localApiKey ? 'Gemini Key (Đã lưu)' : 'Cài Gemini Key'}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-header-goto-materials"
                    onClick={() => setActiveTab('materials')}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs transition shadow-[0_0_20px_rgba(245,192,66,0.3)] hover:brightness-110 whitespace-nowrap active:scale-98"
                  >
                    <FolderPlus className="h-4 w-4 text-slate-950" />
                    <span>Nhập học liệu mới</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Core Section: Study Materials Input (Text-First) */}
            <section id="section-overview-materials">
              <StudyMaterialInputSection
                materials={materials}
                onUpdateMaterials={setMaterials}
                onResetMaterials={handleResetMaterials}
                onGenerateSummaryFromMaterials={handleQuickGenerateSummaryFromMaterials}
              />
            </section>

            {/* Buổi 3 Core Section: Màn hình Preview "AI Đã Hiểu Gì" & Tạo Summary / Key Points / Study Pack */}
            <section id="section-overview-ai-preview">
              <AIStudyPackPreviewSection
                materials={materials}
                studyPacks={studyPacks}
                activePackId={activePackId}
                onSelectPackId={setActivePackId}
                onAddStudyPack={handleAddStudyPack}
                onUpdateStudyPack={handleUpdateStudyPack}
                onDeleteStudyPack={handleDeleteStudyPack}
                onResetStudyPacks={handleResetStudyPacks}
                onNavigateToMaterials={() => setActiveTab('materials')}
                onNavigateToQuiz={() => setActiveTab('quiz')}
                onNavigateToFlashcards={() => setActiveTab('flashcards')}
                onNavigateToTutor={() => setActiveTab('tutor')}
                onSaveCurrentTopic={() => handleSaveCurrentTopicSnapshot()}
                onOpenSavedTopics={() => setIsSavedTopicsModalOpen(true)}
                onOpenKeySettings={() => setIsKeySettingsModalOpen(true)}
              />
            </section>

            {/* Section 1 of Focus: Chemical Equations (PTHH) Showcase */}
            <section id="section-overview-equations">
              <EquationsSection onTriggerComingSoon={triggerComingSoon} />
            </section>

            {/* Section 2 of Focus: Chemistry Quiz Questions Showcase */}
            <section id="section-overview-quiz">
              <QuizSection onTriggerComingSoon={triggerComingSoon} materials={materials} studyPacks={studyPacks} />
            </section>

            {/* Flashcard & Q&A Seed Sections (Buổi 3) */}
            <div className="grid grid-cols-1 gap-10 pt-4">
              <section id="section-overview-flashcard">
                <FlashcardSection
                  onTriggerComingSoon={triggerComingSoon}
                  materials={materials}
                  studyPacks={studyPacks}
                />
              </section>

              <section id="section-overview-tutor">
                <ChatbotSection
                  onTriggerComingSoon={triggerComingSoon}
                  materials={materials}
                  studyPacks={studyPacks}
                  activePackId={activePackId}
                  onNavigateToStudyPack={() => setActiveTab('ai-preview')}
                  onNavigateToMaterials={() => setActiveTab('materials')}
                />
              </section>
            </div>

            {/* Chemistry Topics Section */}
            <section id="section-overview-topics">
              <TopicsSection onTriggerComingSoon={triggerComingSoon} />
            </section>

          </div>
        ) : (
          <div>
            {/* Breadcrumb / Back button when in specific tab */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
              <button
                id="btn-back-to-overview"
                onClick={() => setActiveTab('overview')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 bg-[#121622] hover:bg-[#181d2c] px-4 py-2.5 rounded-2xl border border-amber-500/30 shadow-md cursor-pointer"
              >
                <span>← Trở về Không gian tổng quan của bạn</span>
              </button>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSaveCurrentTopicSnapshot()}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 bg-[#141a2a] hover:bg-[#1b2338] px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer shadow-xs"
                >
                  <Save className="h-3.5 w-3.5 text-amber-400" />
                  <span>Lưu chủ đề này</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSavedTopicsModalOpen(true)}
                  className="text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 bg-[#121622] hover:bg-[#181d2c] px-3.5 py-2 rounded-xl border border-white/10 cursor-pointer shadow-xs"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                  <span>Môn đã lưu ({savedSnapshots.length})</span>
                </button>

                <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-emerald-400" />
                  Snapshot System v1.0
                </span>
              </div>
            </div>

            {activeTab === 'materials' && (
              <StudyMaterialInputSection
                materials={materials}
                onUpdateMaterials={setMaterials}
                onResetMaterials={handleResetMaterials}
                onGenerateSummaryFromMaterials={handleQuickGenerateSummaryFromMaterials}
              />
            )}
            {activeTab === 'ai-preview' && (
              <AIStudyPackPreviewSection
                materials={materials}
                studyPacks={studyPacks}
                activePackId={activePackId}
                onSelectPackId={setActivePackId}
                onAddStudyPack={handleAddStudyPack}
                onUpdateStudyPack={handleUpdateStudyPack}
                onDeleteStudyPack={handleDeleteStudyPack}
                onResetStudyPacks={handleResetStudyPacks}
                onNavigateToMaterials={() => setActiveTab('materials')}
                onNavigateToQuiz={() => setActiveTab('quiz')}
                onNavigateToFlashcards={() => setActiveTab('flashcards')}
                onNavigateToTutor={() => setActiveTab('tutor')}
                onSaveCurrentTopic={() => handleSaveCurrentTopicSnapshot()}
                onOpenSavedTopics={() => setIsSavedTopicsModalOpen(true)}
                onOpenKeySettings={() => setIsKeySettingsModalOpen(true)}
              />
            )}
            {activeTab === 'quiz' && (
              <QuizSection
                onTriggerComingSoon={triggerComingSoon}
                materials={materials}
                studyPacks={studyPacks}
              />
            )}
            {activeTab === 'equations' && <EquationsSection onTriggerComingSoon={triggerComingSoon} />}
            {activeTab === 'flashcards' && (
              <FlashcardSection
                onTriggerComingSoon={triggerComingSoon}
                materials={materials}
                studyPacks={studyPacks}
              />
            )}
            {activeTab === 'tutor' && (
              <ChatbotSection
                onTriggerComingSoon={triggerComingSoon}
                materials={materials}
                studyPacks={studyPacks}
                activePackId={activePackId}
                onNavigateToStudyPack={() => setActiveTab('ai-preview')}
                onNavigateToMaterials={() => setActiveTab('materials')}
              />
            )}
            {activeTab === 'topics' && <TopicsSection onTriggerComingSoon={triggerComingSoon} />}
          </div>
        )}

      </main>

      {/* Modal Quản lý Môn học & Bộ ôn tập đã lưu (Save/Load Snapshots) */}
      <SavedTopicsManagerModal
        isOpen={isSavedTopicsModalOpen}
        onClose={() => setIsSavedTopicsModalOpen(false)}
        currentMaterials={materials}
        currentStudyPack={activeStudyPackObj}
        onSaveCurrentSnapshot={handleSaveCurrentTopicSnapshot}
        onRestoreSnapshot={handleRestoreSnapshot}
        savedSnapshots={savedSnapshots}
        onUpdateSnapshots={setSavedSnapshots}
        onResetDefaultSnapshots={handleResetDefaultSnapshots}
      />

      {/* Modal Cài Đặt Gemini API Key Local-Only (Round 5) */}
      <GeminiLocalKeySettingsModal
        isOpen={isKeySettingsModalOpen}
        onClose={() => setIsKeySettingsModalOpen(false)}
        onKeyChange={(newKey) => setLocalApiKey(newKey)}
      />

      {/* Global Coming Soon Feedback Modal */}
      <ComingSoonModal
        feature={comingSoonModal}
        onClose={() => setComingSoonModal(null)}
      />

      {/* App Shell Footer */}
      <Footer />
    </div>
  );
}
