'use server'

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function updateSolution(formData: FormData) {
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const keywords = formData.get("keywords") as string
    const videoUrl = formData.get("videoUrl") as string
    const description = formData.get("description") as string

    if (!id || !title || !keywords || !description) {
        throw new Error("Missing required fields")
    }

    await prisma.solution.update({
        where: { id },
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

export async function deleteSolution(formData: FormData) {
    const id = formData.get("id") as string

    if (!id) {
        throw new Error("Missing solution ID")
    }

    await prisma.solution.delete({
        where: { id }
    })

    revalidatePath("/admin/solutions")
    redirect("/admin/solutions")
}
