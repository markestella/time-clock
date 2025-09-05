import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (token?.role === 'ADMIN' && pathname.startsWith('/user')) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    if (token?.role === 'EMPLOYEE' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/user/dashboard', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/profile/:path*'],
};