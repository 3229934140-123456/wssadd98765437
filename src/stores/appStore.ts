import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, Member, Article, ProofreadIssue, PublishChecklist, ActivityLog, MemberRole, FileVersion } from "@/types";
import { seedProjects, seedMembers, seedArticles, seedFileVersions, seedProofreadIssues, seedPublishChecklists, seedActivities, CURRENT_USER_ID } from "@/mock/seed";

interface NewProjectMember {
  name: string;
  role: MemberRole;
}

interface NewProjectArticle {
  title: string;
  type: "illustration" | "text" | "cover";
  assigneeId: string;
}

interface AppState {
  projects: Project[];
  members: Member[];
  articles: Article[];
  fileVersions: FileVersion[];
  proofreadIssues: ProofreadIssue[];
  publishChecklists: PublishChecklist[];
  activities: ActivityLog[];
  currentUserId: string;

  getProject: (id: string) => Project | undefined;
  getMembersByProject: (projectId: string) => Member[];
  getArticlesByProject: (projectId: string) => Article[];
  getArticlesByAssignee: (projectId: string, assigneeId: string) => Article[];
  getFileVersionsByArticle: (articleId: string) => FileVersion[];
  getIssuesByProject: (projectId: string) => ProofreadIssue[];
  getIssuesByArticle: (articleId: string) => ProofreadIssue[];
  getChecklistByProject: (projectId: string) => PublishChecklist | undefined;
  getActivitiesByProject: (projectId: string) => ActivityLog[];
  getMemberById: (id: string) => Member | undefined;
  getCurrentUserProjects: () => Project[];
  getCurrentUserTodos: () => { type: string; detail: string; projectId: string; projectName: string; deadline: string }[];
  setCurrentUserId: (id: string) => void;

  addProject: (
    project: Omit<Project, "id" | "createdAt" | "status">,
    members?: NewProjectMember[],
    articles?: NewProjectArticle[]
  ) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addMember: (member: Omit<Member, "id">) => string;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: MemberRole) => void;
  addArticle: (article: Omit<Article, "id" | "sortOrder">) => string;
  removeArticle: (id: string) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  simulateUpload: (articleId: string, fileName: string, note?: string) => void;
  signAuthorization: (articleId: string) => void;
  addProofreadIssue: (issue: Omit<ProofreadIssue, "id" | "createdAt" | "resolvedAt">) => void;
  resolveIssue: (id: string) => void;
  confirmIssue: (id: string) => void;
  batchConfirmIssues: (ids: string[]) => void;
  updateChecklist: (projectId: string, updates: Partial<PublishChecklist>) => void;
  publishProject: (projectId: string) => void;
  addActivity: (projectId: string, action: string, detail: string) => void;
}

