// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { Input, Btn } from "../components/UI";

export default function AuthPage({ defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, signup } = useStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (mode === "signup" && !name.trim()) e.name = "Name is required";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name, email, password);
      navigate("/workspace"); // always go to workspace after auth
    } catch (err) {
      setErrors({ general: err.response?.data?.error || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--paper)", fontFamily: "var(--font-body)",
      backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(74,63,140,0.04) 0%, transparent 60%)",
      padding: "24px",
    }}>
      <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>

        {/* Back link */}
        <Link to="/" style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 13, color: "var(--ink-4)", textDecoration: "none", marginBottom: 28,
        }}>← Back to Inkwell</Link>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 42, marginBottom: 4, opacity: 0.85 }}>✦</div>
          <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 400, fontSize: 30, color: "var(--ink)", margin: 0 }}>Inkwell</h1>
          <p style={{ fontSize: 13, color: "var(--ink-4)", marginTop: 6, fontStyle: "italic" }}>Where ideas find form</p>
        </div>

        <div style={{ background: "var(--paper-2)", borderRadius: "var(--radius-lg)", border: "1px solid var(--line)", padding: "32px 28px", boxShadow: "var(--shadow)" }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", background: "var(--paper-3)", borderRadius: "var(--radius)", padding: 3, marginBottom: 24, gap: 2 }}>
            {[["login","Sign in"],["signup","Create account"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }} style={{
                flex: 1, padding: "7px 0", border: "none", borderRadius: 6,
                background: mode === m ? "var(--paper)" : "transparent",
                color: mode === m ? "var(--ink)" : "var(--ink-3)",
                fontSize: 13, fontWeight: mode === m ? 500 : 400,
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: mode === m ? "0 1px 3px rgba(26,26,24,0.08)" : "none",
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <Input label="Full name" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
            )}
            <Input label="Email address" type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
            <Input label="Password" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              error={errors.password} />

            {errors.general && (
              <p style={{ fontSize: 12, color: "var(--danger)", background: "var(--danger-bg)", padding: "8px 12px", borderRadius: "var(--radius)", margin: 0 }}>
                {errors.general}
              </p>
            )}

            <Btn variant="primary" size="lg" onClick={submit} loading={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              {mode === "login" ? "Sign in" : "Create account"}
            </Btn>
          </div>

          <p style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrors({}); }}
              style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
