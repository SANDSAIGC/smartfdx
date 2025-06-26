/**
 * 数据缓存管理器
 * 提供内存缓存和本地存储缓存功能
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // 缓存时间（毫秒）
  useLocalStorage?: boolean; // 是否使用本地存储
  maxSize?: number; // 最大缓存条目数
}

class DataCache {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 默认5分钟
  private maxSize = 100; // 默认最大100个条目

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      useLocalStorage = false,
      maxSize = this.maxSize
    } = options;

    const now = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiry: now + ttl
    };

    // 内存缓存
    this.memoryCache.set(key, cacheItem);

    // 清理过期缓存
    this.cleanup();

    // 限制缓存大小
    if (this.memoryCache.size > maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    // 本地存储缓存
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string, useLocalStorage = false): T | null {
    const now = Date.now();

    // 先检查内存缓存
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && memoryItem.expiry > now) {
      return memoryItem.data;
    }

    // 检查本地存储缓存
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          const cacheItem: CacheItem<T> = JSON.parse(stored);
          if (cacheItem.expiry > now) {
            // 恢复到内存缓存
            this.memoryCache.set(key, cacheItem);
            return cacheItem.data;
          } else {
            // 清理过期的本地存储
            localStorage.removeItem(`cache_${key}`);
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string, useLocalStorage = false): boolean {
    return this.get(key, useLocalStorage) !== null;
  }

  /**
   * 删除缓存
   */
  delete(key: string, useLocalStorage = false): void {
    this.memoryCache.delete(key);
    
    if (useLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${key}`);
    }
  }

  /**
   * 清空所有缓存
   */
  clear(useLocalStorage = false): void {
    this.memoryCache.clear();
    
    if (useLocalStorage && typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      keys.forEach(key => localStorage.removeItem(key));
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    memorySize: number;
    localStorageSize: number;
    totalKeys: string[];
  } {
    const memoryKeys = Array.from(this.memoryCache.keys());
    let localStorageKeys: string[] = [];
    
    if (typeof window !== 'undefined') {
      localStorageKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'))
        .map(key => key.replace('cache_', ''));
    }

    return {
      memorySize: memoryKeys.length,
      localStorageSize: localStorageKeys.length,
      totalKeys: [...new Set([...memoryKeys, ...localStorageKeys])]
    };
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.memoryCache.forEach((item, key) => {
      if (item.expiry <= now) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.memoryCache.delete(key));
  }

  /**
   * 获取最旧的缓存键
   */
  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    this.memoryCache.forEach((item, key) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }
}

// 创建全局缓存实例
export const dataCache = new DataCache();

/**
 * 缓存装饰器函数
 */
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  options: CacheOptions = {}
) {
  return async (...args: T): Promise<R> => {
    const cacheKey = keyGenerator(...args);
    
    // 尝试从缓存获取
    const cached = dataCache.get<R>(cacheKey, options.useLocalStorage);
    if (cached !== null) {
      console.log(`🎯 [Cache] Hit: ${cacheKey}`);
      return cached;
    }

    // 缓存未命中，执行函数
    console.log(`💾 [Cache] Miss: ${cacheKey}`);
    const result = await fn(...args);
    
    // 存储到缓存
    dataCache.set(cacheKey, result, options);
    
    return result;
  };
}
