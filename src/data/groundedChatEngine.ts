import {
  StudyMaterialItem,
  GeneratedStudyPack,
  GroundedChatMessage,
} from '../types';

export interface GroundedChatResponse {
  answer: string;
  isOutOfScope: boolean;
  citedSources: string[];
  suggestedFollowUps: string[];
}

/**
 * Xử lý truy vấn câu hỏi của học sinh theo cơ chế Grounded Chatbot:
 * 1. Thử gọi API máy chủ /api/ai/grounded-chat (Gemini API)
 * 2. Nếu máy chủ không có API key hoặc lỗi mạng, tự động chuyển sang bộ máy Grounding sư phạm cục bộ.
 */
export async function askGroundedChatbot(
  userQuestion: string,
  topicTitle: string,
  sources: StudyMaterialItem[],
  studyPack: GeneratedStudyPack | null,
  chatHistory: GroundedChatMessage[]
): Promise<GroundedChatResponse> {
  const cleanQuestion = userQuestion.trim();
  if (!cleanQuestion) {
    return {
      answer: 'Em hãy nhập câu hỏi để thầy/cô trợ lý hỗ trợ ôn bài nhé!',
      isOutOfScope: false,
      citedSources: [],
      suggestedFollowUps: [],
    };
  }

  // 1. Thử gọi API Server
  try {
    const res = await fetch('/api/ai/grounded-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cleanQuestion,
        topicTitle,
        sources,
        analysisPreview: studyPack?.summary || null,
        studyPack,
        chatHistory: chatHistory.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
      }),
    });

    if (res.ok) {
      const data: GroundedChatResponse = await res.json();
      if (data && typeof data.answer === 'string') {
        return data;
      }
    }
  } catch {
    // Chuyển sang fallback cục bộ
  }

  // 2. Bộ máy Grounding Sư Phạm Cục Bộ (Local Grounded Fallback Engine)
  return evaluateLocalGroundedResponse(cleanQuestion, topicTitle, sources, studyPack);
}

/**
 * Bộ máy Grounding cục bộ: Kiểm tra đối sánh ngữ nghĩa với sources, analysisPreview và studyPack
 */
