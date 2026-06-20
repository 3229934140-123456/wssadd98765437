import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar, Globe } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { CircularProgress } from "@/components/ProgressBar";
import { StatusStamp } from "@/components/StatusBadge";
import {
  daysUntil,
  formatDate,
  formatRelativeTime,
  calculateProjectProgress,
} from "@/utils";
import { VISIBILITY_LABELS, ProjectVisibility } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const TODO_ICONS: Record<string, { icon: string; color: string }> = {
  upload: { icon: "\u2601", color: "text-indigo" },
  revision: { icon: "\u270E", color: "text-gold" },
  fix: { icon: "\u203B", color: "text-cinnabar-500" },
  confirm: { icon: "\u2713", color: "text-green-600" },
  proofread: { icon: "\u25C7", color: "text-ink-400" },
};

const TODO_LABELS: Record<string, string> = {
  upload: "待上传",
  revision: "待修改",
  fix: "待处理标注",
  confirm: "待确认校对",
  proofread: "待校对",
};

export default function Dashboard() {
  const rawProjects = useAppStore((s) => s.projects);
  const rawMembers = useAppStore((s) => s.members);
  const rawArticles = useAppStore((s) => s.articles);
  const rawActivities = useAppStore((s) => s.activities);
  const rawIssues = useAppStore((s) => s.proofreadIssues);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const addProject = useAppStore((s) => s.addProject);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    visibility: "public" as ProjectVisibility,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userName = useMemo(() => {
    const m = rawMembers.find((m) => m.id === currentUserId);
    return m?.name ?? "创作者";
  }, [rawMembers, currentUserId]);

  const projects = useMemo(() => {
    const memberOf = rawMembers.filter((m) => m.id === currentUserId);
    return rawProjects.filter((p) => memberOf.some((m) => m.projectId === p.id));
  }, [rawProjects, rawMembers, currentUserId]);

  const projectData = useMemo(
    () =>
      projects.map((p) => {
        const articles = rawArticles
          .filter((a) => a.projectId === p.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        const activities = rawActivities
          .filter((a) => a.projectId === p.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return {
          project: p,
          articles,
          activities,
          progress: calculateProjectProgress(articles),
          daysLeft: daysUntil(p.deadline),
        };
      }),
    [projects, rawArticles, rawActivities]
  );

  const todos = useMemo(() => {
    const memberOf = rawMembers.filter((m) => m.id === currentUserId);
    const result: { type: string; detail: string; projectId: string; projectName: string; deadline: string }[] = [];
    for (const membership of memberOf) {
      const project = rawProjects.find((p) => p.id === membership.projectId);
      if (!project) continue;
      if (membership.role === "organizer") {
        const issues = rawIssues.filter((i) => i.projectId === membership.projectId && i.status === "resolved");
        for (const issue of issues) {
          const article = rawArticles.find((a) => a.id === issue.articleId);
          result.push({ type: "confirm", detail: `确认校对：${article?.title ?? ""}`, projectId: project.id, projectName: project.name, deadline: project.deadline });
        }
      }
      if (membership.role === "artist" || membership.role === "writer") {
        const myArticles = rawArticles.filter((a) => a.assigneeId === currentUserId && a.projectId === membership.projectId);
        for (const article of myArticles) {
          if (article.uploadStatus === "pending") {
            result.push({ type: "upload", detail: `待上传：${article.title}`, projectId: project.id, projectName: project.name, deadline: project.deadline });
          }
          if (article.uploadStatus === "revision") {
            result.push({ type: "revision", detail: `待修改：${article.title}`, projectId: project.id, projectName: project.name, deadline: project.deadline });
          }
          const openIssues = rawIssues.filter((i) => i.articleId === article.id && i.status === "open");
          if (openIssues.length > 0) {
            result.push({ type: "fix", detail: `待处理标注：${article.title}（${openIssues.length}项）`, projectId: project.id, projectName: project.name, deadline: project.deadline });
          }
        }
      }
      if (membership.role === "proofreader") {
        const uploadedArticles = rawArticles.filter((a) => a.projectId === membership.projectId && a.uploadStatus === "uploaded");
        if (uploadedArticles.length > 0 && project.status === "proofreading") {
          result.push({ type: "proofread", detail: `待校对 ${uploadedArticles.length} 篇稿件`, projectId: project.id, projectName: project.name, deadline: project.deadline });
        }
      }
    }
    return result;
  }, [rawProjects, rawMembers, rawArticles, rawIssues, currentUserId]);

  const recentActivities = useMemo(() => {
    const all = projectData.flatMap((pd) => pd.activities);
    return all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [projectData]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-ink-300 text-sm mb-1 tracking-wide">
            你好，{userName}
          </p>
          <h1 className="text-3xl font-serif font-bold text-ink-900 tracking-tight">
            合志发行工作台
          </h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-cinnabar flex items-center gap-2">
          <span className="text-lg leading-none">+</span>
          新建合志
        </button>
      </motion.div>

      <section>
        <h2 className="text-lg font-serif font-semibold text-ink-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-cinnabar-500 rounded-full" />
          我的合志
        </h2>

        {projectData.length === 0 ? (
          <div className="ink-card p-12 text-center">
            <p className="text-5xl mb-4">📜</p>
            <p className="text-ink-400">尚无参与中的合志项目</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {projectData.map(({ project, articles, progress, daysLeft }) => (
              <motion.div key={project.id} variants={item}>
                <NavLink
                  to={`/project/${project.id}`}
                  className="ink-card-hover block overflow-hidden group"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={project.coverUrl}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <StatusStamp status={project.status} />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-washi-50 font-serif font-bold text-lg truncate drop-shadow-lg">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-ink-400 text-sm line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CircularProgress value={progress} size={44} />
                        <div className="text-xs text-ink-500">
                          <span className="font-medium text-ink-700">
                            {articles.length}
                          </span>{" "}
                          篇稿件
                        </div>
                      </div>
                      <div className="text-right">
                        {daysLeft < 0 ? (
                          <span className="text-cinnabar-500 text-xs font-medium">
                            已截止
                          </span>
                        ) : daysLeft <= 7 ? (
                          <span className="text-cinnabar-500 text-xs font-medium">
                            剩余 {daysLeft} 天
                          </span>
                        ) : (
                          <span className="text-ink-400 text-xs">
                            剩余 {daysLeft} 天
                          </span>
                        )}
                        <p className="text-ink-300 text-[11px] mt-0.5">
                          {formatDate(project.deadline)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-ink-50">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          project.visibility === "public"
                            ? "bg-indigo/10 text-indigo"
                            : project.visibility === "link"
                            ? "bg-gold/15 text-gold-dark"
                            : "bg-ink-50 text-ink-400"
                        }`}
                      >
                        {VISIBILITY_LABELS[project.visibility]}
                      </span>
                    </div>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3">
          <h2 className="text-lg font-serif font-semibold text-ink-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-indigo rounded-full" />
            我的待办
          </h2>

          {todos.length === 0 ? (
            <div className="ink-card p-8 text-center">
              <p className="text-4xl mb-3">🎐</p>
              <p className="text-ink-400 text-sm">暂无待办事项</p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="ink-card p-5 space-y-0"
            >
              {todos.map((todo, i) => {
                const cfg = TODO_ICONS[todo.type] ?? TODO_ICONS.upload;
                const label = TODO_LABELS[todo.type] ?? todo.type;
                const daysLeft = daysUntil(todo.deadline);
                return (
                  <motion.div
                    key={`${todo.projectId}-${todo.type}-${i}`}
                    variants={item}
                    className="flex items-start gap-4 py-3.5 border-b border-ink-50 last:border-b-0 first:pt-0 last:pb-0"
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full bg-washi-100 flex items-center justify-center text-base ${cfg.color} shrink-0`}
                      >
                        {cfg.icon}
                      </div>
                      {i < todos.length - 1 && (
                        <div className="w-px flex-1 bg-ink-100 mt-2 min-h-[20px]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            todo.type === "fix" || todo.type === "revision"
                              ? "bg-cinnabar-50 text-cinnabar-600"
                              : "bg-indigo/10 text-indigo"
                          }`}
                        >
                          {label}
                        </span>
                        <span className="text-xs text-ink-300">
                          {todo.projectName}
                        </span>
                      </div>
                      <p className="text-sm text-ink-700 truncate">
                        {todo.detail}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {daysLeft < 0 ? (
                        <span className="text-cinnabar-500 text-xs">
                          已过期
                        </span>
                      ) : daysLeft <= 3 ? (
                        <span className="text-cinnabar-500 text-xs font-medium">
                          {daysLeft}天后
                        </span>
                      ) : (
                        <span className="text-ink-400 text-xs">
                          {daysLeft}天后
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        <section className="lg:col-span-2">
          <h2 className="text-lg font-serif font-semibold text-ink-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gold rounded-full" />
            近期动态
          </h2>

          {recentActivities.length === 0 ? (
            <div className="ink-card p-8 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-ink-400 text-sm">暂无动态</p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="ink-card p-5 space-y-0"
            >
              {recentActivities.map((act) => (
                <motion.div
                  key={act.id}
                  variants={item}
                  className="flex items-start gap-3 py-3 border-b border-ink-50 last:border-b-0 first:pt-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-xs font-medium text-ink-600 shrink-0">
                    {act.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-700 leading-relaxed">
                      <span className="font-medium">{act.userName}</span>
                      <span className="text-ink-400 mx-1">·</span>
                      <span className="text-ink-500">{act.action}</span>
                    </p>
                    <p className="text-xs text-ink-400 truncate mt-0.5">
                      {act.detail}
                    </p>
                  </div>
                  <span className="text-[11px] text-ink-300 shrink-0 mt-0.5">
                    {formatRelativeTime(act.createdAt)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
            >
              <div className="ink-card p-6 mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-ink-900">新建合志</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn-ghost p-2 hover:bg-ink-50"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newErrors: Record<string, string> = {};
                    if (!formData.name.trim()) newErrors.name = "请输入刊物名称";
                    if (!formData.deadline) newErrors.deadline = "请选择截稿日期";
                    if (!formData.description.trim()) newErrors.description = "请输入简介";

                    if (Object.keys(newErrors).length > 0) {
                      setErrors(newErrors);
                      return;
                    }

                    const coverPrompt = encodeURIComponent(
                      `${formData.name} book cover elegant minimalist design traditional style`
                    );
                    const coverUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${coverPrompt}&image_size=portrait_4_3`;

                    addProject({
                      name: formData.name.trim(),
                      description: formData.description.trim(),
                      coverUrl,
                      deadline: formData.deadline,
                      visibility: formData.visibility,
                    });

                    setFormData({
                      name: "",
                      description: "",
                      deadline: "",
                      visibility: "public",
                    });
                    setErrors({});
                    setShowModal(false);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      刊物名称
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      placeholder="例如：星霜纪年·冬之卷"
                      className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-0 ${
                        errors.name
                          ? "border-cinnabar-300 bg-cinnabar-50/50 focus:border-cinnabar-400"
                          : "border-ink-100 bg-white hover:border-ink-200 focus:border-indigo"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-cinnabar-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      简介
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: "" });
                      }}
                      placeholder="简要描述这本合志的主题和内容..."
                      rows={3}
                      className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-0 resize-none ${
                        errors.description
                          ? "border-cinnabar-300 bg-cinnabar-50/50 focus:border-cinnabar-400"
                          : "border-ink-100 bg-white hover:border-ink-200 focus:border-indigo"
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-cinnabar-500">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
                      截稿日期
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => {
                        setFormData({ ...formData, deadline: e.target.value });
                        if (errors.deadline) setErrors({ ...errors, deadline: "" });
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-0 ${
                        errors.deadline
                          ? "border-cinnabar-300 bg-cinnabar-50/50 focus:border-cinnabar-400"
                          : "border-ink-100 bg-white hover:border-ink-200 focus:border-indigo"
                      }`}
                    />
                    {errors.deadline && (
                      <p className="mt-1 text-xs text-cinnabar-500">{errors.deadline}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      <Globe size={14} className="inline mr-1.5 -mt-0.5" />
                      公开范围
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { value: "public", label: "公开", desc: "所有人可见" },
                          { value: "link", label: "仅链接", desc: "链接访问" },
                          { value: "private", label: "私密", desc: "仅成员" },
                        ] as { value: ProjectVisibility; label: string; desc: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, visibility: opt.value })
                          }
                          className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                            formData.visibility === opt.value
                              ? "border-indigo bg-indigo/5"
                              : "border-ink-100 bg-white hover:border-ink-200"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              formData.visibility === opt.value
                                ? "text-indigo"
                                : "text-ink-700"
                            }`}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-ink-400 mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-ink-50">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-outline flex-1"
                    >
                      取消
                    </button>
                    <button type="submit" className="btn-cinnabar flex-1">
                      创建合志
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
