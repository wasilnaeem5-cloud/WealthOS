import { NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getRequestOrigin, sanitizeRedirectPath } from '../../../lib/auth/url';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Resolve canonical public origin (protecting against internal localhost proxy leaks in production)
  const origin = getRequestOrigin(request);

  // Read auth parameters from query string
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const otpType = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next');
  const safeNext = sanitizeRedirectPath(rawNext, '/dashboard');
  const isPasswordRecovery =
    otpType === 'recovery' ||
    safeNext === '/reset-password' ||
    rawNext === '/reset-password';

  // Also check if Supabase returned an error directly in query params (e.g. access_denied, expired link)
  const queryError = searchParams.get('error_description') || searchParams.get('error');
  if (queryError) {
    console.error('[AUTH_CALLBACK] Supabase returned error in query params:', queryError);
    const targetPath = isPasswordRecovery ? '/forgot-password' : '/login';
    const redirectUrl = new URL(targetPath, origin);
    redirectUrl.searchParams.set('error', queryError);
    redirectUrl.searchParams.set(
      'error_code',
      isPasswordRecovery ? 'recovery_link_error' : 'email_link_error'
    );
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createSupabaseServerClient();
  let authError: string | null = null;
  let authenticatedUser = null;

  // 1. PKCE Code Exchange flow
  if (code) {
    console.log('[AUTH_CALLBACK] Exchanging PKCE code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[AUTH_CALLBACK] PKCE code exchange failed:', error.message);
      authError = error.message;
    } else {
      authenticatedUser = data?.user;
    }
  }
  // 2. Token Hash / OTP verification flow (used in some Supabase email confirmation links)
  else if (tokenHash && otpType) {
    console.log('[AUTH_CALLBACK] Verifying OTP token hash of type:', otpType);
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) {
      console.error('[AUTH_CALLBACK] Token hash verification failed:', error.message);
      authError = error.message;
    } else {
      authenticatedUser = data?.user;
    }
  } else {
    authError = 'Missing authorization code or token hash in confirmation link.';
  }

  // 3. If authenticated successfully
  if (authenticatedUser) {
    // If this was a password recovery request, route directly to /reset-password
    if (isPasswordRecovery) {
      console.log('[AUTH_CALLBACK] Password recovery verified. Redirecting to /reset-password');
      return NextResponse.redirect(`${origin}/reset-password`);
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', authenticatedUser.id)
        .maybeSingle();

      if (profile && profile.onboarding_completed) {
        console.log('[AUTH_CALLBACK] User confirmed and onboarding complete. Redirecting to:', safeNext);
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else {
        console.log('[AUTH_CALLBACK] User confirmed. Redirecting to onboarding...');
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    } catch (profileErr) {
      console.warn('[AUTH_CALLBACK] Profile check exception:', profileErr);
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  // 4. Verification failed: redirect with clear error and helper
  console.error('[AUTH_CALLBACK] Authentication/recovery failed. Redirecting with error:', authError);
  const failurePath = isPasswordRecovery ? '/forgot-password' : '/login';
  const failureUrl = new URL(failurePath, origin);
  failureUrl.searchParams.set(
    'error',
    authError ||
      (isPasswordRecovery
        ? 'Your password reset link is invalid or has expired. Please request a new one.'
        : 'Your confirmation link may have expired or was already used. Please request a new confirmation email.')
  );
  failureUrl.searchParams.set(
    'error_code',
    isPasswordRecovery ? 'recovery_failed' : 'confirmation_failed'
  );
  return NextResponse.redirect(failureUrl);
}
