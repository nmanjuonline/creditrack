import { createClient, type Client } from '@libsql/client/web';
import type { CreditCard } from '../types/card';

const TURSO_CONFIG_KEY = 'creditrack_turso_config';
const LOCAL_CARDS_KEY = 'creditrack_cards_cache';

export interface TursoConfig {
  databaseUrl: string;
  authToken: string;
  autoSync: boolean;
}

let activeClient: Client | null = null;

export function getStoredTursoConfig(): TursoConfig {
  try {
    const raw = localStorage.getItem(TURSO_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading Turso config:', e);
  }
  return {
    databaseUrl: '',
    authToken: '',
    autoSync: false,
  };
}

export function saveTursoConfig(config: TursoConfig): void {
  localStorage.setItem(TURSO_CONFIG_KEY, JSON.stringify(config));
  activeClient = null; // Reset client so next call re-instantiates
}

export function getTursoClient(config?: TursoConfig): Client | null {
  const conf = config || getStoredTursoConfig();
  if (!conf.databaseUrl || !conf.authToken) {
    return null;
  }

  // Convert libsql:// to https:// if web client requires it
  let url = conf.databaseUrl.trim();
  if (url.startsWith('libsql://')) {
    url = url.replace('libsql://', 'https://');
  }

  if (!activeClient) {
    try {
      activeClient = createClient({
        url,
        authToken: conf.authToken.trim(),
      });
    } catch (e) {
      console.error('Failed to create Turso client:', e);
      return null;
    }
  }

  return activeClient;
}

/**
 * Test Turso connection and ensure table exists
 */
export async function testTursoConnection(url: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    let cleanUrl = url.trim();
    if (cleanUrl.startsWith('libsql://')) {
      cleanUrl = cleanUrl.replace('libsql://', 'https://');
    }
    const testClient = createClient({
      url: cleanUrl,
      authToken: token.trim(),
    });

    // Run a lightweight test query & initialize table
    await testClient.execute('SELECT 1 as test');
    await initTursoSchema(testClient);

    return {
      success: true,
      message: 'Successfully connected to Turso database and verified schema!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to connect to Turso. Check URL and Auth Token.',
    };
  }
}

/**
 * Initializes the table in Turso if it doesn't already exist
 */
export async function initTursoSchema(client?: Client): Promise<void> {
  const c = client || getTursoClient();
  if (!c) return;

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS creditrack_cards (
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

  await c.execute(createTableSql);
}

/**
 * Convert DB row to CreditCard model
 */
function rowToCard(row: any): CreditCard {
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
    benefits: row.benefits_json ? JSON.parse(String(row.benefits_json)) : createDefaultEmptyBenefits(),
    lastBenefitsFetch: row.last_benefits_fetch ? String(row.last_benefits_fetch) : undefined,
    isAiFetched: Boolean(row.is_ai_fetched),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

/**
 * Save / Upsert a single card to Turso
 */
export async function saveCardToTurso(card: CreditCard): Promise<void> {
  const c = getTursoClient();
  if (!c) return;

  const sql = `
    INSERT INTO creditrack_cards (
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

  await c.execute({
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

/**
 * Delete a card from Turso
 */
export async function deleteCardFromTurso(id: string): Promise<void> {
  const c = getTursoClient();
  if (!c) return;

  await c.execute({
    sql: 'DELETE FROM creditrack_cards WHERE id = ?',
    args: [id],
  });
}

/**
 * Load all cards from Turso
 */
export async function loadCardsFromTurso(): Promise<CreditCard[]> {
  const c = getTursoClient();
  if (!c) return [];

  await initTursoSchema(c);
  const result = await c.execute('SELECT * FROM creditrack_cards ORDER BY is_favorite DESC, updated_at DESC');
  return result.rows.map(rowToCard);
}

/**
 * Fallback & Local Storage cache operations
 */
export function getLocalCachedCards(): CreditCard[] {
  try {
    const raw = localStorage.getItem(LOCAL_CARDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local cached cards:', e);
  }
  return [];
}

export function saveLocalCachedCards(cards: CreditCard[]): void {
  try {
    localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Error saving local cards cache:', e);
  }
}

export function createDefaultEmptyBenefits() {
  return {
    domesticLounge: { available: false, details: 'None' },
    internationalLounge: { available: false, details: 'None' },
    rewardRate: { basePercent: 1.0 },
    cashbackHighlights: [],
    milestones: [],
    forexMarkup: { ratePercent: 3.5, details: 'Standard 3.5% + GST' },
    fuelSurchargeWaiver: { available: false, details: 'None' },
    annualFee: { amount: 'Not specified', waiverSpend: 'N/A' },
    isRupayUPI: false,
    summaryPoints: [],
    allPerks: [],
  };
}
