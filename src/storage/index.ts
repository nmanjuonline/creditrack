/**
 * Storage Factory with memoization
 * Seamlessly resolves Turso or Local Storage adapter based on runtime configuration
 */

import type { StorageAdapter } from './adapter';
import { createTursoAdapter, type TursoConnectionConfig } from './tursoAdapter';
import { createLocalStorageAdapter } from './localAdapter';
import { CONFIG } from '../config';

let cachedAdapter: StorageAdapter | null = null;
let lastConfigHash = '';

export function getStorage(customConfig?: TursoConnectionConfig): StorageAdapter {
  let dbUrl = customConfig?.databaseUrl;
  let token = customConfig?.authToken;

  if (!dbUrl || !token) {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.TURSO_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        dbUrl = parsed.databaseUrl;
        token = parsed.authToken;
      }
    } catch {
      // ignore
    }
  }

  const currentHash = `${dbUrl || ''}::${token || ''}`;

  if (cachedAdapter && currentHash === lastConfigHash) {
    return cachedAdapter;
  }

  if (dbUrl && token) {
    try {
      cachedAdapter = createTursoAdapter({ databaseUrl: dbUrl, authToken: token });
      lastConfigHash = currentHash;
      return cachedAdapter;
    } catch (e) {
      console.warn('Failed initializing Turso storage adapter, falling back to local storage:', e);
    }
  }

  cachedAdapter = createLocalStorageAdapter();
  lastConfigHash = currentHash;
  return cachedAdapter;
}

export function resetStorageCache(): void {
  cachedAdapter = null;
  lastConfigHash = '';
}
