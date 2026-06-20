import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/Layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Project from "@/pages/Project";
import Upload from "@/pages/Upload";
import Proofread from "@/pages/Proofread";
import Publish from "@/pages/Publish";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/project/:id/upload" element={<Upload />} />
          <Route path="/project/:id/proofread" element={<Proofread />} />
          <Route path="/project/:id/publish" element={<Publish />} />
        </Route>
      </Routes>
    </Router>
  );
}
