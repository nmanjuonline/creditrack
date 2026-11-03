/**
 * Local / Memory Storage Adapter
 * Provides offline-first resilience, local storage persistence, and test isolation.
 */

import type { CreditCard } from '../types/card';
import type { EntityStore, StorageAdapter } from './adapter';
import { LocalStateStore } from './tursoAdapter';
import { CONFIG } from '../config';

export class LocalCardStore implements EntityStore<CreditCard> {
  private cacheKey: string;

  constructor(cacheKey: string = CONFIG.STORAGE_KEYS.CARDS_CACHE) {
    this.cacheKey = cacheKey;
  }

  async getById(id: string): Promise<CreditCard | null> {
    const all = await this.getAll();
    return all.find(c => c.id === id) || null;
  }

  async getAll(): Promise<CreditCard[]> {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('LocalCardStore read error:', e);
    }
    return [];
  }

  async save(card: CreditCard): Promise<void> {
    const all = await this.getAll();
    const existingIndex = all.findIndex(c => c.id === card.id);
    let updated: CreditCard[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = card;
    } else {
      updated = [card, ...all];
    }
    localStorage.setItem(this.cacheKey, JSON.stringify(updated));
  }

  async saveBatch(entities: CreditCard[]): Promise<void> {
    const all = await this.getAll();
    const map = new Map(all.map(c => [c.id, c]));
    for (const entity of entities) {
      map.set(entity.id, entity);
    }
    localStorage.setItem(this.cacheKey, JSON.stringify(Array.from(map.values())));
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(c => c.id !== id);
    localStorage.setItem(this.cacheKey, JSON.stringify(filtered));
  }
}

export class MemoryCardStore implements EntityStore<CreditCard> {
  private cards: Map<string, CreditCard> = new Map();

  async getById(id: string): Promise<CreditCard | null> {
    return this.cards.get(id) || null;
  }

  async getAll(): Promise<CreditCard[]> {
    return Array.from(this.cards.values());
  }

  async save(entity: CreditCard): Promise<void> {
    this.cards.set(entity.id, entity);
  }

  async saveBatch(entities: CreditCard[]): Promise<void> {
    for (const card of entities) {
      this.cards.set(card.id, card);
    }
  }

  async delete(id: string): Promise<void> {
    this.cards.delete(id);
  }
}

export function createLocalStorageAdapter(cacheKey?: string): StorageAdapter {
  return {
    name: 'local',
    cards: new LocalCardStore(cacheKey),
    state: new LocalStateStore(),
  };
}
