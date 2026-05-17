// routes/notes.js
import { Router } from "express";
import { nanoid } from "nanoid";
import { getDb } from "../db/init.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

async function buildNote(row, db) {
  if (!row) return null;
  const tags = await db.all("SELECT name FROM tags WHERE note_id = ?", row.id);
  const ai = await db.get(
    "SELECT * FROM ai_generations WHERE note_id = ? ORDER BY created_at DESC LIMIT 1",
    row.id
  );
  return {
    ...row,
    tags: tags.map(t => t.name),
    is_archived: !!row.is_archived,
    is_public: !!row.is_public,
    ai: ai ? {
      summary: ai.summary,
      action_items: JSON.parse(ai.action_items || "[]"),
      suggested_title: ai.suggested_title,
      generated_at: ai.created_at,
    } : null,
  };
}

async function logActivity(db, userId, noteId, action) {
  await db.run(
    "INSERT INTO note_activity (id, user_id, note_id, action) VALUES (?, ?, ?, ?)",
    "ACT_" + nanoid(6), userId, noteId, action
  );
}

// GET /notes
router.get("/", requireAuth, async (req, res) => {
  const { search, tag, category, archived, sort } = req.query;
  const db = await getDb();
  try {
    let query = `SELECT DISTINCT n.* FROM notes n`;
    const params = [];
    const where = ["n.user_id = ?"];
    params.push(req.user.id);

    if (tag) {
      query += ` LEFT JOIN tags t ON t.note_id = n.id`;
      where.push("t.name = ?");
      params.push(tag);
    }
    if (search) {
      where.push("(n.title LIKE ? OR n.content LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) { where.push("n.category = ?"); params.push(category); }
    where.push(`n.is_archived = ?`);
    params.push(archived === "true" ? 1 : 0);

    query += ` WHERE ${where.join(" AND ")}`;
    query += sort === "created" ? " ORDER BY n.created_at DESC" : " ORDER BY n.updated_at DESC";

    const rows = await db.all(query, ...params);
    const notes = await Promise.all(rows.map(r => buildNote(r, db)));
    res.json({ notes, total: notes.length });
  } finally {
    await db.close();
  }
});

// POST /notes
router.post("/", requireAuth, async (req, res) => {
  const { title = "Untitled", content = "", tags = [], category = "general" } = req.body;
  const db = await getDb();
  try {
    const id = "NOTE_" + nanoid(8);
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const shareId = nanoid(12);
    await db.run(
      `INSERT INTO notes (id, user_id, title, content, category, word_count, share_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id, req.user.id, title, content, category, wordCount, shareId
    );
    for (const tag of tags) {
      if (tag.trim()) await db.run("INSERT INTO tags (id, note_id, name) VALUES (?, ?, ?)", nanoid(6), id, tag.trim().toLowerCase());
    }
    await logActivity(db, req.user.id, id, "created");
    const note = await db.get("SELECT * FROM notes WHERE id = ?", id);
    res.status(201).json({ note: await buildNote(note, db) });
  } finally {
    await db.close();
  }
});

// PATCH /notes/:id
router.patch("/:id", requireAuth, async (req, res) => {
  const db = await getDb();
  try {
    const note = await db.get("SELECT * FROM notes WHERE id = ? AND user_id = ?", req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const { title, content, category, tags, is_archived, is_public } = req.body;
    const updates = [];
    const vals = [];

    if (title !== undefined) { updates.push("title = ?"); vals.push(title); }
    if (content !== undefined) {
      updates.push("content = ?"); updates.push("word_count = ?");
      vals.push(content, content.trim().split(/\s+/).filter(Boolean).length);
    }
    if (category !== undefined) { updates.push("category = ?"); vals.push(category); }
    if (is_archived !== undefined) { updates.push("is_archived = ?"); vals.push(is_archived ? 1 : 0); }
    if (is_public !== undefined) { updates.push("is_public = ?"); vals.push(is_public ? 1 : 0); }
    updates.push("updated_at = datetime('now')");

    if (updates.length) await db.run(`UPDATE notes SET ${updates.join(", ")} WHERE id = ?`, ...vals, req.params.id);

    if (Array.isArray(tags)) {
      await db.run("DELETE FROM tags WHERE note_id = ?", req.params.id);
      for (const tag of tags) {
        if (tag.trim()) await db.run("INSERT INTO tags (id, note_id, name) VALUES (?, ?, ?)", nanoid(6), req.params.id, tag.trim().toLowerCase());
      }
    }

    await logActivity(db, req.user.id, req.params.id, "updated");
    const updated = await db.get("SELECT * FROM notes WHERE id = ?", req.params.id);
    res.json({ note: await buildNote(updated, db) });
  } finally {
    await db.close();
  }
});

// DELETE /notes/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const db = await getDb();
  try {
    const note = await db.get("SELECT id FROM notes WHERE id = ? AND user_id = ?", req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    await db.run("DELETE FROM notes WHERE id = ?", req.params.id);
    res.json({ deleted: true });
  } finally {
    await db.close();
  }
});

// GET /notes/shared/:shareId (public)
router.get("/shared/:shareId", async (req, res) => {
  const db = await getDb();
  try {
    const note = await db.get("SELECT * FROM notes WHERE share_id = ? AND is_public = 1", req.params.shareId);
    if (!note) return res.status(404).json({ error: "Note not found or not public" });
    const built = await buildNote(note, db);
    const author = await db.get("SELECT name FROM users WHERE id = ?", note.user_id);
    res.json({ note: { ...built, author_name: author?.name } });
  } finally {
    await db.close();
  }
});

export default router;
