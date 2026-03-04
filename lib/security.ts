// Rate limiter: sliding window per user
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 10 // requests per window

export function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true }
}

// CSRF protection: validate Origin/Referer header
const ALLOWED_ORIGINS = [
  'https://vectorstrat.ai',
  'https://www.vectorstrat.ai',
  'http://localhost:3000',
]

export function checkCsrf(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (origin) {
    return ALLOWED_ORIGINS.includes(origin)
  }

  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const url = new URL(referer)
      return ALLOWED_ORIGINS.includes(url.origin)
    } catch {
      return false
    }
  }

  // No origin or referer — could be same-origin navigation or non-browser client
  // Be permissive here since auth is already checked; CSRF is defense-in-depth
  return true
}
