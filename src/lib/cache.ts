// Simple in-memory cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, expiresIn: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

// Cache keys
export const CACHE_KEYS = {
  USER_STATS: 'user-stats',
  NOTIFICATIONS: 'notifications',
  MARKETPLACE_ITEMS: 'marketplace-items',
  PURCHASES: 'purchases',
  SALES: 'sales',
  LIBRARY: 'library',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
};

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 10000,    // 10 seconds
  MEDIUM: 30000,   // 30 seconds
  LONG: 60000,     // 1 minute
  VERY_LONG: 300000, // 5 minutes
};

