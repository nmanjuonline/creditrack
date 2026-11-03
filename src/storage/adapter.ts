/**
 * Storage Abstraction Layer
 * Compliant with Edge-First Serverless Application Architecture
 */

import type { CreditCard } from '../types/card';

export interface StateStore {
  get<T = string>(key: string): Promise<T | null>;
  set<T = string>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface EntityStore<T> {
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  saveBatch(entities: T[]): Promise<void>;
  delete(id: string): Promise<void>;
  ensureSchema?(): Promise<void>;
}

export interface StorageAdapter {
  cards: EntityStore<CreditCard>;
  state: StateStore;
  name: string;
}
