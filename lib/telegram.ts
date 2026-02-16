import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function sendTelegramNotification(message: string) {
  try {
    // Get settings from database
    const settings = await prisma.settings.findFirst()
    
    if (!settings || !settings.telegramBotToken || !settings.telegramChatId) {
      console.log('Telegram not configured, skipping notification')
      return false
    }
    
    if (!settings.notifyOnNewTicket) {
      console.log('New ticket notifications disabled')
      return false
    }
    
    // Send to Telegram
    const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Telegram API error:', data)
      return false
    }
    
    console.log('Telegram notification sent successfully')
    return true
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return false
  }
}
