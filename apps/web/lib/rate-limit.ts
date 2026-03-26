// Dual-mode rate limiter.
// Production: uses Upstash Redis REST API (INCR + EXPIRE pattern) when
//   UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
// Dev / preview fallback: in-memory Map with a sliding window.
//   NOTE: in-memory store resets on every serverless cold start — not
//   suitable for production multi-instance deployments.

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Clean up expired entries every 5 minutes to prevent unbounded memory growth
const cleanup = setInterval(() => {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key)
  })
}, 5 * 60 * 1000)

// Allow Node.js to exit without waiting for this timer
cleanup.unref?.()

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSecs: number } {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[rate-limit] WARNING: Using in-memory store in production. ' +
        'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for persistent rate limiting.'
    )
  }

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSecs: 0 }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { allowed: true, retryAfterSecs: 0 }
}

async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  redisUrl: string,
  redisToken: string
): Promise<{ allowed: boolean; retryAfterSecs: number }> {
  const windowSeconds = Math.ceil(windowMs / 1000)

  const response = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, windowSeconds],
    ]),
  })

  if (!response.ok) {
    // If Redis call fails, fall back to allowing the request to avoid
    // blocking all traffic due to a Redis outage.
    console.error('[rate-limit] Redis pipeline request failed, allowing request', {
      status: response.status,
    })
    return { allowed: true, retryAfterSecs: 0 }
  }

  // Pipeline response: [[null, count], [null, 1]]
  const results = (await response.json()) as Array<[unknown, number]>
  const count = results[0]?.[1] ?? 1

  if (count > limit) {
    return { allowed: false, retryAfterSecs: windowSeconds }
  }

  return { allowed: true, retryAfterSecs: 0 }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSecs: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    return redisRateLimit(key, limit, windowMs, redisUrl, redisToken)
  }

  return inMemoryRateLimit(key, limit, windowMs)
}
