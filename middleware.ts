// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Jika belum login dan mencoba akses halaman yang dilindungi
  if (!token && !pathname.startsWith('/api/auth')) {
     if (pathname !== '/') {
        return NextResponse.redirect(new URL('/', req.url));
     }
  }

  // Jika sudah login
  if (token) {
    const userRole = token.role as string;

    // --- PERUBAHAN UTAMA ADA DI SINI ---
    // Logika redirect setelah login berhasil (saat berada di halaman login '/')
    if (pathname === '/') {
        if (userRole === 'admin') {
            return NextResponse.redirect(new URL('/overview', req.url));
        }
        // Jika rolenya analyst, arahkan ke data library
        if (userRole === 'analyst') {
            return NextResponse.redirect(new URL('/library', req.url)); // Diarahkan ke /library
        }
        // Jika rolenya guest, arahkan ke dashboard umum
        if (userRole === 'guest') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    // Aturan untuk role 'analyst' yang mencoba akses halaman terlarang
    if (userRole === 'analyst') {
      if (pathname.startsWith('/overview') || pathname.startsWith('/registration')) {
        return NextResponse.redirect(new URL('/library', req.url)); // Arahkan kembali ke halaman yang diizinkan
      }
    }
    
    // Aturan untuk role 'guest'
    if (userRole === 'guest') {
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
    '/', 
    '/overview/:path*',
    '/dashboard/:path*',
    '/registration/:path*',
    '/library/:path*',
    '/coa/:path*',
  ],
};