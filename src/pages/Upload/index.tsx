import { useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { ProjectSubNav } from "@/components/Layout/Sidebar";
import { StatusStamp, RoleBadge } from "@/components/StatusBadge";
import { ARTICLE_TYPE_LABELS } from "@/types";
import type { Article, ArticleType, FileVersion } from "@/types";
import { formatRelativeTime } from "@/utils";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Shield,
  Clock,
  FileCheck,
} from "lucide-react";

const typeConfig: Record<ArticleType, { icon: typeof Upload; className: string }> = {
  illustration: { icon: ImageIcon, className: "bg-indigo/10 text-indigo border-indigo/20" },
  text: { icon: FileText, className: "bg-gold/15 text-gold-dark border-gold/30" },
  cover: { icon: BookOpen, className: "bg-cinnabar-50 text-cinnabar-600 border-cinnabar-100" },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const versionItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const versionListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface ArticleCardProps {
  article: Article;
  rawFileVersions: FileVersion[];
  expandedVersions: Set<string>;
  toggleVersion: (articleId: string) => void;
  handleUpload: (article: Article) => void;
  onSignAuth: (article: Article) => void;
}

function ArticleCard({
  article,
  rawFileVersions,
  expandedVersions,
  toggleVersion,
  handleUpload,
  onSignAuth,
}: ArticleCardProps) {
  const typeInfo = typeConfig[article.type];
  const TypeIcon = typeInfo.icon;
  const isUploaded = article.uploadStatus === "uploaded" || article.uploadStatus === "revision";
  const showVersionHistory = isUploaded;

  const versions = useMemo(
    () => rawFileVersions.filter((v) => v.articleId === article.id).sort((a, b) => b.version - a.version),
    [rawFileVersions, article.id]
  );
  const latestVersion = versions[0];

  return (
    <motion.div key={article.id} variants={itemVariants} className="ink-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${typeInfo.className}`}>
              <TypeIcon size={18} />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-ink-900">{article.title}</h3>
              <span className={`stamp-mark ${typeInfo.className} border text-[10px] mt-1`}>
                {ARTICLE_TYPE_LABELS[article.type]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {article.authorizationSigned ? (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </span>
                已签署
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="flex items-center gap-1.5 text-cinnabar-500 text-sm font-medium">
                  <span className="w-5 h-5 rounded-full bg-cinnabar-50 flex items-center justify-center">
                    <X size={12} strokeWidth={3} />
                  </span>
                  未签署
                </span>
                {isUploaded && (
                  <button onClick={() => onSignAuth(article)} className="btn-cinnabar text-xs px-3 py-1.5">
                    签署授权
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        {!isUploaded ? (
          <button
            onClick={() => handleUpload(article)}
            className="w-full border-2 border-dashed border-ink-200 hover:border-indigo/40 rounded-2xl p-8 washi-texture transition-colors duration-200 group cursor-pointer"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-ink-50 group-hover:bg-indigo/10 flex items-center justify-center transition-colors">
                <Upload size={20} className="text-ink-300 group-hover:text-indigo transition-colors" />
              </div>
              <span className="text-sm text-ink-400 group-hover:text-ink-600 transition-colors">点击或拖拽上传</span>
            </div>
          </button>
        ) : (
          <div className="p-4 bg-washi-50/60 rounded-2xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo/10 to-indigo/5 border border-indigo/20 flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold text-indigo">v{latestVersion?.version ?? 1}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink-900 truncate" title={latestVersion?.fileName}>
                  {latestVersion?.fileName}
                </p>
                <p className="text-xs text-ink-400 mt-1 flex items-center gap-1">
                  <Clock size={11} />
                  {latestVersion?.uploadedAt ? formatRelativeTime(latestVersion.uploadedAt) : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {article.uploadStatus === "revision" && (
                  <span className="stamp-mark bg-gold/15 text-gold-dark border border-gold/30 text-[10px]">修改稿</span>
                )}
                <button
                  onClick={() => toggleVersion(article.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 hover:border-indigo/30 hover:bg-indigo/5 text-xs text-ink-600 hover:text-indigo transition-all"
                >
                  <FileCheck size={13} />
                  版本记录
                  {expandedVersions.has(article.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-3 border-t border-ink-100">
              <div className="text-center min-w-[64px]">
                <p className="text-3xl font-serif font-bold text-ink-900">{article.pageCount}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">页数</p>
              </div>
              <div className="h-10 w-px bg-ink-100" />
              <div className="flex-1">
                <p className="text-sm text-ink-600">尺寸：{article.dimensions}</p>
              </div>
              <button
                onClick={() => handleUpload(article)}
                className="btn-outline text-xs px-4 py-2"
              >
                <Upload size={12} className="inline mr-1.5" />
                上传新版本
              </button>
            </div>
          </div>
        )}

        {showVersionHistory && (
          <AnimatePresence>
            {expandedVersions.has(article.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="pl-2 border-l-2 border-ink-100">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={versionListVariants}
                    className="space-y-3"
                  >
                    {versions.map((version: FileVersion, index: number) => (
                      <motion.div
                        key={version.id}
                        variants={versionItemVariants}
                        className="relative pl-4"
                      >
                        <div
                          className={`absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 ${
                            index === 0
                              ? "bg-indigo border-indigo"
                              : "bg-washi-50 border-ink-200"
                          }`}
                        />
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold ${
                                  index === 0
                                    ? "bg-indigo/10 text-indigo"
                                    : "bg-ink-100 text-ink-500"
                                }`}
                              >
                                v{version.version}
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  index === 0 ? "text-ink-900" : "text-ink-600"
                                }`}
                              >
                                {index === 0 ? "当前版本" : `历史版本`}
                              </span>
                            </div>
                            <p
                              className={`text-xs mt-1 truncate ${
                                index === 0 ? "text-ink-700" : "text-ink-500"
                              }`}
                              title={version.fileName}
                            >
                              {version.fileName}
                            </p>
                            <p className="text-[11px] text-ink-400 mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {formatRelativeTime(version.uploadedAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

export default function UploadPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const rawProjects = useAppStore((s) => s.projects);
  const rawMembers = useAppStore((s) => s.members);
  const rawArticles = useAppStore((s) => s.articles);
  const rawFileVersions = useAppStore((s) => s.fileVersions);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const simulateUpload = useAppStore((s) => s.simulateUpload);
  const signAuthorization = useAppStore((s) => s.signAuthorization);

  const project = rawProjects.find((p) => p.id === projectId);
  const articles = useMemo(
    () => rawArticles.filter((a) => a.projectId === projectId && a.assigneeId === currentUserId).sort((a, b) => a.sortOrder - b.sortOrder),
    [rawArticles, projectId, currentUserId]
  );
  const currentMember = rawMembers.find((m) => m.id === currentUserId && m.projectId === projectId);

  const [authModalArticle, setAuthModalArticle] = useState<Article | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authSignature, setAuthSignature] = useState("");
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const handleUpload = useCallback(
    (article: Article) => {
      const ext = article.type === "text" ? "pdf" : "png";
      const existingVersions = rawFileVersions.filter((v) => v.articleId === article.id);
      const nextVersion = existingVersions.length + 1;
      const defaultName = `${article.title}_v${nextVersion}`;
      const fileName = window.prompt("请输入文件名（不含扩展名）：", defaultName) || defaultName;
      simulateUpload(article.id, `${fileName}.${ext}`);
    },
    [simulateUpload, rawFileVersions]
  );

  const handleSignAuth = useCallback(() => {
    if (!authModalArticle || !authChecked || !authSignature.trim()) return;
    signAuthorization(authModalArticle.id);
    setAuthModalArticle(null);
    setAuthChecked(false);
    setAuthSignature("");
  }, [authModalArticle, authChecked, authSignature, signAuthorization]);

  const toggleVersion = useCallback((articleId: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) next.delete(articleId);
      else next.add(articleId);
      return next;
    });
  }, []);

  const closeModal = useCallback(() => {
    setAuthModalArticle(null);
    setAuthChecked(false);
    setAuthSignature("");
  }, []);

  if (!project) return null;

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <Link
          to={`/project/${projectId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          返回项目
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-ink-900">{project.name}</h1>
              <p className="text-ink-400 mt-1 flex items-center gap-2">
                收稿上传
                <StatusStamp status={project.status} />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentMember && <RoleBadge role={currentMember.role} />}
            <ProjectSubNav projectId={projectId!} />
          </div>
        </div>
      </header>

      {articles.length === 0 ? (
        <div className="ink-card p-12 text-center">
          <Upload size={48} className="mx-auto text-ink-200 mb-4" />
          <p className="text-ink-400">暂无分配给你的稿件</p>
        </div>
      ) : (
        <motion.div className="grid gap-5" variants={containerVariants} initial="hidden" animate="visible">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              rawFileVersions={rawFileVersions}
              expandedVersions={expandedVersions}
              toggleVersion={toggleVersion}
              handleUpload={handleUpload}
              onSignAuth={setAuthModalArticle}
            />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {authModalArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="ink-card w-full max-w-md mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-cinnabar-50 flex items-center justify-center">
                  <Shield size={20} className="text-cinnabar-500" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-ink-900">签署授权声明</h3>
                  <p className="text-xs text-ink-400">「{authModalArticle.title}」</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={authChecked}
                    onChange={(e) => setAuthChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-ink-300 text-cinnabar-500 focus:ring-cinnabar-500"
                  />
                  <span className="text-sm text-ink-600 group-hover:text-ink-900 transition-colors">
                    我确认已阅读并同意授权说明
                  </span>
                </label>

                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">签名</label>
                  <input
                    type="text"
                    value={authSignature}
                    onChange={(e) => setAuthSignature(e.target.value)}
                    placeholder="请输入你的签名"
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 bg-washi-50/40 text-ink-900 placeholder:text-ink-300 focus:border-cinnabar-400 focus:ring-1 focus:ring-cinnabar-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={closeModal} className="btn-outline text-sm px-4 py-2">
                  取消
                </button>
                <button
                  onClick={handleSignAuth}
                  disabled={!authChecked || !authSignature.trim()}
                  className="btn-cinnabar text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-cinnabar"
                >
                  确认签署
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
