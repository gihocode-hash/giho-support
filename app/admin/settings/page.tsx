import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Key, Bell, Globe } from "lucide-react"

export default function SettingsPage() {
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

            <div className="grid gap-6">
                {/* AI Configuration */}
                <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-blue-500" />
                            <span className="italic font-bold">Cấu Hình AI</span>
                        </CardTitle>
                        <CardDescription className="italic">
                            Quản lý Google Gemini API và các thông số AI chatbot
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="apiKey" className="italic font-medium">Google Gemini API Key</Label>
                            <Input 
                                id="apiKey" 
                                type="password" 
                                placeholder="AIza..." 
                                defaultValue="••••••••••••••••"
                                className="rounded-[40px] border-blue-200"
                            />
                            <p className="text-sm text-slate-500 italic">
                                API key được lưu trong biến môi trường GOOGLE_GENERATIVE_AI_API_KEY
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="model" className="italic font-medium">Model AI</Label>
                            <Input 
                                id="model" 
                                placeholder="gemini-1.5-flash" 
                                defaultValue="gemini-1.5-flash"
                                className="rounded-[40px] border-blue-200"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="systemPrompt" className="italic font-medium">System Prompt</Label>
                            <Textarea 
                                id="systemPrompt" 
                                placeholder="Bạn là trợ lý AI của GIHO..."
                                className="min-h-[100px] rounded-[20px] border-blue-200"
                                defaultValue="Bạn là trợ lý AI hỗ trợ khách hàng của GIHO Smart Home. Hãy trả lời một cách thân thiện và chuyên nghiệp."
                            />
                        </div>

                        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-[40px] italic">
                            Lưu Cấu Hình AI
                        </Button>
                    </CardContent>
                </Card>

                {/* Database */}
                <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-emerald-500" />
                            <span className="italic font-bold">Quản Lý Database</span>
                        </CardTitle>
                        <CardDescription className="italic">
                            Backup, restore và quản lý dữ liệu hệ thống
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-blue-100 rounded-[20px] hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                            <div>
                                <p className="font-medium italic">Backup Database</p>
                                <p className="text-sm text-slate-500 italic">Sao lưu toàn bộ dữ liệu hiện tại</p>
                            </div>
                            <Button variant="outline" className="rounded-[40px] border-blue-200 italic">Tạo Backup</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-blue-100 rounded-[20px] hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                            <div>
                                <p className="font-medium italic">Xóa Dữ Liệu Cũ</p>
                                <p className="text-sm text-slate-500 italic">Xóa tickets đã giải quyết cách đây &gt; 90 ngày</p>
                            </div>
                            <Button variant="outline" className="text-rose-600 rounded-[40px] border-rose-200 italic">Xóa</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-rose-200 rounded-[20px] hover:shadow-md transition-shadow bg-rose-50/50">
                            <div>
                                <p className="font-medium italic">Reset Database</p>
                                <p className="text-sm text-slate-500 italic">⚠️ Xóa toàn bộ dữ liệu (không thể khôi phục)</p>
                            </div>
                            <Button variant="destructive" className="rounded-[40px] italic">Reset</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            <span className="italic font-bold">Thông Báo</span>
                        </CardTitle>
                        <CardDescription className="italic">
                            Cấu hình email và thông báo cho admin
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="adminEmail" className="italic font-medium">Email Admin</Label>
                            <Input 
                                id="adminEmail" 
                                type="email" 
                                placeholder="admin@giho.vn"
                                className="rounded-[40px] border-blue-200"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="emailOnTicket" className="rounded" />
                            <Label htmlFor="emailOnTicket" className="italic">Gửi email khi có ticket mới</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="emailDaily" className="rounded" />
                            <Label htmlFor="emailDaily" className="italic">Gửi báo cáo hàng ngày</Label>
                        </div>

                        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-[40px] italic">
                            Lưu Cài Đặt
                        </Button>
                    </CardContent>
                </Card>

                {/* Website Info */}
                <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-violet-500" />
                            <span className="italic font-bold">Thông Tin Website</span>
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
                                defaultValue="GIHO Smart Home"
                                className="rounded-[40px] border-blue-200"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supportPhone" className="italic font-medium">Hotline Hỗ Trợ</Label>
                            <Input 
                                id="supportPhone" 
                                placeholder="0901234567"
                                className="rounded-[40px] border-blue-200"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="workingHours" className="italic font-medium">Giờ Làm Việc</Label>
                            <Input 
                                id="workingHours" 
                                placeholder="8:00 - 17:00 (Thứ 2 - Thứ 6)"
                                defaultValue="8:00 - 17:00 (Thứ 2 - Thứ 6)"
                                className="rounded-[40px] border-blue-200"
                            />
                        </div>

                        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-[40px] italic">
                            Cập Nhật
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
