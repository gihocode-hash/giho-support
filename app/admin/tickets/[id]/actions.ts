'use server'

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function updateTicketStatus(formData: FormData) {
    const id = formData.get("id") as string
    const status = formData.get("status") as string

    if (!id || !status) {
        throw new Error("Missing required fields")
    }

    await prisma.ticket.update({
        where: { id },
        data: { status }
    })

    revalidatePath("/admin/tickets")
    revalidatePath(`/admin/tickets/${id}`)
    redirect("/admin/tickets")
}
