/**
 * SQLite Offline Cache
 * 
 * Mirrors Supabase tables locally for offline support
 */

import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize SQLite database
 */
export async function initDatabase() {
  if (db) return db;

  db = await SQLite.openDatabaseAsync("recovery_companion.db");

  // Create tables mirroring Supabase schema
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      handle TEXT,
      timezone TEXT DEFAULT 'UTC',
      avatar_url TEXT,
      clean_date TEXT,
      program TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      cravings_intensity INTEGER,
      feelings TEXT, -- JSON
      triggers TEXT, -- JSON
      coping_actions TEXT, -- JSON
      gratitude TEXT,
      notes TEXT,
      share_with_sponsor INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, entry_date)
    );

    CREATE TABLE IF NOT EXISTS step_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      content TEXT NOT NULL, -- JSON
      is_shared_with_sponsor INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date);
    CREATE INDEX IF NOT EXISTS idx_step_entries_user_step ON step_entries(user_id, step_id);
  `);

  return db;
}

/**
 * Get database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

