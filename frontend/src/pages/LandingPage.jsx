// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "✦", title: "AI-powered summaries", desc: "One click generates a concise summary, extracts action items, and suggests a sharper title for your note." },
  { icon: "🗂", title: "Tags & categories", desc: "Organise notes with coloured tags and categories. Filter and search find anything in seconds." },
  { icon: "🔗", title: "Public sharing", desc: "Share any note via a unique link. Readers see a clean page — no account needed." },
  { icon: "📊", title: "Productivity insights", desc: "7-day activity chart, top tags, word count, and AI usage stats — all in your dashboard." },
  { icon: "✍", title: "Markdown editor", desc: "Write in Markdown with live preview. Headings, bold, code, blockquotes all render beautifully." },
  { icon: "💾", title: "Auto-save", desc: "Every keystroke saves automatically after 1.2 seconds. You never lose a thought." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--paper)", color: "var(--ink)", minHeight: "100vh", overflowY: "auto" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 48px", borderBottom: "1px solid var(--line)",
        background: "var(--paper)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>✦</span>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 400 }}>Inkwell</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/login")} style={{
            padding: "8px 20px", border: "1px solid var(--line-2)", borderRadius: "var(--radius)",
            background: "transparent", color: "var(--ink-2)", fontSize: 13, cursor: "pointer",
          }}>Sign in</button>
          <button onClick={() => navigate("/signup")} style={{
            padding: "8px 20px", border: "none", borderRadius: "var(--radius)",
            background: "var(--ink)", color: "var(--paper)", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>Get started free →</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign: "center", padding: "88px 24px 72px",
        backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(74,63,140,0.07) 0%, transparent 65%)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--accent-bg)", color: "var(--accent)",
          border: "1px solid rgba(74,63,140,0.2)", borderRadius: 20,
          padding: "4px 14px", fontSize: 12, fontWeight: 500, marginBottom: 28,
          letterSpacing: "0.03em",
        }}>
          ✦ AI-powered · Built for Peblo Challenge
        </div>

        <h1 style={{
          fontFamily: "var(--font-head)", fontWeight: 400,
          fontSize: "clamp(34px, 5.5vw, 58px)",
          lineHeight: 1.18, color: "var(--ink)", maxWidth: 680, margin: "0 auto 20px",
        }}>
          A smarter place for<br />
          <em style={{ color: "var(--accent)" }}>your ideas</em>
        </h1>

        <p style={{ fontSize: 17, color: "var(--ink-3)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 40px" }}>
          Inkwell is a focused notes workspace with AI built in. Write, organise, summarise, and share — all in one elegant place.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/signup")} style={{
            padding: "12px 30px", border: "none", borderRadius: "var(--radius)",
            background: "var(--ink)", color: "var(--paper)", fontSize: 15, fontWeight: 500, cursor: "pointer",
          }}>Start writing for free</button>
          <button onClick={() => navigate("/login")} style={{
            padding: "12px 30px", border: "1px solid var(--line-2)", borderRadius: "var(--radius)",
            background: "transparent", color: "var(--ink-2)", fontSize: 15, cursor: "pointer",
          }}>Sign in to workspace →</button>
        </div>
      </section>

      {/* ── App preview ── */}
      <section style={{ padding: "0 32px 72px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{
          border: "1px solid var(--line-2)", borderRadius: 16,
          overflow: "hidden", boxShadow: "0 8px 40px rgba(26,26,24,0.10)",
        }}>
          {/* Browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "var(--paper-3)", borderBottom: "1px solid var(--line)" }}>
            {["#f87171","#fbbf24","#34d399"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
            <span style={{ flex: 1, maxWidth: 200, margin: "0 auto", background: "var(--paper-2)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "var(--ink-4)", textAlign: "center", border: "1px solid var(--line)" }}>localhost:5173/workspace</span>
          </div>
          {/* App layout */}
          <div style={{ display: "flex", height: 320, background: "var(--paper)" }}>
            {/* Rail */}
            <div style={{ width: 52, background: "var(--paper-2)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 8 }}>
              <span style={{ fontSize: 16, marginBottom: 8 }}>✦</span>
              {[["📝",true],["📊",false],["🗂",false]].map(([icon, active], i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: active ? "var(--accent-bg)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</div>
              ))}
            </div>
            {/* Note list */}
            <div style={{ width: 220, background: "var(--paper-2)", borderRight: "1px solid var(--line)", overflow: "hidden" }}>
              <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: "100%", padding: "6px 10px", background: "var(--ink)", color: "var(--paper)", borderRadius: 6, fontSize: 12, textAlign: "center", fontWeight: 500 }}>+ New note</div>
              </div>
              {[
                { title: "Sprint Planning", tag: "✦ AI", tagColor: "var(--accent)", time: "2h ago", active: true },
                { title: "Book Notes — Atomic Habits", tag: "shared", tagColor: "var(--success)", time: "5h ago", active: false },
                { title: "Ideas for Q3", tag: null, time: "1d ago", active: false },
              ].map((n, i) => (
                <div key={i} style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", borderLeft: n.active ? "2px solid var(--accent)" : "2px solid transparent", background: n.active ? "var(--accent-bg)" : "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontFamily: "var(--font-head)", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{n.title}</span>
                    <span style={{ fontSize: 10, color: "var(--ink-4)", flexShrink: 0 }}>{n.time}</span>
                  </div>
                  {n.tag && <span style={{ fontSize: 9, background: n.tagColor + "18", color: n.tagColor, borderRadius: 8, padding: "1px 6px" }}>{n.tag}</span>}
                </div>
              ))}
            </div>
            {/* Editor */}
            <div style={{ flex: 1, padding: "22px 28px", overflow: "hidden" }}>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 400, fontSize: 22, margin: "0 0 6px", color: "var(--ink)" }}>Sprint Planning</h2>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {["work","sprint","planning"].map(t => (
                  <span key={t} style={{ fontSize: 10, background: "var(--accent-bg)", color: "var(--accent)", borderRadius: 20, padding: "2px 8px" }}>{t}</span>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 16 }}>
                This sprint focuses on the onboarding redesign. Team assignments are confirmed…
              </p>
              <div style={{ background: "var(--accent-bg)", border: "1px solid rgba(74,63,140,0.15)", borderRadius: 8, padding: "10px 12px" }}>
                <p style={{ fontSize: 10, fontWeight: 500, color: "var(--accent)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>✦ AI Insights</p>
                <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>Sprint planning covering Q2 goals, UI and API team tasks, and a May 30th deadline.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "48px 32px 72px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 400, fontSize: 32, textAlign: "center", marginBottom: 8, color: "var(--ink)" }}>
          Everything you need, nothing you don't
        </h2>
        <p style={{ textAlign: "center", color: "var(--ink-4)", fontSize: 15, marginBottom: 44 }}>Six core features that cover every requirement of a modern notes workspace.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={{ background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
              <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 400, fontSize: 16, margin: "0 0 8px", color: "var(--ink)" }}>{title}</h3>
              <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ margin: "0 32px 72px", maxWidth: 820, marginLeft: "auto", marginRight: "auto", background: "var(--ink)", borderRadius: 16, padding: "48px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 400, fontSize: 30, color: "var(--paper)", margin: "0 0 10px" }}>Ready to start writing?</h2>
        <p style={{ fontSize: 15, color: "rgba(245,243,238,0.55)", marginBottom: 28 }}>Free forever. No credit card required.</p>
        <button onClick={() => navigate("/signup")} style={{ padding: "12px 32px", border: "none", borderRadius: "var(--radius)", background: "var(--paper)", color: "var(--ink)", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
          Create your workspace →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--line)", padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>✦</span>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 14, color: "var(--ink-3)" }}>Inkwell</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--ink-4)", margin: 0 }}>Peblo Full Stack Developer Challenge · 2026</p>
      </footer>
    </div>
  );
}
