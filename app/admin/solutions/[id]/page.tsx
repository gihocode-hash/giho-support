import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateSolution, deleteSolution } from "./actions"
import Link from "next/link"
import { ChevronLeft, Trash2 } from "lucide-react"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"

const prisma = new PrismaClient()

export default async function EditSolutionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const solution = await prisma.solution.findUnique({
        where: { id }
    })

    if (!solution) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link href="/admin/solutions">
                        <Button variant="ghost" size="icon" className="rounded-[40px]">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                        Chỉnh Sửa Hướng Dẫn
                    </h2>
                </div>
                <form action={deleteSolution}>
                    <input type="hidden" name="id" value={solution.id} />
                    <Button variant="destructive" size="sm" type="submit" className="rounded-[40px] italic">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                    </Button>
                </form>
            </div>

            <form action={updateSolution} className="space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-[40px] shadow-lg border border-blue-100">
                <input type="hidden" name="id" value={solution.id} />
                
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="italic font-medium">Tiêu Đề</Label>
                        <Input 
                            id="title" 
                            name="title" 
                            defaultValue={solution.title}
                            required
                            className="rounded-[40px] border-blue-200"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="keywords" className="italic font-medium">Từ Khóa (cách nhau bởi dấu phẩy)</Label>
                        <Input 
                            id="keywords" 
                            name="keywords" 
                            defaultValue={solution.keywords}
                            required
                            className="rounded-[40px] border-blue-200"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="videoUrl" className="italic font-medium">Link Video Hướng Dẫn</Label>
                        <Input 
                            id="videoUrl" 
                            name="videoUrl" 
                            defaultValue={solution.videoUrl || ''}
                            className="rounded-[40px] border-blue-200"
                        />
                        <p className="text-sm text-gray-500 italic">Dán đường dẫn video hướng dẫn của bạn vào đây.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description" className="italic font-medium">Mô Tả / Các Bước Sửa Lỗi</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={solution.description}
                            required
                            className="min-h-[150px] rounded-[20px] border-blue-200"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Link href="/admin/solutions">
                        <Button variant="outline" type="button" className="rounded-[40px] italic">Hủy</Button>
                    </Link>
                    <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-[40px] italic">
                        Lưu Thay Đổi
                    </Button>
                </div>
            </form>
        </div>
    )
}
