import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type AdminAccount = {
  email: string
  password: string
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Parse admin accounts from env
    const adminAccountsJson = process.env.ADMIN_ACCOUNTS || '[]'
    const adminAccounts: AdminAccount[] = JSON.parse(adminAccountsJson)

    // Check if credentials match any admin account
    const validAdmin = adminAccounts.find(
      admin => admin.email === email && admin.password === password
    )

    if (validAdmin) {
      // Set secure cookie
      const cookieStore = await cookies()
      cookieStore.set('admin_session', JSON.stringify({ email: validAdmin.email }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return NextResponse.json({ success: true, email: validAdmin.email })
    } else {
      return NextResponse.json(
        { error: 'Sai email hoặc mật khẩu' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
