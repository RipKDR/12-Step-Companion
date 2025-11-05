import { get, set, del } from 'idb-keyval';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('LocalStorage getItem failed:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('LocalStorage setItem failed:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage removeItem failed:', error);
      throw error;
    }
  }
}

class IndexedDBAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await get(key);
      return value ?? null;
    } catch (error) {
      console.error('IndexedDB getItem failed:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await set(key, value);
    } catch (error) {
      console.error('IndexedDB setItem failed:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await del(key);
    } catch (error) {
      console.error('IndexedDB removeItem failed:', error);
      throw error;
    }
  }
}

export class StorageManager {
  private adapter: StorageAdapter;
  private quotaWarningShown = false;

  constructor() {
    this.adapter = this.detectBestAdapter();
  }

  private detectBestAdapter(): StorageAdapter {
    try {
      // Test if localStorage is available and working
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return new LocalStorageAdapter();
    } catch {
      // Fall back to IndexedDB if localStorage fails (private mode, quota exceeded)
      console.warn('LocalStorage unavailable, falling back to IndexedDB');
      return new IndexedDBAdapter();
    }
  }

  async getItem(key: string): Promise<string | null> {
    return this.adapter.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.adapter.setItem(key, value);
    } catch (error) {
      if (!this.quotaWarningShown) {
        this.quotaWarningShown = true;
        console.warn('Storage quota exceeded. Consider exporting your data.');
        // TODO: Show user-facing notification
      }
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    return this.adapter.removeItem(key);
  }

  isPrivateMode(): boolean {
    try {
      const testKey = '__private_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return false;
    } catch {
      return true;
    }
  }

  async estimateQuota(): Promise<{ usage: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const storageManager = new StorageManager();
