import { useState, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { ProjectSubNav } from "@/components/Layout/Sidebar";
import { StatusStamp, RoleBadge } from "@/components/StatusBadge";
import { CircularProgress } from "@/components/ProgressBar";
import { formatDate, daysUntil, getInitials, calculateProjectProgress } from "@/utils";
import type { ProjectVisibility, MemberRole, ArticleType } from "@/types";
import { VISIBILITY_LABELS, ARTICLE_TYPE_LABELS, ROLE_LABELS } from "@/types";
import {
  Check,
  X,
  Plus,
  Trash2,
  Pencil,
  Globe,
  Link2,
  Lock,
  Save,
  Users,
  Calendar,
} from "lucide-react";

const UPLOAD_STATUS_LABELS: Record<string, string> = {
  pending: "待上传",
  uploaded: "已上传",
  revision: "待修改",
};

const UPLOAD_STATUS_CLASSES: Record<string, string> = {
  pending: "bg-cinnabar-50 text-cinnabar-600 border-cinnabar-100",
  uploaded: "bg-green-50 text-green-700 border-green-200",
  revision: "bg-gold/15 text-gold-dark border-gold/30",
};

const ARTICLE_TYPE_CLASSES: Record<string, string> = {
  illustration: "bg-indigo/10 text-indigo border-indigo/20",
  text: "bg-gold/15 text-gold-dark border-gold/30",
  cover: "bg-cinnabar-50 text-cinnabar-600 border-cinnabar-100",
};

const VISIBILITY_ICONS: Record<ProjectVisibility, typeof Globe> = {
  public: Globe,
  link: Link2,
  private: Lock,
};

const MEMBER_COLORS: Record<string, string> = {
  organizer: "bg-cinnabar-500/15 text-cinnabar-600",
  artist: "bg-indigo/10 text-indigo",
  writer: "bg-gold/15 text-gold-dark",
  proofreader: "bg-ink-100 text-ink-600",
};

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const rawProjects = useAppStore((s) => s.projects);
  const rawMembers = useAppStore((s) => s.members);
  const rawArticles = useAppStore((s) => s.articles);
  const updateProject = useAppStore((s) => s.updateProject);
  const addMember = useAppStore((s) => s.addMember);
  const removeMember = useAppStore((s) => s.removeMember);
  const addArticle = useAppStore((s) => s.addArticle);
  const removeArticle = useAppStore((s) => s.removeArticle);

  const project = rawProjects.find((p) => p.id === projectId);
  const members = useMemo(() => rawMembers.filter((m) => m.projectId === projectId), [rawMembers, projectId]);
  const articles = useMemo(
    () => rawArticles.filter((a) => a.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder),
    [rawArticles, projectId]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editVisibility, setEditVisibility] = useState<ProjectVisibility>("public");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<MemberRole>("artist");
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleType, setNewArticleType] = useState<ArticleType>("illustration");
  const [newArticleAssigneeId, setNewArticleAssigneeId] = useState("");

  const progress = useMemo(() => calculateProjectProgress(articles), [articles]);

  const memberArticleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const article of articles) {
      counts[article.assigneeId] = (counts[article.assigneeId] || 0) + 1;
    }
    return counts;
  }, [articles]);

  const stats = useMemo(() => {
    const missingCover = articles.filter((a) => !a.hasCover).length;
    const unsignedAuth = articles.filter((a) => !a.authorizationSigned).length;
    const notUploaded = articles.filter((a) => a.uploadStatus === "pending").length;
    return { missingCover, unsignedAuth, notUploaded };
  }, [articles]);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.p
          className="text-ink-400 text-lg font-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          项目不存在
        </motion.p>
      </div>
    );
  }

  const remaining = daysUntil(project.deadline);
  const VisIcon = VISIBILITY_ICONS[project.visibility];

  const startEditing = () => {
    setEditName(project.name);
    setEditDesc(project.description);
    setEditDeadline(project.deadline);
    setEditVisibility(project.visibility);
    setIsEditing(true);
  };

  const saveEditing = () => {
    updateProject(projectId!, {
      name: editName,
      description: editDesc,
      deadline: editDeadline,
      visibility: editVisibility,
    });
    setIsEditing(false);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    addMember({
      projectId: projectId!,
      name: newMemberName.trim(),
      avatar: "",
      role: newMemberRole,
    });
    setNewMemberName("");
    setNewMemberRole("artist");
    setShowAddMember(false);
  };

  const handleAddArticle = () => {
    if (!newArticleTitle.trim()) return;
    addArticle({
      projectId: projectId!,
      assigneeId: newArticleAssigneeId || members[0]?.id || "",
      title: newArticleTitle.trim(),
      type: newArticleType,
      uploadStatus: "pending",
      pageCount: 0,
      dimensions: "",
      hasCover: false,
      authorizationSigned: false,
      uploadedAt: null,
    });
    setNewArticleTitle("");
    setNewArticleType("illustration");
    setNewArticleAssigneeId("");
    setShowAddArticle(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <ProjectSubNav projectId={projectId!} />

      <motion.div
        className="ink-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 lg:w-80 flex-shrink-0 relative overflow-hidden">
            <img
              src={project.coverUrl}
              alt={project.name}
              className="w-full h-48 md:h-full object-cover"
            />
            <div className="absolute top-3 right-2 vertical-label text-white/70 text-xs font-serif select-none drop-shadow-md">
              {VISIBILITY_LABELS[project.visibility]}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ink-900/50 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <StatusStamp status={project.status} />
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-serif font-bold text-ink-900 bg-washi-50 border border-ink-200 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:border-indigo transition-colors"
                  />
                ) : (
                  <h1 className="text-2xl font-serif font-bold text-ink-900 truncate">
                    {project.name}
                  </h1>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={saveEditing}
                      className="btn-cinnabar flex items-center gap-1.5 text-sm !px-3 !py-1.5"
                    >
                      <Save size={14} />
                      保存
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-ghost text-sm"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startEditing}
                    className="btn-cinnabar flex items-center gap-1.5 text-sm !px-3 !py-1.5"
                  >
                    <Pencil size={14} />
                    编辑
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full text-ink-600 bg-washi-50 border border-ink-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-indigo resize-none transition-colors"
                rows={3}
              />
            ) : (
              <p className="text-ink-600 mb-4 leading-relaxed">{project.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-ink-400" size={16} />
                {isEditing ? (
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="bg-washi-50 border border-ink-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo transition-colors"
                  />
                ) : (
                  <>
                    <span className="text-ink-700">{formatDate(project.deadline)}</span>
                    <span
                      className={`text-xs font-medium ${
                        remaining <= 7 ? "text-cinnabar-500" : "text-ink-400"
                      }`}
                    >
                      ({remaining > 0 ? `剩余${remaining}天` : "已截止"})
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                {isEditing ? (
                  <select
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value as ProjectVisibility)}
                    className="bg-washi-50 border border-ink-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo transition-colors"
                  >
                    {Object.entries(VISIBILITY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <VisIcon className="text-ink-400" size={16} />
                    <span className="text-ink-700">{VISIBILITY_LABELS[project.visibility]}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <CircularProgress value={progress} size={42} />
                <div className="text-xs text-ink-500">
                  <p>完成度</p>
                  <p className="font-serif font-semibold text-ink-700">{progress}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="ink-card p-6 lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-serif font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo" />
            参与人员
            <span className="ml-auto text-xs text-ink-400 font-sans font-normal">
              {members.length}人
            </span>
          </h2>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {members.map((member, i) => (
                <motion.div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-washi-50/60 hover:bg-washi-100/60 transition-colors group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-serif font-semibold flex-shrink-0 ${
                      MEMBER_COLORS[member.role] ?? "bg-ink-50 text-ink-600"
                    }`}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{member.name}</p>
                    <p className="text-xs text-ink-400">
                      {memberArticleCounts[member.id] || 0} 篇稿件
                    </p>
                  </div>
                  <RoleBadge role={member.role} />
                  <button
                    onClick={() => removeMember(member.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-cinnabar-500 transition-all ml-1"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {showAddMember && (
                <motion.div
                  className="p-3 rounded-xl bg-washi-50 border border-ink-100"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="成员名称"
                    className="w-full bg-white border border-ink-200 rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:border-indigo transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                  />
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as MemberRole)}
                    className="w-full bg-white border border-ink-200 rounded-lg px-3 py-1.5 text-sm mb-3 focus:outline-none focus:border-indigo transition-colors"
                  >
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddMember}
                      className="btn-indigo text-xs !px-3 !py-1.5"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setShowAddMember(false)}
                      className="btn-ghost text-xs"
                    >
                      取消
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowAddMember(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-ink-200 rounded-xl text-ink-400 hover:border-indigo hover:text-indigo transition-all duration-200"
            >
              <Plus size={16} />
              <span className="text-sm">添加成员</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          className="ink-card p-6 lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-ink-900">篇目列表</h2>
            <button
              onClick={() => setShowAddArticle(true)}
              className="btn-outline text-xs !px-3 !py-1.5 flex items-center gap-1.5"
            >
              <Plus size={14} />
              添加篇目
            </button>
          </div>

          <AnimatePresence>
            {showAddArticle && (
              <motion.div
                className="mb-4 p-4 rounded-xl bg-washi-50 border border-ink-100"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    value={newArticleTitle}
                    onChange={(e) => setNewArticleTitle(e.target.value)}
                    placeholder="篇目标题"
                    className="bg-white border border-ink-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleAddArticle()}
                  />
                  <select
                    value={newArticleType}
                    onChange={(e) => setNewArticleType(e.target.value as ArticleType)}
                    className="bg-white border border-ink-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo transition-colors"
                  >
                    {Object.entries(ARTICLE_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newArticleAssigneeId}
                    onChange={(e) => setNewArticleAssigneeId(e.target.value)}
                    className="bg-white border border-ink-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo transition-colors sm:col-span-2"
                  >
                    <option value="">选择负责人</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}（{ROLE_LABELS[m.role]}）
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddArticle}
                    className="btn-indigo text-xs !px-3 !py-1.5"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setShowAddArticle(false)}
                    className="btn-ghost text-xs"
                  >
                    取消
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-ink-300">
              <p className="font-serif text-lg mb-1">暂无篇目</p>
              <p className="text-sm">点击上方按钮添加第一篇稿件</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-ink-100">
                    <th className="text-left py-2.5 px-3 text-ink-400 font-medium">标题</th>
                    <th className="text-left py-2.5 px-3 text-ink-400 font-medium">类型</th>
                    <th className="text-left py-2.5 px-3 text-ink-400 font-medium">负责人</th>
                    <th className="text-left py-2.5 px-3 text-ink-400 font-medium">状态</th>
                    <th className="text-center py-2.5 px-3 text-ink-400 font-medium">页数</th>
                    <th className="text-left py-2.5 px-3 text-ink-400 font-medium">尺寸</th>
                    <th className="text-center py-2.5 px-3 text-ink-400 font-medium">封面</th>
                    <th className="text-center py-2.5 px-3 text-ink-400 font-medium">授权</th>
                    <th className="w-10 py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {articles.map((article, i) => {
                      const assignee = rawMembers.find((m) => m.id === article.assigneeId);
                      return (
                        <motion.tr
                          key={article.id}
                          className="border-b border-ink-50 hover:bg-washi-50/40 transition-colors group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <td className="py-3 px-3 font-medium text-ink-900">
                            <NavLink
                              to={`/project/${projectId}/upload`}
                              className="hover:text-indigo transition-colors"
                            >
                              {article.title}
                            </NavLink>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`stamp-mark border ${ARTICLE_TYPE_CLASSES[article.type]}`}
                            >
                              {ARTICLE_TYPE_LABELS[article.type]}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-ink-700">
                            {assignee ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-semibold ${
                                    MEMBER_COLORS[assignee.role] ?? "bg-ink-50 text-ink-600"
                                  }`}
                                >
                                  {getInitials(assignee.name)}
                                </span>
                                <span className="text-sm">{assignee.name}</span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`stamp-mark border ${UPLOAD_STATUS_CLASSES[article.uploadStatus]}`}
                            >
                              {UPLOAD_STATUS_LABELS[article.uploadStatus]}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-ink-600">
                            {article.pageCount || "—"}
                          </td>
                          <td className="py-3 px-3 text-ink-400 text-xs font-mono">
                            {article.dimensions || "—"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {article.hasCover ? (
                              <Check size={16} className="text-green-600 mx-auto" />
                            ) : (
                              <X size={16} className="text-cinnabar-400 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {article.authorizationSigned ? (
                              <Check size={16} className="text-green-600 mx-auto" />
                            ) : (
                              <X size={16} className="text-cinnabar-400 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => removeArticle(article.id)}
                              className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-cinnabar-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        className="fixed bottom-0 left-56 right-0 bg-white/90 backdrop-blur-md border-t border-ink-100/50 px-8 py-3.5 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-center gap-10 text-sm">
          <div
            className={`flex items-center gap-2.5 ${
              stats.missingCover > 0 ? "text-cinnabar-500" : "text-ink-400"
            }`}
          >
            {stats.missingCover > 0 && (
              <span className="w-2 h-2 rounded-full bg-cinnabar-500 animate-pulse-dot" />
            )}
            <span className="font-medium">缺封面</span>
            <span className="font-serif font-semibold">{stats.missingCover}</span>
          </div>
          <div
            className={`flex items-center gap-2.5 ${
              stats.unsignedAuth > 0 ? "text-cinnabar-500" : "text-ink-400"
            }`}
          >
            {stats.unsignedAuth > 0 && (
              <span className="w-2 h-2 rounded-full bg-cinnabar-500 animate-pulse-dot" />
            )}
            <span className="font-medium">未签授权</span>
            <span className="font-serif font-semibold">{stats.unsignedAuth}</span>
          </div>
          <div
            className={`flex items-center gap-2.5 ${
              stats.notUploaded > 0 ? "text-cinnabar-500" : "text-ink-400"
            }`}
          >
            {stats.notUploaded > 0 && (
              <span className="w-2 h-2 rounded-full bg-cinnabar-500 animate-pulse-dot" />
            )}
            <span className="font-medium">未上传</span>
            <span className="font-serif font-semibold">{stats.notUploaded}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
