// src/components/Sidebar.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { Tag, Spinner, tagColor } from "./UI";

function NoteCard({ note, active, onClick }) {
  const fmtDate = (iso) => {
    const d = new Date(iso), diff = Date.now() - d;
    if (diff < 60000)    return "just now";
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return d.toLocaleDateString("en-GB", { day:"numeric", month:"short" });
  };
  return (
    <div onClick={onClick} style={{
      padding: "12px 16px", borderBottom: "1px solid var(--line)", cursor: "pointer",
      background: active ? "var(--accent-bg)" : "transparent",
      borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
      transition: "background 0.15s",
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--paper-3)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:3, alignItems:"flex-start" }}>
        <p className="truncate" style={{ fontFamily:"var(--font-head)", fontWeight:400, fontSize:14, color:"var(--ink)", margin:0, lineHeight:1.3, flex:1 }}>
          {note.title || "Untitled"}
        </p>
        <span style={{ fontSize:10, color:"var(--ink-4)", whiteSpace:"nowrap", flexShrink:0, marginTop:2 }}>
          {fmtDate(note.updated_at)}
        </span>
      </div>
      <p className="truncate" style={{ fontSize:12, color:"var(--ink-4)", margin:"0 0 7px", lineHeight:1.4 }}>
        {note.content?.slice(0,65) || "Empty note…"}
      </p>
      <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
        {note.ai       && <span style={{ fontSize:10, background:"var(--accent-bg)", color:"var(--accent)", borderRadius:10, padding:"1px 6px", fontWeight:500 }}>✦ AI</span>}
        {note.is_public && <span style={{ fontSize:10, background:"var(--success-bg)", color:"var(--success)", borderRadius:10, padding:"1px 6px" }}>shared</span>}
        {(note.tags||[]).slice(0,2).map(t => <Tag key={t} name={t} size="sm" />)}
        {(note.tags||[]).length > 2 && <span style={{ fontSize:10, color:"var(--ink-4)" }}>+{note.tags.length-2}</span>}
      </div>
    </div>
  );
}

const NAV = [
  { key:"notes",    icon:"📝", label:"Notes"    },
  { key:"insights", icon:"📊", label:"Insights" },
  { key:"archive",  icon:"🗂", label:"Archive"  },
];

