import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  function getEffectiveApiKey(req: express.Request): string | undefined {
    const fromBody = req.body?.localApiKey;
    const fromHeader = req.headers['x-gemini-api-key'];
    if (typeof fromBody === 'string' && fromBody.trim()) {
      return fromBody.trim();
    }
    if (typeof fromHeader === 'string' && fromHeader.trim()) {
      return fromHeader.trim();
    }
    return process.env.GEMINI_API_KEY;
  }

  // Server-side Gemini API Route: Generate Study Pack (Buổi 3 & Re-generate v2)
  app.post('/api/ai/generate-study-pack', async (req, res) => {
    try {
      const {
        materials = [],
        gradeLevel = 'Lớp 7 - Lớp 12 (THCS & THPT)',
        customPackTitle = '',
      } = req.body || {};

      const effectiveApiKey = getEffectiveApiKey(req);

      if (!effectiveApiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY chưa được cấu hình trên máy chủ và chưa có local-only key.',
          fallbackRecommended: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const materialsSummaryText = Array.isArray(materials)
        ? materials
            .map(
              (m: { id?: string; type?: string; title?: string; topicTitle?: string; content?: string; noteOrCaption?: string }, idx: number) =>
                `Nguồn #${idx + 1} [${m.type || 'text'}] - Tiêu đề: "${m.title || ''}" (Chuyên đề: ${m.topicTitle || 'Hóa học'}):\nNội dung: ${m.content || ''}\nGhi chú của học sinh: ${m.noteOrCaption || 'Không có'}`
            )
            .join('\n\n---\n\n')
        : 'Chưa có học liệu chi tiết';

      const prompt = `Bạn là chuyên gia sư phạm Khoa học Tự nhiên & Hóa học dành cho học sinh từ Lớp 7 trở lên (trình độ mục tiêu: ${gradeLevel}).
Hãy phân tích kỹ các nguồn học liệu đầu vào của học sinh dưới đây và tạo ra Study Pack theo hướng "HỌC ĐƯỢC THẬT".

7 TIÊU CHÍ CHẤT LƯỢNG BẮT BUỘC (RÀ LỖI NGHIÊM NGẶT):
1. KHÔNG LẶP NỘI DUNG: Các bước Summary, Key Points, Flashcards, Practice Questions và Q&A Seeds phải khai thác các khía cạnh bổ trợ nhau (Key Points đi vào cơ chế & PTHH; Flashcards đi vào danh pháp, phân biệt nhanh & thao tác thực hành; Câu hỏi kiểm tra vận dụng độc lập). Không hỏi lặp lại nguyên văn cùng một ý.
2. Ý CHÍNH CỤ THỂ (KHÔNG CHUNG CHUNG): Mỗi Key Point phải nêu trực diện định luật/cơ chế/phản ứng, có đủ phương trình/biểu thức (formulaOrEquation), điều kiện phản ứng và mẹo tránh bẫy (examTip).
3. ĐỘ KHÓ VỪA SỨC (KHÔNG QUÁ DỄ / KHÔNG QUÁ KHÓ): Câu hỏi bám sát bài kiểm tra 15 phút và 1 tiết trên trường. Không ra câu quá dễ (như cho sẵn hệ số sản phẩm ở vế phải) và không đưa kiến thức đánh đố vượt ngoài chương trình phổ thông.
4. ĐÚNG CHUẨN 4 DẠNG CÂU HỎI CƠ BẢN:
   - multiple_choice: Trắc nghiệm 4 lựa chọn A, B, C, D rõ ràng.
   - true_false: Nhận định Đúng / Sai đơn mệnh đề (không ghép nhiều ý gây nhiễu).
   - fill_blank: Điền từ hoặc công thức ngắn vào ĐÚNG 1 chỗ trống [ ... ] duy nhất; sampleAnswer chỉ gồm 1 từ/công thức/con số ngắn gọn để học sinh tự nhập kiểm tra.
   - short_answer: Hỏi - đáp giải thích ngắn gọn trong 1-2 câu.
5. FLASHCARD RÕ MẶT TRƯỚC / MẶT SAU:
   - Mặt trước (frontPrompt): Câu hỏi chốt hoặc thuật ngữ ngắn gọn (< 20 từ). Gợi ý (frontHint) chỉ định hướng tư duy, TUYỆT ĐỐI KHÔNG làm lộ đáp án hay công thức.
   - Mặt sau (backAnswer, backFormula, memoryHook): Trình bày cô đọng, tách bạch đáp án + công thức + mẹo nhớ nhanh.
6. LIÊN KẾT CHẶT VỚI HỌC LIỆU GỐC: Mỗi Key Point, Flashcard, Câu hỏi và Q&A Seed đều phải có trường "sourceRef" trích dẫn rõ lấy từ Nguồn học liệu nào (ví dụ: "Trích Nguồn #1: ...").
7. KHÔNG NÔNG / KHÔNG META: Tuyệt đối KHÔNG mở đầu bằng các câu meta như "AI đã tổng hợp từ ghi chép của bạn..." hay "Nắm vững định nghĩa gốc của chủ đề...". Đi thẳng 100% vào kiến thức khoa học thực chất.

Danh sách nguồn học liệu của học sinh:
${materialsSummaryText}
${customPackTitle ? `\nTiêu đề gói học tập mong muốn: ${customPackTitle}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là trợ lý sư phạm Hóa học & Khoa học tự nhiên chuẩn mực, ưu tiên chất lượng "học được thật", không viết câu chữ meta sáo rỗng. Luôn trả về đúng định dạng JSON theo schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Tiêu đề của Study Pack' },
              topicTitle: { type: Type.STRING, description: 'Tên chuyên đề chính' },
              summary: {
                type: Type.OBJECT,
                properties: {
                  overview: { type: Type.STRING },
                  coreTheme: { type: Type.STRING },
                  targetGrade: { type: Type.STRING },
                  estimatedReadMinutes: { type: Type.INTEGER },
                  prerequisiteKnowledge: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  learningObjectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  aiDetectedConcepts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'overview',
                  'coreTheme',
                  'targetGrade',
                  'estimatedReadMinutes',
                  'prerequisiteKnowledge',
                  'learningObjectives',
                  'aiDetectedConcepts',
                ],
              },
              keyPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    formulaOrEquation: { type: Type.STRING },
                    examTip: { type: Type.STRING },
                    difficultyTag: { type: Type.STRING },
                    sourceRef: { type: Type.STRING },
                  },
                  required: ['title', 'category', 'explanation', 'formulaOrEquation', 'difficultyTag', 'sourceRef'],
                },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    frontPrompt: { type: Type.STRING },
                    frontHint: { type: Type.STRING },
                    backAnswer: { type: Type.STRING },
                    backFormula: { type: Type.STRING },
                    memoryHook: { type: Type.STRING },
                    sourceRef: { type: Type.STRING },
                  },
                  required: ['category', 'frontPrompt', 'backAnswer', 'sourceRef'],
                },
              },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    format: {
                      type: Type.STRING,
                      description: 'Một trong 4 giá trị: multiple_choice, true_false, fill_blank, short_answer',
                    },
                    formatLabel: { type: Type.STRING },
                    cognitiveLevel: { type: Type.STRING },
                    question: { type: Type.STRING },
                    formulaContext: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    sampleAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    sourceRef: { type: Type.STRING },
                  },
                  required: ['format', 'formatLabel', 'cognitiveLevel', 'question', 'sampleAnswer', 'explanation', 'sourceRef'],
                },
              },
              qaSeeds: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    studentQuestion: { type: Type.STRING },
                    intentTag: { type: Type.STRING },
                    aiSeedAnswer: { type: Type.STRING },
                    followUpPrompt: { type: Type.STRING },
                    sourceRef: { type: Type.STRING },
                  },
                  required: ['studentQuestion', 'intentTag', 'aiSeedAnswer', 'followUpPrompt', 'sourceRef'],
                },
              },
            },
            required: ['title', 'topicTitle', 'summary', 'keyPoints', 'flashcards', 'practiceQuestions', 'qaSeeds'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(500).json({ error: 'Mô hình AI không trả về dữ liệu văn bản.' });
      }

      const parsed = JSON.parse(rawText.trim());
      return res.json({ pack: parsed });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Lỗi không xác định khi gọi Gemini API';
      console.error('[Server Gemini Error]:', errMsg);
      return res.status(500).json({
        error: errMsg,
        fallbackRecommended: true,
      });
    }
  });

  // Server-side Gemini API Route: Generate Multi-format Basic Practice Questions for Current Topic
  app.post('/api/ai/generate-practice-questions', async (req, res) => {
    try {
      const { topicTitle = 'Hóa học', gradeLevel = 'Lớp 9', materials = [] } = req.body || {};

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY chưa được cấu hình.',
          fallbackRecommended: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contextText = Array.isArray(materials)
        ? materials
            .map(
              (m: { title?: string; content?: string }) =>
                `[${m.title || ''}]: ${m.content || ''}`
            )
            .join('\n\n')
        : '';

      const prompt = `Hãy tạo bộ 4 câu hỏi luyện tập cơ bản phục vụ ôn bài trên trường cho chủ đề "${topicTitle}", phù hợp với học sinh trình độ "${gradeLevel}".
YÊU CẦU BẮT BUỘC:
1. Gồm đúng 4 dạng câu hỏi cơ bản:
   - multiple_choice: Câu hỏi lựa chọn A, B, C, D (options gồm 4 phương án A, B, C, D)
   - true_false: Câu hỏi nhận định Đúng / Sai (options gồm ["Đúng (True)", "Sai (False)"])
   - fill_blank: Câu hỏi điền từ / công thức / hệ số ngắn vào chỗ trống [ ... ]
   - short_answer: Câu hỏi hỏi-đáp ngắn giải thích hiện tượng hoặc bản chất thường gặp khi kiểm tra miệng/15 phút trên lớp
2. Tuyệt đối TRÁNH câu hỏi chung chung hoặc câu hỏi meta (như "Chủ đề của bài là gì?"). Phải hỏi trực tiếp vào kiến thức thật: công thức hóa học, sản phẩm phản ứng, điều kiện xúc tác, màu kết tủa, định luật bảo toàn.
${contextText ? `\nNgữ cảnh học liệu đang học:\n${contextText}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là giáo viên Hóa học & Khoa học tự nhiên tận tâm, ra câu hỏi ôn bài trên trường rõ ràng, bám sát kiến thức thật trong sách giáo khoa.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    format: {
                      type: Type.STRING,
                      description: 'multiple_choice, true_false, fill_blank, hoặc short_answer',
                    },
                    formatLabel: { type: Type.STRING },
                    cognitiveLevel: { type: Type.STRING },
                    question: { type: Type.STRING },
                    formulaContext: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    sampleAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['format', 'formatLabel', 'cognitiveLevel', 'question', 'sampleAnswer', 'explanation'],
                },
              },
            },
            required: ['questions'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(500).json({ error: 'Không nhận được dữ liệu câu hỏi.' });
      }
      const parsed = JSON.parse(rawText.trim());
      return res.json({ questions: parsed.questions || [] });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi tạo bộ câu hỏi';
      return res.status(500).json({ error: errMsg, fallbackRecommended: true });
    }
  });

  // Server-side Gemini API Route: Generate Basic Flashcards across subjects (Buổi 3)
  app.post('/api/ai/generate-flashcards', async (req, res) => {
    try {
      const {
        subjectName = 'Hóa học',
        topicTitle = 'Este - Lipit & Phản ứng Xà phòng hóa',
        sourceNote = '',
      } = req.body || {};

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY chưa được cấu hình.',
          fallbackRecommended: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Hãy tạo bộ 4 thẻ Flashcard cơ bản cho môn "${subjectName}" — Chủ đề: "${topicTitle}".
YÊU CẦU BẮT BUỘC:
1. Mỗi thẻ gồm Mặt trước (frontPrompt, frontHint) và Mặt sau (backAnswer, backFormula, memoryHook).
2. Ưu tiên đúng 4 nhóm nội dung giúp học sinh dễ ôn nhanh:
   - Thẻ 1 (category: "Khái niệm & Định nghĩa"): Định nghĩa cốt lõi ngắn gọn, dễ thuộc.
   - Thẻ 2 (category: "Phân biệt nhanh"): So sánh 2 khái niệm / trường hợp dễ nhầm lẫn trong bài.
   - Thẻ 3 (category: "Ví dụ minh họa"): Ví dụ điển hình trong SGK hoặc bài kiểm tra.
   - Thẻ 4 (category: "Quy tắc & Lưu ý"): Quy tắc làm bài hoặc lưu ý tránh bẫy mất điểm.
3. Trình bày cực kỳ ngắn gọn, súc tích, dễ hiểu cho học sinh phổ thông.
${sourceNote ? `\nNội dung ghi chú học liệu bổ sung:\n${sourceNote}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là chuyên gia thiết kế thẻ Flashcard học tập đa môn (Hóa học, KHTN, Vật lý, Sinh học, Toán học). Ngắn gọn, súc tích, dễ nhẩm thuộc nhanh.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    frontPrompt: { type: Type.STRING },
                    frontHint: { type: Type.STRING },
                    backAnswer: { type: Type.STRING },
                    backFormula: { type: Type.STRING },
                    memoryHook: { type: Type.STRING },
                  },
                  required: ['category', 'frontPrompt', 'backAnswer'],
                },
              },
            },
            required: ['cards'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(500).json({ error: 'Không nhận được dữ liệu Flashcard.' });
      }
      const parsed = JSON.parse(rawText.trim());
      return res.json({ cards: parsed.cards || [] });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi tạo Flashcard';
      return res.status(500).json({ error: errMsg, fallbackRecommended: true });
    }
  });

  // Server-side Gemini API Route: Generate Q&A Seeds for Current Topic (Buổi 3)
  app.post('/api/ai/generate-qa-seeds', async (req, res) => {
    try {
      const {
        topicTitle = 'Este - Lipit & Phản ứng Xà phòng hóa',
        gradeLevel = 'Lớp 7 - Lớp 12',
        materials = [],
      } = req.body || {};

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY chưa được cấu hình.',
          fallbackRecommended: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contextText = Array.isArray(materials)
        ? materials
            .map((m: { title?: string; content?: string }) => `[${m.title || ''}]: ${m.content || ''}`)
            .join('\n\n')
        : '';

      const prompt = `Hãy tạo danh sách 4 Q&A Seed (Câu hỏi gợi mở và câu trả lời ngắn ban đầu) cho chủ đề học tập hiện tại: "${topicTitle}" (Trình độ: ${gradeLevel}).
MỤC ĐÍCH: Chuẩn bị dữ liệu khởi tạo cho Chatbot hỗ trợ ôn bài ở buổi sau (chỉ ở mức khởi tạo Q&A seed, chưa làm chatbot hoàn chỉnh).
YÊU CẦU BẮT BUỘC:
1. Ưu tiên các câu hỏi mà HỌC SINH THẬT SỰ CÓ THỂ HỎI khi đang học hoặc làm bài tập về chủ đề này (thắc mắc "Tại sao...", "Làm sao phân biệt...", "Khi nào dùng...", "Lỗi sai nào hay gặp...").
2. intentTag phải thuộc 1 trong 4 nhãn: "Giải thích bản chất", "So sánh phân biệt", "Ứng dụng thực tế", "Bẫy thường gặp".
3. aiSeedAnswer: Câu trả lời ngắn ban đầu (2-3 câu), giải thích rõ bản chất, đúng trọng tâm để làm mồi (seed) chuẩn cho AI Tutor.
4. followUpPrompt: 1 câu hỏi gợi mở tiếp theo để khuyến khích học sinh đào sâu tư duy.
${contextText ? `\nNgữ cảnh học liệu hiện tại:\n${contextText}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là chuyên gia sư phạm tạo bộ hạt giống câu hỏi gợi mở (Q&A Seeds) thực tế từ góc nhìn thắc mắc thật của học sinh phổ thông.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              qaSeeds: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    studentQuestion: { type: Type.STRING },
                    intentTag: {
                      type: Type.STRING,
                      description: 'Một trong 4 nhãn: Giải thích bản chất, So sánh phân biệt, Ứng dụng thực tế, Bẫy thường gặp',
                    },
                    aiSeedAnswer: { type: Type.STRING },
                    followUpPrompt: { type: Type.STRING },
                  },
                  required: ['studentQuestion', 'intentTag', 'aiSeedAnswer', 'followUpPrompt'],
                },
              },
            },
            required: ['qaSeeds'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(500).json({ error: 'Không nhận được dữ liệu Q&A Seed.' });
      }
      const parsed = JSON.parse(rawText.trim());
      return res.json({ qaSeeds: parsed.qaSeeds || [] });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi tạo Q&A Seed';
      return res.status(500).json({ error: errMsg, fallbackRecommended: true });
    }
  });

  // Server-side Gemini API Route: Grounded Study Assistant Chatbot
  app.post('/api/ai/grounded-chat', async (req, res) => {
    try {
      const {
        message = '',
        topicTitle = 'Hóa học & Khoa học Tự nhiên',
        sources = [],
        analysisPreview = null,
        studyPack = null,
        chatHistory = [],
      } = req.body || {};

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Câu hỏi không được để trống.' });
      }

      const effectiveApiKey = getEffectiveApiKey(req);
      if (!effectiveApiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY chưa được cấu hình trên máy chủ và chưa có local-only key.',
          fallbackRecommended: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // 1. Dựng tài liệu Grounding Text từ 3 nguồn: sources, analysisPreview, studyPack
      const sourcesText = Array.isArray(sources) && sources.length > 0
        ? sources
            .map(
              (s: any, idx: number) =>
                `[Học liệu #${idx + 1} (${s.id || ''}) - "${s.title || ''}"]: ${s.content || ''}${
                  s.noteOrCaption ? `\n(Ghi chú học sinh: ${s.noteOrCaption})` : ''
                }`
            )
            .join('\n\n')
        : 'Chưa có ghi chép học liệu gốc.';

      const analysisText = analysisPreview
        ? `[Phân tích sơ bộ AI đã hiểu gì]:\n- Khái niệm nhận diện: ${(analysisPreview.aiDetectedConcepts || []).join(', ')}\n- Chủ đề cốt lõi: ${analysisPreview.coreTheme || ''}\n- Tổng quan: ${analysisPreview.overview || ''}\n- Mục tiêu cần đạt: ${(analysisPreview.learningObjectives || []).join('; ')}`
        : 'Không có dữ liệu phân tích sơ bộ.';

      const studyPackText = studyPack
        ? `[Study Pack: "${studyPack.title || ''}"]:\n` +
          `1. Tóm tắt: ${studyPack.summary?.overview || ''}\n` +
          `2. Ý chính (Key Points):\n${(studyPack.keyPoints || [])
            .map(
              (kp: any) =>
                `- [${kp.category}] ${kp.title}: ${kp.explanation} (PTHH/Biểu thức: ${kp.formulaOrEquation || 'Không'} | Tránh bẫy: ${kp.examTip || 'Không'} | Nguồn: ${kp.sourceRef || ''})`
            )
            .join('\n')}\n` +
          `3. Thẻ Flashcard:\n${(studyPack.flashcards || [])
            .map(
              (fc: any) =>
                `- Trước: "${fc.frontPrompt}" (Gợi ý: ${fc.frontHint || 'Không'}) ↔ Sau: "${fc.backAnswer}" (Công thức: ${fc.backFormula || 'Không'} | Mẹo: ${fc.memoryHook || 'Không'})`
            )
            .join('\n')}\n` +
          `4. Câu hỏi luyện tập & Đáp án chuẩn:\n${(studyPack.practiceQuestions || [])
            .map(
              (pq: any) =>
                `- Câu hỏi: "${pq.question}" | Đáp án chuẩn: "${pq.sampleAnswer}" | Giải thích: ${pq.explanation} | Gợi ý ôn lại: ${pq.reviewTip || 'Không'}`
            )
            .join('\n')}\n` +
          `5. Q&A Seeds:\n${(studyPack.qaSeeds || [])
            .map(
              (qa: any) =>
                `- Thắc mắc: "${qa.studentQuestion}" ➔ Trả lời: "${qa.aiSeedAnswer}" (Gợi mở: ${qa.followUpPrompt || 'Không'})`
            )
            .join('\n')}`
        : 'Không có Study Pack đính kèm.';

      const historyText = Array.isArray(chatHistory) && chatHistory.length > 0
        ? chatHistory
            .slice(-6)
            .map((h: any) => `${h.sender === 'user' ? 'Học sinh' : 'Gia sư'}: ${h.text}`)
            .join('\n')
        : 'Chưa có lịch sử đối thoại trước.';

      const prompt = `Bạn là Trợ lý Học tập Grounded AI chuyên hỗ trợ học sinh ôn tập cho chủ đề: "${topicTitle}".
Hãy đọc kỹ toàn bộ ngữ cảnh tài liệu học tập dưới đây và giải đáp câu hỏi của học sinh.

================ QUY TẮC CỐT LÕI (GROUNDING STRICT RULES) ================
1. PHẠM VI TRẢ LỜI NGHIÊM NGẶT:
Bạn CHỈ ĐƯỢC PHÉP trả lời dựa vào 3 nguồn tài liệu dưới đây:
- NGUỒN 1: SOURCES (Học liệu gốc)
- NGUỒN 2: ANALYSIS PREVIEW (Màn hình AI đã hiểu gì / Phân tích sơ bộ)
- NGUỒN 3: STUDY PACK (Summary, Key Points, Flashcards, Practice Questions, Q&A Seeds của chủ đề)

2. BẮT BUỘC XỬ LÝ NGOÀI PHẠM VI (OUT OF SCOPE):
Nếu câu hỏi của học sinh KHÔNG CÓ trong tài liệu và KHÔNG THỂ SUY RA ĐƯỢC từ tài liệu đã cung cấp, bạn BẮT BUỘC PHẢI TRẢ LỜI CÂU CHÍNH XÁC NÀY:
"Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp."
(Sau câu này, bạn có thể kèm thêm 1 câu thân thiện rằng bạn là trợ lý ôn bài bám sát tài liệu của chủ đề "${topicTitle}", và gợi ý học sinh hỏi về các nội dung có trong học liệu đã học).
Đồng thời đặt "isOutOfScope": true.

3. KHÔNG BIẾN THÀNH CHATBOT CHUNG CHUNG:
Tuyệt đối không tán gẫu về các chủ đề ngoài lề (game, phim ảnh, đời tư, xã hội, công nghệ không liên quan...). Không trả lời kiến thức các môn học khác nếu không có trong tài liệu đã cung cấp.

4. PHÙ HỢP CHO VIỆC ÔN BÀI & NGÔN NGỮ THÂN THIỆN:
- Giọng điệu như một người thầy / gia sư đồng hành ân cần, nhẹ nhàng, giải thích từng bước rõ ràng, dễ hiểu cho học sinh từ Lớp 7 trở lên.
- Khi trả lời được trong phạm vi tài liệu, hãy nêu rõ căn cứ trích dẫn trong trường "citedSources" (ví dụ: ["Key Point #1: Cơ chế Este hóa", "Học liệu #mat-001"]).
- Cung cấp 1-2 câu hỏi gợi mở ôn tập tiếp theo trong trường "suggestedFollowUps".

================ TÀI LIỆU CĂN CỨ ĐÃ CUNG CẤP ================
--- NGUỒN 1: SOURCES (HỌC LIỆU GỐC) ---
${sourcesText}

--- NGUỒN 2: ANALYSIS PREVIEW (AI ĐÃ HIỂU GÌ) ---
${analysisText}

--- NGUỒN 3: STUDY PACK CỦA CHỦ ĐỀ HIỆN TẠI ---
${studyPackText}

================ LỊCH SỬ HỘI THOẠI GẦN ĐÂY ================
${historyText}

================ CÂU HỎI MỚI CỦA HỌC SINH ================
"${message.trim()}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là Trợ lý Học tập Grounded AI chuẩn mực. Chỉ trả lời dựa trên tài liệu đã cung cấp. Nếu ngoài phạm vi, bắt buộc phải trả lời: "Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp."',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description:
                  'Nội dung câu trả lời. Nếu ngoài phạm vi, bắt buộc bắt đầu bằng "Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp."',
              },
              isOutOfScope: {
                type: Type.BOOLEAN,
                description: 'true nếu câu hỏi nằm ngoài phạm vi tài liệu đã cung cấp',
              },
              citedSources: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách các nguồn hoặc mục tài liệu được trích dẫn làm căn cứ',
              },
              suggestedFollowUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '1-2 câu hỏi gợi mở tiếp theo giúp học sinh đào sâu ôn tập',
              },
            },
            required: ['answer', 'isOutOfScope', 'citedSources', 'suggestedFollowUps'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(500).json({ error: 'Không nhận được phản hồi từ AI.' });
      }

      const parsed = JSON.parse(rawText.trim());
      return res.json(parsed);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Lỗi xử lý Chatbot Grounded';
      return res.status(500).json({ error: errMsg, fallbackRecommended: true });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
