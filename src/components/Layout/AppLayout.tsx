import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen washi-texture">
      <Sidebar />
      <main className="ml-56 min-h-screen p-6 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
