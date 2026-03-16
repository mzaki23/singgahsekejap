import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Forward pathname as header so server components can read it
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', path);

    // Allow access to public admin pages
    if (path.startsWith('/admin/login') || path.startsWith('/admin/register')) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Protect all /admin routes
    if (path.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      const role = token.role as string;

      // Super user only routes
      if (path.startsWith('/admin/users') || path.startsWith('/admin/settings')) {
        if (role !== 'super_user') {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/admin/login') || req.nextUrl.pathname.startsWith('/admin/register')) {
          return true;
        }
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token;
        }
        return true;
      }
    }
  }
);

export const config = {
  matcher: ['/admin/:path*']
};
