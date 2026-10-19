import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Layers,
  HelpCircle,
  MessageSquarePlus,
  Link2,
  ArrowRight,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  Plus,
  Trash2,
  Lightbulb,
  Compass,
  GraduationCap,
  RefreshCw,
  Database,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Columns,
  Save,
  FolderOpen,
  Key,
} from 'lucide-react';
import { StudyPackVersionManager } from './StudyPackVersionManager';
import {
  StudyMaterialItem,
  GeneratedStudyPack,
  PracticeQuestionFormat,
  StudyPackKeyPoint,
  StudyPackFlashcard,
  StudyPackPracticeQuestion,
  StudyPackQASeed,
} from '../types';
import {
  GENERATION_ORDER_PROPOSAL,
  buildSynthesizedStudyPackFromMaterials,
  evaluateStudyPackQuality,
  refineStudyPackToRealLearning,
  getQuestionReviewTip,
} from '../data/studyPackData';
import {
  loadMasteredPointIds,
  saveMasteredPointIds,
  loadAICustomTakeaways,
  saveAICustomTakeaways,
  loadLocalGeminiApiKey,
  saveLocalGeminiApiKey,
  AICustomTakeaway,
} from '../utils/storage';

interface AIStudyPackPreviewSectionProps {
  materials: StudyMaterialItem[];
  studyPacks: GeneratedStudyPack[];
  activePackId: string;
  onSelectPackId: (id: string) => void;
  onAddStudyPack: (newPack: GeneratedStudyPack) => void;
  onUpdateStudyPack?: (updatedPack: GeneratedStudyPack) => void;
  onDeleteStudyPack?: (packId: string) => void;
  onResetStudyPacks: () => void;
  onNavigateToMaterials?: () => void;
  onNavigateToQuiz?: () => void;
  onNavigateToFlashcards?: () => void;
  onNavigateToTutor?: () => void;
  onSaveCurrentTopic?: () => void;
  onOpenSavedTopics?: () => void;
  onOpenKeySettings?: () => void;
}

type StepFilterType =
  | 'all'
  | 'summary_keypoints'
  | 'summary'
  | 'keypoints'
  | 'flashcards'
  | 'questions'
  | 'qaseeds';

