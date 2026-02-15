import Link from "next/link"
import { LayoutDashboard, BookOpen, MessageSquare, Settings, Home } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
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

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-100">
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
