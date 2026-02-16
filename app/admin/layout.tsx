'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, BookOpen, MessageSquare, Settings, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()

    useEffect(() => {
        // Check authentication on mount
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/admin/check')
                if (!res.ok) {
                    router.push('/admin/login')
                }
            } catch (e) {
                router.push('/admin/login')
            }
        }
        checkAuth()
    }, [router])

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' })
            router.push('/admin/login')
            router.refresh()
        } catch (e) {
            console.error('Logout error:', e)
        }
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Sidebar */}
            <aside className="w-72 bg-white/80 backdrop-blur-sm shadow-xl border-r border-blue-100">
                <div className="p-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                        GIHO Admin
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 italic">Support Management</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link 
                        href="/" 
                        className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-[40px] transition-all duration-200 group"
                    >
                        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium italic">Về Trang Chủ</span>
                    </Link>
                    <Link 
                        href="/admin" 
                        className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-[40px] transition-all duration-200 group"
                    >
                        <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium italic">Tổng Quan</span>
                    </Link>
                    <Link 
                        href="/admin/solutions" 
                        className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-[40px] transition-all duration-200 group"
                    >
                        <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium italic">Kho Kiến Thức</span>
                    </Link>
                    <Link 
                        href="/admin/tickets" 
                        className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-[40px] transition-all duration-200 group"
                    >
                        <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium italic">Yêu Cầu Hỗ Trợ</span>
                    </Link>
                    <Link 
                        href="/admin/settings" 
                        className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-[40px] transition-all duration-200 group"
                    >
                        <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium italic">Cài Đặt</span>
                    </Link>
                </nav>

                {/* Footer with Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-100 space-y-3">
                    <Button 
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full rounded-[40px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 italic"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                    </Button>
                    <p className="text-xs text-slate-400 italic text-center">GIHO Smart Home © 2026</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
