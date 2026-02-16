import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  
  if (session?.value) {
    try {
      const sessionData = JSON.parse(session.value)
      return NextResponse.json({ authenticated: true, email: sessionData.email })
    } catch (e) {
      // Old format compatibility
      if (session.value === 'authenticated') {
        return NextResponse.json({ authenticated: true })
      }
    }
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 })
}
