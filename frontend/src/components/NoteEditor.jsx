// src/components/NoteEditor.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../lib/store";
import { aiApi } from "../lib/api";
import { Tag, Btn, Spinner } from "./UI";

const CATEGORIES = ["general","work","personal","learning","ideas","journal"];

function renderMarkdown(text = "") {
  return text
    .replace(/^### (.+)$/gm, `<h3 style="font-family:var(--font-head);font-size:16px;font-weight:500;margin:16px 0 6px;color:var(--ink)">$1</h3>`)
    .replace(/^## (.+)$/gm,  `<h2 style="font-family:var(--font-head);font-size:20px;font-weight:400;margin:20px 0 8px;color:var(--ink)">$1</h2>`)
    .replace(/^# (.+)$/gm,   `<h1 style="font-family:var(--font-head);font-size:26px;font-weight:400;margin:24px 0 10px;color:var(--ink)">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,     "<em>$1</em>")
    .replace(/`(.+?)`/g, `<code style="font-family:var(--font-mono);font-size:13px;background:var(--paper-3);padding:1px 5px;border-radius:3px">$1</code>`)
    .replace(/^> (.+)$/gm, `<blockquote style="border-left:3px solid var(--accent);padding:6px 0 6px 14px;margin:12px 0;color:var(--ink-3);font-style:italic">$1</blockquote>`)
    .replace(/^- (.+)$/gm, `<li style="margin:3px 0;padding-left:4px">$1</li>`)
    .replace(/\n\n/g, `<p style="margin:10px 0"></p>`)
    .replace(/\n/g, "<br>");
}

export default function NoteEditor() {
  const { activeNote, updateNote, deleteNote, addToast, setSidebarView } = useStore();

  const [title,     setTitle]     = useState("");
  const [content,   setContent]   = useState("");
  const [tags,      setTags]      = useState([]);
  const [category,  setCategory]  = useState("general");
  const [tagInput,  setTagInput]  = useState("");
  const [preview,   setPreview]   = useState(false);
  const [aiResult,  setAiResult]  = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const saveTimer = useRef(null);
  const noteId    = activeNote?.id;

  useEffect(() => {
    if (!activeNote) return;
    setTitle(activeNote.title || "");
    setContent(activeNote.content || "");
    setTags(activeNote.tags || []);
    setCategory(activeNote.category || "general");
    setAiResult(activeNote.ai || null);
    setPreview(false);
  }, [noteId]);

  const autoSave = useCallback((t, c, tg, cat) => {
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      try { await updateNote(noteId, { title:t, content:c, tags:tg, category:cat }); }
      finally { setSaving(false); }
    }, 1200);
  }, [noteId, updateNote]);

  const handleTitle    = v => { setTitle(v);    autoSave(v, content, tags, category); };
  const handleContent  = v => { setContent(v);  autoSave(title, v, tags, category); };
  const handleCategory = v => { setCategory(v); autoSave(title, content, tags, v); };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g,"-");
    if (t && !tags.includes(t) && tags.length < 8) {
      const next = [...tags, t];
      setTags(next);
      autoSave(title, content, next, category);
    }
    setTagInput("");
  };

  const removeTag = t => {
    const next = tags.filter(x => x !== t);
    setTags(next);
    autoSave(title, content, next, category);
  };

  const forceSave = useCallback(async () => {
    clearTimeout(saveTimer.current);
    setSaving(true);
    try { await updateNote(noteId, { title, content, tags, category }); }
    finally { setSaving(false); }
  }, [noteId, title, content, tags, category, updateNote]);

  const generateAI = useCallback(async () => {
    if (!content.trim()) { addToast("Add some content first", "error"); return; }
    setAiLoading(true);
    try {
      const { data } = await aiApi.generate(noteId);
      setAiResult(data);
      if (!title || title === "Untitled") handleTitle(data.suggested_title);
      addToast("✦ AI analysis complete", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "AI error — try again", "error");
    } finally { setAiLoading(false); }
  }, [noteId, content, title, addToast]);

  // ── Editor keyboard shortcuts ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "s") { e.preventDefault(); forceSave(); }                        // Ctrl+S save
      if (e.key === "p") { e.preventDefault(); setPreview(v => !v); }               // Ctrl+P preview
      if (e.key === "Enter") { e.preventDefault(); generateAI(); }                   // Ctrl+Enter AI
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [forceSave, generateAI]);

  const handleShare = async () => {
    const next = !activeNote.is_public;
    await updateNote(noteId, { is_public: next });
    if (next) {
      const url = `${window.location.origin}/shared/${activeNote.share_id}`;
      navigator.clipboard?.writeText(url).catch(() => {});
      addToast("Share link copied!", "success");
    } else {
      addToast("Note is now private", "info");
    }
  };

  const handleArchive = async () => {
    const going = !activeNote.is_archived;
    await updateNote(noteId, { is_archived: going });
    addToast(going ? "Note archived" : "Note restored", "success");
    setSidebarView(going ? "archive" : "notes");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this note permanently?")) return;
    await deleteNote(noteId);
    addToast("Note deleted", "info");
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime  = Math.max(1, Math.round(wordCount/200));

  if (!activeNote) return null;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--paper)" }}>

      {/* Toolbar */}
      <div style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"10px 20px", borderBottom:"1px solid var(--line)",
        flexWrap:"wrap", flexShrink:0,
      }}>
        <select value={category} onChange={e => handleCategory(e.target.value)} style={{
          padding:"5px 8px", border:"1px solid var(--line-2)",
          borderRadius:"var(--radius-sm)", fontSize:12,
          color:"var(--ink-3)", background:"var(--paper-2)", cursor:"pointer",
        }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <span style={{ flex:1 }} />

        <span style={{ fontSize:11, color:"var(--ink-4)", fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:5 }}>
          {saving ? <><Spinner size={10} /> saving…</> : `${wordCount}w · ${readTime}min`}
        </span>

        <Btn size="sm" variant="ghost" onClick={() => setPreview(v=>!v)} title="Toggle preview (Ctrl+P)">
          {preview ? "Edit" : "Preview"}
        </Btn>
        <Btn size="sm" variant="ghost" onClick={handleShare}
          style={{ color: activeNote.is_public ? "var(--success)" : "var(--ink-3)" }}>
          {activeNote.is_public ? "🔗 Shared" : "Share"}
        </Btn>
        <Btn size="sm" variant="ghost" onClick={handleArchive}>
          {activeNote.is_archived ? "Restore" : "Archive"}
        </Btn>
        <Btn size="sm" variant="danger" onClick={handleDelete}>Delete</Btn>
      </div>

      {/* Title */}
      <div style={{ padding:"20px 28px 0", flexShrink:0 }}>
        <input value={title} onChange={e => handleTitle(e.target.value)} placeholder="Note title…" style={{
          width:"100%", border:"none", outline:"none", background:"transparent",
          fontFamily:"var(--font-head)", fontSize:30, fontWeight:400,
          color:"var(--ink)", lineHeight:1.3,
        }} />
      </div>

      {/* Tags */}
      <div style={{
        padding:"10px 28px", display:"flex", flexWrap:"wrap", gap:6, alignItems:"center",
        borderBottom:"1px solid var(--line)", flexShrink:0,
      }}>
        {tags.map(t => <Tag key={t} name={t} onRemove={() => removeTag(t)} />)}
        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter"||e.key===",") { e.preventDefault(); addTag(); } }}
          placeholder={tags.length < 8 ? "Add tag, press Enter…" : "Max 8 tags"}
          disabled={tags.length >= 8}
          style={{ border:"none", outline:"none", background:"transparent", fontSize:12, color:"var(--ink-3)", minWidth:80 }}
        />
      </div>

      {/* Editor / Preview */}
      <div style={{ flex:1, overflow:"auto", padding:"20px 28px" }}>
        {preview ? (
          <div style={{ fontSize:15, lineHeight:1.85, color:"var(--ink)", maxWidth:680 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        ) : (
          <textarea value={content} onChange={e => handleContent(e.target.value)}
            placeholder={"Start writing…\n\nMarkdown supported:\n# Heading  **bold**  *italic*  `code`\n> blockquote\n- list item\n\nCtrl+S to save · Ctrl+Enter for AI · Ctrl+P for preview"}
            style={{
              width:"100%", height:"100%", minHeight:200,
              border:"none", outline:"none", background:"transparent",
              resize:"none", fontFamily:"var(--font-body)",
              fontSize:15, lineHeight:1.85, color:"var(--ink)", maxWidth:680,
            }}
          />
        )}
      </div>

      {/* AI Panel */}
      <div style={{ borderTop:"1px solid var(--line)", padding:"14px 20px", flexShrink:0 }}>
        <Btn size="sm" variant="ghost" onClick={generateAI} loading={aiLoading}
          style={{ marginBottom: aiResult ? 12 : 0 }}
          title="Generate AI summary (Ctrl+Enter)">
          ✦ {aiResult ? "Regenerate AI Summary" : "Generate AI Summary"}
          {!aiLoading && <span style={{ opacity:0.45, fontSize:10, fontFamily:"var(--font-mono)", marginLeft:4 }}>⌘↵</span>}
        </Btn>

        {aiResult && (
          <div className="fade-in" style={{
            background:"var(--accent-bg)", border:"1px solid rgba(74,63,140,0.15)",
            borderRadius:"var(--radius)", padding:"14px 16px",
          }}>
            <p style={{ fontSize:11, fontWeight:500, color:"var(--accent)", marginBottom:8, letterSpacing:"0.06em", textTransform:"uppercase" }}>
              ✦ AI Insights
            </p>
            <p style={{ fontSize:13, color:"var(--ink-2)", lineHeight:1.65, marginBottom: aiResult.action_items?.length ? 10 : 0 }}>
              {aiResult.summary}
            </p>
            {aiResult.action_items?.length > 0 && (
              <>
                <p style={{ fontSize:11, fontWeight:500, color:"var(--ink-3)", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Action items</p>
                <ul style={{ paddingLeft:16, margin:"0 0 10px" }}>
                  {aiResult.action_items.map((a,i) => <li key={i} style={{ fontSize:13, color:"var(--ink-2)", marginBottom:3 }}>{a}</li>)}
                </ul>
              </>
            )}
            {aiResult.key_topics?.length > 0 && (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {aiResult.key_topics.map(t => (
                  <span key={t} style={{ fontSize:10, background:"var(--accent)", color:"#fff", borderRadius:20, padding:"2px 8px", opacity:0.85 }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
