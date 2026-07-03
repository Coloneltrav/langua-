// Minimal in-memory rate limiter for the endpoints that spend Anthropic /
// Azure credits. This is a personal single-user app — the goal is a
// sanity ceiling against a runaway client or a leaked token, not
// distributed-abuse protection, so an in-memory map (reset on restart) is
// sufficient and avoids pulling in a datastore.
const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart > windowMs) {
      bucket = { windowStart: now, count: 0 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfterSec = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ error: `Rate limit exceeded. Try again in ${retryAfterSec}s.` });
    }
    next();
  };
}
