import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, Member, Article, ProofreadIssue, PublishChecklist, ActivityLog, MemberRole, ProjectVisibility } from "@/types";
import { seedProjects, seedMembers, seedArticles, seedProofreadIssues, seedPublishChecklists, seedActivities, CURRENT_USER_ID } from "@/mock/seed";

interface AppState {
  projects: Project[];
  members: Member[];
  articles: Article[];
  proofreadIssues: ProofreadIssue[];
  publishChecklists: PublishChecklist[];
  activities: ActivityLog[];
  currentUserId: string;

  getProject: (id: string) => Project | undefined;
  getMembersByProject: (projectId: string) => Member[];
  getArticlesByProject: (projectId: string) => Article[];
  getArticlesByAssignee: (projectId: string, assigneeId: string) => Article[];
  getIssuesByProject: (projectId: string) => ProofreadIssue[];
  getIssuesByArticle: (articleId: string) => ProofreadIssue[];
  getChecklistByProject: (projectId: string) => PublishChecklist | undefined;
  getActivitiesByProject: (projectId: string) => ActivityLog[];
  getMemberById: (id: string) => Member | undefined;
  getCurrentUserProjects: () => Project[];
  getCurrentUserTodos: () => { type: string; detail: string; projectId: string; projectName: string; deadline: string }[];

  addProject: (project: Omit<Project, "id" | "createdAt" | "status">) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addMember: (member: Omit<Member, "id">) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: MemberRole) => void;
  addArticle: (article: Omit<Article, "id" | "sortOrder">) => void;
  removeArticle: (id: string) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  simulateUpload: (articleId: string, fileName: string) => void;
  signAuthorization: (articleId: string) => void;
  addProofreadIssue: (issue: Omit<ProofreadIssue, "id" | "createdAt" | "resolvedAt">) => void;
  resolveIssue: (id: string) => void;
  confirmIssue: (id: string) => void;
  updateChecklist: (projectId: string, updates: Partial<PublishChecklist>) => void;
  publishProject: (projectId: string) => void;
  addActivity: (projectId: string, action: string, detail: string) => void;
}

