import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const dataMode = process.env.NEXT_PUBLIC_DATA_MODE || 'local';

  // In local demo mode, do not enforce auth middleware.
  if (dataMode !== 'supabase') {
    return NextResponse.next();
  }

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/simulator/:path*',
    '/goals/:path*',
    '/scenarios/:path*',
    '/copilot/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/resend-confirmation',
  ],
};
