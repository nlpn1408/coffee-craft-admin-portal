import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Exclude login page from auth check
  // if (request.nextUrl.pathname === '/login') {
  //   return NextResponse.next();
  // }

  // try {
  //   // Check if user is authenticated by verifying with backend
  //   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check`, {
  //     headers: {
  //       cookie: request.headers.get('cookie') || '',
  //     },
  //   });

  //   if (!response.ok) {
  //     return NextResponse.redirect(new URL('/login', request.url));
  //   }

  //   return NextResponse.next();
  // } catch (error) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - login
     * - api (API routes)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     */
    '/((?!login|api|_next/static|favicon.ico).*)',
  ],
};
