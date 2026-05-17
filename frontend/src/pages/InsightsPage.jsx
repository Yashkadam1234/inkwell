// src/pages/InsightsPage.jsx
import { useState, useEffect } from "react";
import { insightsApi, aiApi } from "../lib/api";
import { useStore } from "../lib/store";
import { Spinner, Tag, tagColor } from "../components/UI";

function StatCard({ label, value, unit, accent }) {
  return (
    <div style={{
      background: "var(--paper-2)", border: "1px solid var(--line)",
      borderRadius: "var(--radius)", padding: "16px 18px",
    }}>
      <p style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-head)", fontSize: 30, fontWeight: 400, color: accent || "var(--ink)", margin: 0 }}>
        {value}
      </p>
      {unit && <p style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4, margin: "4px 0 0" }}>{unit}</p>}
    </div>
  );
}

export default function InsightsPage() {
  const { user } = useStore();
  const [data,    setData]    = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ins, ai] = await Promise.all([insightsApi.get(), aiApi.stats()]);
        setData(ins.data);
        setAiStats(ai.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner size={24} />
    </div>
  );

  if (!data) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Could not load insights.</p>
    </div>
  );

  const { totals, top_tags, recent_notes, weekly_activity, categories } = data;
  const maxActivity = Math.max(...(weekly_activity || []).map(d => d.count), 1);

  // Fill last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const found = (weekly_activity || []).find(w => w.day === key);
    return {
      day: key,
      count: found?.count || 0,
      label: d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2),
    };
  });

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      padding: "32px 36px",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 400, fontSize: 28, color: "var(--ink)", margin: "0 0 4px" }}>
          Your workspace ✦
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-4)", margin: 0 }}>
          Productivity insights for {user?.name}
        </p>
      </div>

      {/* Stats — 6 cards in a responsive grid, all on same rows */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        marginBottom: 24,
      }}>
        <StatCard label="Active notes"  value={totals.notes} />
        <StatCard label="AI summaries"  value={totals.ai_used} accent="var(--accent)"
          unit={totals.notes ? `${Math.round(totals.ai_used / totals.notes * 100)}% of notes` : "0% of notes"} />
        <StatCard label="Words written" value={(totals.words || 0).toLocaleString()} />
        <StatCard label="Shared notes"  value={totals.shared} accent="var(--success)" />
        <StatCard label="Archived"      value={totals.archived} />
        <StatCard label="Unique tags"   value={(top_tags || []).length} />
      </div>

      {/* 7-day activity bar chart */}
      <div style={{
        background: "var(--paper-2)", border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)", padding: "20px 22px", marginBottom: 16,
      }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          7-day activity
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {last7.map(({ day, count, label }) => {
            const h = count ? Math.max(6, (count / maxActivity) * 72) : 4;
            return (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  title={`${day}: ${count} edit${count !== 1 ? "s" : ""}`}
                  style={{
                    width: "100%", height: h,
                    background: count > 0 ? "var(--accent)" : "var(--paper-3)",
                    borderRadius: 4, transition: "height 0.4s ease",
                    opacity: count > 0 ? 0.7 + (count / maxActivity) * 0.3 : 1,
                  }}
                />
                <span style={{ fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tags + Categories side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* Most-used tags */}
        <div style={{
          background: "var(--paper-2)", border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)", padding: "18px 20px",
        }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Most-used tags
          </p>
          {!top_tags?.length ? (
            <p style={{ fontSize: 13, color: "var(--ink-4)" }}>No tags yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {top_tags.map(({ name, count }) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag name={name} size="sm" />
                  <div style={{ flex: 1, height: 3, background: "var(--paper-3)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${(count / top_tags[0].count) * 100}%`, height: "100%", background: tagColor(name), borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", minWidth: 16, textAlign: "right" }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By category */}
        <div style={{
          background: "var(--paper-2)", border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)", padding: "18px 20px",
        }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            By category
          </p>
          {!categories?.length ? (
            <p style={{ fontSize: 13, color: "var(--ink-4)" }}>No notes yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.map(({ category, count }) => (
                <div key={category} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)", width: 72, flexShrink: 0 }}>{category}</span>
                  <div style={{ flex: 1, height: 3, background: "var(--paper-3)", borderRadius: 2 }}>
                    <div style={{ width: `${(count / categories[0].count) * 100}%`, height: "100%", background: "var(--gold)", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", minWidth: 16, textAlign: "right" }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI stats */}
      {aiStats && (
        <div style={{
          background: "var(--accent-bg)", border: "1px solid rgba(74,63,140,0.15)",
          borderRadius: "var(--radius-lg)", padding: "18px 20px", marginBottom: 16,
        }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ✦ AI usage
          </p>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <p style={{ fontFamily: "var(--font-head)", fontSize: 26, color: "var(--accent)", margin: 0 }}>{aiStats.total_generations}</p>
              <p style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>total generations</p>
            </div>
          </div>
        </div>
      )}

      {/* Recently edited */}
      {recent_notes?.length > 0 && (
        <div style={{
          background: "var(--paper-2)", border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)", padding: "18px 20px",
          marginBottom: 32,
        }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Recently edited
          </p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recent_notes.map((n, i) => (
              <div key={n.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "9px 0",
                borderBottom: i < recent_notes.length - 1 ? "1px solid var(--line)" : "none",
              }}>
                <span style={{ fontFamily: "var(--font-head)", fontSize: 14, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {n.title || "Untitled"}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                  {n.word_count}w
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-4)", flexShrink: 0 }}>
                  {new Date(n.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
