import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login';
  
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admins') || 
    pathname.startsWith('/employees') || 
    pathname.startsWith('/leaves') ||
    pathname.startsWith('/summary');

  if (!accessToken && !refreshToken && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((accessToken || refreshToken) && isAuthPage) {
    return NextResponse.next();
  }

  return NextResponse.next();
}