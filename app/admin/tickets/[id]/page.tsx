import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Clock, CheckCircle, AlertCircle, User, Calendar } from "lucide-react"
import { updateTicketStatus } from "./actions"

const prisma = new PrismaClient()

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const ticket = await prisma.ticket.findUnique({
        where: { id }
    })

    if (!ticket) {
        notFound()
    }

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'OPEN':
                return <Badge className="bg-amber-500 rounded-[40px] italic"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>
            case 'RESOLVED':
                return <Badge className="bg-emerald-500 rounded-[40px] italic"><CheckCircle className="w-3 h-3 mr-1" />Đã giải quyết</Badge>
            case 'ESCALATED':
                return <Badge className="bg-rose-500 rounded-[40px] italic"><AlertCircle className="w-3 h-3 mr-1" />Cần hỗ trợ</Badge>
            default:
                return <Badge className="rounded-[40px] italic">{status}</Badge>
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-2">
                <Link href="/admin/tickets">
                    <Button variant="ghost" size="icon" className="rounded-[40px]">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                    Chi Tiết Yêu Cầu
                </h2>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg rounded-[40px] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-xl italic">Ticket #{ticket.id.slice(-8)}</CardTitle>
                    {getStatusBadge(ticket.status)}
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-500 italic">Khách hàng:</span>
                            <span className="font-medium italic">{ticket.customerName || 'Ẩn danh'}</span>
                        </div>

                        {ticket.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 italic">📞 Số điện thoại:</span>
                                <span className="font-medium font-mono">{ticket.phone}</span>
                            </div>
                        )}

                        {ticket.warranty && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500 italic">🛡️ Bảo hành:</span>
                                    {ticket.warranty === 'ACTIVE' && (
                                        <Badge className="bg-emerald-500 rounded-[40px] italic">✓ Còn bảo hành</Badge>
                                    )}
                                    {ticket.warranty === 'EXPIRED' && (
                                        <Badge className="bg-orange-500 rounded-[40px] italic">✗ Hết bảo hành</Badge>
                                    )}
                                    {ticket.warranty === 'UNKNOWN' && (
                                        <Badge variant="outline" className="rounded-[40px] italic">
                                            {ticket.phone ? 'Chưa xác định (Không có trong hệ thống)' : 'Chưa xác định'}
                                        </Badge>
                                    )}
                                </div>
                                
                                {ticket.warrantyDetails && (() => {
                                    try {
                                        const products = JSON.parse(ticket.warrantyDetails)
                                        return (
                                            <div className="ml-6 mt-2 space-y-1">
                                                <p className="text-xs text-slate-500 italic mb-1">Sản phẩm:</p>
                                                {products.map((p: any, i: number) => (
                                                    <div key={i} className="text-sm bg-blue-50 rounded-[20px] p-3 border border-blue-100">
                                                        <p className="font-medium text-blue-900 italic">• {p.productName}</p>
                                                        <div className="flex gap-4 mt-1 text-xs text-slate-600">
                                                            <span className="italic">BH: {p.warrantyMonths} tháng</span>
                                                            {p.isValid && (
                                                                <span className="text-emerald-600 italic">Còn {p.daysLeft} ngày</span>
                                                            )}
                                                            <span className="italic">Hết: {(() => {
                                                                // Handle both formats: "YYYY-MM-DD" (old) and "d/m/yyyy" (new)
                                                                if (p.expireDate.includes('-')) {
                                                                    // Old format: "2027-07-02"
                                                                    const [year, month, day] = p.expireDate.split('-')
                                                                    return `${parseInt(day)}/${parseInt(month)}/${year}`
                                                                } else {
                                                                    // New format: "7/2/2027"
                                                                    return p.expireDate
                                                                }
                                                            })()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    } catch (e) {
                                        return null
                                    }
                                })()}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-500 italic">Thời gian:</span>
                            <span className="font-medium italic">
                                {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-blue-100 pt-4">
                        <h3 className="font-semibold mb-2 italic">Mô Tả Vấn Đề</h3>
                        <p className="text-slate-700 whitespace-pre-wrap bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-[20px]">
                            {ticket.description}
                        </p>
                        
                        {ticket.fileUrl && (
                            <div className="mt-4">
                                <h4 className="font-medium mb-2 italic text-sm">📎 File Đính Kèm:</h4>
                                {ticket.fileType === 'image' ? (
                                    <img 
                                        src={ticket.fileUrl} 
                                        alt="Attachment" 
                                        className="max-w-md rounded-[20px] border border-blue-200 shadow-md"
                                    />
                                ) : ticket.fileType === 'video' ? (
                                    <video 
                                        src={ticket.fileUrl} 
                                        controls 
                                        className="max-w-md rounded-[20px] border border-blue-200 shadow-md"
                                    />
                                ) : (
                                    <a 
                                        href={ticket.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline italic"
                                    >
                                        Xem file đính kèm
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-blue-100 pt-4">
                        <h3 className="font-semibold mb-3 italic">Cập Nhật Trạng Thái</h3>
                        <div className="flex gap-2 flex-wrap">
                            <form action={updateTicketStatus}>
                                <input type="hidden" name="id" value={ticket.id} />
                                <input type="hidden" name="status" value="OPEN" />
                                <Button 
                                    variant={ticket.status === 'OPEN' ? 'default' : 'outline'}
                                    size="sm"
                                    type="submit"
                                    disabled={ticket.status === 'OPEN'}
                                    className="rounded-[40px] italic"
                                >
                                    <Clock className="w-4 h-4 mr-1" />
                                    Chờ xử lý
                                </Button>
                            </form>
                            <form action={updateTicketStatus}>
                                <input type="hidden" name="id" value={ticket.id} />
                                <input type="hidden" name="status" value="RESOLVED" />
                                <Button 
                                    variant={ticket.status === 'RESOLVED' ? 'default' : 'outline'}
                                    size="sm"
                                    type="submit"
                                    disabled={ticket.status === 'RESOLVED'}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-[40px] italic"
                                >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Đã giải quyết
                                </Button>
                            </form>
                            <form action={updateTicketStatus}>
                                <input type="hidden" name="id" value={ticket.id} />
                                <input type="hidden" name="status" value="ESCALATED" />
                                <Button 
                                    variant={ticket.status === 'ESCALATED' ? 'default' : 'outline'}
                                    size="sm"
                                    type="submit"
                                    disabled={ticket.status === 'ESCALATED'}
                                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-[40px] italic"
                                >
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    Cần hỗ trợ
                                </Button>
                            </form>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
