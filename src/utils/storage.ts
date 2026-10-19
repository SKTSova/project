import {
  StudyMaterialItem,
  GeneratedStudyPack,
  StudyPackPracticeQuestion,
  StudyPackFlashcard,
  StudyPackQASeed,
  StudyTopicSnapshot,
} from '../types';
import { INITIAL_STUDY_MATERIALS } from '../data/materialsData';
import {
  INITIAL_STUDY_PACKS,
  INITIAL_PRACTICE_QUESTIONS,
  INITIAL_FLASHCARDS,
  INITIAL_QA_SEEDS,
} from '../data/studyPackData';

// Khóa định danh lưu trữ trong LocalStorage của trình duyệt (Phiên bản v2 đã rà lỗi Học Được Thật)
export const STUDY_MATERIALS_STORAGE_KEY = 'sciencequiz_study_materials_v2';
export const AI_MASTERED_POINTS_STORAGE_KEY = 'sciencequiz_ai_mastered_points';
export const AI_CUSTOM_NOTES_STORAGE_KEY = 'sciencequiz_ai_custom_notes';
export const STUDY_PACKS_STORAGE_KEY = 'sciencequiz_study_packs_v2';
export const PRACTICE_QUESTIONS_STORAGE_KEY = 'sciencequiz_practice_questions_v2';
export const FLASHCARDS_STORAGE_KEY = 'sciencequiz_flashcards_v2';
export const QA_SEEDS_STORAGE_KEY = 'sciencequiz_qa_seeds_v2';

export interface AICustomTakeaway {
  id: string;
  topicTitle: string;
  content: string;
  createdAt: string;
}

/**
 * Đọc danh sách thẻ Flashcard cơ bản từ LocalStorage
 */
export function loadFlashcards(): StudyPackFlashcard[] {
  if (typeof window === 'undefined') return INITIAL_FLASHCARDS;
  try {
    const raw = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    if (!raw) return INITIAL_FLASHCARDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FLASHCARDS;
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi đọc danh sách Flashcard:', error);
    return INITIAL_FLASHCARDS;
  }
}

/**
 * Lưu danh sách thẻ Flashcard cơ bản vào LocalStorage
 */
export function saveFlashcards(cards: StudyPackFlashcard[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu danh sách Flashcard:', error);
  }
}

/**
 * Khôi phục danh sách Flashcard cơ bản về mặc định ban đầu
 */
export function resetFlashcardsToDefault(): StudyPackFlashcard[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(INITIAL_FLASHCARDS));
    } catch (error) {
      console.error('[LocalStorage] Lỗi khi khôi phục Flashcard:', error);
    }
  }
  return INITIAL_FLASHCARDS;
}

/**
 * Đọc danh sách Q&A Seed khởi tạo từ LocalStorage
 */
export function loadQASeeds(): StudyPackQASeed[] {
  if (typeof window === 'undefined') return INITIAL_QA_SEEDS;
  try {
    const raw = localStorage.getItem(QA_SEEDS_STORAGE_KEY);
    if (!raw) return INITIAL_QA_SEEDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_QA_SEEDS;
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi đọc danh sách Q&A Seed:', error);
    return INITIAL_QA_SEEDS;
  }
}

/**
 * Lưu danh sách Q&A Seed khởi tạo vào LocalStorage
 */
export function saveQASeeds(seeds: StudyPackQASeed[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QA_SEEDS_STORAGE_KEY, JSON.stringify(seeds));
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu danh sách Q&A Seed:', error);
  }
}

/**
 * Khôi phục danh sách Q&A Seed về mặc định ban đầu
 */
export function resetQASeedsToDefault(): StudyPackQASeed[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(QA_SEEDS_STORAGE_KEY, JSON.stringify(INITIAL_QA_SEEDS));
    } catch (error) {
      console.error('[LocalStorage] Lỗi khi khôi phục Q&A Seed:', error);
    }
  }
  return INITIAL_QA_SEEDS;
}

/**
 * Đọc danh sách câu hỏi luyện tập cơ bản nhiều dạng từ LocalStorage
 */
export function loadPracticeQuestions(): StudyPackPracticeQuestion[] {
  if (typeof window === 'undefined') return INITIAL_PRACTICE_QUESTIONS;
  try {
    const raw = localStorage.getItem(PRACTICE_QUESTIONS_STORAGE_KEY);
    if (!raw) return INITIAL_PRACTICE_QUESTIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PRACTICE_QUESTIONS;
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi đọc danh sách câu hỏi luyện tập:', error);
    return INITIAL_PRACTICE_QUESTIONS;
  }
}

