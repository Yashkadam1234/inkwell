// db/init.js — async sqlite driver (pure JS, works on Windows with no build tools)
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = join(__dirname, "inkwell.db");

// Returns an open async DB connection
export async function getDb() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.run("PRAGMA journal_mode = WAL");
  await db.run("PRAGMA foreign_keys = ON");
  return db;
}

export async function initDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title       TEXT NOT NULL DEFAULT 'Untitled',
      content     TEXT NOT NULL DEFAULT '',
      category    TEXT NOT NULL DEFAULT 'general',
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_public   INTEGER NOT NULL DEFAULT 0,
      share_id    TEXT UNIQUE,
      word_count  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tags (
      id      TEXT PRIMARY KEY,
      note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      name    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_generations (
      id              TEXT PRIMARY KEY,
      note_id         TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      summary         TEXT,
      action_items    TEXT,
      suggested_title TEXT,
      tokens_used     INTEGER DEFAULT 0,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS note_activity (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      note_id    TEXT REFERENCES notes(id) ON DELETE SET NULL,
      action     TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_notes_user    ON notes(user_id);
    CREATE INDEX IF NOT EXISTS idx_notes_share   ON notes(share_id);
    CREATE INDEX IF NOT EXISTS idx_tags_note     ON tags(note_id);
    CREATE INDEX IF NOT EXISTS idx_ai_note       ON ai_generations(note_id);
    CREATE INDEX IF NOT EXISTS idx_activity_user ON note_activity(user_id);
  `);

  await db.close();
  console.log("✦ Inkwell DB ready at", DB_PATH);
}
