import type { ProjectStatus } from "@/types";
import { PROJECT_STATUS_LABELS } from "@/types";

const statusClasses: Record<ProjectStatus, string> = {
  collecting: "stamp-collecting",
  proofreading: "stamp-proofreading",
  publishing: "stamp-published",
  published: "stamp-published",
};

export function StatusStamp({ status }: { status: ProjectStatus }) {
  return (
    <span className={`${statusClasses[status]} animate-stamp-down`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

export function IssueStatusBadge({ status }: { status: "open" | "resolved" | "confirmed" }) {
  const config = {
    open: "bg-cinnabar-50 text-cinnabar-600 border-cinnabar-100",
    resolved: "bg-indigo/10 text-indigo border-indigo/20",
    confirmed: "bg-green-50 text-green-700 border-green-200",
  };
  const labels = { open: "待处理", resolved: "已处理", confirmed: "已确认" };
  return (
    <span className={`stamp-mark ${config[status]} border`}>
      {labels[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const config: Record<string, string> = {
    organizer: "bg-cinnabar-50 text-cinnabar-600 border-cinnabar-100",
    artist: "bg-indigo/10 text-indigo border-indigo/20",
    writer: "bg-gold/15 text-gold-dark border-gold/30",
    proofreader: "bg-ink-50 text-ink-600 border-ink-100",
  };
  const labels: Record<string, string> = {
    organizer: "主催",
    artist: "画手",
    writer: "写手",
    proofreader: "校对",
  };
  return (
    <span className={`stamp-mark ${config[role] ?? ""} border`}>
      {labels[role] ?? role}
    </span>
  );
}
