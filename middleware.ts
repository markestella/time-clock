import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith('/auth');
  const isLandingPage = pathname === '/';
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/user') || pathname.startsWith('/profile');

  if (token) {
    if (isLandingPage || isAuthPage) {
      return NextResponse.redirect(new URL(
        token.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard',
        req.url
      ));
    }

    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user/dashboard', req.url));
    }

    if (pathname.startsWith('/user') && token.role !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }


  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/auth/:path*', '/admin/:path*', '/user/:path*', '/profile/:path*'],
};