'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Globe, Check, Bot } from "lucide-react"

type Settings = {
  telegramBotToken: string
  telegramChatId: string
  notifyOnNewTicket: boolean
  notifyDailyReport: boolean
  companyName: string
  supportPhone: string
  workingHours: string
  enableAiSearch: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    telegramBotToken: '',
    telegramChatId: '',
    notifyOnNewTicket: true,
    notifyDailyReport: false,
    companyName: 'GIHO Smart Home',
    supportPhone: '',
    workingHours: '8:00 - 17:00 (Thứ 2 - Thứ 6)',
    enableAiSearch: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.settings) {
        setSettings({
          telegramBotToken: data.settings.telegramBotToken || '',
          telegramChatId: data.settings.telegramChatId || '',
          notifyOnNewTicket: data.settings.notifyOnNewTicket ?? true,
          notifyDailyReport: data.settings.notifyDailyReport ?? false,
          companyName: data.settings.companyName || 'GIHO Smart Home',
          supportPhone: data.settings.supportPhone || '',
          workingHours: data.settings.workingHours || '8:00 - 17:00 (Thứ 2 - Thứ 6)',
          enableAiSearch: data.settings.enableAiSearch ?? true
        })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage('✅ Đã lưu cài đặt thành công!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Lỗi: ' + (data.error || 'Không thể lưu'))
      }
    } catch (error) {
      setMessage('❌ Có lỗi xảy ra khi lưu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96 italic">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
            Cài Đặt Hệ Thống
          </h2>
          <p className="text-slate-500 mt-2 italic">Quản lý cấu hình & thông số</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-[20px] text-center italic ${message.includes('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-6">
        {/* Telegram Notifications */}
        <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              <span className="italic font-bold">Thông Báo Telegram</span>
            </CardTitle>
            <CardDescription className="italic">
              Nhận thông báo qua Telegram khi có yêu cầu hỗ trợ mới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="botToken" className="italic font-medium">Bot Token</Label>
              <Input 
                id="botToken" 
                type="password" 
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={settings.telegramBotToken}
                onChange={(e) => setSettings({...settings, telegramBotToken: e.target.value})}
                className="rounded-[40px] border-blue-200"
              />
              <p className="text-sm text-slate-500 italic">
                Lấy từ @BotFather trên Telegram
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chatId" className="italic font-medium">Chat ID (Group hoặc User)</Label>
              <Input 
                id="chatId" 
                placeholder="-1001234567890"
                value={settings.telegramChatId}
                onChange={(e) => setSettings({...settings, telegramChatId: e.target.value})}
                className="rounded-[40px] border-blue-200"
              />
              <p className="text-sm text-slate-500 italic">
                Chat ID của group kỹ thuật hoặc user admin (số âm cho group)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="notifyTicket" 
                className="rounded"
                checked={settings.notifyOnNewTicket}
                onChange={(e) => setSettings({...settings, notifyOnNewTicket: e.target.checked})}
              />
              <Label htmlFor="notifyTicket" className="italic">Gửi thông báo khi có ticket mới</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="dailyReport" 
                className="rounded"
                checked={settings.notifyDailyReport}
                onChange={(e) => setSettings({...settings, notifyDailyReport: e.target.checked})}
              />
              <Label htmlFor="dailyReport" className="italic">Gửi báo cáo hàng ngày</Label>
            </div>
          </CardContent>
        </Card>

        {/* Website Info */}
        <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-500" />
              <span className="italic font-bold">Thông Tin Công Ty</span>
            </CardTitle>
            <CardDescription className="italic">
              Thông tin hiển thị trên trang support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName" className="italic font-medium">Tên Công Ty</Label>
              <Input 
                id="companyName" 
                placeholder="GIHO Smart Home"
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                className="rounded-[40px] border-blue-200"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supportPhone" className="italic font-medium">Hotline Hỗ Trợ</Label>
              <Input 
                id="supportPhone" 
                placeholder="0901234567"
                value={settings.supportPhone}
                onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                className="rounded-[40px] border-blue-200"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workingHours" className="italic font-medium">Giờ Làm Việc</Label>
              <Input 
                id="workingHours" 
                placeholder="8:00 - 17:00 (Thứ 2 - Thứ 6)"
                value={settings.workingHours}
                onChange={(e) => setSettings({...settings, workingHours: e.target.value})}
                className="rounded-[40px] border-blue-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-500" />
              <span className="italic font-bold">Cài Đặt AI</span>
            </CardTitle>
            <CardDescription className="italic">
              Cấu hình AI hỗ trợ tự động (Gemini + ChatGPT backup)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableAiSearch"
                className="rounded"
                checked={settings.enableAiSearch}
                onChange={(e) => setSettings({...settings, enableAiSearch: e.target.checked})}
              />
              <Label htmlFor="enableAiSearch" className="italic">Bật AI hỗ trợ tự động</Label>
            </div>
            <p className="text-sm text-slate-500 italic">
              Khi bật, hệ thống sẽ dùng Gemini AI (và ChatGPT làm backup) để tự động trả lời khách hàng.
            </p>

            <div className="rounded-[20px] bg-blue-50 border border-blue-100 p-4 space-y-2">
              <p className="text-sm font-medium italic text-blue-700">Trạng thái API Keys (cấu hình tại Vercel)</p>
              <div className="flex items-center gap-2 text-sm italic">
                <span className={`w-2 h-2 rounded-full ${process.env.NEXT_PUBLIC_GEMINI_CONFIGURED === 'true' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span className="text-slate-600">Gemini API Key: <strong>Cấu hình trong Vercel → Environment Variables → GEMINI_API_KEY</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm italic">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="text-slate-600">OpenAI API Key: <strong>Cấu hình trong Vercel → Environment Variables → OPENAI_API_KEY</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-[40px] text-lg font-semibold italic shadow-lg"
        >
          {saving ? 'Đang lưu...' : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Lưu Tất Cả Cài Đặt
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