/**
 * Lưu danh sách câu hỏi luyện tập cơ bản vào LocalStorage
 */
export function savePracticeQuestions(questions: StudyPackPracticeQuestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRACTICE_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu danh sách câu hỏi luyện tập:', error);
  }
}

/**
 * Khôi phục danh sách câu hỏi luyện tập về mặc định ban đầu
 */
export function resetPracticeQuestionsToDefault(): StudyPackPracticeQuestion[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PRACTICE_QUESTIONS_STORAGE_KEY, JSON.stringify(INITIAL_PRACTICE_QUESTIONS));
    } catch (error) {
      console.error('[LocalStorage] Lỗi khi khôi phục câu hỏi luyện tập:', error);
    }
  }
  return INITIAL_PRACTICE_QUESTIONS;
}

/**
 * Đọc danh sách Study Pack từ LocalStorage (Buổi 3)
 */
export function loadStudyPacks(): GeneratedStudyPack[] {
  if (typeof window === 'undefined') return INITIAL_STUDY_PACKS;
  try {
    const raw = localStorage.getItem(STUDY_PACKS_STORAGE_KEY);
    if (!raw) return INITIAL_STUDY_PACKS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_STUDY_PACKS;
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi đọc Study Packs:', error);
    return INITIAL_STUDY_PACKS;
  }
}

/**
 * Lưu danh sách Study Pack vào LocalStorage (Buổi 3)
 */
export function saveStudyPacks(packs: GeneratedStudyPack[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STUDY_PACKS_STORAGE_KEY, JSON.stringify(packs));
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu Study Packs:', error);
  }
}

/**
 * Khôi phục danh sách Study Pack về mẫu mặc định ban đầu
 */
export function resetStudyPacksToDefault(): GeneratedStudyPack[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STUDY_PACKS_STORAGE_KEY, JSON.stringify(INITIAL_STUDY_PACKS));
    } catch (error) {
      console.error('[LocalStorage] Lỗi khi khôi phục Study Packs:', error);
    }
  }
  return INITIAL_STUDY_PACKS;
}

/**
 * Đọc danh sách ID các ý trọng tâm mà học sinh đã đánh dấu "Đã nắm vững"
 */
export function loadMasteredPointIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AI_MASTERED_POINTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Lưu danh sách ID các ý trọng tâm đã nắm vững vào LocalStorage
 */
export function saveMasteredPointIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AI_MASTERED_POINTS_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu trạng thái ôn tập:', error);
  }
}

/**
 * Đọc danh sách ghi chú bổ sung cho AI từ LocalStorage
 */
export function loadAICustomTakeaways(): AICustomTakeaway[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AI_CUSTOM_NOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Lưu danh sách ghi chú bổ sung cho AI vào LocalStorage
 */
export function saveAICustomTakeaways(notes: AICustomTakeaway[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AI_CUSTOM_NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu ghi chú AI:', error);
  }
}

/**
 * Đọc danh sách nguồn học liệu từ LocalStorage.
 * Nếu chưa có dữ liệu hoặc có lỗi phân tích cú pháp, trả về danh sách mẫu ban đầu.
 */
export function loadStudyMaterials(): StudyMaterialItem[] {
  if (typeof window === 'undefined') {
    return INITIAL_STUDY_MATERIALS;
  }

  try {
    const rawData = localStorage.getItem(STUDY_MATERIALS_STORAGE_KEY);
    if (!rawData) {
      return INITIAL_STUDY_MATERIALS;
    }

    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_STUDY_MATERIALS;
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi đọc danh sách học liệu:', error);
    return INITIAL_STUDY_MATERIALS;
  }
}

/**
 * Ghi danh sách nguồn học liệu vào LocalStorage.
 */
export function saveStudyMaterials(materials: StudyMaterialItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STUDY_MATERIALS_STORAGE_KEY, JSON.stringify(materials));
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu danh sách học liệu:', error);
  }
}

/**
 * Khôi phục danh sách nguồn học liệu về danh sách mẫu mặc định ban đầu.
 */