let nextId = 100;
const genId = (prefix: string) => `${prefix}${++nextId}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: seedProjects,
      members: seedMembers,
      articles: seedArticles,
      proofreadIssues: seedProofreadIssues,
      publishChecklists: seedPublishChecklists,
      activities: seedActivities,
      currentUserId: CURRENT_USER_ID,

      getProject: (id) => get().projects.find((p) => p.id === id),
      getMembersByProject: (projectId) => get().members.filter((m) => m.projectId === projectId),
      getArticlesByProject: (projectId) => get().articles.filter((a) => a.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder),
      getArticlesByAssignee: (projectId, assigneeId) => get().articles.filter((a) => a.projectId === projectId && a.assigneeId === assigneeId).sort((a, b) => a.sortOrder - b.sortOrder),
      getIssuesByProject: (projectId) => get().proofreadIssues.filter((i) => i.projectId === projectId),
      getIssuesByArticle: (articleId) => get().proofreadIssues.filter((i) => i.articleId === articleId),
      getChecklistByProject: (projectId) => get().publishChecklists.find((c) => c.projectId === projectId),
      getActivitiesByProject: (projectId) => get().activities.filter((a) => a.projectId === projectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getMemberById: (id) => get().members.find((m) => m.id === id),
      getCurrentUserProjects: () => {
        const userId = get().currentUserId;
        const memberOf = get().members.filter((m) => m.id === userId);
        return get().projects.filter((p) => memberOf.some((m) => m.projectId === p.id));
      },
      getCurrentUserTodos: () => {
        const userId = get().currentUserId;
        const memberOf = get().members.filter((m) => m.id === userId);
        const todos: { type: string; detail: string; projectId: string; projectName: string; deadline: string }[] = [];
        for (const membership of memberOf) {
          const project = get().projects.find((p) => p.id === membership.projectId);
          if (!project) continue;
          if (membership.role === "organizer") {
            const issues = get().proofreadIssues.filter((i) => i.projectId === membership.projectId && i.status === "resolved");
            for (const issue of issues) {
              const article = get().articles.find((a) => a.id === issue.articleId);
              todos.push({ type: "confirm", detail: `确认校对：${article?.title ?? ""}`, projectId: project.id, projectName: project.name, deadline: project.deadline });
            }
          }
          if (membership.role === "artist" || membership.role === "writer") {
            const myArticles = get().articles.filter((a) => a.assigneeId === userId && a.projectId === membership.projectId);
            for (const article of myArticles) {
              if (article.uploadStatus === "pending") {
                todos.push({ type: "upload", detail: `待上传：${article.title}`, projectId: project.id, projectName: project.name, deadline: project.deadline });
              }
              if (article.uploadStatus === "revision") {
                todos.push({ type: "revision", detail: `待修改：${article.title}`, projectId: project.id, projectName: project.name, deadline: project.deadline });
              }
              const openIssues = get().proofreadIssues.filter((i) => i.articleId === article.id && i.status === "open");
              if (openIssues.length > 0) {
                todos.push({ type: "fix", detail: `待处理标注：${article.title}（${openIssues.length}项）`, projectId: project.id, projectName: project.name, deadline: project.deadline });
              }
            }
          }
          if (membership.role === "proofreader") {
            const uploadedArticles = get().articles.filter((a) => a.projectId === membership.projectId && a.uploadStatus === "uploaded");
            if (uploadedArticles.length > 0 && project.status === "proofreading") {
              todos.push({ type: "proofread", detail: `待校对 ${uploadedArticles.length} 篇稿件`, projectId: project.id, projectName: project.name, deadline: project.deadline });
            }
          }
        }
        return todos;
      },

      addProject: (data) => {
        const id = genId("p");
        const now = new Date().toISOString();
        const project: Project = { ...data, id, status: "collecting", createdAt: now };
        const member: Member = { id: genId("m"), projectId: id, name: "织梦", avatar: "", role: "organizer" };
        const checklist: PublishChecklist = { id: genId("pc"), projectId: id, contentRating: false, sampleRange: false, priceSet: false, revenueDistribution: false, takedownRules: false, readyToPublish: false };
        set((s) => ({ projects: [...s.projects, project], members: [...s.members, member], publishChecklists: [...s.publishChecklists, checklist] }));
        return id;
      },
      updateProject: (id, updates) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
      addMember: (data) => set((s) => ({ members: [...s.members, { ...data, id: genId("m") }] })),
      removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
      updateMemberRole: (id, role) => set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, role } : m)) })),
      addArticle: (data) => {
        const projectArticles = get().articles.filter((a) => a.projectId === data.projectId);
        const sortOrder = projectArticles.length;
        set((s) => ({ articles: [...s.articles, { ...data, id: genId("a"), sortOrder }] }));
      },
      removeArticle: (id) => set((s) => ({ articles: s.articles.filter((a) => a.id !== id) })),
      updateArticle: (id, updates) => set((s) => ({ articles: s.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),
      simulateUpload: (articleId, fileName) => {
        const now = new Date().toISOString();
        const version = get().proofreadIssues.filter((i) => i.articleId === articleId).length + 1;
        set((s) => ({
          articles: s.articles.map((a) =>
            a.id === articleId ? { ...a, uploadStatus: "uploaded" as const, pageCount: Math.floor(Math.random() * 10) + 1, dimensions: "2480×3508", hasCover: true, uploadedAt: now } : a
          ),
        }));
        const article = get().articles.find((a) => a.id === articleId);
        if (article) {
          get().addActivity(article.projectId, "上传稿件", `上传了「${article.title}」`);
        }
      },
      signAuthorization: (articleId) => set((s) => ({ articles: s.articles.map((a) => (a.id === articleId ? { ...a, authorizationSigned: true } : a)) })),
      addProofreadIssue: (data) => {
        const now = new Date().toISOString();
        const issue: ProofreadIssue = { ...data, id: genId("pi"), createdAt: now, resolvedAt: null };
        set((s) => ({ proofreadIssues: [...s.proofreadIssues, issue] }));
        const article = get().articles.find((a) => a.id === data.articleId);
        if (article) {
          get().addActivity(data.projectId, "提交校对", `标注了「${article.title}」的问题`);
        }
      },
      resolveIssue: (id) => {
        const now = new Date().toISOString();
        set((s) => ({
          proofreadIssues: s.proofreadIssues.map((i) => (i.id === id ? { ...i, status: "resolved" as const, resolvedAt: now } : i)),
        }));
        const issue = get().proofreadIssues.find((i) => i.id === id);
        if (issue) {
          const article = get().articles.find((a) => a.id === issue.articleId);
          if (article) {
            get().addActivity(issue.projectId, "处理标注", `处理了「${article.title}」的校对标注`);
          }
        }
      },
      confirmIssue: (id) => {
        set((s) => ({
          proofreadIssues: s.proofreadIssues.map((i) => (i.id === id ? { ...i, status: "confirmed" as const } : i)),
        }));
        const issue = get().proofreadIssues.find((i) => i.id === id);
        if (issue) {
          const article = get().articles.find((a) => a.id === issue.articleId);
          if (article) {
            get().addActivity(issue.projectId, "确认校对", `确认了「${article.title}」的校对标注`);
          }
        }
      },
      updateChecklist: (projectId, updates) => {
        const checklist = get().getChecklistByProject(projectId);
        if (!checklist) return;
        const newChecklist = { ...checklist, ...updates };
        const allChecked = newChecklist.contentRating && newChecklist.sampleRange && newChecklist.priceSet && newChecklist.revenueDistribution && newChecklist.takedownRules;
        newChecklist.readyToPublish = allChecked;
        set((s) => ({
          publishChecklists: s.publishChecklists.map((c) => (c.projectId === projectId ? newChecklist : c)),
        }));
      },
      publishProject: (projectId) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === projectId ? { ...p, status: "published" as const } : p)),
        }));
        get().addActivity(projectId, "发布上线", "刊物已正式发布");
      },
      addActivity: (projectId, action, detail) => {
        const now = new Date().toISOString();
        const user = get().getMemberById(get().currentUserId);
        const activity: ActivityLog = { id: genId("act"), projectId, userId: get().currentUserId, userName: user?.name ?? "未知", action, detail, createdAt: now };
        set((s) => ({ activities: [...s.activities, activity] }));
      },
    }),
    { name: "doujin-workbench" }
  )
);
