/**
 * Simple in-memory cache to reduce API calls
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if expired/missing
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[CACHE HIT] ${key} (${Math.round((item.expiresAt - Date.now()) / 1000)}s remaining)`);
    return item.data;
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
    console.log(`[CACHE SET] ${key} (TTL: ${ttl / 1000}s)`);
  }

  /**
   * Clear specific key or all cache
   * @param {string} key - Optional key to clear
   */
  clear(key) {
    if (key) {
      this.cache.delete(key);
      console.log(`[CACHE CLEAR] ${key}`);
    } else {
      this.cache.clear();
      console.log(`[CACHE CLEAR] All keys cleared`);
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;

    this.cache.forEach((item) => {
      if (now > item.expiresAt) {
        expired++;
      } else {
        active++;
      }
    });

    return {
      total: this.cache.size,
      active,
      expired,
    };
  }
}

// Singleton instance
export const cache = new SimpleCache();