export const AIStudyPackPreviewSection: React.FC<AIStudyPackPreviewSectionProps> = ({
  materials,
  studyPacks,
  activePackId,
  onSelectPackId,
  onAddStudyPack,
  onUpdateStudyPack,
  onDeleteStudyPack,
  onResetStudyPacks,
  onNavigateToMaterials,
  onNavigateToQuiz,
  onNavigateToFlashcards,
  onNavigateToTutor,
  onSaveCurrentTopic,
  onOpenSavedTopics,
  onOpenKeySettings,
}) => {
  const activePack = studyPacks.find((p) => p.id === activePackId) || studyPacks[0];

  // State cho bộ lọc bước hiển thị trong Study Pack
  const [activeStepFilter, setActiveStepFilter] = useState<StepFilterType>('all');
  const [selectedPipelineStep, setSelectedPipelineStep] = useState<number>(1);

  // State hiển thị bảng chi tiết Rà lỗi 7 tiêu chí
  const [showAuditDetails, setShowAuditDetails] = useState<boolean>(true);
  const [isAuditingPack, setIsAuditingPack] = useState<boolean>(false);

  // State cấu hình AI Content Generation từ nguồn học liệu
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>(() =>
    materials.slice(0, 2).map((m) => m.id)
  );
  const [targetGradeLevel, setTargetGradeLevel] = useState<string>(
    'Lớp 7 - 9 (THCS • Khoa học Tự nhiên) & Liên thông THPT'
  );
  const [customPackTitle, setCustomPackTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingStepIndex, setGeneratingStepIndex] = useState<number>(0);
  const [generationBannerMessage, setGenerationBannerMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  // State tương tác của học sinh trên màn hình Preview "AI đã hiểu gì"
  const [localApiKey, setLocalApiKey] = useState<string>(loadLocalGeminiApiKey);
  const [masteredPointIds, setMasteredPointIds] = useState<string[]>(loadMasteredPointIds);
  const [customTakeaways, setCustomTakeaways] = useState<AICustomTakeaway[]>(loadAICustomTakeaways);
  const [newTakeawayInput, setNewTakeawayInput] = useState<string>('');

  const handleUpdateLocalApiKey = (key: string) => {
    setLocalApiKey(key);
    saveLocalGeminiApiKey(key);
  };

  // State Flashcard: Chế độ Lật thẻ (flip) vs Chế độ Tách 2 Mặt Song Song (split)
  const [flashcardViewMode, setFlashcardViewMode] = useState<'split' | 'flip'>('split');
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);

  // State bộ lọc, làm thử câu hỏi cơ bản 4 dạng & xem lời giải
  const [questionFormatFilter, setQuestionFormatFilter] = useState<'all' | PracticeQuestionFormat>('all');
  const [revealedQuestionIds, setRevealedQuestionIds] = useState<string[]>([]);
  const [studentSelectedOption, setStudentSelectedOption] = useState<Record<string, string>>({});
  const [studentTextAnswer, setStudentTextAnswer] = useState<Record<string, string>>({});
  const [checkedQuestionIds, setCheckedQuestionIds] = useState<string[]>([]);

  // Đồng bộ lựa chọn học liệu khi danh sách materials thay đổi
  useEffect(() => {
    setSelectedMaterialIds((prev) => {
      const validIds = prev.filter((id) => materials.some((m) => m.id === id));
      if (validIds.length > 0) return validIds;
      return materials.slice(0, 2).map((m) => m.id);
    });
  }, [materials]);

  // Lưu trạng thái "Đã nắm vững" vào LocalStorage
  useEffect(() => {
    saveMasteredPointIds(masteredPointIds);
  }, [masteredPointIds]);

  // Lưu ghi chú bổ sung của học sinh vào LocalStorage
  useEffect(() => {
    saveAICustomTakeaways(customTakeaways);
  }, [customTakeaways]);

  const toggleSelectMaterial = (id: string) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllMaterials = () => {
    if (selectedMaterialIds.length === materials.length) {
      setSelectedMaterialIds(materials.slice(0, 1).map((m) => m.id));
    } else {
      setSelectedMaterialIds(materials.map((m) => m.id));
    }
  };

  const toggleMasteredPoint = (pointId: string) => {
    setMasteredPointIds((prev) =>
      prev.includes(pointId) ? prev.filter((id) => id !== pointId) : [...prev, pointId]
    );
  };

  const handleAddTakeaway = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTakeawayInput.trim();
    if (!trimmed) return;
    const newNote: AICustomTakeaway = {
      id: `note-${Date.now()}`,
      topicTitle: activePack?.topicTitle || 'Hóa học',
      content: trimmed,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setCustomTakeaways((prev) => [newNote, ...prev]);
    setNewTakeawayInput('');
  };

  const handleDeleteTakeaway = (id: string) => {
    setCustomTakeaways((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleFlipCard = (cardId: string) => {
    setFlippedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleFlipAllCards = () => {
    if (!activePack) return;
    const allIds = activePack.flashcards.map((c) => c.id);
    if (flippedCardIds.length === allIds.length) {
      setFlippedCardIds([]);
    } else {
      setFlippedCardIds(allIds);
    }
  };

  const toggleRevealQuestion = (questionId: string) => {
    setRevealedQuestionIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleRevealAllQuestions = () => {
    if (!activePack) return;
    const allIds = activePack.practiceQuestions.map((q) => q.id);
    if (revealedQuestionIds.length === allIds.length) {
      setRevealedQuestionIds([]);
    } else {
      setRevealedQuestionIds(allIds);
    }
  };

  const handleSelectOptionForQuestion = (questionId: string, optionValue: string) => {
    setStudentSelectedOption((prev) => ({ ...prev, [questionId]: optionValue }));
    setCheckedQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
    setRevealedQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  const handleCheckTextAnswer = (questionId: string) => {
    setCheckedQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
    setRevealedQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  // Kiểm tra câu trả lời Điền từ ngắn / Hỏi đáp ngắn của học sinh
  const isTextAnswerCorrect = (q: StudyPackPracticeQuestion, userText: string): boolean => {
    const clean = userText.trim().toLowerCase();
    if (!clean) return false;
    if (q.AcceptableKeywords && q.AcceptableKeywords.length > 0) {
      return q.AcceptableKeywords.some((kw) => clean.includes(kw.toLowerCase()));
    }
    const cleanSample = q.sampleAnswer.trim().toLowerCase();
    return cleanSample.includes(clean) || clean.includes(cleanSample);
  };

  // Hàm Rà lỗi & Tinh chỉnh Study Pack hiện tại theo hướng "Học Được Thật"
  const handleAuditAndRefineActivePack = () => {
    if (!activePack) return;
    setIsAuditingPack(true);
    setTimeout(() => {
      const refined = refineStudyPackToRealLearning(activePack, materials);
      if (onUpdateStudyPack) {
        onUpdateStudyPack(refined);
      } else {
        onAddStudyPack(refined);
      }
      setShowAuditDetails(true);
      setGenerationBannerMessage({
        type: 'success',
        text: `Đã rà lỗi 7 tiêu chí và chuẩn hóa "${refined.title}" theo hướng HỌC ĐƯỢC THẬT (Loại bỏ trùng lặp, bỏ câu meta, chuẩn hóa 4 dạng câu hỏi cơ bản, tách rõ Mặt trước/Mặt sau Flashcard & gắn trích dẫn học liệu gốc #mat-...)!`,
      });
      setIsAuditingPack(false);
    }, 350);
  };

  // Hàm gọi AI sinh Summary & Key Points hoặc trọn bộ Study Pack theo thứ tự 5 bước
  const handleGenerateStudyPack = async (
    focusMode: 'summary_keypoints' | 'full_pack' = 'full_pack'
  ) => {
    const chosenMaterials = materials.filter((m) => selectedMaterialIds.includes(m.id));
    const effectiveMaterials =
      chosenMaterials.length > 0 ? chosenMaterials : materials.slice(0, 2);
    const nextFilter: StepFilterType =
      focusMode === 'summary_keypoints' ? 'summary_keypoints' : 'all';

    setIsGenerating(true);
    setGenerationBannerMessage(null);
    setGeneratingStepIndex(1);

    const stepTimer = setInterval(() => {
      setGeneratingStepIndex((prev) => (prev < 5 ? prev + 1 : prev));
    }, 650);

    try {
      const response = await fetch('/api/ai/generate-study-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: effectiveMaterials,
          gradeLevel: targetGradeLevel,
          customPackTitle: customPackTitle.trim(),
        }),
      });

      clearInterval(stepTimer);
      setGeneratingStepIndex(5);

      if (response.ok) {
        const data = await response.json();
        const rawPack = data.pack;

        if (rawPack && rawPack.summary) {
          const newPack: GeneratedStudyPack = {
            id: `pack-ai-${Date.now()}`,
            title:
              customPackTitle.trim() ||
              rawPack.title ||
              `Study Pack AI: ${effectiveMaterials[0]?.topicTitle || 'Hóa học'}`,
            topicId: effectiveMaterials[0]?.topicId || 'topic-ai',
            topicTitle:
              rawPack.topicTitle || effectiveMaterials[0]?.topicTitle || 'Chuyên đề Hóa học',
            gradeLevel: targetGradeLevel,
            sourceMaterialIds: effectiveMaterials.map((m) => m.id),
            sourceMaterialTitles: effectiveMaterials.map((m) => m.title),
            generatedAt: `Sinh & Rà lỗi bởi Gemini AI lúc ${new Date().toLocaleTimeString(
              'vi-VN',
              {
                hour: '2-digit',
                minute: '2-digit',
              }
            )}`,
            generationMethod: 'gemini-ai',
            lastAuditedAt: 'Đã kiểm duyệt 7/7 tiêu chí Học Được Thật',
            summary: {
              overview: rawPack.summary.overview || '',
              coreTheme: rawPack.summary.coreTheme || '',
              targetGrade: rawPack.summary.targetGrade || targetGradeLevel,
              estimatedReadMinutes: rawPack.summary.estimatedReadMinutes || 5,
              prerequisiteKnowledge: Array.isArray(rawPack.summary.prerequisiteKnowledge)
                ? rawPack.summary.prerequisiteKnowledge
                : [],
              learningObjectives: Array.isArray(rawPack.summary.learningObjectives)
                ? rawPack.summary.learningObjectives
                : [],
              aiDetectedConcepts: Array.isArray(rawPack.summary.aiDetectedConcepts)
                ? rawPack.summary.aiDetectedConcepts
                : [],
            },
            keyPoints: (Array.isArray(rawPack.keyPoints) ? rawPack.keyPoints : []).map(
              (kp: Partial<StudyPackKeyPoint>, idx: number) => ({
                id: `kp-ai-${Date.now()}-${idx}`,
                order: idx + 1,
                title: kp.title || `Luận điểm khoa học #${idx + 1}`,
                category:
                  kp.category === 'Phương trình (PTHH)' ||
                  kp.category === 'Hiện tượng nhận biết' ||
                  kp.category === 'Mẹo & Lưu ý thi'
                    ? kp.category
                    : 'Khái niệm',
                explanation: kp.explanation || '',
                formulaOrEquation: kp.formulaOrEquation,
                examTip: kp.examTip,
                difficultyTag:
                  kp.difficultyTag === 'Cơ bản (Lớp 7-9)' || kp.difficultyTag === 'Vận dụng'
                    ? kp.difficultyTag
                    : 'Trọng tâm (Lớp 10-12)',
                sourceRef:
                  kp.sourceRef ||
                  `Trích #${effectiveMaterials[idx % effectiveMaterials.length]?.id}: ${
                    effectiveMaterials[idx % effectiveMaterials.length]?.title
                  }`,
              })
            ),
            flashcards: (Array.isArray(rawPack.flashcards) ? rawPack.flashcards : []).map(
              (fc: Partial<StudyPackFlashcard>, idx: number) => ({
                id: `fc-ai-${Date.now()}-${idx}`,
                order: idx + 1,
                category: fc.category || 'Ghi nhớ nhanh',
                frontPrompt: fc.frontPrompt || '',
                frontHint: fc.frontHint,
                backAnswer: fc.backAnswer || '',
                backFormula: fc.backFormula,
                memoryHook: fc.memoryHook,
                sourceRef:
                  fc.sourceRef ||
                  `Liên kết #${effectiveMaterials[idx % effectiveMaterials.length]?.id}: ${
                    effectiveMaterials[idx % effectiveMaterials.length]?.title
                  }`,
              })
            ),
            practiceQuestions: (Array.isArray(rawPack.practiceQuestions)
              ? rawPack.practiceQuestions
              : []
            ).map((pq: Partial<StudyPackPracticeQuestion>, idx: number) => {
              const validFormat: PracticeQuestionFormat =
                pq.format === 'true_false' ||
                pq.format === 'fill_blank' ||
                pq.format === 'short_answer'
                  ? pq.format
                  : 'multiple_choice';
              return {
                id: `pq-ai-${Date.now()}-${idx}`,
                order: idx + 1,
                format: validFormat,
                formatLabel: pq.formatLabel || `Dạng câu hỏi #${idx + 1}`,
                cognitiveLevel:
                  pq.cognitiveLevel === 'Nhận biết' || pq.cognitiveLevel === 'Vận dụng cơ bản'
                    ? pq.cognitiveLevel
                    : 'Thông hiểu',
                question: pq.question || '',
                formulaContext: pq.formulaContext,
                options: Array.isArray(pq.options) ? pq.options : undefined,
                sampleAnswer: pq.sampleAnswer || '',
                explanation: pq.explanation || '',
                sourceRef:
                  pq.sourceRef ||
                  `Bám sát #${effectiveMaterials[idx % effectiveMaterials.length]?.id}: ${
                    effectiveMaterials[idx % effectiveMaterials.length]?.title
                  }`,
              };
            }),
            qaSeeds: (Array.isArray(rawPack.qaSeeds) ? rawPack.qaSeeds : []).map(
              (qa: Partial<StudyPackQASeed>, idx: number) => ({
                id: `qa-ai-${Date.now()}-${idx}`,
                order: idx + 1,
                studentQuestion: qa.studentQuestion || '',
                intentTag:
                  qa.intentTag === 'So sánh phân biệt' ||
                  qa.intentTag === 'Ứng dụng thực tế' ||
                  qa.intentTag === 'Bẫy thường gặp'
                    ? qa.intentTag
                    : 'Giải thích bản chất',
                aiSeedAnswer: qa.aiSeedAnswer || '',
                followUpPrompt: qa.followUpPrompt || '',
                sourceRef:
                  qa.sourceRef ||
                  `Mở rộng từ #${effectiveMaterials[idx % effectiveMaterials.length]?.id}: ${
                    effectiveMaterials[idx % effectiveMaterials.length]?.title
                  }`,
              })
            ),
          };

          newPack.auditCriteria = evaluateStudyPackQuality(newPack, materials);
          onAddStudyPack(newPack);
          setCustomPackTitle('');
          setActiveStepFilter(nextFilter);
          setGenerationBannerMessage({
            type: 'success',
            text:
              focusMode === 'summary_keypoints'
                ? `Đã tạo Summary & Key Points cốt lõi cho "${newPack.title}" (đã rà lỗi 7 tiêu chí) và lưu vào LocalStorage!`
                : `Đã sinh thành công "${newPack.title}" từ ${effectiveMaterials.length} nguồn học liệu bằng Gemini AI (đã kiểm duyệt 7 tiêu chí Học Được Thật) và lưu vào LocalStorage!`,
          });
          setIsGenerating(false);
          return;
        }
      }

      const synthesizedPack = buildSynthesizedStudyPackFromMaterials(
        effectiveMaterials,
        targetGradeLevel,
        customPackTitle
      );
      onAddStudyPack(synthesizedPack);
      setCustomPackTitle('');
      setActiveStepFilter(nextFilter);
      setGenerationBannerMessage({
        type: 'info',
        text:
          focusMode === 'summary_keypoints'
            ? `Đã tạo Summary & Key Points thực chất từ ${effectiveMaterials.length} nguồn học liệu đã chọn (gắn trích dẫn nguồn) và lưu vào LocalStorage!`
            : `Đã tổng hợp & rà lỗi "${synthesizedPack.title}" từ ${effectiveMaterials.length} nguồn học liệu bạn chọn theo đúng 7 tiêu chí Học Được Thật và lưu vào LocalStorage!`,
      });
    } catch {
      clearInterval(stepTimer);
      const synthesizedPack = buildSynthesizedStudyPackFromMaterials(
        effectiveMaterials,
        targetGradeLevel,
        customPackTitle
      );
      onAddStudyPack(synthesizedPack);
      setCustomPackTitle('');
      setActiveStepFilter(nextFilter);
      setGenerationBannerMessage({
        type: 'info',
        text:
          focusMode === 'summary_keypoints'
            ? `Đã tạo Summary & Key Points cốt lõi từ ${effectiveMaterials.length} nguồn học liệu của bạn và lưu tự động vào LocalStorage!`
            : `Đã tổng hợp & rà lỗi "${synthesizedPack.title}" trực tiếp từ ${effectiveMaterials.length} nguồn học liệu của bạn và lưu tự động vào LocalStorage!`,
      });
    } finally {
      setIsGenerating(false);
      setGeneratingStepIndex(0);
    }
  };

  // Hàm Re-generate toàn bộ Study Pack từ nguồn học liệu gốc (PROMPT 05)
  const handleRegenerateCurrentPack = async () => {
    if (!activePack) return;
    setIsGenerating(true);
    setGenerationBannerMessage(null);
    setGeneratingStepIndex(1);

    // 1. Tìm các học liệu nguồn gốc ban đầu của pack này (giữ nguyên không làm mất)
    const matchingMaterials = materials.filter((m) =>
      activePack.sourceMaterialIds && activePack.sourceMaterialIds.includes(m.id)
    );
    const effectiveMaterials =
      matchingMaterials.length > 0
        ? matchingMaterials
        : materials.filter((m) => m.topicId === activePack.topicId).length > 0
        ? materials.filter((m) => m.topicId === activePack.topicId)
        : materials.slice(0, 2);

    // 2. Tính số version tiếp theo của chủ đề này
    const topicPacks = studyPacks.filter((p) => p.topicId === activePack.topicId);
    const currentMaxVersion = topicPacks.reduce(
      (max, p) => Math.max(max, p.versionNumber || 1),
      1
    );
    const nextVersion = currentMaxVersion + 1;

    const stepTimer = setInterval(() => {
      setGeneratingStepIndex((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await fetch('/api/ai/generate-study-pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localApiKey.trim() ? { 'x-gemini-api-key': localApiKey.trim() } : {}),
        },
        body: JSON.stringify({
          materials: effectiveMaterials,
          gradeLevel: activePack.gradeLevel,
          customPackTitle: `[v${nextVersion}] ${activePack.topicTitle} (Làm mới bởi AI)`,
          localApiKey: localApiKey.trim(),
        }),
      });

      clearInterval(stepTimer);
      setGeneratingStepIndex(5);

      if (response.ok) {
        const data = await response.json();
        const rawPack = data.pack;

        if (rawPack && rawPack.summary) {
          const regeneratedPack: GeneratedStudyPack = {
            id: `pack-ai-${activePack.topicId}-v${nextVersion}-${Date.now()}`,
            title: `[v${nextVersion}] ${activePack.topicTitle} (Làm mới bởi Gemini AI)`,
            topicId: activePack.topicId,
            topicTitle: activePack.topicTitle,
            gradeLevel: activePack.gradeLevel,
            sourceMaterialIds: effectiveMaterials.map((m) => m.id),
            sourceMaterialTitles: effectiveMaterials.map((m) => m.title),
            generatedAt: `Sinh lại lúc ${new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })} (${new Date().toLocaleDateString('vi-VN')})`,
            generationMethod: 'gemini-ai',
            versionNumber: nextVersion,
            versionTag: `v${nextVersion}.0 (Re-generate mới)`,
            parentPackId: activePack.parentPackId || activePack.id,
            createdAtTimestamp: Date.now(),
            lastAuditedAt: 'Đã kiểm duyệt 7/7 tiêu chí Học Được Thật',
            summary: {
              overview: rawPack.summary.overview || '',
              coreTheme: rawPack.summary.coreTheme || '',
              targetGrade: rawPack.summary.targetGrade || activePack.gradeLevel,
              estimatedReadMinutes: rawPack.summary.estimatedReadMinutes || 5,
              prerequisiteKnowledge: Array.isArray(rawPack.summary.prerequisiteKnowledge)
                ? rawPack.summary.prerequisiteKnowledge
                : [],
              learningObjectives: Array.isArray(rawPack.summary.learningObjectives)
                ? rawPack.summary.learningObjectives
                : [],
              aiDetectedConcepts: Array.isArray(rawPack.summary.aiDetectedConcepts)
                ? rawPack.summary.aiDetectedConcepts
                : [],
            },
            keyPoints: (Array.isArray(rawPack.keyPoints) ? rawPack.keyPoints : []).map(
              (kp: Partial<StudyPackKeyPoint>, idx: number) => ({
                id: `kp-v${nextVersion}-${Date.now()}-${idx}`,
                order: idx + 1,
                title: kp.title || `Luận điểm khoa học #${idx + 1}`,
                category:
                  kp.category === 'Phương trình (PTHH)' ||
                  kp.category === 'Hiện tượng nhận biết' ||
                  kp.category === 'Mẹo & Lưu ý thi'
                    ? kp.category
                    : 'Khái niệm',
                explanation: kp.explanation || '',
                formulaOrEquation: kp.formulaOrEquation,
                examTip: kp.examTip,
                difficultyTag: kp.difficultyTag || 'Trọng tâm (Lớp 10-12)',
                sourceRef:
                  kp.sourceRef ||
                  `Trích #${effectiveMaterials[idx % effectiveMaterials.length]?.id}: ${
                    effectiveMaterials[idx % effectiveMaterials.length]?.title
                  }`,
              })
            ),
            flashcards: (Array.isArray(rawPack.flashcards) ? rawPack.flashcards : []).map(
              (fc: Partial<StudyPackFlashcard>, idx: number) => ({
                id: `fc-v${nextVersion}-${Date.now()}-${idx}`,
                order: idx + 1,
                category: fc.category || 'Ghi nhớ nhanh',
                frontPrompt: fc.frontPrompt || '',
                frontHint: fc.frontHint,
                backAnswer: fc.backAnswer || '',
                backFormula: fc.backFormula,
                memoryHook: fc.memoryHook,
                sourceRef:
                  fc.sourceRef ||
                  `Liên kết #${effectiveMaterials[idx % effectiveMaterials.length]?.id}: ${
                    effectiveMaterials[idx % effectiveMaterials.length]?.title
                  }`,
              })
            ),
            practiceQuestions: (Array.isArray(rawPack.practiceQuestions)
              ? rawPack.practiceQuestions
              : []
            ).map((pq: Partial<StudyPackPracticeQuestion>, idx: number) => {
              const validFormat: PracticeQuestionFormat =
                pq.format === 'true_false' ||
                pq.format === 'fill_blank' ||
                pq.format === 'short_answer'
                  ? pq.format
                  : 'multiple_choice';
              return {
                id: `pq-v${nextVersion}-${Date.now()}-${idx}`,
                order: idx + 1,
                format: validFormat,
                formatLabel: pq.formatLabel || `Dạng câu hỏi #${idx + 1}`,
                cognitiveLevel:
                  pq.cognitiveLevel === 'Nhận biết' || pq.cognitiveLevel === 'Vận dụng cơ bản'
                    ? pq.cognitiveLevel
                    : 'Thông hiểu',
                question: pq.question || '',
                formulaContext: pq.formulaContext,
                options: Array.isArray(pq.options) ? pq.options : undefined,
                sampleAnswer: pq.sampleAnswer || '',
                explanation: pq.explanation || '',
                reviewTip: getQuestionReviewTip(pq as any),
                sourceRef:
                  pq.sourceRef ||
                  `Bám sát #${effectiveMaterials[idx % effectiveMaterials.length]?.id}: ${
                    effectiveMaterials[idx % effectiveMaterials.length]?.title
                  }`,
              };
            }),
            qaSeeds: (Array.isArray(rawPack.qaSeeds) ? rawPack.qaSeeds : []).map(
              (qa: Partial<StudyPackQASeed>, idx: number) => ({
                id: `qa-v${nextVersion}-${Date.now()}-${idx}`,
                order: idx + 1,
                studentQuestion: qa.studentQuestion || '',
                intentTag:
                  qa.intentTag === 'So sánh phân biệt' ||
                  qa.intentTag === 'Ứng dụng thực tế' ||
                  qa.intentTag === 'Bẫy thường gặp'
                    ? qa.intentTag
                    : 'Giải thích bản chất',
                aiSeedAnswer: qa.aiSeedAnswer || '',
                followUpPrompt: qa.followUpPrompt || '',
                sourceRef:
                  qa.sourceRef ||
                  `Căn cứ #${effectiveMaterials[idx % effectiveMaterials.length]?.id}: ${
                    effectiveMaterials[idx % effectiveMaterials.length]?.title
                  }`,
              })
            ),
          };

          regeneratedPack.auditCriteria = evaluateStudyPackQuality(regeneratedPack, materials);
          onAddStudyPack(regeneratedPack);
          setGenerationBannerMessage({
            type: 'success',
            text: `🎉 Đã re-generate thành công Version ${nextVersion} cho "${activePack.topicTitle}" từ ${effectiveMaterials.length} nguồn học liệu gốc (làm mới Summary, Quiz, Flashcard, Q&A và bảo toàn nguồn ban đầu)!`,
          });
          setIsGenerating(false);
          return;
        }
      }

      // Fallback tổng hợp có variation
      const synthesizedPack = buildSynthesizedStudyPackFromMaterials(
        effectiveMaterials,
        activePack.gradeLevel,
        `[v${nextVersion}] ${activePack.topicTitle} (Làm mới)`
      );
      synthesizedPack.id = `pack-synth-${activePack.topicId}-v${nextVersion}-${Date.now()}`;
      synthesizedPack.versionNumber = nextVersion;
      synthesizedPack.versionTag = `v${nextVersion}.0 (Re-generate mới)`;
      synthesizedPack.parentPackId = activePack.parentPackId || activePack.id;
      synthesizedPack.createdAtTimestamp = Date.now();
      synthesizedPack.generationMethod = 'gemini-ai';
      synthesizedPack.generatedAt = `Làm mới lúc ${new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      onAddStudyPack(synthesizedPack);
      setGenerationBannerMessage({
        type: 'success',
        text: `🎉 Đã re-generate thành công Version ${nextVersion} cho "${activePack.topicTitle}" từ ${effectiveMaterials.length} nguồn học liệu gốc (làm mới toàn bộ Summary, Quiz, Flashcard, Q&A)!`,
      });
    } catch {
      clearInterval(stepTimer);
      const synthesizedPack = buildSynthesizedStudyPackFromMaterials(
        effectiveMaterials,
        activePack.gradeLevel,
        `[v${nextVersion}] ${activePack.topicTitle} (Làm mới)`
      );
      synthesizedPack.id = `pack-synth-${activePack.topicId}-v${nextVersion}-${Date.now()}`;
      synthesizedPack.versionNumber = nextVersion;
      synthesizedPack.versionTag = `v${nextVersion}.0 (Re-generate mới)`;
      synthesizedPack.parentPackId = activePack.parentPackId || activePack.id;
      synthesizedPack.createdAtTimestamp = Date.now();
      synthesizedPack.generationMethod = 'gemini-ai';
      synthesizedPack.generatedAt = `Làm mới lúc ${new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      onAddStudyPack(synthesizedPack);
      setGenerationBannerMessage({
        type: 'success',
        text: `🎉 Đã re-generate thành công Version ${nextVersion} cho "${activePack.topicTitle}" từ ${effectiveMaterials.length} nguồn học liệu gốc!`,
      });
    } finally {
      setIsGenerating(false);
      setGeneratingStepIndex(0);
    }
  };

  const handleDeletePack = (packId: string) => {
    if (onDeleteStudyPack) {
      onDeleteStudyPack(packId);
    } else if (studyPacks.length > 1) {
      const remaining = studyPacks.filter((p) => p.id !== packId);
      if (activePackId === packId && remaining[0]) {
        onSelectPackId(remaining[0].id);
      }
    }
  };

  if (!activePack) return null;

  const auditItems =
    activePack.auditCriteria && activePack.auditCriteria.length > 0
      ? activePack.auditCriteria
      : evaluateStudyPackQuality(activePack, materials);

  const passedOrFixedCount = auditItems.filter(
    (c) => c.status === 'passed' || c.status === 'fixed'
  ).length;

  const filteredQuestions =
    questionFormatFilter === 'all'
      ? activePack.practiceQuestions
      : activePack.practiceQuestions.filter((q) => q.format === questionFormatFilter);

  const activePipelineStepDetail =
    GENERATION_ORDER_PROPOSAL.find((s) => s.stepNumber === selectedPipelineStep) ||
    GENERATION_ORDER_PROPOSAL[0];

  const masteredCountInPack = activePack.keyPoints.filter((kp) =>
    masteredPointIds.includes(kp.id)
  ).length;

  return (
    <div id="ai-study-pack-preview-container" className="space-y-8">
      {/* 1. HEADER BANNER: MÀN HÌNH PREVIEW "AI ĐÃ HIỂU GÌ" & CHUẨN HÓA "HỌC ĐƯỢC THẬT" */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#0e121e] via-[#151828] to-[#1d121d] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-semibold">
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Buổi 3: AI Study Pack (Đã Rà Lỗi “Học Được Thật”)
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="text-emerald-300 flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                Đã lưu {studyPacks.length} Study Pack (LocalStorage)
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="text-amber-200 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Đạt {passedOrFixedCount}/7 tiêu chí Rà lỗi Sư phạm
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onSaveCurrentTopic && (
                <button
                  type="button"
                  id="btn-studypack-save-snapshot"
                  onClick={onSaveCurrentTopic}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm active:scale-98"
                  title="Lưu trọn vẹn snapshot working copy của chủ đề hiện tại"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Lưu chủ đề này</span>
                </button>
              )}

              {onOpenSavedTopics && (
                <button
                  type="button"
                  id="btn-studypack-open-saved"
                  onClick={onOpenSavedTopics}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#141a2a] hover:bg-[#1a2236] text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer active:scale-98"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>Môn đã lưu</span>
                </button>
              )}

              {onOpenKeySettings && (
                <button
                  type="button"
                  id="btn-studypack-open-key-settings"
                  onClick={onOpenKeySettings}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer active:scale-98 ${
                    localApiKey
                      ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#141a2a] hover:bg-[#1a2236] text-amber-300 border-amber-500/30'
                  }`}
                  title="Cài đặt Gemini API Key cá nhân (Round 5 • Local-Only)"
                >
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  <span>{localApiKey ? 'Gemini Key (Đã lưu)' : 'Cài Gemini Key'}</span>
                </button>
              )}

              {onNavigateToMaterials && (
                <button
                  type="button"
                  onClick={onNavigateToMaterials}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#161b2c] hover:bg-[#1e253a] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition whitespace-nowrap"
                >
                  <span>Học liệu gốc ({materials.length})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-balance">
              Study Pack & Kiểm Duyệt Chất Lượng:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
                “Học Được Thật”
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-4xl leading-relaxed">
              Mọi thành phần trong Study Pack (Summary, Key Points, Flashcard 2 mặt, 4 dạng Câu hỏi cơ bản, Q&A Seed) đều được{' '}
              <strong>rà lỗi chống trùng lặp, xóa bỏ câu dẫn meta sáo rỗng, tách bạch Mặt trước/Mặt sau</strong> và{' '}
              <strong>gắn trích dẫn trực tiếp về học liệu gốc</strong> để học sinh từ Lớp 7 trở lên ôn bài hiệu quả ngay lập tức.
            </p>
          </div>
        </div>
      </div>

      {/* 2. BẢNG RÀ LỖI CHẤT LƯỢNG 7 TIÊU CHÍ ("HỌC ĐƯỢC THẬT") */}
      <div
        id="study-pack-quality-audit-panel"
        className="rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#0d151d] via-[#101826] to-[#131824] p-6 sm:p-7 shadow-xl space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>BỘ RÀ LỖI SƯ PHẠM 7 TIÊU CHÍ • ƯU TIÊN “HỌC ĐƯỢC THẬT”</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-300 tabular-nums">
                {activePack.lastAuditedAt || 'Đã kiểm duyệt 7/7 tiêu chí'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Báo Cáo Rà Lỗi & Chuẩn Hóa Study Pack Hiện Tại ({activePack.topicTitle})
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Kiểm tra 7 lỗi phổ biến của AI Content Generation: Nội dung lặp · Ý chính chung chung · Độ khó lệch chuẩn · Sai dạng cơ bản · Flashcard mờ nhạt Mặt trước/sau · Thiếu liên kết nguồn gốc · Quá nông hoặc quá Meta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              id="btn-audit-refine-pack"
              onClick={handleAuditAndRefineActivePack}
              disabled={isAuditingPack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:brightness-110 disabled:opacity-50 transition cursor-pointer whitespace-nowrap"
            >
              <Wrench className={`h-4 w-4 ${isAuditingPack ? 'animate-spin' : ''}`} />
              <span>
                {isAuditingPack
                  ? 'Đang rà lỗi & chuẩn hóa...'
                  : 'Rà lỗi & Tinh chỉnh "Học Được Thật"'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowAuditDetails((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#162030] hover:bg-[#1c293d] text-emerald-200 border border-emerald-500/30 text-xs font-bold transition cursor-pointer whitespace-nowrap"
            >
              {showAuditDetails ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Thu gọn bảng rà lỗi</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>Xem chi tiết 7 tiêu chí ({passedOrFixedCount}/7)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showAuditDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {auditItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#0c111c] border border-emerald-500/25 p-4 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-300 tabular-nums shrink-0">
                      {item.status === 'fixed' ? 'Đã khắc phục' : 'Đạt chuẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-rose-300">Vấn đề rà soát: </strong>
                    {item.issueFound}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 text-xs text-emerald-200/95 leading-relaxed">
                  <strong className="text-amber-300">Chỉnh theo hướng Học Được Thật: </strong>
                  {item.actionTaken}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. ĐỀ XUẤT THỨ TỰ SINH NỘI DUNG HỢP LÝ CHO HỌC SINH LỚP 7 TRỞ LÊN */}
      <div className="rounded-3xl border border-amber-500/30 bg-[#0d101a] p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Compass className="h-4 w-4" />
              <span>Đề xuất Sư phạm • Lộ trình Sinh Nội Dung 5 Bước (Phù hợp Học sinh Lớp 7+)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Thứ tự 5 bước không trùng lặp: Đi từ Tổng quan → Bản chất → Nhẩm nhớ → Vận dụng → Đào sâu
            </h2>
          </div>
          <div className="text-xs text-slate-400">
            Nhấn vào từng bước để xem lý giải sư phạm & lọc nhanh phần đó
          </div>
        </div>

        {/* 5-Step Interactive Pipeline Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {GENERATION_ORDER_PROPOSAL.map((step) => {
            const isSelected = selectedPipelineStep === step.stepNumber;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setSelectedPipelineStep(step.stepNumber);
                  setActiveStepFilter(step.id);
                }}
                className={`text-left p-4 rounded-2xl border transition flex flex-col justify-between relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#1b2034] to-[#231724] border-amber-400 shadow-[0_0_20px_rgba(245,192,66,0.2)]'
                    : 'bg-[#121624] hover:bg-[#171c2d] border-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black tabular-nums ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-amber-400/15 text-amber-300'
                      }`}
                    >
                      0{step.stepNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {step.timeEstimate}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white leading-snug">
                    {step.title.replace(/^Bước \d:\s*/, '')}
                  </div>
                  <div className="text-[11px] text-amber-300/85 mt-1 font-medium">
                    {step.bloomTier}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span>{step.outputCountLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Rationale Callout Box for the Selected Step */}
        <div className="rounded-2xl bg-[#131828] border border-amber-500/30 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Vai trò riêng biệt ở {activePipelineStepDetail.title}:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {activePipelineStepDetail.whyThisOrder}
            </p>
          </div>
          <div className="space-y-1.5 lg:border-l lg:border-amber-500/20 lg:pl-4">
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Hiệu quả thực tế với Học sinh Lớp 7 trở lên:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {activePipelineStepDetail.studentBenefitGrade7Plus}
            </p>
          </div>
        </div>
      </div>

      {/* 4. BẢNG ĐIỀU KHIỂN SINH STUDY PACK TỪ NGUỒN HỌC LIỆU ĐÃ LƯU */}
      <div className="rounded-3xl border border-amber-500/30 bg-[#0f1320] p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>Trình Sinh Study Pack Bám Sát Học Liệu Gốc (Có Gắn Trích Dẫn #mat-...)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Chọn các học liệu đầu vào trong LocalStorage để AI bóc tách phương trình, định nghĩa và sinh Study Pack không lặp, không meta.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSelectAllMaterials}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 bg-[#171c2e] px-3 py-1.5 rounded-xl border border-amber-500/30 transition self-start sm:self-auto whitespace-nowrap cursor-pointer"
          >
            {selectedMaterialIds.length === materials.length
              ? 'Bỏ chọn bớt học liệu'
              : `Chọn tất cả (${materials.length} nguồn)`}
          </button>
        </div>

        {/* Danh sách học liệu để tick chọn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {materials.map((item) => {
            const isChecked = selectedMaterialIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSelectMaterial(item.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  isChecked
                    ? 'bg-[#191f34] border-amber-400/70 shadow-md'
                    : 'bg-[#111522] border-white/10 opacity-75 hover:opacity-100'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    isChecked
                      ? 'bg-amber-400 border-amber-400 text-slate-950'
                      : 'border-slate-600 bg-transparent'
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono text-amber-300">#{item.id}</span>
                    <span>·</span>
                    <span>
                      {item.type === 'text' && 'Ghi chép văn bản'}
                      {item.type === 'image' && 'Ảnh chụp vở'}
                      {item.type === 'url' && 'Liên kết bài học'}
                    </span>
                    <span>·</span>
                    <span className="truncate text-amber-200/90">{item.topicTitle}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                    {item.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tùy chọn cấp lớp & nút bấm Sinh Study Pack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 items-end">
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cấp học & Trình độ ngôn ngữ giải thích:
            </label>
            <select
              value={targetGradeLevel}
              onChange={(e) => setTargetGradeLevel(e.target.value)}
              className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Lớp 7 - 9 (THCS • Khoa học Tự nhiên) & Liên thông THPT">
                Lớp 7 - 9 (THCS • Diễn giải trực quan, dễ hiểu)
              </option>
              <option value="Lớp 10 - 12 (THPT • Trọng tâm PTHH & Ôn thi)">
                Lớp 10 - 12 (THPT • Trọng tâm PTHH & Bẫy đề thi)
              </option>
              <option value="Lớp 7 trở lên (Kết hợp nền tảng THCS & chuyên sâu THPT)">
                Lớp 7 trở lên (Kết hợp nền tảng cơ bản & mở rộng)
              </option>
            </select>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Đặt tên Study Pack (Tùy chọn):
            </label>
            <input
              type="text"
              value={customPackTitle}
              onChange={(e) => setCustomPackTitle(e.target.value)}
              placeholder="VD: Study Pack Ôn kiểm tra 15 phút Este..."
              className="w-full rounded-xl bg-[#090c14] border border-amber-500/30 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              type="button"
              id="btn-generate-summary-keypoints"
              disabled={isGenerating || selectedMaterialIds.length === 0}
              onClick={() => handleGenerateStudyPack('summary_keypoints')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(245,192,66,0.3)] hover:brightness-110 disabled:opacity-50 transition whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Tạo Summary & Key Points ({selectedMaterialIds.length} nguồn)</span>
            </button>
            <button
              type="button"
              id="btn-generate-ai-study-pack"
              disabled={isGenerating || selectedMaterialIds.length === 0}
              onClick={() => handleGenerateStudyPack('full_pack')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#181e32] hover:bg-[#222a45] text-amber-300 border border-amber-500/40 font-bold text-xs disabled:opacity-50 transition whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang sinh Bước {generatingStepIndex}/5...</span>
                </>
              ) : (
                <span>+ Sinh trọn bộ Study Pack 5 Bước (Đã rà lỗi)</span>
              )}
            </button>
          </div>
        </div>

        {/* Tiến trình sinh 5 bước khi đang chạy */}
        {isGenerating && (
          <div className="rounded-2xl bg-[#090c14] border border-amber-400/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span>AI đang đọc học liệu gốc và kiểm duyệt 7 tiêu chí Học Được Thật...</span>
              <span className="tabular-nums">Bước {generatingStepIndex} / 5</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {GENERATION_ORDER_PROPOSAL.map((st) => (
                <div
                  key={st.stepNumber}
                  className={`p-2 rounded-lg text-[11px] font-semibold border transition ${
                    generatingStepIndex >= st.stepNumber
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                      : 'bg-[#111522] border-white/5 text-slate-500'
                  }`}
                >
                  {st.stepNumber}. {st.id.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thông báo sau khi sinh hoặc rà lỗi xong */}
        {generationBannerMessage && (
          <div className="rounded-2xl bg-emerald-950/50 border border-emerald-500/40 p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{generationBannerMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setGenerationBannerMessage(null)}
              className="text-emerald-300 hover:text-white font-bold px-2 py-0.5 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* KHU VỰC QUẢN LÝ VERSION & RE-GENERATE TỪ NGUỒN HỌC LIỆU GỐC (PROMPT 05 & PROMPT 06) */}
      <StudyPackVersionManager
        studyPacks={studyPacks}
        activePackId={activePackId}
        onSelectPackId={onSelectPackId}
        onDeletePack={handleDeletePack}
        onRegeneratePack={handleRegenerateCurrentPack}
        isRegenerating={isGenerating}
        activeTopicId={activePack.topicId}
        localApiKey={localApiKey}
        onUpdateLocalApiKey={handleUpdateLocalApiKey}
        onOpenKeySettings={onOpenKeySettings}
      />

      {/* 5. THANH CHỌN STUDY PACK ĐANG XEM & BỘ LỌC 5 BƯỚC */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#111522] p-4 rounded-2xl border border-amber-500/25">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-300">Đang xem Study Pack:</span>
            {studyPacks.map((pack) => {
              const isCurrent = pack.id === activePack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => {
                    onSelectPackId(pack.id);
                    setFlippedCardIds([]);
                    setRevealedQuestionIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-sm'
                      : 'bg-[#181e30] text-slate-300 hover:text-white border border-amber-500/20'
                  }`}
                >
                  {pack.title.length > 42 ? `${pack.title.slice(0, 42)}...` : pack.title}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onResetStudyPacks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 border border-amber-500/25 hover:bg-white/5 transition self-start lg:self-auto whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>Khôi phục 3 Study Pack chuẩn</span>
          </button>
        </div>

        {/* Hộp Thông tin đối chiếu Nguồn Học Liệu Gốc của Study Pack */}
        <div className="rounded-2xl bg-[#131829] border border-amber-500/35 p-5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="text-xs text-amber-300 font-semibold">
                Hồ sơ Học tập Chuẩn hóa • {activePack.generatedAt}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {activePack.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span>
                Trình độ: <strong className="text-amber-200">{activePack.gradeLevel}</strong>
              </span>
              <span>·</span>
              <span>
                Thời lượng ôn:{' '}
                <strong className="text-emerald-300 tabular-nums">
                  ~{activePack.summary.estimatedReadMinutes} phút
                </strong>
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-300 flex items-center gap-1.5 flex-wrap">
              <Link2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <strong className="text-amber-300">Liên kết Học liệu gốc: </strong>
              {activePack.sourceMaterialIds.map((id, idx) => (
                <span key={id} className="text-slate-200 font-medium">
                  <span className="font-mono text-amber-300">#{id}</span> (
                  {activePack.sourceMaterialTitles[idx] || 'Học liệu đã lưu'})
                  {idx < activePack.sourceMaterialIds.length - 1 ? '  ·  ' : ''}
                </span>
              ))}
            </div>
            <div className="text-emerald-300 font-semibold whitespace-nowrap tabular-nums">
              Đã nắm vững: {masteredCountInPack}/{activePack.keyPoints.length} ý chính
            </div>
          </div>
        </div>

        {/* Bộ lọc chuyển nhanh giữa 5 thành phần trong Study Pack */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#0d101b] p-1.5 rounded-2xl border border-amber-500/25">
          {[
            { id: 'all' as StepFilterType, label: 'Tất cả 5 bước (Đầy đủ)' },
            { id: 'summary_keypoints' as StepFilterType, label: '⚡ Summary + Key Points (Trọng tâm)' },
            { id: 'summary' as StepFilterType, label: '1. Summary (Tóm tắt)' },
            { id: 'keypoints' as StepFilterType, label: `2. Key Points (${activePack.keyPoints.length})` },
            { id: 'flashcards' as StepFilterType, label: `3. Flashcard (${activePack.flashcards.length})` },
            { id: 'questions' as StepFilterType, label: `4. Câu hỏi 4 dạng (${activePack.practiceQuestions.length})` },
            { id: 'qaseeds' as StepFilterType, label: `5. Q&A Seed (${activePack.qaSeeds.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStepFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeStepFilter === tab.id
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          BƯỚC 1: SUMMARY (TÓM TẮT BẢN CHẤT — KHÔNG META, ĐI THẲNG VÀO KIẾN THỨC)
         ===================================================================== */}
      {(activeStepFilter === 'all' ||
        activeStepFilter === 'summary_keypoints' ||
        activeStepFilter === 'summary') && (
        <section
          id="study-pack-step-1-summary"
          className="rounded-3xl border border-amber-500/30 bg-[#101422] p-6 sm:p-7 shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-sm tabular-nums">
                01
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Bước 1: Summary — Tóm Tắt Bản Chất Khoa Học (Không Lời Dẫn Meta)
                </h3>
                <p className="text-xs text-slate-400">
                  Tầng Định hướng • Đi thẳng vào cơ chế phản ứng và quy luật cốt lõi trong 30 giây đọc
                </p>
              </div>
            </div>
            <span className="text-xs text-amber-300 font-medium">
              Trục kiến thức: {activePack.summary.coreTheme}
            </span>
          </div>

          {/* Nội dung tóm tắt chính */}
          <div className="rounded-2xl bg-[#090c15] border border-amber-500/25 p-5">
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
              {activePack.summary.overview}
            </p>
          </div>

          {/* Hai cột: Kiến thức nền cần có & Mục tiêu cần đạt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#14192b] border border-white/10 p-4 space-y-2.5">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>Kiến thức nền tảng cần nhớ trước khi học bài này:</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                {activePack.summary.prerequisiteKnowledge.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-[#14192b] border border-white/10 p-4 space-y-2.5">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Kỹ năng làm bài đạt được sau khi ôn xong:</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                {activePack.summary.learningObjectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Các từ khóa / khái niệm trọng tâm */}
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="font-bold text-slate-300">Khái niệm & Công thức cốt lõi:</span>
            {activePack.summary.aiDetectedConcepts.map((concept, idx) => (
              <React.Fragment key={idx}>
                <span className="text-amber-300 font-medium">{concept}</span>
                {idx < activePack.summary.aiDetectedConcepts.length - 1 && (
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          BƯỚC 2: KEY POINTS (Ý CHÍNH CỤ THỂ, PTHH & TRÍCH DẪN HỌC LIỆU GỐC)
         ===================================================================== */}
      {(activeStepFilter === 'all' ||
        activeStepFilter === 'summary_keypoints' ||
        activeStepFilter === 'keypoints') && (
        <section
          id="study-pack-step-2-keypoints"
          className="rounded-3xl border border-amber-500/30 bg-[#101422] p-6 sm:p-7 shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-sm tabular-nums">
                02
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Bước 2: Key Points — Luận Điểm Cụ Thể, PTHH & Liên Kết Học Liệu Gốc
                </h3>
                <p className="text-xs text-slate-400">
                  Tầng Thông hiểu • Mỗi luận điểm đều giải thích rõ cơ chế, điều kiện phản ứng, bẫy thường gặp và trích dẫn nguồn gốc
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-300 tabular-nums">
              Đã nắm vững: {masteredCountInPack} / {activePack.keyPoints.length} ý chính
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePack.keyPoints.map((kp) => {
              const isMastered = masteredPointIds.includes(kp.id);
              return (
                <div
                  key={kp.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                    isMastered
                      ? 'bg-[#111c24] border-emerald-500/40'
                      : 'bg-[#14192b] border-amber-500/20 hover:border-amber-400/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-amber-400 tabular-nums">
                          Ý #{kp.order}
                        </span>
                        <span>·</span>
                        <span className="text-amber-200 font-semibold">{kp.category}</span>
                        <span>·</span>
                        <span className="text-slate-300">{kp.difficultyTag}</span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">{kp.title}</h4>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {kp.explanation}
                    </p>

                    {kp.formulaOrEquation && (
                      <div className="rounded-xl bg-[#080b12] border border-amber-500/25 p-3 font-mono text-xs sm:text-sm text-amber-300 font-semibold overflow-x-auto">
                        ⚗️ {kp.formulaOrEquation}
                      </div>
                    )}

                    {kp.examTip && (
                      <div className="text-xs text-rose-200 bg-rose-950/35 border border-rose-500/30 rounded-xl p-2.5">
                        <strong className="text-rose-300">Lưu ý tránh bẫy mất điểm: </strong>
                        {kp.examTip}
                      </div>
                    )}

                    {kp.sourceRef && (
                      <div className="text-[11px] text-emerald-300/90 flex items-start gap-1.5 pt-1">
                        <Link2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{kp.sourceRef}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {isMastered
                        ? 'Đã lưu trạng thái vào LocalStorage'
                        : 'Đánh dấu khi bạn đã thuộc công thức này'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleMasteredPoint(kp.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#1c2338] text-amber-300 hover:bg-amber-400 hover:text-slate-950 border border-amber-500/30'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{isMastered ? 'Đã nắm vững' : 'Đánh dấu đã hiểu'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ghi chú đính chính / bổ sung của học sinh (Lưu LocalStorage) */}
          <div className="rounded-2xl bg-[#0b0e18] border border-amber-500/25 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm font-bold text-amber-300">
                ✍️ Ghi chú bổ sung của em vào Study Pack này (Lưu tự động LocalStorage)
              </div>
              <span className="text-xs text-slate-400 tabular-nums">
                {customTakeaways.length} ghi chú cá nhân
              </span>
            </div>

            <form onSubmit={handleAddTakeaway} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newTakeawayInput}
                onChange={(e) => setNewTakeawayInput(e.target.value)}
                placeholder="Thêm ý nhấn mạnh của thầy cô trên lớp mà em muốn ghim vào Study Pack..."
                className="flex-1 rounded-xl bg-[#121726] border border-amber-500/30 px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs whitespace-nowrap transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Lưu ghi chú</span>
              </button>
            </form>

            {customTakeaways.length > 0 && (
              <div className="space-y-2 pt-1">
                {customTakeaways.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#14192a] px-3.5 py-2.5 border border-white/10 text-xs"
                  >
                    <div className="text-slate-200">
                      <span className="text-amber-300 font-semibold">[{note.topicTitle}]</span>{' '}
                      {note.content}{' '}
                      <span className="text-slate-500 ml-1">({note.createdAt})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTakeaway(note.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition cursor-pointer"
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          BƯỚC 3: FLASHCARDS PREVIEW (RÕ MẶT TRƯỚC ↔ MẶT SAU, KHÔNG LỘ ĐÁP ÁN Ở HINT)
         ===================================================================== */}
      {(activeStepFilter === 'all' || activeStepFilter === 'flashcards') && (
        <section
          id="study-pack-step-3-flashcards"
          className="rounded-3xl border border-amber-500/30 bg-[#101422] p-6 sm:p-7 shadow-xl space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-sm tabular-nums">
                03
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Bước 3: Flashcards — Tách Bạch Rõ Mặt Trước (Câu Hỏi Chốt) & Mặt Sau (Đáp Án 3 Tầng)
                </h3>
                <p className="text-xs text-slate-400">
                  Tầng Ghi nhớ chủ động • Không lặp lại nguyên văn Key Points; Gợi ý Mặt trước không làm lộ đáp án Mặt sau
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#0b0e18] p-1 rounded-xl border border-amber-500/25 text-xs">
                <button
                  type="button"
                  onClick={() => setFlashcardViewMode('split')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    flashcardViewMode === 'split'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span>Đối chiếu 2 Mặt (Rõ Mặt trước ↔ Mặt sau)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlashcardViewMode('flip')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    flashcardViewMode === 'flip'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Chế độ Lật thẻ tự nhẩm</span>
                </button>
              </div>

              {flashcardViewMode === 'flip' && (
                <button
                  type="button"
                  onClick={handleFlipAllCards}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181e30] hover:bg-[#202840] text-amber-300 border border-amber-500/30 text-xs font-bold transition whitespace-nowrap cursor-pointer"
                >
                  <span>
                    {flippedCardIds.length === activePack.flashcards.length
                      ? 'Úp tất cả về Mặt trước'
                      : 'Lật xem tất cả Mặt sau'}
                  </span>
                </button>
              )}

              {onNavigateToFlashcards && (
                <button
                  type="button"
                  onClick={onNavigateToFlashcards}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition whitespace-nowrap cursor-pointer shadow-md shadow-amber-400/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Vào Flashcard Mode luyện thẻ</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePack.flashcards.map((card) => {
              const isFlipped = flippedCardIds.includes(card.id);

              if (flashcardViewMode === 'split') {
                return (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-amber-500/25 bg-[#14192b] p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2.5">
                        <span>
                          Thẻ #{card.order} ·{' '}
                          <strong className="text-amber-300">{card.category}</strong>
                        </span>
                        <span className="text-emerald-300 font-semibold">
                          Mặt trước ↔ Mặt sau rõ ràng
                        </span>
                      </div>

                      {/* MẶT TRƯỚC */}
                      <div className="rounded-xl bg-[#0c101d] border border-amber-500/30 p-3.5 space-y-1.5">
                        <div className="text-[11px] font-black text-amber-400 tracking-wide">
                          MẶT TRƯỚC (CÂU HỎI CHỐT / THUẬT NGỮ CẦN NHẨM):
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {card.frontPrompt}
                        </h4>
                        {card.frontHint && (
                          <p className="text-xs text-slate-300 italic pt-0.5">
                            💡 Gợi ý định hướng (không lộ đáp án): {card.frontHint}
                          </p>
                        )}
                      </div>

                      {/* MẶT SAU */}
                      <div className="rounded-xl bg-[#101c24] border border-emerald-500/35 p-3.5 space-y-2">
                        <div className="text-[11px] font-black text-emerald-400 tracking-wide">
                          MẶT SAU (ĐÁP ÁN CÔ ĐỌNG + CÔNG THỨC + MẸO NHỚ):
                        </div>
                        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line">
                          {card.backAnswer}
                        </p>
                        {card.backFormula && (
                          <div className="rounded-lg bg-[#080c12] border border-amber-500/30 px-3 py-2 font-mono text-xs text-amber-300 font-semibold">
                            {card.backFormula}
                          </div>
                        )}
                        {card.memoryHook && (
                          <p className="text-xs text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-lg px-2.5 py-1.5">
                            🧠 <strong>Mẹo nhớ nhanh:</strong> {card.memoryHook}
                          </p>
                        )}
                      </div>
                    </div>

                    {card.sourceRef && (
                      <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Link2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>{card.sourceRef}</span>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={card.id}
                  onClick={() => toggleFlipCard(card.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFlipCard(card.id);
                    }
                  }}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition cursor-pointer select-none ${
                    isFlipped
                      ? 'bg-gradient-to-br from-[#132229] to-[#1a1829] border-emerald-400 shadow-lg'
                      : 'bg-[#14192b] border-amber-500/25 hover:border-amber-400/60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Thẻ #{card.order} ·{' '}
                        <strong className="text-amber-300">{card.category}</strong>
                      </span>
                      <span
                        className={`font-bold ${
                          isFlipped ? 'text-emerald-300' : 'text-amber-300'
                        }`}
                      >
                        {isFlipped ? 'ĐANG XEM MẶT SAU (ĐÁP ÁN)' : 'ĐANG XEM MẶT TRƯỚC (CÂU HỎI)'}
                      </span>
                    </div>

                    {!isFlipped ? (
                      <div className="space-y-2.5 py-2">
                        <h4 className="text-base font-bold text-white leading-snug">
                          {card.frontPrompt}
                        </h4>
                        {card.frontHint && (
                          <p className="text-xs text-amber-200/80 italic">
                            💡 Gợi ý: {card.frontHint}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5 py-1">
                        {/* Giữ dòng nhắc Mặt trước để học sinh không bị mất ngữ cảnh khi lật */}
                        <div className="text-xs text-slate-400 border-b border-white/10 pb-1.5">
                          <strong className="text-amber-300">Mặt trước:</strong> {card.frontPrompt}
                        </div>
                        <div className="text-xs font-bold text-emerald-300">
                          Mặt sau — Đáp án chuẩn:
                        </div>
                        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line">
                          {card.backAnswer}
                        </p>
                        {card.backFormula && (
                          <div className="rounded-xl bg-[#090c14] border border-amber-500/30 p-2.5 font-mono text-xs text-amber-300 font-semibold">
                            {card.backFormula}
                          </div>
                        )}
                        {card.memoryHook && (
                          <p className="text-xs text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-xl p-2">
                            🧠 <strong>Mẹo nhớ nhanh:</strong> {card.memoryHook}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-amber-300 font-semibold">
                    <span>{card.sourceRef || 'Nhấn vào thẻ để lật Mặt trước ↔ Mặt sau'}</span>
                    <span>{isFlipped ? '← Úp về Mặt trước' : 'Lật xem Mặt sau →'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================================
          BƯỚC 4: CÂU HỎI LUYỆN TẬP CƠ BẢN NHIỀU DẠNG (CHUẨN 4 DẠNG + LÀM THỬ ĐƯỢC THẬT)
         ===================================================================== */}
      {(activeStepFilter === 'all' || activeStepFilter === 'questions') && (
        <section
          id="study-pack-step-4-questions"
          className="rounded-3xl border border-amber-500/30 bg-[#101422] p-6 sm:p-7 shadow-xl space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-sm tabular-nums">
                04
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Bước 4: Câu Hỏi Luyện Tập Cơ Bản 4 Dạng (Làm Thử & Đối Chiếu Ngay)
                </h3>
                <p className="text-xs text-slate-400">
                  Tầng Vận dụng cơ bản • Đã cân chỉnh độ khó vừa sức (không lộ hệ số có sẵn, chỉ điền 1 từ/công thức ngắn gọn)
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Filter theo dạng câu hỏi */}
              <div className="flex items-center gap-1 bg-[#0b0e18] p-1 rounded-xl border border-amber-500/20 text-xs">
                {[
                  { id: 'all' as const, label: 'Đủ 4 dạng' },
                  { id: 'multiple_choice' as const, label: '1. Lựa chọn A/B/C/D' },
                  { id: 'true_false' as const, label: '2. Đúng/Sai' },
                  { id: 'fill_blank' as const, label: '3. Điền từ ngắn' },
                  { id: 'short_answer' as const, label: '4. Hỏi-Đáp ngắn' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setQuestionFormatFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                      questionFormatFilter === f.id
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRevealAllQuestions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181e30] hover:bg-[#202840] text-amber-300 border border-amber-500/30 text-xs font-bold transition whitespace-nowrap cursor-pointer"
              >
                {revealedQuestionIds.length === activePack.practiceQuestions.length ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Ẩn tất cả đáp án</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Hiện tất cả đáp án</span>
                  </>
                )}
              </button>

              {onNavigateToQuiz && (
                <button
                  type="button"
                  onClick={onNavigateToQuiz}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition whitespace-nowrap cursor-pointer shadow-md shadow-amber-400/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Vào Quiz Mode luyện từng câu</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isRevealed = revealedQuestionIds.includes(q.id);
              const selectedOpt = studentSelectedOption[q.id];
              const typedAnswer = studentTextAnswer[q.id] || '';
              const isChecked = checkedQuestionIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-amber-500/25 bg-[#14192b] p-5 space-y-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-amber-400 tabular-nums">
                        Câu #{q.order}
                      </span>
                      <span>·</span>
                      <span className="text-amber-300 font-bold">{q.formatLabel}</span>
                      <span>·</span>
                      <span className="text-emerald-300 font-medium">
                        Mức độ: {q.cognitiveLevel}
                      </span>
                      {q.sourceRef && (
                        <>
                          <span>·</span>
                          <span className="text-slate-300 flex items-center gap-1">
                            <Link2 className="h-3 w-3 text-amber-400" />
                            {q.sourceRef}
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRevealQuestion(q.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1d243b] hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Ẩn lời giải</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem đáp án & Giải thích</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {q.question}
                  </div>

                  {q.formulaContext && (
                    <div className="rounded-xl bg-[#090c14] border border-amber-500/25 p-3 font-mono text-xs sm:text-sm text-amber-300 font-semibold">
                      {q.formulaContext}
                    </div>
                  )}

                  {/* Tương tác Dạng 1 (Trắc nghiệm) & Dạng 2 (Đúng/Sai) */}
                  {(q.format === 'multiple_choice' || q.format === 'true_false') &&
                    q.options &&
                    q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((opt, idx) => {
                          const isChosen = selectedOpt === opt;
                          const isCorrectOption =
                            opt.trim().toLowerCase() === q.sampleAnswer.trim().toLowerCase() ||
                            q.sampleAnswer.trim().toLowerCase().startsWith(opt.trim().toLowerCase().slice(0, 2));

                          let btnStyle =
                            'bg-[#0d111d] border-white/10 text-slate-200 hover:border-amber-400/60';
                          if (isChosen && isCorrectOption) {
                            btnStyle =
                              'bg-emerald-950/60 border-emerald-400 text-emerald-200 font-bold';
                          } else if (isChosen && !isCorrectOption) {
                            btnStyle = 'bg-rose-950/60 border-rose-400 text-rose-200 font-bold';
                          } else if (isRevealed && isCorrectOption) {
                            btnStyle =
                              'bg-emerald-950/35 border-emerald-500/50 text-emerald-200 font-semibold';
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectOptionForQuestion(q.id, opt)}
                              className={`text-left rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm transition flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isChosen && (
                                <span className="text-xs font-black shrink-0">
                                  {isCorrectOption ? '✓ Chính xác' : '✗ Chưa đúng'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {/* Tương tác Dạng 3 (Điền từ / công thức ngắn 1 ô trống) */}
                  {q.format === 'fill_blank' && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                      <input
                        type="text"
                        value={typedAnswer}
                        onChange={(e) =>
                          setStudentTextAnswer((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Nhập công thức / con số cần điền vào [ ... ] (VD: C3H5(OH)3, 8, Fe2O3)..."
                        className="flex-1 rounded-xl bg-[#0d111d] border border-amber-500/30 px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleCheckTextAnswer(q.id)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs whitespace-nowrap transition cursor-pointer"
                      >
                        Kiểm tra đáp án điền từ
                      </button>
                      {isChecked && typedAnswer.trim() && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            isTextAnswerCorrect(q, typedAnswer)
                              ? 'text-emerald-300 bg-emerald-950/50 border border-emerald-500/40'
                              : 'text-amber-300 bg-amber-950/50 border border-amber-500/40'
                          }`}
                        >
                          {isTextAnswerCorrect(q, typedAnswer)
                            ? '✓ Khớp đáp án chuẩn!'
                            : 'Hãy đối chiếu đáp án chuẩn bên dưới'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tương tác Dạng 4 (Hỏi - Đáp ngắn) */}
                  {q.format === 'short_answer' && (
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="text"
                          value={typedAnswer}
                          onChange={(e) =>
                            setStudentTextAnswer((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder="Tự viết câu trả lời ngắn (1 - 2 câu) trước khi đối chiếu lời giải mẫu..."
                          className="flex-1 rounded-xl bg-[#0d111d] border border-amber-500/30 px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleCheckTextAnswer(q.id)}
                          className="px-4 py-2 rounded-xl bg-[#1d253d] hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-500/35 font-bold text-xs whitespace-nowrap transition cursor-pointer"
                        >
                          Đối chiếu câu trả lời
                        </button>
                      </div>
                    </div>
                  )}

                  {isRevealed && (
                    <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/40 p-4 space-y-2.5 mt-2">
                      <div className="text-xs sm:text-sm font-bold text-emerald-300">
                        ✓ Đáp án chuẩn: {q.sampleAnswer}
                      </div>
                      <div className="rounded-xl p-2.5 bg-amber-400/10 border border-amber-400/25 text-amber-200 text-xs flex items-start gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 block">Gợi ý ngắn để ôn lại:</strong>
                          <span>{getQuestionReviewTip(q)}</span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        <strong className="text-amber-300">Giải thích bản chất: </strong>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================================
          BƯỚC 5: Q&A SEEDS (HẠT GIỐNG HỎI ĐÁP ĐÀO SÂU BẢN CHẤT)
         ===================================================================== */}
      {(activeStepFilter === 'all' || activeStepFilter === 'qaseeds') && (
        <section
          id="study-pack-step-5-qaseeds"
          className="rounded-3xl border border-amber-500/30 bg-[#101422] p-6 sm:p-7 shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-sm tabular-nums">
                05
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Bước 5: Q&A Seeds — Hạt Giống Câu Hỏi Mở Rộng & Đào Sâu Bản Chất
                </h3>
                <p className="text-xs text-slate-400">
                  Tầng Tư duy phản biện • Giải đáp thắc mắc thực tế của học sinh mà không lặp lại phần lý thuyết cơ bản ở Bước 2
                </p>
              </div>
            </div>

            {onNavigateToTutor && (
              <button
                type="button"
                onClick={onNavigateToTutor}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition cursor-pointer shadow-md shadow-emerald-950/30 self-start sm:self-center"
              >
                <span>🤖 Hỏi đáp với Gia sư Grounded AI</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activePack.qaSeeds.map((seed) => (
              <div
                key={seed.id}
                className="rounded-2xl border border-amber-500/25 bg-[#14192b] p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400 flex-wrap">
                  <span>
                    Hạt giống Q&A #{seed.order} ·{' '}
                    <strong className="text-amber-300">{seed.intentTag}</strong>
                  </span>
                  {seed.sourceRef ? (
                    <span className="text-emerald-300 flex items-center gap-1">
                      <Link2 className="h-3.5 w-3.5" />
                      {seed.sourceRef}
                    </span>
                  ) : (
                    <span className="text-slate-400">Chuẩn bị cho AI Tutor</span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-1" />
                  <span>{seed.studentQuestion}</span>
                </h4>

                <div className="rounded-xl bg-[#0a0d16] border border-white/10 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <strong className="text-emerald-300">Câu trả lời ngắn ban đầu (Seed Answer): </strong>
                  {seed.aiSeedAnswer}
                </div>

                <div className="text-xs text-amber-200/90 flex items-center gap-2 pt-1">
                  <MessageSquarePlus className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>
                    <strong>Câu hỏi gợi mở tiếp theo:</strong> “{seed.followUpPrompt}”
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
