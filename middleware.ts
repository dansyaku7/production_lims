// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Jika belum login dan mencoba akses halaman yang dilindungi
  if (!token && !pathname.startsWith('/api/auth')) { // Izinkan akses ke API auth
     // Jika halaman yang dituju bukan halaman login (root), redirect ke login
     if (pathname !== '/') {
        return NextResponse.redirect(new URL('/', req.url));
     }
  }

  // Jika sudah login
  if (token) {
    const userRole = token.role as string;

    // Jika sudah login, jangan biarkan akses halaman login lagi
    if (pathname === '/') {
        if (userRole === 'admin') return NextResponse.redirect(new URL('/overview', req.url));
        // Guest dan Analyst diarahkan ke dashboard umum
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Aturan untuk role 'analyst'
    if (userRole === 'analyst') {
      // Analyst tidak boleh akses halaman admin dan pendaftaran
      if (pathname.startsWith('/overview') || pathname.startsWith('/registration')) {
        return NextResponse.redirect(new URL('/dashboard', req.url)); // Lempar ke dashboard mereka
      }
    }
    
    // Aturan untuk role 'guest'
    if (userRole === 'guest') {
       // Guest hanya boleh akses dashboard umum
       const allowedPaths = ['/dashboard'];
       if (!allowedPaths.some(path => pathname.startsWith(path))) {
         return NextResponse.redirect(new URL('/dashboard', req.url));
       }
    }
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang akan dijaga oleh middleware
export const config = {
  matcher: [
    '/', // Halaman login/root
    '/overview/:path*',
    '/dashboard/:path*',
    '/registration/:path*',
    '/library/:path*',
    '/coa/:path*',
  ],
};