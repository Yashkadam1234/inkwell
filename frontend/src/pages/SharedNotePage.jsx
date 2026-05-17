// src/pages/SharedNotePage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { notesApi } from "../lib/api";
import { Tag, Spinner } from "../components/UI";

export default function SharedNotePage() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    notesApi.getShared(shareId)
      .then(r => setNote(r.data.note))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  const renderMd = (text = "") => text
    .replace(/^# (.+)$/gm, `<h1 style="font-family:var(--font-head);font-size:28px;font-weight:400;margin:24px 0 10px">$1</h1>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-family:var(--font-head);font-size:22px;font-weight:400;margin:20px 0 8px">$1</h2>`)
    .replace(/^### (.+)$/gm, `<h3 style="font-family:var(--font-head);font-size:17px;font-weight:500;margin:16px 0 6px">$1</h3>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, `<code style="font-family:var(--font-mono);font-size:13px;background:var(--paper-3);padding:1px 5px;border-radius:3px">$1</code>`)
    .replace(/^> (.+)$/gm, `<blockquote style="border-left:3px solid var(--accent);padding:6px 0 6px 14px;margin:12px 0;color:var(--ink-3);font-style:italic">$1</blockquote>`)
    .replace(/^- (.+)$/gm, `<li style="margin:4px 0">$1</li>`)
    .replace(/\n\n/g, `<p style="margin:12px 0"></p>`)
    .replace(/\n/g, "<br>");

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)" }}>
      <Spinner size={24} />
    </div>
  );

  if (error || !note) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "var(--paper)" }}>
      <span style={{ fontSize: 48, opacity: 0.3 }}>🔒</span>
      <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 400, color: "var(--ink)" }}>Note not found</h2>
      <p style={{ color: "var(--ink-4)", fontSize: 14 }}>This note is private or doesn't exist.</p>
      <Link to="/" style={{ color: "var(--accent)", fontSize: 13 }}>← Back to Inkwell</Link>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "14px 0" }}>
        <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>✦</span>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 18, color: "var(--ink)" }}>Inkwell</span>
          <span style={{ flex: 1 }} />
          <Link to="/" style={{ fontSize: 12, color: "var(--ink-4)", textDecoration: "none" }}>Open app →</Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 32px 80px" }}>
        <div className="fade-up">
          {/* Tags */}
          {note.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {note.tags.map(t => <Tag key={t} name={t} size="sm" />)}
            </div>
          )}

          {/* Title */}
          <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 400, fontSize: 38, color: "var(--ink)", lineHeight: 1.25, margin: "0 0 12px" }}>
            {note.title || "Untitled"}
          </h1>

          {/* Meta */}
          <div style={{ display: "flex", gap: 16, marginBottom: 36, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12, color: "var(--ink-4)" }}>
              By {note.author_name || "Anonymous"}
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-4)" }}>
              {new Date(note.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            {note.word_count > 0 && (
              <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{note.word_count} words · {Math.max(1, Math.round(note.word_count / 200))} min read</span>
            )}
          </div>

          {/* AI summary */}
          {note.ai?.summary && (
            <div style={{ background: "var(--accent-bg)", border: "1px solid rgba(74,63,140,0.15)", borderRadius: "var(--radius)", padding: "16px 18px", marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>✦ AI Summary</p>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>{note.ai.summary}</p>
            </div>
          )}

          {/* Note content */}
          <div
            style={{ fontSize: 16, lineHeight: 1.85, color: "var(--ink)" }}
            dangerouslySetInnerHTML={{ __html: renderMd(note.content) }}
          />
        </div>
      </div>
    </div>
  );
}
