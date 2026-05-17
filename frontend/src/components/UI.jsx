// src/components/UI.jsx — shared design system components
import { useEffect } from "react";
import { useStore } from "../lib/store";

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = "var(--ink-3)" }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid ${color}33`, borderTopColor: color,
      borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0
    }} />
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "ghost", size = "md", disabled, loading, onClick, style = {}, ...rest }) {
  const sizes = { sm: "6px 12px", md: "8px 16px", lg: "11px 22px" };
  const variants = {
    primary: { background: "var(--ink)", color: "var(--paper)", border: "none" },
    ghost: { background: "transparent", color: "var(--ink-2)", border: "1px solid var(--line-2)" },
    accent: { background: "var(--accent)", color: "#fff", border: "none" },
    danger: { background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid rgba(153,31,31,0.2)" },
    success: { background: "var(--success-bg)", color: "var(--success)", border: "1px solid rgba(26,107,58,0.2)" },
  };
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...variants[variant], padding: sizes[size], borderRadius: "var(--radius)",
        fontSize: size === "sm" ? 12 : 13, fontWeight: 400, display: "inline-flex",
        alignItems: "center", gap: 6, transition: "opacity 0.15s, transform 0.1s",
        opacity: (disabled || loading) ? 0.55 : 1, cursor: (disabled || loading) ? "not-allowed" : "pointer",
        whiteSpace: "nowrap", ...style
      }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={e => e.currentTarget.style.transform = ""}
      onMouseLeave={e => e.currentTarget.style.transform = ""}
      {...rest}
    >
      {loading && <Spinner size={12} color="currentColor" />}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{label}</label>}
      <input
        style={{
          padding: "9px 12px", border: `1px solid ${error ? "var(--danger)" : "var(--line-2)"}`,
          borderRadius: "var(--radius)", fontSize: 14, color: "var(--ink)", background: "var(--paper-2)",
          outline: "none", transition: "border-color 0.15s", width: "100%", ...style
        }}
        onFocus={e => !error && (e.target.style.borderColor = "var(--accent)")}
        onBlur={e => !error && (e.target.style.borderColor = "var(--line-2)")}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: "var(--danger)" }}>{error}</span>}
    </div>
  );
}

// ── Tag Pill ──────────────────────────────────────────────────────────────────
const TAG_PALETTE = ["#4a3f8c","#1a6b3a","#8c3f3f","#3f6b8c","#6b3f8c","#8c6b3f","#3f8c6b","#8c3f6b"];
export const tagColor = (name) => TAG_PALETTE[name.charCodeAt(0) % TAG_PALETTE.length];

export function Tag({ name, onRemove, size = "md" }) {
  const c = tagColor(name);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c + "15", color: c, border: `1px solid ${c}33`,
      borderRadius: 20, padding: size === "sm" ? "2px 8px" : "3px 10px",
      fontSize: size === "sm" ? 11 : 12, fontWeight: 500, whiteSpace: "nowrap"
    }}>
      {name}
      {onRemove && (
        <span onClick={onRemove} style={{ cursor: "pointer", opacity: 0.6, lineHeight: 1, fontSize: 14 }}>×</span>
      )}
    </span>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
export function ToastStack() {
  const toasts = useStore(s => s.toasts);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => {
        const colors = {
          success: ["var(--success-bg)", "var(--success)", "rgba(26,107,58,0.25)"],
          error:   ["var(--danger-bg)",  "var(--danger)",  "rgba(153,31,31,0.25)"],
          info:    ["var(--accent-bg)",  "var(--accent)",  "rgba(74,63,140,0.25)"],
        };
        const [bg, fg, border] = colors[t.type] || colors.info;
        return (
          <div key={t.id} className="fade-up" style={{
            background: bg, color: fg, border: `1px solid ${border}`,
            borderRadius: "var(--radius)", padding: "10px 16px", fontSize: 13,
            fontWeight: 500, maxWidth: 300, backdropFilter: "blur(8px)"
          }}>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function Empty({ icon = "✦", title, subtitle, action }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: 40 }}>
      <span style={{ fontSize: 40, opacity: 0.25 }}>{icon}</span>
      <p style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 400, color: "var(--ink-3)", textAlign: "center" }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: "var(--ink-4)", textAlign: "center" }}>{subtitle}</p>}
      {action}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, ...rest }) {
  return (
    <div style={{
      background: "var(--paper)", border: "1px solid var(--line)",
      borderRadius: "var(--radius-lg)", padding: "20px 22px",
      boxShadow: "var(--shadow)", ...style
    }} {...rest}>
      {children}
    </div>
  );
}
