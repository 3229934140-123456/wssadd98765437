import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppStore } from "@/stores/appStore";
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  FileCheck,
  Rocket,
  ChevronLeft,
  BookOpen,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "工作台" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const rawProjects = useAppStore((s) => s.projects);
  const rawMembers = useAppStore((s) => s.members);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const projects = useMemo(() => {
    const memberOf = rawMembers.filter((m) => m.id === currentUserId);
    return rawProjects.filter((p) => memberOf.some((m) => m.projectId === p.id));
  }, [rawProjects, rawMembers, currentUserId]);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-ink-900/95 backdrop-blur-md text-washi-100 flex flex-col transition-all duration-300 z-50 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-ink-700/50">
        <div className="w-8 h-8 rounded-lg bg-cinnabar-500 flex items-center justify-center flex-shrink-0">
          <BookOpen size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-serif font-semibold text-washi-100 leading-tight">合志工作台</h1>
            <p className="text-[10px] text-washi-400">Doujin Workbench</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto scrollbar-washi">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? "bg-cinnabar-500/20 text-cinnabar-300 font-medium"
                  : "text-washi-300 hover:bg-ink-800 hover:text-washi-100"
              }`
            }
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <div className="mt-4 mb-2 px-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-400 font-medium">项目</p>
          </div>
        )}

        {projects.map((project) => {
          const projectBase = `/project/${project.id}`;
          const isActive = location.pathname.startsWith(projectBase);
          return (
            <NavLink
              key={project.id}
              to={projectBase}
              className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? "bg-indigo/20 text-gold-light font-medium"
                  : "text-washi-400 hover:bg-ink-800 hover:text-washi-200"
              }`}
            >
              <FolderOpen size={16} />
              {!collapsed && (
                <span className="truncate text-xs">{project.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-ink-700/50 text-washi-400 hover:text-washi-100 transition-colors"
      >
        <ChevronLeft
          size={16}
          className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>
    </aside>
  );
}

export function ProjectSubNav({ projectId }: { projectId: string }) {
  const rawMembers = useAppStore((s) => s.members);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const project = useAppStore((s) => s.projects.find((p) => p.id === projectId));

  const currentMember = useMemo(
    () => rawMembers.find((m) => m.projectId === projectId && m.id === currentUserId),
    [rawMembers, projectId, currentUserId]
  );

  const subItems = useMemo(() => {
    const items = [
      { to: `/project/${projectId}`, icon: FolderOpen, label: "项目信息", end: true },
    ];
    if (currentMember?.role === "organizer" || currentMember?.role === "artist" || currentMember?.role === "writer") {
      items.push({ to: `/project/${projectId}/upload`, icon: Upload, label: "收稿上传", end: false });
    }
    if (currentMember?.role === "organizer" || currentMember?.role === "proofreader") {
      items.push({ to: `/project/${projectId}/proofread`, icon: FileCheck, label: "校对流转", end: false });
    }
    if (currentMember?.role === "organizer") {
      items.push({ to: `/project/${projectId}/publish`, icon: Rocket, label: "发行确认", end: false });
    }
    return items;
  }, [projectId, currentMember?.role]);

  if (!project) return null;

  return (
    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-2xl px-2 py-1.5 border border-ink-100/30">
      {subItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              isActive
                ? "bg-ink-900 text-washi-100 shadow-ink"
                : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
            }`
          }
        >
          <item.icon size={14} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