export function resetStudyMaterialsToDefault(): StudyMaterialItem[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STUDY_MATERIALS_STORAGE_KEY, JSON.stringify(INITIAL_STUDY_MATERIALS));
    } catch (error) {
      console.error('[LocalStorage] Lỗi khi khôi phục danh sách học liệu:', error);
    }
  }
  return INITIAL_STUDY_MATERIALS;
}

export const SAVED_TOPIC_SNAPSHOTS_STORAGE_KEY = 'sciencequiz_saved_topic_snapshots_v1';

/**
 * Xây dựng danh sách bộ môn / bộ ôn tập mẫu ban đầu làm cơ sở dữ liệu nền
 */
export function buildInitialTopicSnapshots(): StudyTopicSnapshot[] {
  const packs = INITIAL_STUDY_PACKS;
  const materials = INITIAL_STUDY_MATERIALS;

  return packs.map((pack, idx) => {
    const topicMaterials = materials.filter(
      (m) => m.topicId === pack.topicId || (pack.sourceMaterialIds && pack.sourceMaterialIds.includes(m.id))
    );
    const effectiveMaterials = topicMaterials.length > 0 ? topicMaterials : materials.slice(0, 2);

    let subject = 'Hóa học';
    if (pack.topicId.includes('khtn') || pack.gradeLevel.includes('Lớp 7')) {
      subject = 'KHTN (Khoa học Tự nhiên)';
    }

    const shortNames = [
      'Este - Lipit (Hóa 12)',
      'Kim loại & Axit (Hóa 12)',
      'Nguyên tử & BTH (KHTN 7)',
    ];

    return {
      id: `snapshot-init-${pack.id}`,
      shortName: shortNames[idx] || pack.topicTitle,
      subject,
      topicId: pack.topicId,
      topicTitle: pack.topicTitle,
      sources: effectiveMaterials,
      analysisPreview: pack.summary,
      studyPack: pack,
      metadata: {
        savedAt: new Date(Date.now() - (idx + 1) * 3600000 * 24).toISOString(),
        savedAtFormatted: `${idx + 1} ngày trước`,
        sourceCount: effectiveMaterials.length,
        keyPointCount: pack.keyPoints?.length || 0,
        flashcardCount: pack.flashcards?.length || 0,
        questionCount: pack.practiceQuestions?.length || 0,
        qaSeedCount: pack.qaSeeds?.length || 0,
        gradeLevel: pack.gradeLevel,
        version: 'v1.0',
        customNote: `Snapshot mặc định: ${pack.title}`,
      },
    };
  });
}

/**
 * Đọc danh sách Snapshot các môn học / bộ ôn tập đã lưu từ LocalStorage
 */
export function loadSavedTopicSnapshots(): StudyTopicSnapshot[] {
  if (typeof window === 'undefined') return buildInitialTopicSnapshots();
  try {
    const raw = localStorage.getItem(SAVED_TOPIC_SNAPSHOTS_STORAGE_KEY);
    if (!raw) {
      const initial = buildInitialTopicSnapshots();
      localStorage.setItem(SAVED_TOPIC_SNAPSHOTS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = buildInitialTopicSnapshots();
    localStorage.setItem(SAVED_TOPIC_SNAPSHOTS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi đọc Snapshot bộ ôn tập:', error);
    return buildInitialTopicSnapshots();
  }
}

/**
 * Lưu toàn bộ danh sách Snapshot vào LocalStorage
 */
export function saveSavedTopicSnapshots(snapshots: StudyTopicSnapshot[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_TOPIC_SNAPSHOTS_STORAGE_KEY, JSON.stringify(snapshots));
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu Snapshot bộ ôn tập:', error);
  }
}

export const LOCAL_GEMINI_API_KEY_STORAGE_KEY = 'sciencequiz_local_gemini_api_key_v1';

/**
 * Đọc API key local-only (chỉ lưu trên trình duyệt của người dùng)
 */
export function loadLocalGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(LOCAL_GEMINI_API_KEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Lưu API key local-only vào LocalStorage của trình duyệt
 */
export function saveLocalGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (!key.trim()) {
      localStorage.removeItem(LOCAL_GEMINI_API_KEY_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_GEMINI_API_KEY_STORAGE_KEY, key.trim());
    }
  } catch (error) {
    console.error('[LocalStorage] Lỗi khi lưu local-only API key:', error);
  }
}

