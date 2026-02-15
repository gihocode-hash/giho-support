'use server'

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function createSolution(formData: FormData) {
    const title = formData.get("title") as string
    const keywords = formData.get("keywords") as string
    const videoUrl = formData.get("videoUrl") as string
    const description = formData.get("description") as string

    if (!title || !keywords || !description) {
        throw new Error("Missing required fields")
    }

    await prisma.solution.create({
        data: {
            title,
            keywords,
            videoUrl: videoUrl || null,
            description,
        },
    })

    revalidatePath("/admin/solutions")
    redirect("/admin/solutions")
}
