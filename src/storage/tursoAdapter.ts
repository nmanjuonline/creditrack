/**
 * Turso / libSQL Storage Adapter
 * Implements EntityStore for CreditCard with chunking and edge safety
 */

import { createClient, type Client } from '@libsql/client/web';
import type { CreditCard } from '../types/card';
import type { EntityStore, StateStore, StorageAdapter } from './adapter';
import { CONFIG } from '../config';

export interface TursoConnectionConfig {
  databaseUrl: string;
  authToken: string;
}

export class TursoCardStore implements EntityStore<CreditCard> {
  private client: Client;
  private schemaInitialized = false;

  constructor(client: Client) {
    this.client = client;
  }

  async ensureSchema(): Promise<void> {
    if (this.schemaInitialized) return;

    const sql = `
      CREATE TABLE IF NOT EXISTS ${CONFIG.TURSO.DEFAULT_TABLE_NAME} (
        id TEXT PRIMARY KEY,
        bank_name TEXT NOT NULL,
        card_name TEXT NOT NULL,
        card_network TEXT NOT NULL,
        card_color TEXT,
        card_alias TEXT,
        statement_day INTEGER NOT NULL,
        due_days_after_statement INTEGER NOT NULL,
        specific_due_day INTEGER,
        credit_limit REAL,
        is_favorite INTEGER DEFAULT 0,
        notes TEXT,
        benefits_json TEXT,
        last_benefits_fetch TEXT,
        is_ai_fetched INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    await this.client.execute(sql);
    this.schemaInitialized = true;
  }

  async getById(id: string): Promise<CreditCard | null> {
    await this.ensureSchema();
    const result = await this.client.execute({
      sql: `SELECT * FROM ${CONFIG.TURSO.DEFAULT_TABLE_NAME} WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) return null;
    return this.rowToCard(result.rows[0]);
  }

  async getAll(): Promise<CreditCard[]> {
    await this.ensureSchema();
    const result = await this.client.execute(
      `SELECT * FROM ${CONFIG.TURSO.DEFAULT_TABLE_NAME} ORDER BY is_favorite DESC, updated_at DESC`
    );
    return result.rows.map(row => this.rowToCard(row));
  }

  async save(card: CreditCard): Promise<void> {
    await this.ensureSchema();
    const sql = `
      INSERT INTO ${CONFIG.TURSO.DEFAULT_TABLE_NAME} (
        id, bank_name, card_name, card_network, card_color, card_alias,
        statement_day, due_days_after_statement, specific_due_day,
        credit_limit, is_favorite, notes, benefits_json,
        last_benefits_fetch, is_ai_fetched, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        bank_name = excluded.bank_name,
        card_name = excluded.card_name,
        card_network = excluded.card_network,
        card_color = excluded.card_color,
        card_alias = excluded.card_alias,
        statement_day = excluded.statement_day,
        due_days_after_statement = excluded.due_days_after_statement,
        specific_due_day = excluded.specific_due_day,
        credit_limit = excluded.credit_limit,
        is_favorite = excluded.is_favorite,
        notes = excluded.notes,
        benefits_json = excluded.benefits_json,
        last_benefits_fetch = excluded.last_benefits_fetch,
        is_ai_fetched = excluded.is_ai_fetched,
        updated_at = excluded.updated_at;
    `;

    await this.client.execute({
      sql,
      args: [
        card.id,
        card.bankName,
        card.cardName,
        card.cardNetwork,
        card.cardColor || null,
        card.cardAlias || null,
        card.statementDay,
        card.dueDaysAfterStatement,
        card.specificDueDay || null,
        card.creditLimit || null,
        card.isFavorite ? 1 : 0,
        card.notes || null,
        JSON.stringify(card.benefits),
        card.lastBenefitsFetch || null,
        card.isAiFetched ? 1 : 0,
        card.createdAt,
        card.updatedAt,
      ],
    });
  }

  async saveBatch(entities: CreditCard[]): Promise<void> {
    await this.ensureSchema();
    // Chunk batch into chunks of <= 80 statements per Edge Constraints Checklist
    const chunkSize = CONFIG.LIMITS.TURSO_BATCH_CHUNK_LIMIT;
    for (let i = 0; i < entities.length; i += chunkSize) {
      const chunk = entities.slice(i, i + chunkSize);
      await Promise.all(chunk.map(card => this.save(card)));
    }
  }

  async delete(id: string): Promise<void> {
    await this.ensureSchema();
    await this.client.execute({
      sql: `DELETE FROM ${CONFIG.TURSO.DEFAULT_TABLE_NAME} WHERE id = ?`,
      args: [id],
    });
  }

  private rowToCard(row: any): CreditCard {
    return {
      id: String(row.id),
      bankName: String(row.bank_name),
      cardName: String(row.card_name),
      cardNetwork: (row.card_network as any) || 'visa',
      cardColor: row.card_color ? String(row.card_color) : undefined,
      cardAlias: row.card_alias ? String(row.card_alias) : undefined,
      statementDay: Number(row.statement_day),
      dueDaysAfterStatement: Number(row.due_days_after_statement) || 20,
      specificDueDay: row.specific_due_day ? Number(row.specific_due_day) : undefined,
      creditLimit: row.credit_limit ? Number(row.credit_limit) : undefined,
      isFavorite: Boolean(row.is_favorite),
      notes: row.notes ? String(row.notes) : undefined,
      benefits: row.benefits_json ? JSON.parse(String(row.benefits_json)) : this.createFallbackBenefits(),
      lastBenefitsFetch: row.last_benefits_fetch ? String(row.last_benefits_fetch) : undefined,
      isAiFetched: Boolean(row.is_ai_fetched),
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: String(row.updated_at || new Date().toISOString()),
    };
  }

  private createFallbackBenefits() {
    return {
      domesticLounge: { available: false, details: 'None' },
      internationalLounge: { available: false, details: 'None' },
      rewardRate: { basePercent: 1.0 },
      cashbackHighlights: [],
      milestones: [],
      forexMarkup: { ratePercent: 3.5, details: 'Standard 3.5% + GST' },
      fuelSurchargeWaiver: { available: false, details: 'None' },
      annualFee: { amount: 'N/A', waiverSpend: 'N/A' },
      isRupayUPI: false,
      summaryPoints: [],
      allPerks: [],
    };
  }
}

export class LocalStateStore implements StateStore {
  async get<T = string>(key: string): Promise<T | null> {
    try {
      const val = localStorage.getItem(key);
      if (!val) return null;
      try {
        return JSON.parse(val) as T;
      } catch {
        return val as unknown as T;
      }
    } catch {
      return null;
    }
  }

  async set<T = string>(key: string, value: T): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.warn('LocalStateStore write error:', e);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

export function createTursoAdapter(config: TursoConnectionConfig): StorageAdapter {
  let url = config.databaseUrl.trim();
  if (url.startsWith('libsql://')) {
    url = url.replace('libsql://', 'https://');
  }

  const client = createClient({
    url,
    authToken: config.authToken.trim(),
  });

  return {
    name: 'turso',
    cards: new TursoCardStore(client),
    state: new LocalStateStore(),
  };
}
