/**
 * Simple in-memory page cache middleware.
 * Caches full HTML responses for GET requests without session-specific content.
 * Drastically reduces TTFB for repeat visitors and search engine crawlers.
 */

const cache = new Map();
const MAX_ENTRIES = 500;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

function pageCache(ttlMs = DEFAULT_TTL) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    // Don't cache if user has items in cart (personalized content)
    if (req.session && req.session.cart && req.session.cart.length > 0) return next();

    // Don't cache search, cart, checkout
    if (req.path.startsWith('/search') || req.path.startsWith('/cart') || req.path.startsWith('/checkout')) {
      return next();
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttlMs) {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.set('X-Cache', 'HIT');
      return res.send(cached.body);
    }

    // Intercept res.send to capture the response
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      // Only cache successful HTML responses
      if (res.statusCode === 200 && typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        // Evict oldest entries if at capacity
        if (cache.size >= MAX_ENTRIES) {
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }
        cache.set(key, { body, timestamp: Date.now() });
      }
      res.set('X-Cache', 'MISS');
      return originalSend(body);
    };

    next();
  };
}

// Clear cache (call after product/category updates)
function clearPageCache() {
  cache.clear();
}

module.exports = { pageCache, clearPageCache };
