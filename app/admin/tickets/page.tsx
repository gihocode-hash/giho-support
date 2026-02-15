'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, Filter } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

type Ticket = {
    id: string
    customerName: string | null
    phone: string | null
    description: string
    fileUrl: string | null
    fileType: string | null
    status: string
    warranty: string | null
    warrantyDetails: string | null
    createdAt: Date
    updatedAt: Date
}

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [timeFilter, setTimeFilter] = useState<string>('ALL')

    useEffect(() => {
        // Fetch tickets
        fetch('/api/tickets/list')
            .then(res => res.json())
            .then(data => {
                const ticketList = data.tickets || []
                setTickets(ticketList)
                setFilteredTickets(ticketList)
            })
            .catch(err => {
                console.error('Failed to fetch tickets:', err)
                setTickets([])
                setFilteredTickets([])
            })
    }, [])

    useEffect(() => {
        let filtered = [...tickets]

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(t => t.status === statusFilter)
        }

        // Filter by time
        const now = new Date()
        if (timeFilter === 'TODAY') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            filtered = filtered.filter(t => new Date(t.createdAt) >= today)
        } else if (timeFilter === 'WEEK') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filtered = filtered.filter(t => new Date(t.createdAt) >= weekAgo)
        } else if (timeFilter === 'MONTH') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            filtered = filtered.filter(t => new Date(t.createdAt) >= monthAgo)
        }

        setFilteredTickets(filtered)
    }, [statusFilter, timeFilter, tickets])

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                        Yêu Cầu Hỗ Trợ
                    </h2>
                    <p className="text-slate-500 mt-2 italic">Quản lý yêu cầu từ khách hàng</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-4 py-2 rounded-[40px] border-blue-200 italic">
                        Tổng: {tickets.length}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2 rounded-[40px] border-amber-200 text-amber-600 italic">
                        Chờ: {tickets.filter(t => t.status === 'OPEN').length}
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-[40px] p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg italic">Bộ Lọc</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="text-sm font-medium italic mb-2 block">Trạng Thái</label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('ALL')}
                                className="rounded-[40px] italic"
                            >
                                Tất cả
                            </Button>
                            <Button
                                variant={statusFilter === 'OPEN' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('OPEN')}
                                className="rounded-[40px] italic"
                            >
                                Chờ xử lý
                            </Button>
                            <Button
                                variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('RESOLVED')}
                                className="rounded-[40px] italic"
                            >
                                Đã giải quyết
                            </Button>
                            <Button
                                variant={statusFilter === 'ESCALATED' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('ESCALATED')}
                                className="rounded-[40px] italic"
                            >
                                Cần hỗ trợ
                            </Button>
                        </div>
                    </div>

                    {/* Time Filter */}
                    <div>
                        <label className="text-sm font-medium italic mb-2 block">Thời Gian</label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={timeFilter === 'ALL' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTimeFilter('ALL')}
                                className="rounded-[40px] italic"
                            >
                                Tất cả
                            </Button>
                            <Button
                                variant={timeFilter === 'TODAY' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTimeFilter('TODAY')}
                                className="rounded-[40px] italic"
                            >
                                Hôm nay
                            </Button>
                            <Button
                                variant={timeFilter === 'WEEK' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTimeFilter('WEEK')}
                                className="rounded-[40px] italic"
                            >
                                Tuần này
                            </Button>
                            <Button
                                variant={timeFilter === 'MONTH' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTimeFilter('MONTH')}
                                className="rounded-[40px] italic"
                            >
                                Tháng này
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-sm text-slate-600 italic">
                    Hiển thị: <span className="font-bold text-blue-600">{filteredTickets.length}</span> / {tickets.length} yêu cầu
                </div>
            </div>

            <div className="rounded-[40px] border border-blue-100 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-50 hover:to-indigo-50">
                            <TableHead className="italic font-semibold">ID</TableHead>
                            <TableHead className="italic font-semibold">Khách Hàng</TableHead>
                            <TableHead className="italic font-semibold">SĐT</TableHead>
                            <TableHead className="italic font-semibold">Bảo Hành</TableHead>
                            <TableHead className="italic font-semibold">Mô Tả</TableHead>
                            <TableHead className="italic font-semibold">Trạng Thái</TableHead>
                            <TableHead className="italic font-semibold">Thời Gian</TableHead>
                            <TableHead className="text-right italic font-semibold">Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-slate-400 italic">
                                    Không tìm thấy yêu cầu nào phù hợp với bộ lọc.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                                    <TableCell className="font-mono text-xs">{ticket.id.slice(-8)}</TableCell>
                                    <TableCell className="font-medium italic">{ticket.customerName || 'Ẩn danh'}</TableCell>
                                    <TableCell className="font-mono text-sm">{ticket.phone || '---'}</TableCell>
                                    <TableCell>
                                        {ticket.warranty === 'ACTIVE' && (
                                            <div>
                                                <Badge className="bg-emerald-500 rounded-[40px] italic text-xs mb-1">✓ Còn BH</Badge>
                                                {ticket.warrantyDetails && (() => {
                                                    try {
                                                        const products = JSON.parse(ticket.warrantyDetails)
                                                        return (
                                                            <div className="text-xs text-slate-600 mt-1">
                                                                {products.slice(0, 2).map((p: any, i: number) => (
                                                                    <div key={i} className="italic">• {p.productName}</div>
                                                                ))}
                                                                {products.length > 2 && <div className="italic text-slate-400">+{products.length - 2} sản phẩm khác</div>}
                                                            </div>
                                                        )
                                                    } catch (e) {
                                                        return null
                                                    }
                                                })()}
                                            </div>
                                        )}
                                        {ticket.warranty === 'EXPIRED' && (
                                            <div>
                                                <Badge className="bg-orange-500 rounded-[40px] italic text-xs mb-1">✗ Hết BH</Badge>
                                                {ticket.warrantyDetails && (() => {
                                                    try {
                                                        const products = JSON.parse(ticket.warrantyDetails)
                                                        return (
                                                            <div className="text-xs text-slate-600 mt-1">
                                                                {products.slice(0, 2).map((p: any, i: number) => (
                                                                    <div key={i} className="italic">• {p.productName}</div>
                                                                ))}
                                                                {products.length > 2 && <div className="italic text-slate-400">+{products.length - 2} sản phẩm khác</div>}
                                                            </div>
                                                        )
                                                    } catch (e) {
                                                        return null
                                                    }
                                                })()}
                                            </div>
                                        )}
                                        {(!ticket.warranty || ticket.warranty === 'UNKNOWN') && (
                                            <span className="text-slate-400 italic text-xs">
                                                {ticket.phone ? 'Chưa xác định (Không có trong hệ thống)' : 'Chưa xác định'}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">
                                        {ticket.description}
                                        {ticket.fileUrl && (
                                            <span className="ml-2 text-blue-600">📎</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                    <TableCell className="text-sm text-slate-500 italic">
                                        {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/tickets/${ticket.id}`}>
                                            <Button variant="ghost" size="sm" className="rounded-[40px] hover:bg-blue-100 italic">Xem</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
