import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { callChatGPT } from "@/lib/openai"
import { genAI } from "@/lib/gemini"


const prisma = new PrismaClient()


function log(msg: string) {
    console.log(msg);
}

export async function POST(req: NextRequest) {
    try {
        const { query, fileData, fileType } = await req.json()
        log(`[Search API] Query: "${query}"`);
        if (fileData) {
            log(`[Search API] File attached: ${fileType}`);
        }

        if (!query) {
            return NextResponse.json({ solutions: [] })
        }

        // 1. Search in Database (only if no file attached)
        if (!fileData) {
            const solutions = await prisma.solution.findMany({
                where: {
                    OR: [
                        { title: { contains: query } },
                        { keywords: { contains: query } },
                        { description: { contains: query } }
                    ]
                },
                take: 3
            })
            log(`[Search API] DB Search found ${solutions.length} solutions.`);

            // 2. If found, return results
            if (solutions.length > 0) {
                return NextResponse.json({ solutions })
            }
        }

        // 3. If NOT found or has file, use AI
        const appSettings = await prisma.settings.findFirst()
        const enableAI = appSettings?.enableAiSearch ?? (process.env.ENABLE_AI_SEARCH === 'true');
        log(`[Search API] AI Enabled: ${enableAI}`);

        if (enableAI) {
            try {
                if (!genAI) {
                    log("Gemini API Key is missing.");
                    return NextResponse.json({ solutions: [] });
                }

                log("Initializing Gemini model...");
                // Using Gemini 3.0 Flash - supports multimodal
                const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

                const textPrompt = `Bạn là kỹ thuật viên robot GIHO. Trả lời NGẮN GỌN như nhắn tin, tối đa 3-4 dòng.

${fileData ? `Khách gửi ${fileType === 'image' ? 'ảnh' : 'video'}. Phân tích ngay và đưa giải pháp cụ thể.` : ''}

Khách: "${query}"

Quy tắc:
- Đã đủ thông tin: đưa giải pháp ngay (tối đa 3 bước ngắn)
- Chưa đủ thông tin: hỏi 1 câu ngắn NHẤT, ưu tiên hỏi "Bạn có thể gửi ảnh/video không?" nếu chưa rõ
- KHÔNG chào hỏi, KHÔNG giải thích dài dòng, KHÔNG hỏi nhiều câu cùng lúc`;

                log("[Search API] Sending prompt to Gemini...");

                // Add timeout for Gemini (45 seconds)
                const geminiPromise = (async () => {
                    if (fileData && fileType) {
                        const parts: any[] = [{ text: textPrompt }];
                        if (fileType === 'image') {
                            parts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.base64 } });
                        } else if (fileType === 'video') {
                            parts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.base64 } });
                        }
                        return await model.generateContent(parts);
                    } else {
                        return await model.generateContent(textPrompt);
                    }
                })();

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Gemini timeout after 45 seconds')), 45000);
                });

                const result = await Promise.race([geminiPromise, timeoutPromise]) as any;
                const response = result.response;
                const text = response.text();
                log("[Search API] Gemini response received.");

                // Return as a special AI solution
                return NextResponse.json({
                    solutions: [{
                        id: 'ai-generated',
                        title: fileData ? '🤖 Phân tích từ AI (Dựa trên ảnh/video)' : '💡 Gợi ý từ AI (Phân tích tự động)',
                        description: text,
                        videoUrl: null,
                        keywords: 'ai, auto-generated',
                        updatedAt: new Date(),
                        createdAt: new Date()
                    }]
                })

            } catch (aiError: any) {
                log(`AI Generation Error: ${aiError?.message || aiError}`);

                // Try ChatGPT as fallback
                try {
                    log("[Search API] AI failed, trying ChatGPT fallback...");

                    const chatGPTPrompt = `
                    Bạn là kỹ thuật viên chuyên sửa robot hút bụi GIHO với 10 năm kinh nghiệm.
                    
                    NGỮ CẢNH CUỘC TRÒ CHUYỆN:
                    ${query}
                    
                    NHIỆM VỤ CỦA BẠN:
                    1. NẾU CHƯA RÕ VẤN ĐỀ: Hỏi lại khách hàng cụ thể
                    2. NẾU ĐÃ RÕ: Chẩn đoán CHÍNH XÁC dựa trên triệu chứng → Đưa giải pháp CỤ THỂ
                    
                    Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.
                    `;

                    const chatGPTResponse = await callChatGPT(chatGPTPrompt, fileData, fileType);
                    log("[Search API] ChatGPT response received.");

                    return NextResponse.json({
                        solutions: [{
                            id: 'ai-generated',
                            title: fileData ? '🤖 Phân tích từ AI (Dựa trên ảnh/video)' : '💡 Gợi ý từ AI (Phân tích tự động)',
                            description: chatGPTResponse,
                            videoUrl: null,
                            keywords: 'ai, auto-generated, chatgpt',
                            updatedAt: new Date(),
                            createdAt: new Date()
                        }]
                    });
                } catch (chatGPTError: any) {
                    log(`ChatGPT also failed: ${chatGPTError?.message || chatGPTError}`);
                    // Both AI failed, escalate to technician
                    return NextResponse.json({
                        solutions: [{
                            id: 'need-technician',
                            title: 'Cần kỹ thuật viên hỗ trợ',
                            description: 'Hệ thống AI tạm thời không thể xử lý yêu cầu của bạn.',
                            videoUrl: null,
                            keywords: 'escalate, technician',
                            updatedAt: new Date(),
                            createdAt: new Date()
                        }]
                    });
                }
            }
        }

        return NextResponse.json({ solutions: [] })

    } catch (error: any) {
        log(`Internal Error: ${error?.message || error}`);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
