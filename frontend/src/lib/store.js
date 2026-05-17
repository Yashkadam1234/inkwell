// src/lib/store.js
import { create } from "zustand";
import { authApi, notesApi } from "./api";

// Apply dark mode to <html> element
function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  localStorage.setItem("inkwell_theme", dark ? "dark" : "light");
}

const savedTheme = localStorage.getItem("inkwell_theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initDark = savedTheme ? savedTheme === "dark" : prefersDark;
applyTheme(initDark);

export const useStore = create((set, get) => ({

  // ── Auth ──────────────────────────────────────────────────
  user:  null,
  token: localStorage.getItem("inkwell_token"),

  login: async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem("inkwell_token", data.token);
    set({ user: data.user, token: data.token });
  },

  signup: async (name, email, password) => {
    const { data } = await authApi.signup(name, email, password);
    localStorage.setItem("inkwell_token", data.token);
    set({ user: data.user, token: data.token });
  },

  loadUser: async () => {
    if (!localStorage.getItem("inkwell_token")) return;
    try {
      const { data } = await authApi.me();
      set({ user: data.user });
    } catch {
      localStorage.removeItem("inkwell_token");
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem("inkwell_token");
    set({ user: null, token: null, notes: [], activeNote: null });
  },

  // ── Notes ─────────────────────────────────────────────────
  notes:        [],
  activeNote:   null,
  notesLoading: false,

  fetchNotes: async (params = {}) => {
    set({ notesLoading: true });
    try {
      const { data } = await notesApi.list(params);
      set({ notes: data.notes });
    } finally {
      set({ notesLoading: false });
    }
  },

  createNote: async (noteData = {}) => {
    // Optimistic: add a placeholder immediately
    const tempId = "TEMP_" + Date.now();
    const optimistic = {
      id: tempId, title: "Untitled", content: "",
      tags: [], category: "general", ai: null,
      is_public: false, is_archived: false,
      word_count: 0, share_id: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...noteData,
    };
    set(s => ({ notes: [optimistic, ...s.notes], activeNote: optimistic }));

    try {
      const { data } = await notesApi.create({ title: "Untitled", content: "", tags: [], ...noteData });
      // Replace optimistic entry with real one
      set(s => ({
        notes: s.notes.map(n => n.id === tempId ? data.note : n),
        activeNote: s.activeNote?.id === tempId ? data.note : s.activeNote,
      }));
      return data.note;
    } catch (err) {
      // Rollback on failure
      set(s => ({
        notes: s.notes.filter(n => n.id !== tempId),
        activeNote: s.activeNote?.id === tempId ? null : s.activeNote,
      }));
      throw err;
    }
  },

  updateNote: async (id, updates) => {
    // Optimistic: update local state immediately
    const prev = get().notes.find(n => n.id === id);
    const optimistic = { ...prev, ...updates, updated_at: new Date().toISOString() };
    set(s => ({
      notes: s.notes.map(n => n.id === id ? optimistic : n),
      activeNote: s.activeNote?.id === id ? optimistic : s.activeNote,
    }));

    try {
      const { data } = await notesApi.update(id, updates);
      set(s => ({
        notes: s.notes.map(n => n.id === id ? data.note : n),
        activeNote: s.activeNote?.id === id ? data.note : s.activeNote,
      }));
      return data.note;
    } catch (err) {
      // Rollback
      set(s => ({
        notes: s.notes.map(n => n.id === id ? prev : n),
        activeNote: s.activeNote?.id === id ? prev : s.activeNote,
      }));
      throw err;
    }
  },

  deleteNote: async (id) => {
    const prev = get().notes;
    // Optimistic removal
    set(s => ({
      notes: s.notes.filter(n => n.id !== id),
      activeNote: s.activeNote?.id === id ? null : s.activeNote,
    }));
    try {
      await notesApi.delete(id);
    } catch (err) {
      set({ notes: prev }); // rollback
      throw err;
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  // ── UI state ──────────────────────────────────────────────
  sidebarView: "notes",
  setSidebarView: (v) => set({ sidebarView: v }),

  // ── Dark mode ──────────────────────────────────────────────
  darkMode: initDark,
  toggleDark: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    applyTheme(next);
  },

  // ── Toasts ────────────────────────────────────────────────
  toasts: [],
  addToast: (msg, type = "info") => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },
}));
