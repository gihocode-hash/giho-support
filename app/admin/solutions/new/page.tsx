import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createSolution } from "./actions"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function NewSolutionPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-2">
                <Link href="/admin/solutions">
                    <Button variant="ghost" size="icon" className="rounded-[40px]">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                    Thêm Hướng Dẫn Mới
                </h2>
            </div>

            <form action={createSolution} className="space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-[40px] shadow-lg border border-blue-100">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="italic font-medium">Tiêu Đề</Label>
                        <Input 
                            id="title" 
                            name="title" 
                            placeholder="VD: Robot không sạc được" 
                            required
                            className="rounded-[40px] border-blue-200"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="keywords" className="italic font-medium">Từ Khóa (cách nhau bởi dấu phẩy)</Label>
                        <Input 
                            id="keywords" 
                            name="keywords" 
                            placeholder="sạc, pin, dock sạc, nguồn" 
                            required
                            className="rounded-[40px] border-blue-200"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="videoUrl" className="italic font-medium">Link Video Hướng Dẫn</Label>
                        <Input 
                            id="videoUrl" 
                            name="videoUrl" 
                            placeholder="https://youtube.com/..."
                            className="rounded-[40px] border-blue-200"
                        />
                        <p className="text-sm text-gray-500 italic">Dán đường dẫn video hướng dẫn của bạn vào đây.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description" className="italic font-medium">Mô Tả / Các Bước Sửa Lỗi</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="1. Kiểm tra dây nguồn..."
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
                        Lưu Hướng Dẫn
                    </Button>
                </div>
            </form>
        </div>
    )
}
