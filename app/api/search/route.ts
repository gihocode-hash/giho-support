import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"


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
                // Import gemini lib
                const { genAI } = await import("@/lib/gemini");

                if (!genAI) {
                    log("Gemini API Key is missing.");
                    return NextResponse.json({ solutions: [] });
                }

                log("Initializing Gemini model...");
                // Using Gemini 3.0 Flash - supports multimodal
                const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

                const textPrompt = `
                Bạn là trợ lý kỹ thuật chuyên nghiệp cho robot GIHO.
                Người dùng báo cáo vấn đề: "${query}".
                ${fileData ? `\n\nKhách hàng đã gửi ${fileType === 'image' ? 'ảnh chụp màn hình báo lỗi' : 'video quay tình trạng lỗi'}. Hãy phân tích kỹ nội dung ${fileType === 'image' ? 'ảnh' : 'video'} để đưa ra chẩn đoán chính xác.` : ''}
                
                Hãy phân tích ngắn gọn nguyên nhân có thể và đề xuất giải pháp khắc phục.
                YÊU CẦU:
                - Trả lời bằng tiếng Việt.
                - Dùng giọng văn thân thiện, chuyên nghiệp.
                - BẮT BUỘC sử dụng gạch đầu dòng (-) cho các ý.
                - BẮT BUỘC xuống dòng rõ ràng giữa các đoạn để dễ đọc.
                - Không cần tiêu đề "Kiến nghị từ AI".
                ${fileData ? `- Mô tả chi tiết những gì bạn thấy trong ${fileType === 'image' ? 'ảnh' : 'video'} (đèn báo, màn hình, trạng thái robot...).` : ''}
                `;

                log("[Search API] Sending prompt to Gemini...");
                
                let result;
                if (fileData && fileType) {
                    // Multimodal request with image/video
                    const parts: any[] = [
                        { text: textPrompt }
                    ];

                    // Add inline data for image or video
                    if (fileType === 'image') {
                        parts.push({
                            inlineData: {
                                mimeType: fileData.mimeType,
                                data: fileData.base64
                            }
                        });
                    } else if (fileType === 'video') {
                        parts.push({
                            inlineData: {
                                mimeType: fileData.mimeType,
                                data: fileData.base64
                            }
                        });
                    }

                    result = await model.generateContent(parts);
                } else {
                    // Text-only request
                    result = await model.generateContent(textPrompt);
                }
                
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
                // Fallback to empty if AI fails
                return NextResponse.json({ solutions: [] })
            }
        }

        return NextResponse.json({ solutions: [] })

    } catch (error: any) {
        log(`Internal Error: ${error?.message || error}`);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
