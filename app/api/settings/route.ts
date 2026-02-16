import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get first settings record (or create if not exists)
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {}
      })
    }
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Get first settings record
    let settings = await prisma.settings.findFirst()
    
    if (settings) {
      // Update existing
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          telegramBotToken: data.telegramBotToken,
          telegramChatId: data.telegramChatId,
          notifyOnNewTicket: data.notifyOnNewTicket,
          notifyDailyReport: data.notifyDailyReport,
          companyName: data.companyName,
          supportPhone: data.supportPhone,
          workingHours: data.workingHours,
        }
      })
    } else {
      // Create new
      settings = await prisma.settings.create({
        data: {
          telegramBotToken: data.telegramBotToken,
          telegramChatId: data.telegramChatId,
          notifyOnNewTicket: data.notifyOnNewTicket,
          notifyDailyReport: data.notifyDailyReport,
          companyName: data.companyName,
          supportPhone: data.supportPhone,
          workingHours: data.workingHours,
        }
      })
    }
    
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
