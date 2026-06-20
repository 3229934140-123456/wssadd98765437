export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;
  return formatDate(dateStr);
}

export function getInitials(name: string): string {
  return name.charAt(0);
}

export function calculateProjectProgress(articles: { uploadStatus: string; authorizationSigned: boolean }[]): number {
  if (articles.length === 0) return 0;
  let score = 0;
  for (const a of articles) {
    if (a.uploadStatus === "uploaded") score += 0.7;
    else if (a.uploadStatus === "revision") score += 0.4;
    if (a.authorizationSigned) score += 0.3;
  }
  return Math.round((score / articles.length) * 100);
}