let nextId = 1000;
const genId = (prefix: string) => `${prefix}${++nextId}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: seedProjects,
      members: seedMembers,
      articles: seedArticles,
      fileVersions: seedFileVersions,
      proofreadIssues: seedProofreadIssues,
      publishChecklists: seedPublishChecklists,
      activities: seedActivities,
      currentUserId: CURRENT_USER_ID,

      getProject: (id) => get().projects.find((p) => p.id === id),
      getMembersByProject: (projectId) => get().members.filter((m) => m.projectId === projectId),
      getArticlesByProject: (projectId) => get().articles.filter((a) => a.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder),
      getArticlesByAssignee: (projectId, assigneeId) => get().articles.filter((a) => a.projectId === projectId && a.assigneeId === assigneeId).sort((a, b) => a.sortOrder - b.sortOrder),
      getFileVersionsByArticle: (articleId) => get().fileVersions.filter((v) => v.articleId === articleId).sort((a, b) => b.version - a.version),
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

      setCurrentUserId: (id) => set({ currentUserId: id }),

      addProject: (data, members, articles) => {
        const id = genId("p");
        const now = new Date().toISOString();
        const userId = get().currentUserId;
        const existingMember = get().members.find((m) => m.id === userId);
        const organizerName = existingMember?.name ?? "未知用户";

        const project: Project = { ...data, id, status: "collecting", createdAt: now };
        const organizer: Member = { id: userId, projectId: id, name: organizerName, avatar: "", role: "organizer" };
        const checklist: PublishChecklist = { id: genId("pc"), projectId: id, contentRating: false, sampleRange: false, priceSet: false, revenueDistribution: false, takedownRules: false, readyToPublish: false };

        const newMembers: Member[] = [organizer];
        const memberIdMap = new Map<string, string>();
        if (members) {
          for (const m of members) {
            const existing = get().members.find((mem) => mem.name === m.name);
            let memberId: string;
            if (existing) {
              memberId = existing.id;
              const duplicate = newMembers.find((nm) => nm.id === memberId && nm.projectId === id);
              if (!duplicate) {
                newMembers.push({ id: memberId, projectId: id, name: m.name, avatar: "", role: m.role });
              }
            } else {
              memberId = genId("m");
              newMembers.push({ id: memberId, projectId: id, name: m.name, avatar: "", role: m.role });
            }
            memberIdMap.set(m.name, memberId);
          }
        }

        const newArticles: Article[] = [];
        if (articles) {
          articles.forEach((a, idx) => {
            let assigneeId = a.assigneeId;
            if (memberIdMap.has(assigneeId)) {
              assigneeId = memberIdMap.get(assigneeId)!;
            }
            if (!assigneeId && a.type === "cover") {
              assigneeId = userId;
            }
            newArticles.push({
              id: genId("a"),
              projectId: id,
              assigneeId,
              title: a.title,
              type: a.type,
              sortOrder: idx,
              uploadStatus: "pending",
              pageCount: 0,
              dimensions: "",
              hasCover: false,
              authorizationSigned: false,
              uploadedAt: null,
            });
          });
        }

        const allMembers = [...get().members];
        for (const m of newMembers) {
          const exists = allMembers.find((am) => am.id === m.id && am.projectId === m.projectId);
          if (!exists) {
            allMembers.push(m);
          }
        }

        set((s) => ({
          projects: [...s.projects, project],
          members: allMembers,
          articles: [...s.articles, ...newArticles],
          publishChecklists: [...s.publishChecklists, checklist],
        }));

        get().addActivity(id, "创建项目", `创建了合志「${project.name}」`);
        return id;
      },

      updateProject: (id, updates) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),

      addMember: (data) => {
        const id = genId("m");
        set((s) => ({ members: [...s.members, { ...data, id }] }));
        return id;
      },

      removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),

      updateMemberRole: (id, role) => set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, role } : m)) })),

      addArticle: (data) => {
        const projectArticles = get().articles.filter((a) => a.projectId === data.projectId);
        const sortOrder = projectArticles.length;
        const id = genId("a");
        set((s) => ({ articles: [...s.articles, { ...data, id, sortOrder }] }));
        return id;
      },

      removeArticle: (id) => set((s) => ({ articles: s.articles.filter((a) => a.id !== id) })),

      updateArticle: (id, updates) => set((s) => ({ articles: s.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),

      simulateUpload: (articleId, fileName, note) => {
        const now = new Date().toISOString();
        const existingVersions = get().fileVersions.filter((v) => v.articleId === articleId);
        const version = existingVersions.length + 1;

        const fileVersion: FileVersion = {
          id: genId("fv"),
          articleId,
          fileName,
          fileUrl: "",
          version,
          note: note ?? "",
          uploadedAt: now,
        };

        set((s) => ({
          articles: s.articles.map((a) =>
            a.id === articleId ? { ...a, uploadStatus: version > 1 ? ("revision" as const) : ("uploaded" as const), pageCount: Math.floor(Math.random() * 10) + 1, dimensions: "2480×3508", hasCover: true, uploadedAt: now } : a
          ),
          fileVersions: [...s.fileVersions, fileVersion],
        }));

        const article = get().articles.find((a) => a.id === articleId);
        if (article) {
          get().addActivity(article.projectId, version > 1 ? "更新稿件" : "上传稿件", `${version > 1 ? "更新了" : "上传了"}「${article.title}」v${version}${note ? ` - ${note}` : ""}`);
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

      batchConfirmIssues: (ids) => {
        if (ids.length === 0) return;
        const now = new Date().toISOString();
        const idSet = new Set(ids);
        set((s) => ({
          proofreadIssues: s.proofreadIssues.map((i) =>
            idSet.has(i.id) && i.status === "resolved" ? { ...i, status: "confirmed" as const } : i
          ),
        }));
        const issues = get().proofreadIssues.filter((i) => idSet.has(i.id));
        const projectId = issues[0]?.projectId;
        if (projectId) {
          get().addActivity(projectId, "批量确认校对", `批量确认了 ${ids.length} 条校对标注`);
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
