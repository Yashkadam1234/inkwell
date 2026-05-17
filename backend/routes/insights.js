// routes/insights.js
import { Router } from "express";
import { getDb } from "../db/init.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /insights
router.get("/", requireAuth, async (req, res) => {
  const db = await getDb();
  try {
    const uid = req.user.id;

    const { c: totalNotes }    = await db.get("SELECT COUNT(*) as c FROM notes WHERE user_id=? AND is_archived=0", uid);
    const { c: archivedNotes } = await db.get("SELECT COUNT(*) as c FROM notes WHERE user_id=? AND is_archived=1", uid);
    const { s: totalWords }    = await db.get("SELECT COALESCE(SUM(word_count),0) as s FROM notes WHERE user_id=?", uid);
    const { c: aiUsed }        = await db.get("SELECT COUNT(DISTINCT note_id) as c FROM ai_generations WHERE user_id=?", uid);
    const { c: sharedNotes }   = await db.get("SELECT COUNT(*) as c FROM notes WHERE user_id=? AND is_public=1", uid);

    const topTags = await db.all(`
      SELECT t.name, COUNT(*) as count
      FROM tags t JOIN notes n ON n.id = t.note_id
      WHERE n.user_id = ? AND n.is_archived = 0
      GROUP BY t.name ORDER BY count DESC LIMIT 8
    `, uid);

    const recentNotes = await db.all(`
      SELECT id, title, updated_at, word_count FROM notes
      WHERE user_id = ? AND is_archived = 0
      ORDER BY updated_at DESC LIMIT 6
    `, uid);

    const weeklyActivity = await db.all(`
      SELECT date(created_at) as day, COUNT(*) as count
      FROM note_activity
      WHERE user_id = ? AND created_at >= date('now', '-7 days')
      GROUP BY day ORDER BY day ASC
    `, uid);

    const categories = await db.all(`
      SELECT category, COUNT(*) as count
      FROM notes WHERE user_id=? AND is_archived=0
      GROUP BY category ORDER BY count DESC
    `, uid);

    res.json({
      totals: { notes: totalNotes, archived: archivedNotes, words: totalWords, ai_used: aiUsed, shared: sharedNotes },
      top_tags: topTags,
      recent_notes: recentNotes,
      weekly_activity: weeklyActivity,
      categories,
    });
  } finally {
    await db.close();
  }
});

export default router;
