import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if accessing admin pages (except login page)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get('admin_session')
    
    // If no valid session, redirect to login
    if (!session?.value) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // Try to parse session to verify it's valid JSON
    try {
      JSON.parse(session.value)
    } catch (e) {
      // Invalid session format, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // If already logged in and trying to access login page, redirect to admin
  if (pathname === '/admin/login') {
    const session = request.cookies.get('admin_session')
    if (session?.value) {
      try {
        JSON.parse(session.value)
        const adminUrl = new URL('/admin', request.url)
        return NextResponse.redirect(adminUrl)
      } catch (e) {
        // Invalid session, allow access to login
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
