// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./lib/store";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import WorkspacePage from "./pages/WorkspacePage";
import SharedNotePage from "./pages/SharedNotePage";
import { ToastStack, Spinner } from "./components/UI";
import "./index.css";

function ProtectedRoute({ children }) {
  const { user, token } = useStore();
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <Spinner size={24} />
    </div>
  );
  return children;
}

export default function App() {
  const { loadUser, token } = useStore();
  useEffect(() => { if (token) loadUser(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Landing page — first thing every visitor sees */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Auth */}
        <Route path="/login"  element={<AuthPage defaultMode="login" />} />
        <Route path="/signup" element={<AuthPage defaultMode="signup" />} />

        {/* 3. Public shared note — no auth */}
        <Route path="/shared/:shareId" element={<SharedNotePage />} />

        {/* 4. Protected workspace */}
        <Route path="/workspace" element={
          <ProtectedRoute><WorkspacePage /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastStack />
    </BrowserRouter>
  );
}
