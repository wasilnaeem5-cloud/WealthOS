/**
 * WealthOS Auth URL & Redirect Resolver
 * 
 * Provides unified, production-safe URL resolution for authentication flows:
 * - Ensures email confirmation links and auth callbacks resolve to the canonical production URL in production.
 * - Protects against redirecting users to localhost/127.0.0.1 in production environments.
 * - Supports local development with http://localhost:3000.
 * - Sanitizes redirect destinations to prevent open redirect vulnerabilities.
 */

/**
 * Returns true if the hostname corresponds to a local development environment.
 */
export function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.localhost')
  );
}

/**
 * Returns the canonical base URL of the site.
 * 
 * Resolution order:
 * 1. NEXT_PUBLIC_SITE_URL or SITE_URL environment variable (if explicitly configured)
 * 2. In browser: window.location.origin (if not localhost in production)
 * 3. VERCEL_PROJECT_PRODUCTION_URL (auto-provided by Vercel for the main domain)
 * 4. VERCEL_URL / NEXT_PUBLIC_VERCEL_URL (auto-provided by Vercel for preview deployments)
 * 5. Localhost fallback: http://localhost:3000
 */
export function getSiteUrl(): string {
  // 1. Explicitly configured canonical site URL (recommended for production)
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envSiteUrl && envSiteUrl.trim().length > 0) {
    return normalizeUrl(envSiteUrl.trim());
  }

  // 2. Client-side browser resolution
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    const isLocal = isLocalHostname(window.location.hostname);

    // If running in production mode, never let localhost leak if a Vercel URL is available
    if (process.env.NODE_ENV === 'production' && isLocal) {
      if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
      }
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      }
    }

    return normalizeUrl(origin);
  }

  // 3. Vercel production domain
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 4. Vercel deployment URL (fallback for preview branches)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 5. Default local development origin
  return 'http://localhost:3000';
}

/**
 * Returns the fully qualified auth callback URL used for Supabase emailRedirectTo.
 * e.g., "https://wealthos.com/auth/callback" or "https://wealthos.com/auth/callback?next=%2Freset-password"
 */
export function getAuthCallbackUrl(nextPath?: string): string {
  const baseUrl = `${getSiteUrl()}/auth/callback`;
  if (nextPath) {
    const safePath = sanitizeRedirectPath(nextPath, '');
    if (safePath) {
      return `${baseUrl}?next=${encodeURIComponent(safePath)}`;
    }
  }
  return baseUrl;
}

/**
 * Resolves the incoming request's public origin in server-side route handlers.
 * 
 * Inspects reverse-proxy headers (x-forwarded-host, x-forwarded-proto) which are
 * standard on Vercel, AWS, Cloudflare, and Nginx. This prevents the server from
 * redirecting to an internal container origin (like http://localhost:3000) when
 * running in a deployed cloud environment.
 */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    // x-forwarded-host may contain multiple comma-separated hosts; use the first
    const primaryHost = forwardedHost.split(',')[0].trim();
    return `${forwardedProto}://${primaryHost}`;
  }

  // Fallback to configured site URL if available
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configuredSiteUrl && configuredSiteUrl.trim().length > 0) {
    return normalizeUrl(configuredSiteUrl.trim());
  }

  // Fallback to standard request URL
  try {
    const url = new URL(request.url);
    return normalizeUrl(url.origin);
  } catch {
    return getSiteUrl();
  }
}

/**
 * Sanitizes a redirect path to protect against Open Redirect vulnerabilities.
 * Ensures the destination is a safe relative internal route.
 */
export function sanitizeRedirectPath(rawPath: string | null | undefined, fallback = '/dashboard'): string {
  if (!rawPath || typeof rawPath !== 'string') {
    return fallback;
  }

  const trimmed = rawPath.trim();

  // Must begin with a single slash, not a double slash (which represents protocol-relative URL //evil.com)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  // Disallow control characters or newlines
  if (/[\r\n\t]/.test(trimmed)) {
    return fallback;
  }

  // Disallow javascript: or data: schemes
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Strips trailing slashes from a URL string.
 */
function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}
