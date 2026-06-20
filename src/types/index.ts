export type ProjectVisibility = "public" | "link" | "private";
export type ProjectStatus = "collecting" | "proofreading" | "publishing" | "published";
export type MemberRole = "organizer" | "artist" | "writer" | "proofreader";
export type ArticleType = "illustration" | "text" | "cover";
export type UploadStatus = "pending" | "uploaded" | "revision";
export type IssueType = "typo" | "page_break" | "bleed";
export type IssueStatus = "open" | "resolved" | "confirmed";

export interface Project {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  visibility: ProjectVisibility;
  deadline: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface Member {
  id: string;
  projectId: string;
  name: string;
  avatar: string;
  role: MemberRole;
}

export interface Article {
  id: string;
  projectId: string;
  assigneeId: string;
  title: string;
  type: ArticleType;
  sortOrder: number;
  uploadStatus: UploadStatus;
  pageCount: number;
  dimensions: string;
  hasCover: boolean;
  authorizationSigned: boolean;
  uploadedAt: string | null;
}

export interface FileVersion {
  id: string;
  articleId: string;
  fileName: string;
  fileUrl: string;
  version: number;
  uploadedAt: string;
}

export interface ProofreadIssue {
  id: string;
  projectId: string;
  articleId: string;
  type: IssueType;
  description: string;
  page: number;
  positionX: number;
  positionY: number;
  status: IssueStatus;
  reporterId: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface PublishChecklist {
  id: string;
  projectId: string;
  contentRating: boolean;
  sampleRange: boolean;
  priceSet: boolean;
  revenueDistribution: boolean;
  takedownRules: boolean;
  readyToPublish: boolean;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  detail: string;
  createdAt: string;
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  organizer: "主催",
  artist: "画手",
  writer: "写手",
  proofreader: "校对",
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  typo: "错字",
  page_break: "断页",
  bleed: "出血线",
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: "待处理",
  resolved: "已处理",
  confirmed: "已确认",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  collecting: "收稿中",
  proofreading: "校对中",
  publishing: "待发布",
  published: "已发布",
};

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  illustration: "插画",
  text: "文稿",
  cover: "封面",
};

export const VISIBILITY_LABELS: Record<ProjectVisibility, string> = {
  public: "公开",
  link: "仅链接",
  private: "私密",
};
