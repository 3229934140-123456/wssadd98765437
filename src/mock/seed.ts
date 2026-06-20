import type {
  Project,
  Member,
  Article,
  FileVersion,
  ProofreadIssue,
  PublishChecklist,
  ActivityLog,
} from "@/types";

const CURRENT_USER_ID = "m1";

export { CURRENT_USER_ID };

export const seedProjects: Project[] = [
  {
    id: "p1",
    name: "星霜纪年·冬之卷",
    description: "以冬日为主题的合志，收录插画与短篇小说",
    coverUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20style%20winter%20anthology%20book%20cover%2C%20snow%20covered%20temple%2C%20ink%20wash%20painting%2C%20elegant%20minimalist%20design&image_size=portrait_4_3",
    visibility: "public",
    deadline: "2026-08-15",
    status: "collecting",
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "p2",
    name: "花火与约定",
    description: "夏日祭典主题纪念本，记录社团三周年",
    coverUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20summer%20festival%20fireworks%20anthology%20cover%2C%20colorful%20lanterns%2C%20night%20sky%2C%20festive%20mood&image_size=portrait_4_3",
    visibility: "link",
    deadline: "2026-07-20",
    status: "proofreading",
    createdAt: "2026-03-15T08:00:00Z",
  },
  {
    id: "p3",
    name: "墨痕·第十期",
    description: "社团定期刊物第十期，特邀外部作者参与",
    coverUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20calligraphy%20magazine%20cover%2C%20brush%20strokes%2C%20traditional%20pattern%20border%2C%20sophisticated&image_size=portrait_4_3",
    visibility: "private",
    deadline: "2026-09-30",
    status: "publishing",
    createdAt: "2026-02-01T12:00:00Z",
  },
];

export const seedMembers: Member[] = [
  { id: "m1", projectId: "p1", name: "织梦", avatar: "", role: "organizer" },
  { id: "m2", projectId: "p1", name: "岚月", avatar: "", role: "artist" },
  { id: "m3", projectId: "p1", name: "青砚", avatar: "", role: "writer" },
  { id: "m4", projectId: "p1", name: "校雠", avatar: "", role: "proofreader" },
  { id: "m5", projectId: "p1", name: "朱砂", avatar: "", role: "artist" },
  { id: "m6", projectId: "p2", name: "织梦", avatar: "", role: "organizer" },
  { id: "m7", projectId: "p2", name: "岚月", avatar: "", role: "artist" },
  { id: "m8", projectId: "p2", name: "墨竹", avatar: "", role: "writer" },
  { id: "m9", projectId: "p2", name: "校雠", avatar: "", role: "proofreader" },
  { id: "m10", projectId: "p3", name: "织梦", avatar: "", role: "organizer" },
  { id: "m11", projectId: "p3", name: "朱砂", avatar: "", role: "artist" },
  { id: "m12", projectId: "p3", name: "青砚", avatar: "", role: "writer" },
  { id: "m13", projectId: "p3", name: "校雠", avatar: "", role: "proofreader" },
];

