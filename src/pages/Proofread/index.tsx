import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { ProjectSubNav } from "@/components/Layout/Sidebar";
import { IssueStatusBadge } from "@/components/StatusBadge";
import type { IssueType } from "@/types";
import { ISSUE_TYPE_LABELS } from "@/types";
import { formatDate } from "@/utils";
import {
  Type,
  Scissors,
  Move,
  ChevronLeft,
  ChevronRight,
  X,
  ListChecks,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const TOOL_CONFIG: {
  type: IssueType;
  label: string;
  icon: typeof Type;
  activeClass: string;
  badgeClass: string;
  dotClass: string;
}[] = [
  {
    type: "typo",
    label: "错字",
    icon: Type,
    activeClass: "bg-cinnabar-500 text-white shadow-cinnabar",
    badgeClass: "bg-cinnabar-50 text-cinnabar-600 border-cinnabar-100",
    dotClass: "bg-cinnabar-500",
  },
  {
    type: "page_break",
    label: "断页",
    icon: Scissors,
    activeClass: "bg-indigo text-white shadow-ink",
    badgeClass: "bg-indigo/10 text-indigo border-indigo/20",
    dotClass: "bg-indigo",
  },
  {
    type: "bleed",
    label: "出血线",
    icon: Move,
    activeClass: "bg-gold text-ink-900 shadow-gold",
    badgeClass: "bg-gold/15 text-gold-dark border-gold/30",
    dotClass: "bg-gold",
  },
];

export default function Proofread() {
  const { projectId } = useParams<{ projectId: string }>();
  const rawProjects = useAppStore((s) => s.projects);
  const rawArticles = useAppStore((s) => s.articles);
  const rawMembers = useAppStore((s) => s.members);
  const rawIssues = useAppStore((s) => s.proofreadIssues);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const addProofreadIssue = useAppStore((s) => s.addProofreadIssue);
  const resolveIssue = useAppStore((s) => s.resolveIssue);
  const confirmIssue = useAppStore((s) => s.confirmIssue);

  const project = rawProjects.find((p) => p.id === projectId);
  const articles = useMemo(
    () => rawArticles.filter((a) => a.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder),
    [rawArticles, projectId]
  );
  const allIssues = useMemo(
    () => rawIssues.filter((i) => i.projectId === projectId),
    [rawIssues, projectId]
  );
  const members = useMemo(
    () => rawMembers.filter((m) => m.projectId === projectId),
    [rawMembers, projectId]
  );
  const currentMember = members.find((m) => m.id === currentUserId);

  const [activeArticleId, setActiveArticleId] = useState<string>(
    articles[0]?.id ?? ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTool, setSelectedTool] = useState<IssueType | null>(null);
  const [showIssuePanel, setShowIssuePanel] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIssuePosition, setNewIssuePosition] = useState({ x: 0, y: 0 });
  const [newIssueDesc, setNewIssueDesc] = useState("");

  const activeArticle = articles.find((a) => a.id === activeArticleId);
  const totalPages = activeArticle?.pageCount ?? 1;
  const articleIssues = allIssues.filter((i) => i.articleId === activeArticleId);
  const pageIssues = articleIssues.filter((i) => i.page === currentPage);

  const handleArticleChange = (articleId: string) => {
    setActiveArticleId(articleId);
    setCurrentPage(1);
    setSelectedTool(null);
  };

  const handlePreviewClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedTool) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setNewIssuePosition({ x, y });
      setShowAddDialog(true);
    },
    [selectedTool]
  );

  const handleSubmitIssue = () => {
    if (!selectedTool || !newIssueDesc.trim()) return;
    addProofreadIssue({
      projectId: projectId!,
      articleId: activeArticleId,
      type: selectedTool,
      description: newIssueDesc.trim(),
      page: currentPage,
      positionX: newIssuePosition.x,
      positionY: newIssuePosition.y,
      status: "open",
      reporterId: currentUserId,
    });
    setShowAddDialog(false);
    setNewIssueDesc("");
    setSelectedTool(null);
  };

  const isAssigneeOfArticle = (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    return article?.assigneeId === currentUserId;
  };
  const isOrganizer = currentMember?.role === "organizer";

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-ink-400">
        项目不存在
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-washi-100 washi-texture">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink-900">
              {project.name}
              <span className="ml-3 text-lg font-normal text-ink-400">
                校对流转
              </span>
            </h1>
          </div>
          <ProjectSubNav projectId={projectId!} />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-washi pb-1">
          {articles.map((article) => {
            const count = allIssues.filter((i) => i.articleId === article.id).length;
            const isActive = article.id === activeArticleId;
            return (
              <button
                key={article.id}
                onClick={() => handleArticleChange(article.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-ink-900 text-washi-100 shadow-ink"
                    : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                <span>{article.title}</span>
                {count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                      isActive
                        ? "bg-cinnabar-500 text-white"
                        : "bg-cinnabar-50 text-cinnabar-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex px-6 pb-6 gap-4" style={{ height: "calc(100vh - 160px)" }}>
        <div className="flex items-center">
          <div className="flex flex-col gap-2 ink-card p-2">
            {TOOL_CONFIG.map((tool) => {
              const Icon = tool.icon;
              const isActive = selectedTool === tool.type;
              return (
                <motion.button
                  key={tool.type}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setSelectedTool(isActive ? null : tool.type)
                  }
                  className={`relative p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? tool.activeClass
                      : "text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                  }`}
                  title={tool.label}
                >
                  <Icon size={20} />
                  {isActive && (
                    <motion.div
                      layoutId="tool-indicator"
                      className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-cinnabar-500"
                    />
                  )}
                </motion.button>
              );
            })}
            <div className="w-full h-px bg-ink-100 my-1" />
            <button
              onClick={() => setShowIssuePanel(!showIssuePanel)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                showIssuePanel
                  ? "bg-ink-100 text-ink-700"
                  : "text-ink-400 hover:bg-ink-50 hover:text-ink-700"
              }`}
              title="问题列表"
            >
              <ListChecks size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div
            className={`flex-1 ink-card p-6 flex items-center justify-center relative overflow-hidden ${
              selectedTool ? "cursor-crosshair" : ""
            }`}
            onClick={handlePreviewClick}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeArticleId}-${currentPage}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-2xl aspect-[3/4] bg-ink-50/80 rounded-lg border border-ink-100/60 relative flex flex-col items-center justify-center"
              >
                <div className="absolute inset-4 flex flex-col items-center justify-center text-ink-200">
                  <div className="w-12 h-1 bg-ink-200/40 rounded mb-3" />
                  <div className="w-24 h-1.5 bg-ink-200/30 rounded mb-2" />
                  <div className="w-20 h-1 bg-ink-200/25 rounded mb-6" />
                  <div className="w-32 h-1 bg-ink-200/20 rounded mb-1.5" />
                  <div className="w-28 h-1 bg-ink-200/20 rounded mb-1.5" />
                  <div className="w-36 h-1 bg-ink-200/20 rounded mb-1.5" />
                  <div className="w-24 h-1 bg-ink-200/20 rounded mb-1.5" />
                  <div className="w-30 h-1 bg-ink-200/20 rounded mb-6" />
                  <div className="w-20 h-1 bg-ink-200/25 rounded mb-1.5" />
                  <div className="w-28 h-1 bg-ink-200/20 rounded" />
                </div>

                <span className="absolute bottom-3 right-4 text-xs text-ink-300 font-mono">
                  {currentPage} / {totalPages}
                </span>

                {pageIssues.map((issue) => {
                  const cfg = TOOL_CONFIG.find(
                    (t) => t.type === issue.type
                  );
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute z-10"
                      style={{
                        left: `${issue.positionX}%`,
                        top: `${issue.positionY}%`,
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${cfg?.dotClass} animate-pulse-dot shadow-md`}
                      />
                      <div
                        className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1 rounded ${cfg?.badgeClass} border whitespace-nowrap`}
                      >
                        {ISSUE_TYPE_LABELS[issue.type]}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage <= 1}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-ink-100/50 text-ink-500 hover:text-ink-900 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage >= totalPages}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-ink-100/50 text-ink-500 hover:text-ink-900 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>

            {selectedTool && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-ink-900/90 backdrop-blur-sm text-washi-100 text-xs px-3 py-1.5 rounded-full"
              >
                点击页面添加「{ISSUE_TYPE_LABELS[selectedTool]}」标注
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i + 1 === currentPage
                    ? "bg-ink-900 w-6"
                    : "bg-ink-200 hover:bg-ink-400"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showIssuePanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="w-[360px] ink-card h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100/50">
                  <h3 className="text-sm font-serif font-semibold text-ink-900">
                    问题列表
                  </h3>
                  <span className="text-xs text-ink-400">
                    共 {allIssues.length} 项
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-washi p-3 space-y-4">
                  {articles.map((article) => {
                    const issues = allIssues.filter((i) => i.articleId === article.id);
                    if (issues.length === 0) return null;
                    return (
                      <div key={article.id}>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <span className="text-xs font-serif font-semibold text-ink-700">
                            {article.title}
                          </span>
                          <span className="text-[10px] text-ink-400">
                            {issues.length} 项
                          </span>
                        </div>

                        <div className="space-y-2">
                          {issues.map((issue) => {
                            const cfg = TOOL_CONFIG.find(
                              (t) => t.type === issue.type
                            );
                            const reporter = rawMembers.find((m) => m.id === issue.reporterId);
                            return (
                              <motion.div
                                key={issue.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-washi-50/80 rounded-xl p-3 border border-ink-100/30"
                              >
                                <div className="flex items-start gap-2">
                                  <span
                                    className={`stamp-mark ${cfg?.badgeClass} border text-[10px] flex-shrink-0`}
                                  >
                                    {ISSUE_TYPE_LABELS[issue.type]}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-ink-800 leading-relaxed">
                                      {issue.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-ink-400">
                                      <span>P{issue.page}</span>
                                      <span>·</span>
                                      <span>
                                        {reporter?.name ?? "未知"}
                                      </span>
                                      <span>·</span>
                                      <span>
                                        {formatDate(issue.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                  <IssueStatusBadge status={issue.status} />
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-2">
                                  {issue.status === "open" &&
                                    isAssigneeOfArticle(article.id) && (
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          resolveIssue(issue.id)
                                        }
                                        className="btn-indigo !px-3 !py-1 !text-[11px] !rounded-lg"
                                      >
                                        已处理
                                      </motion.button>
                                    )}
                                  {issue.status === "resolved" &&
                                    isOrganizer && (
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          confirmIssue(issue.id)
                                        }
                                        className="btn-cinnabar !px-3 !py-1 !text-[11px] !rounded-lg"
                                      >
                                        已确认
                                      </motion.button>
                                    )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {allIssues.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-ink-300">
                      <ListChecks size={32} className="mb-2 opacity-40" />
                      <p className="text-sm">暂无校对问题</p>
                      <p className="text-xs mt-1">
                        选择左侧工具，点击预览页面添加标注
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddDialog && selectedTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => {
              setShowAddDialog(false);
              setNewIssueDesc("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="ink-card p-6 w-[420px] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const cfg = TOOL_CONFIG.find(
                      (t) => t.type === selectedTool
                    );
                    const Icon = cfg?.icon ?? Type;
                    return (
                      <>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg?.activeClass}`}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="font-serif font-semibold text-ink-900">
                          添加{ISSUE_TYPE_LABELS[selectedTool]}标注
                        </span>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setNewIssueDesc("");
                  }}
                  className="p-1 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span>
                    {activeArticle?.title} · 第 {currentPage} 页
                  </span>
                  <span>·</span>
                  <span>
                    位置 ({newIssuePosition.x}%, {newIssuePosition.y}%)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">
                    问题描述
                  </label>
                  <textarea
                    value={newIssueDesc}
                    onChange={(e) => setNewIssueDesc(e.target.value)}
                    placeholder="请描述发现的问题…"
                    rows={3}
                    className="w-full bg-washi-50/60 border border-ink-100/60 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-cinnabar-300/50 focus:border-cinnabar-300 transition-all resize-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setNewIssueDesc("");
                  }}
                  className="btn-outline !px-4 !py-2 !text-sm"
                >
                  取消
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmitIssue}
                  disabled={!newIssueDesc.trim()}
                  className="btn-cinnabar !px-4 !py-2 !text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  提交标注
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