export function evaluateLocalGroundedResponse(
  question: string,
  topicTitle: string,
  sources: StudyMaterialItem[],
  studyPack: GeneratedStudyPack | null
): GroundedChatResponse {
  const qLower = question.toLowerCase();

  // Danh sách từ khóa cấm / hoàn toàn ngoài phạm vi học tập
  const generalChatTriggers = [
    'thời tiết', 'chơi game', 'bóng đá', 'ca sĩ', 'diễn viên', 'phim', 'người yêu',
    'python', 'javascript', 'html', 'viết code', 'hack', 'chứng khoán', 'bitcoin',
    'chính trị', 'tổng thống', 'chiến tranh thế giới', 'quán cà phê', 'món ăn ngon',
  ];

  const isObviousGeneralTopic = generalChatTriggers.some((t) => qLower.includes(t));
  if (isObviousGeneralTopic) {
    return {
      answer: `Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp.\n\nThầy/cô là trợ lý học tập chuyên biệt hỗ trợ em ôn bài cho chủ đề "${topicTitle}". Em hãy đặt các câu hỏi xoay quanh lý thuyết, hiện tượng, phản ứng hoặc bài tập trong học liệu và Study Pack hiện tại nhé!`,
      isOutOfScope: true,
      citedSources: [],
      suggestedFollowUps: studyPack?.qaSeeds?.slice(0, 2).map((s) => s.studentQuestion) || [
        `Khái niệm cốt lõi của ${topicTitle} là gì?`,
        `Có mẹo nào tránh bẫy câu hỏi trắc nghiệm của chủ đề này không?`,
      ],
    };
  }

  // Tập hợp toàn bộ ngữ cảnh tri thức từ 3 nguồn: sources, analysisPreview, studyPack
  const groundingContext: {
    text: string;
    label: string;
    category: 'source' | 'analysis' | 'keypoint' | 'flashcard' | 'question' | 'qaseed';
  }[] = [];

  // Nguồn 1: Sources (Học liệu gốc)
  sources.forEach((s) => {
    groundingContext.push({
      text: `${s.title} ${s.content} ${s.noteOrCaption || ''}`,
      label: `Học liệu #${s.id} ("${s.title}")`,
      category: 'source',
    });
  });

  // Nguồn 2: Analysis Preview
  if (studyPack?.summary) {
    const sm = studyPack.summary;
    groundingContext.push({
      text: `${sm.overview} ${sm.coreTheme} ${(sm.learningObjectives || []).join(' ')} ${(sm.aiDetectedConcepts || []).join(' ')}`,
      label: 'Phân tích sơ bộ AI đã hiểu gì',
      category: 'analysis',
    });
  }

  // Nguồn 3: Study Pack (Key Points, Flashcards, Practice Questions, QA Seeds)
  if (studyPack) {
    studyPack.keyPoints?.forEach((kp) => {
      groundingContext.push({
        text: `${kp.title} ${kp.explanation} ${kp.formulaOrEquation || ''} ${kp.examTip || ''}`,
        label: `Key Point #${kp.order}: ${kp.title}`,
        category: 'keypoint',
      });
    });

    studyPack.flashcards?.forEach((fc) => {
      groundingContext.push({
        text: `${fc.frontPrompt} ${fc.frontHint || ''} ${fc.backAnswer} ${fc.backFormula || ''} ${fc.memoryHook || ''}`,
        label: `Flashcard #${fc.order} (${fc.category})`,
        category: 'flashcard',
      });
    });

    studyPack.practiceQuestions?.forEach((pq) => {
      groundingContext.push({
        text: `${pq.question} ${pq.sampleAnswer} ${pq.explanation} ${pq.reviewTip || ''}`,
        label: `Câu hỏi luyện tập #${pq.order}`,
        category: 'question',
      });
    });

    studyPack.qaSeeds?.forEach((qa) => {
      groundingContext.push({
        text: `${qa.studentQuestion} ${qa.aiSeedAnswer} ${qa.followUpPrompt || ''}`,
        label: `Q&A Seed: "${qa.studentQuestion}"`,
        category: 'qaseed',
      });
    });
  }

  // Tách từ khóa quan trọng trong câu hỏi (loại bỏ từ nối tiếng Việt phổ biến)
  const stopWords = [
    'là', 'gì', 'của', 'và', 'có', 'thì', 'ở', 'trong', 'được', 'cho', 'với',
    'như', 'thế', 'nào', 'tại', 'sao', 'làm', 'hãy', 'giải', 'thích', 'cho', 'em', 'hỏi', 'ạ', 'ơi',
  ];
  const queryTokens = qLower
    .replace(/[?,.!:;()"]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.includes(w));

  // Tính điểm khớp tài liệu
  let bestMatch: { item: typeof groundingContext[0]; score: number } | null = null;
  const matchedSources: string[] = [];

  groundingContext.forEach((ctx) => {
    const ctxLower = ctx.text.toLowerCase();
    let matchCount = 0;
    queryTokens.forEach((token) => {
      if (ctxLower.includes(token)) matchCount += 1;
    });

    if (matchCount > 0) {
      if (!matchedSources.includes(ctx.label)) {
        matchedSources.push(ctx.label);
      }
      if (!bestMatch || matchCount > bestMatch.score) {
        bestMatch = { item: ctx, score: matchCount };
      }
    }
  });

  // Nếu câu hỏi không khớp bất kỳ từ khóa nào trong tài liệu hoặc điểm khớp quá thấp (< 1 từ khóa)
  if (!bestMatch || bestMatch.score === 0) {
    return {
      answer: `Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp.\n\nCâu hỏi của em không có trong học liệu gốc, màn hình phân tích sơ bộ cũng như Study Pack hiện tại của chủ đề "${topicTitle}". Em hãy thử hỏi về các khái niệm, công thức, hiện tượng nhận biết hoặc câu hỏi bài tập có trong tài liệu nhé!`,
      isOutOfScope: true,
      citedSources: [],
      suggestedFollowUps: studyPack?.qaSeeds?.slice(0, 2).map((s) => s.studentQuestion) || [
        `Tóm tắt bản chất cốt lõi của chủ đề ${topicTitle}?`,
        `Các công thức hoặc phương trình trọng tâm cần ghi nhớ là gì?`,
      ],
    };
  }

  // Tạo câu trả lời sư phạm grounded thân thiện dựa trên mục khớp nhất
  const matchedItem = bestMatch.item;
  let synthesizedAnswer = '';

  if (matchedItem.category === 'keypoint') {
    synthesizedAnswer = `Dựa vào ${matchedItem.label} trong tài liệu Study Pack:\n\n${matchedItem.text
      .replace(/\s+/g, ' ')
      .trim()}`;
  } else if (matchedItem.category === 'flashcard') {
    synthesizedAnswer = `Căn cứ theo thẻ ${matchedItem.label} đã học:\n\n${matchedItem.text
      .replace(/\s+/g, ' ')
      .trim()}`;
  } else if (matchedItem.category === 'question') {
    synthesizedAnswer = `Theo nội dung ${matchedItem.label} trong bộ câu hỏi ôn luyện:\n\n${matchedItem.text
      .replace(/\s+/g, ' ')
      .trim()}`;
  } else if (matchedItem.category === 'qaseed') {
    synthesizedAnswer = `Thầy/cô giải đáp thắc mắc này như sau:\n\n${matchedItem.text
      .replace(/\s+/g, ' ')
      .trim()}`;
  } else {
    synthesizedAnswer = `Dựa trên ghi chép từ ${matchedItem.label}:\n\n${matchedItem.text
      .slice(0, 400)
      .replace(/\s+/g, ' ')
      .trim()}`;
  }

  return {
    answer: synthesizedAnswer,
    isOutOfScope: false,
    citedSources: matchedSources.slice(0, 3),
    suggestedFollowUps: studyPack?.qaSeeds?.slice(0, 2).map((s) => s.followUpPrompt || s.studentQuestion) || [
      'Em muốn thầy/cô giải thích sâu hơn về phần nào trong nội dung này không?',
      'Em có muốn thử trả lời một câu hỏi luyện tập về phần này không?',
    ],
  };
}
