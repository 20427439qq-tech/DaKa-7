import { GoogleGenAI, Type } from "@google/genai";
import { HomeworkAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeHomework = async (dataUrl: string, fileName?: string): Promise<HomeworkAnalysis> => {
  console.log("Starting AI Homework Analysis using gemini-3-flash-preview...");
  const now = new Date();
  const uploadTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  
  try {
    const parts: any[] = [
      { text: `请分析这份作业内容，并完成以下任务：
1. 从可读性、逻辑性、哲理性、反思性四个维度进行评分（每个维度满分25分，总分100分）。
2. 提取文档第一行的文字作为 metadata.firstLine。
3. 统计作业的总字数 (wordCount)。
4. 提供简短的评价反馈。

${fileName ? `文件名信息：${fileName}
请从文件名中解析出：
- 学号 (studentId)
- 书名 (bookName)
- 第几次作业 (homeworkNumber)
- 作业日期 (homeworkDate)

解析规则：
文件名格式通常为：[学号]+[书名][作业次数] [日期].[后缀]
例如 "01+阿利斯塔03 20260101.docx"：
- 学号: 01
- 书名: 阿利斯塔
- 次数: 03
- 日期: 20260101 (请格式化为 YYYY-MM-DD)` : '请尝试从内容中解析学号、书名、作业次数和日期。'}

请以JSON格式返回结果。` }
    ];

    const SUPPORTED_MIMES = [
      'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
      'application/pdf',
      'audio/wav', 'audio/mp3', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac',
      'text/plain', 'text/markdown', 'text/csv'
    ];

    let wordCount = 0;

    if (dataUrl.startsWith('data:')) {
      const mimeType = dataUrl.split(';')[0].split(':')[1];
      const base64Data = dataUrl.split(',')[1];
      
      if (SUPPORTED_MIMES.includes(mimeType)) {
        if (mimeType.startsWith('text/')) {
          try {
            const decodedText = decodeURIComponent(escape(atob(base64Data)));
            parts.push({ text: `以下是作业文本内容：\n\n${decodedText}` });
            wordCount = decodedText.trim().length;
          } catch (e) {
            const decodedText = atob(base64Data);
            parts.push({ text: `以下是作业文本内容：\n\n${decodedText}` });
            wordCount = decodedText.trim().length;
          }
        } else {
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          });
        }
      } else {
        return {
          readability: 0,
          logic: 0,
          philosophy: 0,
          reflection: 0,
          total: 0,
          uploadTime,
          feedback: `抱歉，AI 目前暂不支持直接分析 ${mimeType} 格式的文件。建议您将其另存为 PDF、图片或纯文本文件后重新上传。`
        };
      }
    } else {
      parts.push({ text: dataUrl });
      wordCount = dataUrl.trim().length;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readability: { type: Type.NUMBER, description: "可读性评分 (0-25)" },
            logic: { type: Type.NUMBER, description: "逻辑性评分 (0-25)" },
            philosophy: { type: Type.NUMBER, description: "哲理性评分 (0-25)" },
            reflection: { type: Type.NUMBER, description: "反思性评分 (0-25)" },
            total: { type: Type.NUMBER, description: "总分 (0-100)" },
            feedback: { type: Type.STRING, description: "简短的评价反馈" },
            wordCount: { type: Type.NUMBER, description: "作业总字数" },
            metadata: {
              type: Type.OBJECT,
              properties: {
                studentId: { type: Type.STRING },
                bookName: { type: Type.STRING },
                homeworkNumber: { type: Type.STRING },
                homeworkDate: { type: Type.STRING, description: "作业日期 (YYYY-MM-DD)" },
                firstLine: { type: Type.STRING }
              }
            }
          },
          required: ["readability", "logic", "philosophy", "reflection", "total"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      uploadTime,
      wordCount: result.wordCount || wordCount
    } as HomeworkAnalysis;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      readability: 0,
      logic: 0,
      philosophy: 0,
      reflection: 0,
      total: 0,
      uploadTime,
      feedback: "分析失败，请稍后重试。"
    };
  }
};
