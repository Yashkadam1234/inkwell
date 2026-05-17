// routes/ai.js
import { Router } from "express";
import { nanoid } from "nanoid";
import { getDb } from "../db/init.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /ai/generate/:noteId
router.post("/generate/:noteId", requireAuth, async (req, res) => {
  const db = await getDb();

  try {
    const note = await db.get(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      req.params.noteId,
      req.user.id
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (!note.content?.trim()) {
      return res.status(400).json({ error: "Note has no content to analyse" });
    }

    const prompt = `You are an intelligent note analysis assistant.
Analyse the note below and respond with ONLY valid JSON — no markdown, no code fences, no explanation.

The JSON must have exactly these keys:
- summary: string (2-3 concise sentences summarising the note)
- action_items: array of strings (max 5 items)
- suggested_title: string (under 60 characters)
- key_topics: array of strings (3-5 items)

Note:
Title: ${note.title}
Content:
${note.content.slice(0, 3000)}`;

    // ✅ DIRECT REST API CALL (NO SDK → NO v1beta ISSUES)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Gemini API request failed");
    }

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new Error("Empty response from Gemini");
    }

    // Clean possible markdown formatting
    const cleaned = raw.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    const genId = "AI_" + nanoid(8);

    await db.run(
      `INSERT INTO ai_generations 
      (id, note_id, user_id, summary, action_items, suggested_title, tokens_used)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      genId,
      req.params.noteId,
      req.user.id,
      parsed.summary,
      JSON.stringify(parsed.action_items || []),
      parsed.suggested_title,
      0
    );

    res.json({
      summary: parsed.summary,
      action_items: parsed.action_items || [],
      suggested_title: parsed.suggested_title,
      key_topics: parsed.key_topics || [],
    });
  } catch (err) {
    console.error("AI generation error:", err.message);
    res.status(500).json({
      error: "AI generation failed",
      detail: err.message,
    });
  } finally {
    await db.close();
  }
});

// GET /ai/stats
router.get("/stats", requireAuth, async (req, res) => {
  const db = await getDb();

  try {
    const { c: totalGenerations } = await db.get(
      "SELECT COUNT(*) as c FROM ai_generations WHERE user_id = ?",
      req.user.id
    );

    const recent = await db.all(
      `SELECT ag.*, n.title as note_title 
       FROM ai_generations ag
       LEFT JOIN notes n ON n.id = ag.note_id
       WHERE ag.user_id = ? 
       ORDER BY ag.created_at DESC 
       LIMIT 5`,
      req.user.id
    );

    res.json({
      total_generations: totalGenerations,
      total_tokens: 0,
      recent,
    });
  } finally {
    await db.close();
  }
});

export default router;