/**
 * Centralized Configuration for CrediTrack
 * Follows Edge-First Serverless Application Architecture
 * Zero-hardcoding principle: all constants, limits, and storage keys flow through here.
 */

export const CONFIG = {
  APP: {
    NAME: 'CrediTrack',
    VERSION: '1.0.0',
    DESCRIPTION: 'Smart Credit Card Billing Cycle Tracker & Benefits Intelligence',
  },
  STORAGE_KEYS: {
    CARDS_CACHE: 'creditrack_cards_cache_v2',
    TURSO_CONFIG: 'creditrack_turso_config_v2',
    GEMINI_API_KEY: 'creditrack_gemini_api_key_v2',
    NOTIFICATION_PREFS: 'creditrack_notification_prefs',
    DISMISSED_INSTALL_BANNER: 'creditrack_dismissed_install_banner',
  },
  LIMITS: {
    MAX_CARDS_RECOMMENDED: 50,
    MAX_FLOAT_DAYS_NORMALIZER: 52,
    DEFAULT_STATEMENT_GRACE_DAYS: 20,
    URGENT_DUE_DAYS_THRESHOLD: 3,
    UPCOMING_STATEMENT_DAYS_THRESHOLD: 2,
    OPTIMAL_FLOAT_WINDOW_DAYS: 5,
    TURSO_BATCH_CHUNK_LIMIT: 80, // Cloudflare D1/libSQL batch constraint (<= 90)
  },
  TURSO: {
    DEFAULT_TABLE_NAME: 'creditrack_cards',
  },
  AI: {
    MODEL: 'gemini-3.8-flash',
    TEMPERATURE: 0.1,
    MAX_TOKENS: 1024,
  },
} as const;
