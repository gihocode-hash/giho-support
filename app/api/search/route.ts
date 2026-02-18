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
        const enableAI = process.env.ENABLE_AI_SEARCH === 'true';
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

                const textPrompt = `
                Bạn là kỹ thuật viên chuyên sửa robot hút bụi GIHO với 10 năm kinh nghiệm.
                
                NGỮ CẢNH CUỘC TRÒ CHUYỆN:
                ${query}
                
                ${fileData ? `\nKHÁCH HÀNG ĐÃ GỬI ${fileType === 'image' ? 'ẢNH' : 'VIDEO'}:
                - Hãy quan sát KỸ LƯỠNG ${fileType === 'image' ? 'ảnh' : 'video'} này
                - Nhìn vào: đèn LED (màu gì, nháy hay sáng liên tục), màn hình hiển thị gì, vị trí robot, trạng thái bánh xe, cảm biến...
                - MÔ TẢ CỤ THỂ những gì bạn thấy trong ${fileType === 'image' ? 'ảnh' : 'video'}
                - Đừng đưa ra giải pháp chung chung như "kiểm tra nguồn điện", hãy dựa vào CHÍNH XÁC những gì trong ${fileType === 'image' ? 'ảnh' : 'video'}
                ` : ''}
                
                NHIỆM VỤ CỦA BẠN:
                1. NẾU CHƯA RÕ VẤN ĐỀ: Hỏi lại khách hàng cụ thể (VD: "Đèn nháy màu gì?", "Lỗi xảy ra lúc nào - khi sạc hay khi đang chạy?")
                2. NẾU ĐÃ RÕ: Chẩn đoán CHÍNH XÁC dựa trên triệu chứng → Đưa giải pháp CỤ THỂ
                
                CÁCH TRẢ LỜI:
                - Nói chuyện TỰ NHIÊN như kỹ thuật viên thực tế, KHÔNG máy móc
                - Đừng liệt kê danh sách dài, hãy hỏi hoặc đưa ra 1-2 giải pháp CỤ THỂ NHẤT
                - Sử dụng gạch đầu dòng (-) nếu cần liệt kê
                - Xuống dòng rõ ràng giữa các ý
                - BẮT ĐẦU BẰNG việc mô tả những gì bạn thấy (nếu có ảnh/video)
                
                VÍ DỤ CÁCH TRẢ LỜI TỐT:
                "Tôi thấy trong ảnh đèn LED đang nháy đỏ liên tục và bánh xe bên phải bị kẹt. Đây là dấu hiệu bánh xe gặp vật cản.
                
                Bạn thử làm theo:
                - Tắt robot, lật ngửa lên
                - Kiểm tra xem có tóc/dây quấn vào bánh xe phải không
                - Dùng kéo cắt sợi tóc ra, sau đó khởi động lại
                
                Làm xong báo tôi nhé!"
                
                TRÁNH TRẢ LỜI KIỂU NÀY (máy móc, chung chung):
                "Dựa vào thông tin bạn cung cấp:
                - Nguyên nhân: Có thể do nguồn điện, cảm biến, hoặc bánh xe
                - Giải pháp 1: Kiểm tra nguồn
                - Giải pháp 2: Reset robot
                - Giải pháp 3: Liên hệ bảo hành"
                `;

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