export const seedArticles: Article[] = [
  { id: "a1", projectId: "p1", assigneeId: "m2", title: "雪中寺", type: "illustration", sortOrder: 1, uploadStatus: "uploaded", pageCount: 2, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-05-10T14:00:00Z" },
  { id: "a2", projectId: "p1", assigneeId: "m3", title: "炉边夜话", type: "text", sortOrder: 2, uploadStatus: "uploaded", pageCount: 8, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-05-12T09:00:00Z" },
  { id: "a3", projectId: "p1", assigneeId: "m5", title: "冬之扉", type: "cover", sortOrder: 0, uploadStatus: "uploaded", pageCount: 1, dimensions: "2480×3508", hasCover: true, authorizationSigned: false, uploadedAt: "2026-05-08T16:00:00Z" },
  { id: "a4", projectId: "p1", assigneeId: "m2", title: "冰湖月", type: "illustration", sortOrder: 3, uploadStatus: "pending", pageCount: 0, dimensions: "", hasCover: false, authorizationSigned: false, uploadedAt: null },
  { id: "a5", projectId: "p1", assigneeId: "m3", title: "归乡路", type: "text", sortOrder: 4, uploadStatus: "revision", pageCount: 6, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-05-15T11:00:00Z" },
  { id: "a6", projectId: "p2", assigneeId: "m7", title: "花火夜", type: "cover", sortOrder: 0, uploadStatus: "uploaded", pageCount: 1, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-04-20T10:00:00Z" },
  { id: "a7", projectId: "p2", assigneeId: "m7", title: "祭典之光", type: "illustration", sortOrder: 1, uploadStatus: "uploaded", pageCount: 2, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-04-22T15:00:00Z" },
  { id: "a8", projectId: "p2", assigneeId: "m8", title: "约定", type: "text", sortOrder: 2, uploadStatus: "uploaded", pageCount: 12, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-04-25T09:00:00Z" },
  { id: "a9", projectId: "p3", assigneeId: "m11", title: "墨痕封面", type: "cover", sortOrder: 0, uploadStatus: "uploaded", pageCount: 1, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-03-01T10:00:00Z" },
  { id: "a10", projectId: "p3", assigneeId: "m11", title: "山水卷", type: "illustration", sortOrder: 1, uploadStatus: "uploaded", pageCount: 4, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-03-05T14:00:00Z" },
  { id: "a11", projectId: "p3", assigneeId: "m12", title: "墨痕序章", type: "text", sortOrder: 2, uploadStatus: "uploaded", pageCount: 6, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-03-10T08:00:00Z" },
  { id: "a12", projectId: "p3", assigneeId: "m12", title: "第十封信", type: "text", sortOrder: 3, uploadStatus: "uploaded", pageCount: 10, dimensions: "2480×3508", hasCover: true, authorizationSigned: true, uploadedAt: "2026-03-15T12:00:00Z" },
];

export const seedFileVersions: FileVersion[] = [
  { id: "fv1", articleId: "a1", fileName: "雪中寺_v1.png", fileUrl: "", version: 1, uploadedAt: "2026-05-10T14:00:00Z" },
  { id: "fv2", articleId: "a2", fileName: "炉边夜话_v1.pdf", fileUrl: "", version: 1, uploadedAt: "2026-05-12T09:00:00Z" },
  { id: "fv3", articleId: "a3", fileName: "冬之扉_v1.png", fileUrl: "", version: 1, uploadedAt: "2026-05-08T16:00:00Z" },
  { id: "fv4", articleId: "a5", fileName: "归乡路_v1.pdf", fileUrl: "", version: 1, uploadedAt: "2026-05-15T11:00:00Z" },
  { id: "fv5", articleId: "a5", fileName: "归乡路_v2.pdf", fileUrl: "", version: 2, uploadedAt: "2026-05-18T09:00:00Z" },
  { id: "fv6", articleId: "a6", fileName: "花火夜_v1.png", fileUrl: "", version: 1, uploadedAt: "2026-04-20T10:00:00Z" },
  { id: "fv7", articleId: "a7", fileName: "祭典之光_v1.png", fileUrl: "", version: 1, uploadedAt: "2026-04-22T15:00:00Z" },
  { id: "fv8", articleId: "a8", fileName: "约定_v1.pdf", fileUrl: "", version: 1, uploadedAt: "2026-04-25T09:00:00Z" },
  { id: "fv9", articleId: "a9", fileName: "墨痕封面_v1.png", fileUrl: "", version: 1, uploadedAt: "2026-03-01T10:00:00Z" },
  { id: "fv10", articleId: "a10", fileName: "山水卷_v1.png", fileUrl: "", version: 1, uploadedAt: "2026-03-05T14:00:00Z" },
  { id: "fv11", articleId: "a11", fileName: "墨痕序章_v1.pdf", fileUrl: "", version: 1, uploadedAt: "2026-03-10T08:00:00Z" },
  { id: "fv12", articleId: "a12", fileName: "第十封信_v1.pdf", fileUrl: "", version: 1, uploadedAt: "2026-03-15T12:00:00Z" },
];

export const seedProofreadIssues: ProofreadIssue[] = [
  { id: "pi1", projectId: "p2", articleId: "a8", type: "typo", description: "第3页第2段「絢爛」应为「絢爛」", page: 3, positionX: 45, positionY: 60, status: "resolved", reporterId: "m9", createdAt: "2026-05-01T10:00:00Z", resolvedAt: "2026-05-03T14:00:00Z" },
  { id: "pi2", projectId: "p2", articleId: "a8", type: "page_break", description: "第5页与第6页之间断页，段落被截断", page: 5, positionX: 50, positionY: 85, status: "open", reporterId: "m9", createdAt: "2026-05-01T10:30:00Z", resolvedAt: null },
  { id: "pi3", projectId: "p2", articleId: "a7", type: "bleed", description: "右侧出血线不足，画面延伸超出裁切范围", page: 1, positionX: 90, positionY: 50, status: "open", reporterId: "m9", createdAt: "2026-05-02T09:00:00Z", resolvedAt: null },
  { id: "pi4", projectId: "p3", articleId: "a11", type: "typo", description: "第2页第1行「墨痕」应使用粗体", page: 2, positionX: 30, positionY: 20, status: "confirmed", reporterId: "m13", createdAt: "2026-04-01T10:00:00Z", resolvedAt: "2026-04-03T09:00:00Z" },
  { id: "pi5", projectId: "p3", articleId: "a12", type: "page_break", description: "第7页表格跨页显示不完整", page: 7, positionX: 50, positionY: 75, status: "resolved", reporterId: "m13", createdAt: "2026-04-02T11:00:00Z", resolvedAt: "2026-04-05T16:00:00Z" },
];

export const seedPublishChecklists: PublishChecklist[] = [
  { id: "pc1", projectId: "p1", contentRating: false, sampleRange: false, priceSet: false, revenueDistribution: false, takedownRules: false, readyToPublish: false },
  { id: "pc2", projectId: "p2", contentRating: true, sampleRange: true, priceSet: false, revenueDistribution: false, takedownRules: true, readyToPublish: false },
  { id: "pc3", projectId: "p3", contentRating: true, sampleRange: true, priceSet: true, revenueDistribution: true, takedownRules: true, readyToPublish: true },
];

export const seedActivities: ActivityLog[] = [
  { id: "act1", projectId: "p1", userId: "m2", userName: "岚月", action: "上传稿件", detail: "上传了「雪中寺」", createdAt: "2026-05-10T14:00:00Z" },
  { id: "act2", projectId: "p1", userId: "m3", userName: "青砚", action: "上传稿件", detail: "上传了「炉边夜话」", createdAt: "2026-05-12T09:00:00Z" },
  { id: "act3", projectId: "p1", userId: "m5", userName: "朱砂", action: "上传封面", detail: "上传了封面「冬之扉」", createdAt: "2026-05-08T16:00:00Z" },
  { id: "act4", projectId: "p1", userId: "m3", userName: "青砚", action: "修改稿件", detail: "重新上传了「归乡路」v2", createdAt: "2026-05-18T09:00:00Z" },
  { id: "act5", projectId: "p2", userId: "m7", userName: "岚月", action: "上传封面", detail: "上传了封面「花火夜」", createdAt: "2026-04-20T10:00:00Z" },
  { id: "act6", projectId: "p2", userId: "m9", userName: "校雠", action: "提交校对", detail: "标注了「约定」中的错字问题", createdAt: "2026-05-01T10:00:00Z" },
  { id: "act7", projectId: "p2", userId: "m8", userName: "墨竹", action: "处理标注", detail: "处理了「约定」中的错字问题", createdAt: "2026-05-03T14:00:00Z" },
  { id: "act8", projectId: "p3", userId: "m13", userName: "校雠", action: "确认校对", detail: "确认了「墨痕序章」的校对标注", createdAt: "2026-04-03T09:00:00Z" },
];
