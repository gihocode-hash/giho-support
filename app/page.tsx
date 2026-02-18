'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Paperclip, Bot, User } from "lucide-react"

type ConversationState = 'normal' | 'ai_suggested' | 'asking_for_evidence' | 'asking_contact_info'

export default function Home() {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', content: string, file?: { url: string, type: 'image' | 'video' } }[]>([
    { role: 'bot', content: "Xin chào! Đây là bộ phận hỗ trợ kỹ thuật GIHO TECH. Bạn đang gặp sự cố gì với Robot? Hãy mô tả lỗi hoặc gửi video/hình ảnh cho tôi." }
  ])
  const [input, setInput] = useState("")
  const [conversationState, setConversationState] = useState<ConversationState>('normal')
  const [uploadedFile, setUploadedFile] = useState<{ url: string, type: 'image' | 'video', file: File } | null>(null)
  const customerIssue = useRef<string>('')
  const aiSuggestion = useRef<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert file to base64 for AI analysis
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data:image/jpeg;base64, prefix
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to convert file'))
        }
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const fileType = file.type
    if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
      alert('Chỉ chấp nhận file ảnh hoặc video!')
      return
    }

    // Check file size based on type
    const isVideo = fileType.startsWith('video/')
    const maxSizeMB = isVideo ? 100 : 5
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File ${isVideo ? 'video' : 'ảnh'} không được vượt quá ${maxSizeMB}MB!`)
      return
    }

    // Validate video duration if it's a video
    if (isVideo) {
      const validDuration = await validateVideoDuration(file)
      if (!validDuration) {
        alert('Video không được dài quá 60 giây!')
        return
      }
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    const type = fileType.startsWith('image/') ? 'image' : 'video'
    
    // Store file for later upload (when creating ticket)
    setUploadedFile({ url, type, file })
    
    // Add to messages
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: type === 'image' ? '📷 Đã gửi hình ảnh' : '🎥 Đã gửi video',
      file: { url, type }
    }])

    // Auto-analyze file immediately (except when asking for contact info)
    if (conversationState !== 'asking_contact_info') {
      // Bot response - analyzing
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: `Cảm ơn bạn! Tôi đang phân tích ${type === 'image' ? 'hình ảnh' : 'video'} này...` 
      }])

      // Build query based on current context
      let analysisQuery = ''
      if (customerIssue.current) {
        // User already described an issue before
        analysisQuery = `${customerIssue.current}\n\nKhách hàng đã gửi ${type === 'image' ? 'ảnh chụp màn hình báo lỗi' : 'video quay lỗi'}.`
        if (conversationState === 'asking_for_evidence') {
          analysisQuery = `${customerIssue.current}\n\nKhách hàng đã thử giải pháp đầu tiên nhưng vẫn không được.\n\nKhách hàng đã gửi ${type === 'image' ? 'ảnh chụp màn hình báo lỗi' : 'video quay lỗi'}.`
        }
      } else {
        // User uploaded file without describing issue first
        customerIssue.current = `Khách hàng gửi ${type === 'image' ? 'ảnh' : 'video'} báo lỗi`
        analysisQuery = `Khách hàng gặp vấn đề với robot GIHO và đã gửi ${type === 'image' ? 'ảnh chụp màn hình báo lỗi' : 'video quay tình trạng lỗi'}. Hãy phân tích và đưa ra giải pháp.`
      }

      // Call AI to analyze
      try {
        // Convert file to base64
        const base64Data = await fileToBase64(file)
        
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: analysisQuery,
            fileData: {
              base64: base64Data,
              mimeType: file.type
            },
            fileType: type
          })
        })
        const data = await res.json()

        if (data.solutions && data.solutions.length > 0 && data.solutions[0].id === 'ai-generated') {
          const aiSolution = data.solutions[0]
          aiSuggestion.current = aiSolution.description
          setConversationState('ai_suggested')
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'bot', content: `Dựa trên ${type === 'image' ? 'ảnh' : 'video'} bạn gửi:\n\n${aiSolution.description}\n\n---\n\n💬 Bạn thử làm theo hướng dẫn này nhé! Nếu vẫn không được, hãy cho tôi biết.` }
          ])
        } else {
          // Can't analyze, escalate to technician
          setConversationState('asking_contact_info')
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'bot', content: `Tôi đã xem ${type === 'image' ? 'ảnh' : 'video'} của bạn. Tình huống này cần kỹ thuật viên kiểm tra trực tiếp.\n\nVui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567` }
          ])
        }
      } catch (e) {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'bot', content: "Có lỗi xảy ra khi phân tích. Để kỹ thuật viên hỗ trợ trực tiếp, vui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567" }
        ])
        setConversationState('asking_contact_info')
      }
    }
  }

  // Validate video duration helper
  const validateVideoDuration = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        const duration = video.duration
        resolve(duration <= 60) // Max 60 seconds
      }
      
      video.onerror = () => {
        resolve(false)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const createTicket = async (name: string, phone: string, issue: string, file?: File, fileType?: 'image' | 'video') => {
    try {
      let fileUrl = null
      
      // Upload file to Firebase Storage if exists
      if (file) {
        const { uploadFile } = await import('@/lib/storage')
        const tempTicketId = `temp-${Date.now()}`
        fileUrl = await uploadFile(file, tempTicketId)
      }

      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerName: name,
          phone: phone,
          description: issue,
          fileUrl: fileUrl,
          fileType: fileType
        })
      })
      return await res.json()
    } catch (e) {
      console.error('Error creating ticket:', e)
      return null
    }
  }

  const parseNameAndPhone = (input: string): { name: string, phone: string } | null => {
    // Try to parse format: "Tên - SĐT" or "Tên, SĐT" or "Tên SĐT"
    const patterns = [
      /^(.+?)\s*[-,]\s*(\d{9,11})$/,  // "Tên - 0123456789" or "Tên, 0123456789"
      /^(.+?)\s+(\d{9,11})$/,          // "Tên 0123456789"
    ]
    
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) {
        return {
          name: match[1].trim(),
          phone: match[2].trim()
        }
      }
    }
    return null
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput("")

    // Handle different conversation states
    if (conversationState === 'asking_contact_info') {
      const parsed = parseNameAndPhone(userMsg)
      
      if (!parsed) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "Xin lỗi, tôi chưa hiểu rõ thông tin. Vui lòng nhập theo định dạng:\n\nTên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567" 
        }])
        return
      }

      setConversationState('normal')
      
      // Create ticket
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Đang ghi nhận yêu cầu của bạn..." 
      }])

      const ticket = await createTicket(
        parsed.name,
        parsed.phone,
        customerIssue.current || 'Không có mô tả',
        uploadedFile?.file,
        uploadedFile?.type
      )

      if (ticket && ticket.id) {
        const confirmMessage = `✅ Đã ghi nhận yêu cầu của bạn!\n\n` +
          `👤 Tên: ${parsed.name}\n` +
          `📞 SĐT: ${parsed.phone}\n\n` +
          `Bộ phận kỹ thuật sẽ liên hệ lại với bạn sớm nhất có thể.\n\n` +
          `Mã yêu cầu: #${ticket.id.slice(-8)}\n\n` +
          `Cảm ơn bạn đã đồng hành cùng GIHO Smarthome ! ❤️`

        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'bot', content: confirmMessage }
        ])
      } else {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'bot', content: "Có lỗi khi tạo yêu cầu. Vui lòng liên hệ hotline để được hỗ trợ." }
        ])
      }
      
      // Reset
      customerIssue.current = ''
      aiSuggestion.current = ''
      setUploadedFile(null)
      return
    }

    // Handle AI suggested state - let AI continue the conversation with context
    if (conversationState === 'ai_suggested') {
      // Send user response back to AI with full context for intelligent follow-up
      setMessages(prev => [...prev, { role: 'bot', content: "Để tôi xem thêm..." }])
      
      try {
        // Build conversation context
        const conversationContext = `TÔI VỪA ĐƯA RA GIẢI PHÁP:
${aiSuggestion.current}

---

KHÁCH HÀNG TRẢ LỜI:
${userMsg}

---

NHIỆM VỤ: Hãy phân tích câu trả lời của khách hàng và quyết định:
1. NẾU khách đang trả lời câu hỏi của bạn hoặc bổ sung thông tin → Tiếp tục hỗ trợ, đưa giải pháp cụ thể hơn
2. NẾU khách nói "vẫn không được" / "vẫn lỗi" → Trả lời: "Tôi hiểu rồi. Hãy cho tôi thêm thông tin hoặc ảnh/video để phân tích kỹ hơn."
3. NẾU khách xác nhận đã giải quyết được (đã ok, đã xong, cảm ơn) → Trả lời: "Tuyệt vời! Rất vui vì đã giúp được bạn."

QUAN TRỌNG: Đọc kỹ câu trả lời của khách, ĐỪNG vội kết luận!`

        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: conversationContext }),
          signal: AbortSignal.timeout(120000) // Timeout sau 2 phút
        })
        const data = await res.json()

        if (data.solutions && data.solutions.length > 0 && data.solutions[0].id === 'ai-generated') {
          const aiResponse = data.solutions[0].description
          
          // Check if AI determined the issue is resolved
          const resolvedIndicators = ['tuyệt vời', 'rất vui', 'đã giúp được']
          const isResolved = resolvedIndicators.some(indicator => 
            aiResponse.toLowerCase().includes(indicator)
          )
          
          // Check if AI suggests escalation
          const escalationIndicators = ['chụp ảnh', 'gửi video', 'ảnh/video', 'hình ảnh']
          const needsEscalation = escalationIndicators.some(indicator => 
            aiResponse.toLowerCase().includes(indicator)
          )
          
          if (isResolved) {
            // Issue resolved
            setConversationState('normal')
            customerIssue.current = ''
            aiSuggestion.current = ''
            setUploadedFile(null)
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'bot', content: aiResponse }
            ])
          } else if (needsEscalation) {
            // AI asking for more evidence or suggests escalation
            setConversationState('asking_for_evidence')
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'bot', content: aiResponse + '\n\n📸 Bạn có thể gửi ảnh/video bằng nút đính kèm bên dưới.' }
            ])
          } else {
            // AI continues conversation with more details
            aiSuggestion.current = aiResponse
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'bot', content: aiResponse }
            ])
          }
        } else {
          // Fallback: can't process, ask for escalation
          setConversationState('asking_contact_info')
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'bot', content: "Để bộ phận kỹ thuật hỗ trợ trực tiếp, vui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567" }
          ])
        }
      } catch (error) {
        console.error('Error continuing AI conversation:', error)
        
        // Check if it's a timeout error
        const isTimeout = error instanceof Error && error.name === 'TimeoutError'
        
        setConversationState('asking_contact_info')
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'bot', content: isTimeout 
            ? "Xin lỗi, tôi vẫn chưa rõ lỗi bạn gặp phải. Đội ngũ kỹ thuật viên sẽ hỗ trợ bạn, vui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567"
            : "Có lỗi xảy ra. Để kỹ thuật viên hỗ trợ, vui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567" 
          }
        ])
      }
      return
    }

    // Handle asking for evidence (after AI suggested but user said still not working)
    if (conversationState === 'asking_for_evidence') {
      // Check for immediate support request
      const supportKeywords = ['cần kỹ thuật', 'cần hỗ trợ', 'liên hệ ngay', 'chuyển kỹ thuật']
      const needsSupport = supportKeywords.some(keyword => userMsg.toLowerCase().includes(keyword))

      if (needsSupport) {
        // Jump directly to asking contact info
        setConversationState('asking_contact_info')
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "Để bộ phận kỹ thuật liên hệ hỗ trợ bạn, vui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567" 
        }])
        return
      }

      // If user just typed text (not uploaded file), remind them
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Bạn có thể:\n\n📸 Gửi ảnh/video bằng nút đính kèm bên dưới\n🔧 Hoặc nhắn \"cần kỹ thuật\" để chuyển kỹ thuật viên" 
      }])
      return
    }

    // Normal conversation - search for solutions
    setMessages(prev => [...prev, { role: 'bot', content: "Đang tìm kiếm giải pháp..." }])

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
        signal: AbortSignal.timeout(120000) // Timeout sau 2 phút
      })
      const data = await res.json()

      if (data.solutions && data.solutions.length > 0) {
        // Check if it's an AI solution
        if (data.solutions[0].id === 'ai-generated') {
          const aiSolution = data.solutions[0]
          customerIssue.current = userMsg
          aiSuggestion.current = aiSolution.description
          
          // Show AI solution directly, then ask if it worked
          setConversationState('ai_suggested')
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'bot', content: `${aiSolution.description}\n\n---\n\n💬 Bạn thử làm theo hướng dẫn trên nhé! Nếu vẫn không được, hãy cho tôi biết.` }
          ])
        } else if (data.solutions[0].id === 'need-technician') {
          // Both AIs failed, escalate to technician
          customerIssue.current = userMsg
          setConversationState('asking_contact_info')
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'bot', content: "Xin lỗi, tôi chưa tìm thấy giải pháp hỗ trợ. Kỹ thuật viên sẽ hỗ trợ trực tiếp bạn!\n\nVui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567" }
          ])
        } else {
          // Normal DB solutions
          const solutionLinks = data.solutions.map((s: any) =>
            `\n- [${s.title}](${s.videoUrl || '#'})`
          ).join('')

          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'bot', content: `Tôi tìm thấy vài giải pháp có thể giúp bạn:${solutionLinks}` }
          ])
        }
      } else {
        // No solution found - try AI anyway
        customerIssue.current = userMsg
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'bot', content: "Hiện tại tôi chưa tìm thấy hướng dẫn phù hợp trong hệ thống.\n\nĐể bộ phận kỹ thuật hỗ trợ, vui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567" }
        ])
        setConversationState('asking_contact_info')
      }
    } catch (e) {
      const isTimeout = e instanceof Error && e.name === 'TimeoutError'
      
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'bot', content: isTimeout
          ? "Xin lỗi, tôi vẫn chưa rõ lỗi bạn gặp phải. Đội ngũ kỹ thuật viên sẽ hỗ trợ bạn, vui lòng cung cấp:\n\n📝 Tên - Số điện thoại\n\nVí dụ: Nguyễn Văn A - 0901234567"
          : "Có lỗi xảy ra khi kết nối hệ thống. Vui lòng thử lại hoặc liên hệ kỹ thuật viên." 
        }
      ])
      
      if (isTimeout) {
        setConversationState('asking_contact_info')
      }
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[700px] flex flex-col shadow-2xl bg-white/80 backdrop-blur-sm border-blue-100 rounded-[40px] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-6">
          <CardTitle className="text-2xl font-bold">
            HỖ TRỢ KỸ THUẬT
          </CardTitle>
          <p className="text-sm text-white/80 mt-1">AI-Powered Technical Support</p>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-[20px] p-4 whitespace-pre-wrap shadow-md ${msg.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-none italic'
                : 'bg-white border border-blue-100 text-gray-800 rounded-bl-none'
                }`}>
                {msg.content}
                {msg.file && (
                  <div className="mt-2">
                    {msg.file.type === 'image' ? (
                      <img src={msg.file.url} alt="Uploaded" className="max-w-full rounded-lg" />
                    ) : (
                      <video src={msg.file.url} controls className="max-w-full rounded-lg" />
                    )}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center ml-2 flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </CardContent>

        <CardFooter className="p-4 border-t border-blue-100 bg-white/50">
          <div className="flex w-full items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="shrink-0 rounded-[40px] border-blue-200 hover:bg-blue-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Mô tả lỗi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="rounded-[40px] border-blue-200 italic"
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              className="shrink-0 rounded-[40px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
