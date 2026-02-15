import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, TrendingUp, Users, Zap } from "lucide-react"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function AdminDashboard() {
    const [totalSolutions, tickets] = await Promise.all([
        prisma.solution.count(),
        prisma.ticket.findMany()
    ])

    const openTickets = tickets.filter(t => t.status === 'OPEN').length
    const resolvedToday = tickets.filter(t => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return t.status === 'RESOLVED' && new Date(t.updatedAt) >= today
    }).length

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                    Tổng Quan
                </h2>
                <p className="text-slate-500 mt-2 italic">Dashboard hệ thống hỗ trợ khách hàng GIHO</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-xl rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90 italic">Tổng Số Hướng Dẫn</CardTitle>
                        <FileText className="h-5 w-5 text-white/80 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white italic">{totalSolutions}</div>
                        <p className="text-xs text-white/70 mt-2 italic flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Sẵn sàng hỗ trợ
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-400 to-orange-500 border-0 shadow-xl rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90 italic">Yêu Cầu Chờ Xử Lý</CardTitle>
                        <Clock className="h-5 w-5 text-white/80 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white italic">{openTickets}</div>
                        <p className="text-xs text-white/70 mt-2 italic flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {openTickets > 0 ? 'Cần chú ý gấp' : 'Tất cả đã xử lý'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-400 to-teal-500 border-0 shadow-xl rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90 italic">Đã Xử Lý Hôm Nay</CardTitle>
                        <CheckCircle className="h-5 w-5 text-white/80 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white italic">{resolvedToday}</div>
                        <p className="text-xs text-white/70 mt-2 italic flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Khách hàng hài lòng
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                        Hoạt Động Gần Đây
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tickets.slice(0, 5).map((ticket) => (
                            <div key={ticket.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[20px] hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <p className="font-medium text-slate-700 italic">{ticket.customerName || 'Khách hàng ẩn danh'}</p>
                                    <p className="text-sm text-slate-500 truncate">{ticket.description}</p>
                                </div>
                                <div className="text-xs text-slate-400 italic">
                                    {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        ))}
                        {tickets.length === 0 && (
                            <p className="text-center text-slate-400 py-8 italic">Chưa có hoạt động nào</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
