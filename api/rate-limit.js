export const config = {
  runtime: 'edge',
};

// In-memory store for rate limiting (resets on cold start)
// For production, consider using Vercel KV or Upstash Redis
const rateLimitStore = new Map();

// Clean up old entries every request (simple garbage collection)
function cleanupOldEntries() {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.firstRequest > windowMs) {
      rateLimitStore.delete(key);
    }
  }
}

export default function handler(request) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  // Rate limit settings
  const maxRequests = 5; // Max 5 submissions per hour
  const windowMs = 60 * 60 * 1000; // 1 hour window

  const now = Date.now();

  // Cleanup old entries
  cleanupOldEntries();

  // Get or create rate limit data for this IP
  let rateData = rateLimitStore.get(ip);

  if (!rateData || (now - rateData.firstRequest > windowMs)) {
    // New window
    rateData = {
      count: 0,
      firstRequest: now,
    };
  }

  // Check if rate limited
  const isLimited = rateData.count >= maxRequests;
  const remaining = Math.max(0, maxRequests - rateData.count);
  const resetTime = rateData.firstRequest + windowMs;

  // If this is a POST (actual submission check), increment the counter
  if (request.method === 'POST' && !isLimited) {
    rateData.count++;
    rateLimitStore.set(ip, rateData);
  }

  return new Response(
    JSON.stringify({
      allowed: !isLimited,
      remaining: isLimited ? 0 : remaining - (request.method === 'POST' ? 1 : 0),
      resetTime: new Date(resetTime).toISOString(),
      message: isLimited
        ? 'Too many submissions. Please try again later.'
        : 'OK',
    }),
    {
      status: isLimited ? 429 : 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(maxRequests),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(resetTime),
      },
    }
  );
}
