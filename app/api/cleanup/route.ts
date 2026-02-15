import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This endpoint should be called by a CRON job daily
// to delete tickets and their associated files older than 3 days
export async function POST() {
  try {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    // Find old tickets with files
    const oldTickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          lt: threeDaysAgo
        },
        // Only tickets with file attachments
        NOT: {
          description: {
            contains: 'http' // Simple check if description contains file URL
          }
        }
      }
    })

    // TODO: Delete files from Firebase Storage here
    // For each ticket, extract file URLs and delete from storage

    // Delete old tickets
    const result = await prisma.ticket.deleteMany({
      where: {
        createdAt: {
          lt: threeDaysAgo
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      deleted: result.count,
      message: `Deleted ${result.count} tickets older than 3 days` 
    })
  } catch (error) {
    console.error('Error cleaning up old tickets:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup old tickets' },
      { status: 500 }
    )
  }
}
