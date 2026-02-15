import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PrismaClient } from "@prisma/client"
import { PlusCircle } from "lucide-react"

const prisma = new PrismaClient()

export default async function SolutionsPage() {
    const solutions = await prisma.solution.findMany({
        orderBy: { updatedAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                        Kho Kiến Thức
                    </h2>
                    <p className="text-slate-500 mt-2 italic">Quản lý hướng dẫn & giải pháp</p>
                </div>
                <Link href="/admin/solutions/new">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-[40px] shadow-lg italic px-6">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Thêm Hướng Dẫn
                    </Button>
                </Link>
            </div>

            <div className="rounded-[40px] border border-blue-100 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-50 hover:to-indigo-50">
                            <TableHead className="italic font-semibold">Tiêu Đề</TableHead>
                            <TableHead className="italic font-semibold">Từ Khóa</TableHead>
                            <TableHead className="italic font-semibold">Video</TableHead>
                            <TableHead className="text-right italic font-semibold">Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {solutions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center italic text-slate-400">
                                    Chưa có hướng dẫn nào. Hãy thêm hướng dẫn mới.
                                </TableCell>
                            </TableRow>
                        ) : (
                            solutions.map((solution) => (
                                <TableRow key={solution.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                                    <TableCell className="font-medium italic">{solution.title}</TableCell>
                                    <TableCell className="text-slate-600">{solution.keywords}</TableCell>
                                    <TableCell>
                                        {solution.videoUrl ? (
                                            <span className="text-emerald-600 flex items-center italic font-medium">
                                                ✓ Có
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Không</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/solutions/${solution.id}`}>
                                            <Button variant="ghost" size="sm" className="rounded-[40px] hover:bg-blue-100 italic">Sửa</Button>
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
