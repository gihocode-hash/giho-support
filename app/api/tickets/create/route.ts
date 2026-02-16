import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendTelegramNotification } from '@/lib/telegram'

const prisma = new PrismaClient()

// Check warranty with GIHO Management App
async function checkWarranty(phone: string): Promise<{
  status: 'ACTIVE' | 'EXPIRED' | 'UNKNOWN',
  products?: Array<{
    productName: string,
    warrantyMonths: number,
    expireDate: string,
    daysLeft: number
  }>
}> {
  try {
    // Call Firebase Cloud Function to check warranty in GIHO Management App
    const response = await fetch('https://us-central1-giho-management.cloudfunctions.net/checkWarranty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'giho-support-secret-key-2026'
      },
      body: JSON.stringify({ phone })
    })

    if (!response.ok) {
      console.error('Warranty check failed:', response.statusText)
      return { status: 'UNKNOWN' }
    }

    const data = await response.json()
    console.log('Warranty check result:', data)
    
    if (data.warranty === 'ACTIVE' && data.warranties) {
      // Filter active warranties only
      const activeProducts = data.warranties
        .filter((w: any) => w.isValid)
        .map((w: any) => ({
          productName: w.productName,
          warrantyMonths: w.warrantyMonths,
          expireDate: w.expireDate,
          daysLeft: w.daysLeft
        }))
      
      return {
        status: 'ACTIVE',
        products: activeProducts
      }
    } else if (data.warranty === 'EXPIRED' && data.warranties) {
      // Return expired products info
      const expiredProducts = data.warranties
        .slice(0, 3) // Limit to 3 products
        .map((w: any) => ({
          productName: w.productName,
          warrantyMonths: w.warrantyMonths,
          expireDate: w.expireDate,
          daysLeft: 0
        }))
      
      return {
        status: 'EXPIRED',
        products: expiredProducts
      }
    }
    
    return { status: data.warranty || 'UNKNOWN' }
  } catch (error) {
    console.error('Error checking warranty:', error)
    return { status: 'UNKNOWN' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, phone, description, fileUrl, fileType } = body

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    // Check warranty if phone is provided
    let warrantyStatus: string | null = null
    let warrantyDetails: string | null = null
    
    if (phone) {
      const warrantyResult = await checkWarranty(phone)
      warrantyStatus = warrantyResult.status
      
      // Save product details as JSON string
      if (warrantyResult.products && warrantyResult.products.length > 0) {
        warrantyDetails = JSON.stringify(warrantyResult.products)
      }
    }

    // Create ticket with customer info
    const ticket = await prisma.ticket.create({
      data: {
        customerName: customerName || 'Khách hàng',
        phone: phone || null,
        description: description,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        status: 'OPEN',
        warranty: warrantyStatus,
        warrantyDetails: warrantyDetails
      }
    })

    // Send Telegram notification
    try {
      const warrantyText = warrantyStatus === 'ACTIVE' ? '✅ Còn bảo hành' : 
                          warrantyStatus === 'EXPIRED' ? '⚠️ Hết bảo hành' : 
                          '❓ Chưa xác định'
      
      const message = `
🆕 <b>YÊU CẦU HỖ TRỢ MỚI</b>

👤 <b>Khách hàng:</b> ${ticket.customerName}
📞 <b>SĐT:</b> ${ticket.phone || 'Không có'}
🛡️ <b>Bảo hành:</b> ${warrantyText}

📝 <b>Mô tả:</b>
${ticket.description}

🆔 <b>Mã ticket:</b> #${ticket.id.slice(-8)}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}

🔗 <a href="https://support.giho.vn/admin/tickets/${ticket.id}">Xem chi tiết</a>
      `.trim()
      
      await sendTelegramNotification(message)
    } catch (telegramError) {
      console.error('Failed to send Telegram notification:', telegramError)
      // Don't fail the ticket creation if Telegram fails
    }

    return NextResponse.json({ 
      success: true, 
      id: ticket.id,
      warranty: warrantyStatus,
      message: 'Ticket created successfully' 
    })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}
