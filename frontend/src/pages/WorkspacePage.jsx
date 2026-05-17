// src/pages/WorkspacePage.jsx
import { useStore } from "../lib/store";
import Sidebar from "../components/Sidebar";
import NoteEditor from "../components/NoteEditor";
import InsightsPage from "./InsightsPage";
import { Empty, Btn } from "../components/UI";

export default function WorkspacePage() {
  const { activeNote, sidebarView, createNote, addToast } = useStore();

  const handleNew = async () => {
    try { await createNote(); }
    catch { addToast("Could not create note", "error"); }
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "var(--paper)",
      position: "fixed",
      top: 0, left: 0,
    }}>
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {sidebarView === "insights" ? (
          <InsightsPage />
        ) : activeNote ? (
          <NoteEditor />
        ) : (
          <Empty
            icon="✦"
            title="Select a note or create one"
            subtitle={sidebarView === "archive" ? "Pick an archived note to view it" : "Your next great idea is waiting"}
            action={sidebarView !== "archive" && <Btn variant="primary" onClick={handleNew}>+ New note</Btn>}
          />
        )}
      </div>
    </div>
  );
}