export default function Sidebar() {
  const {
    notes, activeNote, setActiveNote, createNote,
    fetchNotes, notesLoading, sidebarView, setSidebarView,
    user, logout, addToast, darkMode, toggleDark,
  } = useStore();

  const navigate = useNavigate();
  const [search,    setSearch]    = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [sortBy,    setSortBy]    = useState("updated");
  const [showUser,  setShowUser]  = useState(false);
  const [showHelp,  setShowHelp]  = useState(false);

  useEffect(() => {
    fetchNotes({ archived: sidebarView === "archive", sort: sortBy });
    setFilterTag("");
  }, [sidebarView, sortBy]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchNotes({ search, tag: filterTag, archived: sidebarView === "archive", sort: sortBy });
    }, 300);
    return () => clearTimeout(t);
  }, [search, filterTag]);

  // ── Global keyboard shortcuts ──────────────────────────────
  const handleNew = useCallback(async () => {
    try {
      if (sidebarView === "archive") setSidebarView("notes");
      await createNote();
    } catch { addToast("Could not create note", "error"); }
  }, [sidebarView, createNote, setSidebarView, addToast]);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Cmd/Ctrl + N → new note (works even when typing)
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleNew();
        return;
      }
      // Cmd/Ctrl + D → toggle dark mode
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        toggleDark();
        return;
      }
      // Cmd/Ctrl + / → show shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowHelp(v => !v);
        return;
      }
      if (typing) return; // below shortcuts don't fire while typing

      // 1 / 2 / 3 → switch views
      if (e.key === "1") { setSidebarView("notes");    setActiveNote(null); }
      if (e.key === "2") { setSidebarView("insights"); setActiveNote(null); }
      if (e.key === "3") { setSidebarView("archive");  setActiveNote(null); }
      // Escape → deselect note
      if (e.key === "Escape") setActiveNote(null);
      // F → focus search
      if (e.key === "f" || e.key === "F") {
        document.getElementById("note-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNew, toggleDark, setSidebarView, setActiveNote]);

  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];
  const handleLogout = () => { logout(); setShowUser(false); navigate("/"); };
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";

  return (
    <>
      {/* ── Keyboard shortcuts help overlay ── */}
      {showHelp && (
        <div onClick={() => setShowHelp(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:999,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <div onClick={e => e.stopPropagation()} className="fade-in" style={{
            background:"var(--paper)", border:"1px solid var(--line-2)",
            borderRadius:"var(--radius-lg)", padding:"28px 32px", width:340,
            boxShadow:"var(--shadow)",
          }}>
            <h3 style={{ fontFamily:"var(--font-head)", fontWeight:400, fontSize:20, margin:"0 0 18px", color:"var(--ink)" }}>
              Keyboard shortcuts
            </h3>
            {[
              ["Ctrl/⌘ + N", "New note"],
              ["Ctrl/⌘ + D", "Toggle dark mode"],
              ["Ctrl/⌘ + /", "Show this help"],
              ["1 / 2 / 3",  "Switch Notes / Insights / Archive"],
              ["F",          "Focus search"],
              ["Escape",     "Deselect note"],
            ].map(([key, desc]) => (
              <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--line)" }}>
                <span style={{ fontSize:13, color:"var(--ink-2)" }}>{desc}</span>
                <kbd style={{ fontSize:11, background:"var(--paper-3)", border:"1px solid var(--line-2)", borderRadius:5, padding:"3px 8px", fontFamily:"var(--font-mono)", color:"var(--ink-3)" }}>{key}</kbd>
              </div>
            ))}
            <button onClick={() => setShowHelp(false)} style={{ marginTop:18, width:"100%", padding:"8px 0", border:"1px solid var(--line-2)", borderRadius:"var(--radius)", background:"transparent", color:"var(--ink-3)", fontSize:13, cursor:"pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Nav rail ── */}
      <div style={{
        width:56, flexShrink:0,
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"14px 0 12px", gap:2,
        borderRight:"1px solid var(--line)",
        background:"var(--paper-2)", height:"100%",
      }}>
        <div style={{ fontSize:20, marginBottom:14, opacity:0.75 }}>✦</div>

        {NAV.map(({ key, icon, label }) => (
          <button key={key} title={`${label} (${NAV.indexOf(NAV.find(n=>n.key===key))+1})`}
            onClick={() => { setSidebarView(key); setActiveNote(null); }}
            style={{
              width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center",
              border:"none", borderRadius:"var(--radius)", fontSize:18, cursor:"pointer",
              background: sidebarView === key ? "var(--accent-bg)" : "transparent",
              outline: sidebarView === key ? "1px solid rgba(74,63,140,0.2)" : "none",
              transition:"background 0.15s",
            }}
          >{icon}</button>
        ))}

        <div style={{ flex:1 }} />

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          title="Toggle dark mode (Ctrl+D)"
          style={{
            width:34, height:34, borderRadius:"var(--radius)", border:"1px solid var(--line-2)",
            background:"transparent", fontSize:15, cursor:"pointer", marginBottom:6,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
        >{darkMode ? "☀️" : "🌙"}</button>

        {/* Shortcuts help */}
        <button
          onClick={() => setShowHelp(true)}
          title="Keyboard shortcuts (Ctrl+/)"
          style={{
            width:34, height:34, borderRadius:"var(--radius)", border:"1px solid var(--line-2)",
            background:"transparent", fontSize:13, cursor:"pointer", marginBottom:6,
            color:"var(--ink-3)", fontFamily:"var(--font-mono)",
          }}
        >?</button>

        {/* User avatar */}
        <div style={{ position:"relative" }}>
          <button onClick={() => setShowUser(v => !v)} title={user?.name} style={{
            width:34, height:34, borderRadius:"50%", border:"none", cursor:"pointer",
            background:"var(--accent)", color:"#fff", fontSize:12, fontWeight:600,
          }}>{initials}</button>
          {showUser && (
            <div className="fade-in" style={{
              position:"absolute", bottom:42, left:0,
              background:"var(--paper)", border:"1px solid var(--line-2)",
              borderRadius:"var(--radius)", padding:4, width:160,
              boxShadow:"var(--shadow)", zIndex:200,
            }}>
              <p style={{ fontSize:12, color:"var(--ink-3)", padding:"6px 10px", borderBottom:"1px solid var(--line)", margin:0 }}>{user?.name}</p>
              <p style={{ fontSize:11, color:"var(--ink-4)", padding:"4px 10px 6px", margin:0, borderBottom:"1px solid var(--line)" }}>{user?.email}</p>
              <button onClick={handleLogout} style={{ width:"100%", padding:"8px 10px", border:"none", background:"none", textAlign:"left", fontSize:12, color:"var(--danger)", cursor:"pointer" }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Note list ── */}
      {sidebarView !== "insights" && (
        <div style={{
          width:268, flexShrink:0,
          display:"flex", flexDirection:"column",
          borderRight:"1px solid var(--line)",
          background:"var(--paper-2)", height:"100%",
        }}>
          <div style={{ padding:"10px 12px 8px", borderBottom:"1px solid var(--line)", display:"flex", flexDirection:"column", gap:8 }}>
            <button onClick={handleNew} style={{
              width:"100%", padding:"8px 0", border:"none",
              borderRadius:"var(--radius)", background:"var(--ink)",
              color:"var(--paper)", fontSize:13, fontWeight:500, cursor:"pointer",
            }}>
              + New note <span style={{ opacity:0.5, fontSize:11, fontFamily:"var(--font-mono)" }}>⌘N</span>
            </button>
            <input
              id="note-search"
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes… (F)"
              style={{
                width:"100%", padding:"7px 10px",
                border:"1px solid var(--line-2)", borderRadius:"var(--radius)",
                fontSize:13, background:"var(--paper)", outline:"none", color:"var(--ink)",
              }}
            />
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:11, color:"var(--ink-4)", flexShrink:0 }}>Sort:</span>
              {[{val:"updated",label:"Last edited"},{val:"created",label:"Created"}].map(s => (
                <button key={s.val} onClick={() => setSortBy(s.val)} style={{
                  fontSize:11, padding:"3px 9px",
                  border:"1px solid var(--line-2)", borderRadius:20,
                  background: sortBy===s.val ? "var(--ink)" : "transparent",
                  color: sortBy===s.val ? "var(--paper)" : "var(--ink-3)",
                  cursor:"pointer",
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          {allTags.length > 0 && (
            <div style={{ padding:"7px 12px 5px", display:"flex", flexWrap:"wrap", gap:4, borderBottom:"1px solid var(--line)" }}>
              {filterTag && (
                <button onClick={() => setFilterTag("")} style={{ fontSize:10, padding:"2px 8px", border:"1px solid var(--line-2)", borderRadius:20, background:"transparent", color:"var(--ink-4)", cursor:"pointer" }}>
                  Clear ×
                </button>
              )}
              {allTags.slice(0,10).map(t => (
                <button key={t} onClick={() => setFilterTag(filterTag===t ? "" : t)} style={{
                  display:"flex", alignItems:"center", gap:4, padding:"2px 8px",
                  border: filterTag===t ? `1px solid ${tagColor(t)}55` : "1px solid var(--line)",
                  borderRadius:20,
                  background: filterTag===t ? tagColor(t)+"15" : "transparent",
                  color: filterTag===t ? tagColor(t) : "var(--ink-4)",
                  fontSize:10, cursor:"pointer",
                }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:tagColor(t), flexShrink:0 }} />
                  {t}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding:"5px 14px 3px" }}>
            <span style={{ fontSize:10, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:"0.07em" }}>
              {sidebarView==="archive" ? "Archived" : "Notes"}
              {filterTag ? ` · #${filterTag}` : ""}
              {" "}({notes.length})
            </span>
          </div>

          <div style={{ flex:1, overflowY:"auto" }}>
            {notesLoading ? (
              <div style={{ padding:24, display:"flex", justifyContent:"center" }}><Spinner /></div>
            ) : notes.length === 0 ? (
              <div style={{ padding:"36px 16px", textAlign:"center" }}>
                <p style={{ fontSize:28, opacity:0.2, marginBottom:8 }}>✦</p>
                <p style={{ fontSize:13, color:"var(--ink-4)" }}>
                  {search ? "No notes match" : sidebarView==="archive" ? "Nothing archived yet" : "Create your first note"}
                </p>
              </div>
            ) : notes.map(note => (
              <NoteCard key={note.id} note={note}
                active={activeNote?.id === note.id}
                onClick={() => setActiveNote(note)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
