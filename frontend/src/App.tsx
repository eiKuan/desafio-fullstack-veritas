import { Routes, Route } from "react-router-dom";
import KanbanPage from "./pages/KanbanPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<KanbanPage />} />
      <Route path="*" element={<KanbanPage />} />
    </Routes>
  );
}
