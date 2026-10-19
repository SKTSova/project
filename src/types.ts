export type NavTabId = 'overview' | 'materials' | 'ai-preview' | 'quiz' | 'equations' | 'flashcards' | 'tutor' | 'topics';

export type StudyMaterialType = 'text' | 'image' | 'url';

export type PracticeQuestionFormat = 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer';

export interface StudyPackSummary {
  overview: string;
  coreTheme: string;
  targetGrade: string;
  estimatedReadMinutes: number;
  prerequisiteKnowledge: string[];
  learningObjectives: string[];
  aiDetectedConcepts: string[];
}

export interface StudyPackKeyPoint {
  id: string;
  order: number;
  title: string;
  category: 'Khái niệm' | 'Phương trình (PTHH)' | 'Hiện tượng nhận biết' | 'Mẹo & Lưu ý thi';
  explanation: string;
  formulaOrEquation?: string;
  examTip?: string;
  difficultyTag: 'Cơ bản (Lớp 7-9)' | 'Trọng tâm (Lớp 10-12)' | 'Vận dụng';
  sourceRef?: string;
}

export interface StudyPackPracticeQuestion {
  id: string;
  order: number;
  format: PracticeQuestionFormat;
  formatLabel: string;
  cognitiveLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng cơ bản';
  question: string;
  formulaContext?: string;
  options?: string[];
  sampleAnswer: string;
  AcceptableKeywords?: string[];
  explanation: string;
  reviewTip?: string;
  sourceRef?: string;
}

export interface StudyPackFlashcard {
  id: string;
  order: number;
  category: string;
  frontPrompt: string;
  frontHint?: string;
  backAnswer: string;
  backFormula?: string;
  memoryHook?: string;
  sourceRef?: string;
}

export interface StudyPackQASeed {
  id: string;
  order: number;
  studentQuestion: string;
  intentTag: 'Giải thích bản chất' | 'So sánh phân biệt' | 'Ứng dụng thực tế' | 'Bẫy thường gặp';
  aiSeedAnswer: string;
  followUpPrompt: string;
  sourceRef?: string;
}

export interface StudyPackAuditCriterion {
  id:
    | 'no_duplication'
    | 'specific_keypoints'
    | 'calibrated_difficulty'
    | 'basic_formats'
    | 'clear_flashcards'
    | 'source_grounding'
    | 'deep_not_meta';
  label: string;
  status: 'passed' | 'fixed' | 'warning';
  issueFound: string;
  actionTaken: string;
}

export interface GeneratedStudyPack {
  id: string;
  title: string;
  topicId: string;
  topicTitle: string;
  gradeLevel: string;
  sourceMaterialIds: string[];
  sourceMaterialTitles: string[];
  generatedAt: string;
  generationMethod: 'gemini-ai' | 'default-pack';
  summary: StudyPackSummary;
  keyPoints: StudyPackKeyPoint[];
  flashcards: StudyPackFlashcard[];
  practiceQuestions: StudyPackPracticeQuestion[];
  qaSeeds: StudyPackQASeed[];
  auditCriteria?: StudyPackAuditCriterion[];
  lastAuditedAt?: string;
  versionNumber?: number;
  versionTag?: string;
  parentPackId?: string;
  createdAtTimestamp?: number;
}

export interface GroundedChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isOutOfScope?: boolean;
  citedSources?: string[];
  suggestedFollowUps?: string[];
}

export interface StudyMaterialItem {
  id: string;
  type: StudyMaterialType;
  title: string;
  subject: string;
  grade: string;
  topicId: string;
  topicTitle: string;
  content: string; // text content, or image dataUrl/URL, or web link
  noteOrCaption?: string;
  createdAt: string;
  wordCount?: number;
  tags?: string[];
}

export interface ChemicalEquationItem {
  id: string;
  code: string;
  name: string;
  category: 'Vô cơ' | 'Hữu cơ' | 'Oxi hóa - Khử' | 'Nhiệt nhôm & Điện phân';
  equation: string;
  condition?: string;
  phenomenon: string;
  significance: string;
}

export interface ChemistryTopic {
  id: string;
  code: string;
  title: string;
  grade: string;
  lessonCount: number;
  description: string;
  formulaSample: string;
  tag: string;
}

export interface QuizOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  formula?: string;
}

export interface MockQuizItem {
  id: string;
  number: number;
  question: string;
  chapter: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Nâng cao';
  options: QuizOption[];
  staticExplanationPreview: string;
}

export interface MockFlashcardItem {
  id: string;
  number: number;
  totalCards: number;
  category: string;
  front: {
    elementName: string;
    symbol: string;
    atomicNumber: number;
    prompt: string;
  };
  back: {
    answer: string;
    valency: string;
    commonReactions: string[];
  };
}

export interface MockChatMessage {
  id: string;
  sender: 'student' | 'assistant';
  senderName: string;
  timestamp: string;
  content: string;
  equation?: string;
}

export interface StudyTopicSnapshotMetadata {
  savedAt: string;
  savedAtFormatted: string;
  sourceCount: number;
  keyPointCount: number;
  flashcardCount: number;
  questionCount: number;
  qaSeedCount: number;
  gradeLevel: string;
  version: string;
  customNote?: string;
}

export interface StudyTopicSnapshot {
  id: string;
  shortName: string;
  subject: string;
  topicId: string;
  topicTitle: string;
  sources: StudyMaterialItem[];
  analysisPreview: StudyPackSummary;
  studyPack: GeneratedStudyPack;
  metadata: StudyTopicSnapshotMetadata;
}

export interface ComingSoonFeature {
  featureName: string;
  scheduledVersion: string;
  description: string;
}
