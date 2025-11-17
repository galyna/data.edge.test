/**
 * IndexedDB-based caching system for offline-first data storage
 * Optimized for high-frequency sports data updates
 */

interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
}

class CacheDB {
  private dbName = "data-edge-cache";
  private version = 1;
  private storeName = "cache";
  private db: IDBDatabase | null = null;

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      console.warn("IndexedDB not available");
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "key" });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("expiresAt", "expiresAt", { unique: false });
        }
      };
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          // Remove expired entry
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(entry.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined,
      };

      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all keys in cache
   */
  async keys(): Promise<string[]> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clean expired entries
   */
  async cleanExpired(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("expiresAt");
      const now = Date.now();
      
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache size (number of entries)
   */
  async size(): Promise<number> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return 0;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let cacheInstance: CacheDB | null = null;

/**
 * Get cache instance (singleton)
 */
export function getCacheDB(): CacheDB {
  if (!cacheInstance) {
    cacheInstance = new CacheDB();
  }
  return cacheInstance;
}

/**
 * Cache wrapper with automatic expiration and LRU eviction
 */
export class Cache {
  private db = getCacheDB();
  private maxSize = 1000; // Maximum number of entries
  
  constructor(maxSize?: number) {
    if (maxSize) {
      this.maxSize = maxSize;
    }
    
    // Initialize database
    this.db.init().catch(console.error);
    
    // Clean expired entries periodically (every 5 minutes)
    if (typeof window !== "undefined") {
      setInterval(() => {
        this.db.cleanExpired().catch(console.error);
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.db.get<T>(key);
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL (in milliseconds)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      // Check cache size and evict if necessary
      const size = await this.db.size();
      if (size >= this.maxSize) {
        // Evict oldest entries
        await this.evictOldest(Math.floor(this.maxSize * 0.1)); // Evict 10%
      }

      await this.db.set(key, value, ttl);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.db.delete(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.db.clear();
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  /**
   * Get all cache keys
   */
  async keys(): Promise<string[]> {
    try {
      return await this.db.keys();
    } catch (error) {
      console.error("Cache keys error:", error);
      return [];
    }
  }

  /**
   * Evict oldest entries
   */
  private async evictOldest(count: number): Promise<void> {
    // This is a simplified version - in production you'd want more sophisticated LRU
    const keys = await this.db.keys();
    const toDelete = keys.slice(0, count);
    
    await Promise.all(toDelete.map((key) => this.db.delete(key)));
  }
}

// Export singleton cache instance
export const cache = new Cache(1000);

