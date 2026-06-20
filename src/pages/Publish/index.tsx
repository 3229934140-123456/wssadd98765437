import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { ProjectSubNav } from "@/components/Layout/Sidebar";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusStamp } from "@/components/StatusBadge";
import type { PublishChecklist } from "@/types";
import {
  ShieldCheck,
  BookOpen,
  Coins,
  PieChart,
  Ban,
  Lock,
  Unlock,
  ChevronDown,
  Check,
  Rocket,
} from "lucide-react";

type ChecklistKey = keyof Pick<PublishChecklist, "contentRating" | "sampleRange" | "priceSet" | "revenueDistribution" | "takedownRules">;

interface ChecklistItemConfig {
  key: ChecklistKey;
  title: string;
  description: string;
  icon: React.ElementType;
  detailContent: (checked: boolean, onConfirm: () => void) => React.ReactNode;
}

export default function Publish() {
  const { projectId } = useParams<{ projectId: string }>();
  const rawProjects = useAppStore((s) => s.projects);
  const rawChecklists = useAppStore((s) => s.publishChecklists);
  const updateChecklist = useAppStore((s) => s.updateChecklist);
  const publishProject = useAppStore((s) => s.publishProject);

  const project = rawProjects.find((p) => p.id === projectId);
  const checklist = rawChecklists.find((c) => c.projectId === projectId);
  const [expandedKey, setExpandedKey] = useState<ChecklistKey | null>(null);
  const [published, setPublished] = useState(false);

  if (!project || !checklist) return null;

  const isPublished = project.status === "published";

  const keys: ChecklistKey[] = [
    "contentRating",
    "sampleRange",
    "priceSet",
    "revenueDistribution",
    "takedownRules",
  ];

  const completedCount = keys.filter((k) => checklist[k]).length;
  const allComplete = completedCount === 5;

  const items: ChecklistItemConfig[] = [
    {
      key: "contentRating",
      title: "分级提示",
      description: "确认刊物的年龄分级标识已正确设置",
      icon: ShieldCheck,
      detailContent: (checked, onConfirm) => (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-ink-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cinnabar-50 text-cinnabar-600 rounded-lg text-xs font-medium border border-cinnabar-100">
              R-18
            </span>
            <span>或</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200">
              全年龄
            </span>
          </div>
          <p className="text-xs text-ink-400">请确认刊物封面与信息页的年龄分级标识已正确标注。若刊物含成人向内容，必须标注 R-18 标识。</p>
          {!checked && (
            <button
              onClick={onConfirm}
              className="text-xs text-cinnabar-500 font-medium hover:text-cinnabar-600 transition-colors"
            >
              ✓ 确认分级标识已设置
            </button>
          )}
        </div>
      ),
    },
    {
      key: "sampleRange",
      title: "试读范围",
      description: "设置试读页数范围，供读者预览",
      icon: BookOpen,
      detailContent: (checked, onConfirm) => (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-500">试读页数：</span>
            <span className="px-3 py-1 bg-washi-100 rounded-lg text-ink-700 font-medium">第 1 页 ~ 第 8 页</span>
          </div>
          <p className="text-xs text-ink-400">试读范围将免费开放给所有读者预览，建议选择封面及前数页内容。</p>
          {!checked && (
            <button
              onClick={onConfirm}
              className="text-xs text-cinnabar-500 font-medium hover:text-cinnabar-600 transition-colors"
            >
              ✓ 确认试读范围
            </button>
          )}
        </div>
      ),
    },
    {
      key: "priceSet",
      title: "价格",
      description: "确认刊物定价及货币单位",
      icon: Coins,
      detailContent: (checked, onConfirm) => (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-500">定价：</span>
            <span className="px-3 py-1 bg-gold/15 text-gold-dark rounded-lg font-medium border border-gold/30">
              ¥ 45.00
            </span>
          </div>
          <p className="text-xs text-ink-400">定价一经发布不可随意更改，请仔细确认。货币单位默认为人民币（CNY）。</p>
          {!checked && (
            <button
              onClick={onConfirm}
              className="text-xs text-cinnabar-500 font-medium hover:text-cinnabar-600 transition-colors"
            >
              ✓ 确认定价
            </button>
          )}
        </div>
      ),
    },
    {
      key: "revenueDistribution",
      title: "收益分配说明",
      description: "确认各参与者的收益分配比例和结算方式",
      icon: PieChart,
      detailContent: (checked, onConfirm) => (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">主催</span>
              <span className="text-ink-700 font-medium">40%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">画手</span>
              <span className="text-ink-700 font-medium">35%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">写手</span>
              <span className="text-ink-700 font-medium">20%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">校对</span>
              <span className="text-ink-700 font-medium">5%</span>
            </div>
          </div>
          <p className="text-xs text-ink-400">收益按月结算，次月15日前汇入各参与者账户。请确认所有参与者已同意此分配方案。</p>
          {!checked && (
            <button
              onClick={onConfirm}
              className="text-xs text-cinnabar-500 font-medium hover:text-cinnabar-600 transition-colors"
            >
              ✓ 确认分配方案
            </button>
          )}
        </div>
      ),
    },
    {
      key: "takedownRules",
      title: "下架规则",
      description: "确认刊物下架条件和退款政策",
      icon: Ban,
      detailContent: (checked, onConfirm) => (
        <div className="space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex items-start gap-2 text-ink-600">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-ink-400 flex-shrink-0" />
              <span>发行后30天内可申请下架，需全体参与者同意</span>
            </div>
            <div className="flex items-start gap-2 text-ink-600">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-ink-400 flex-shrink-0" />
              <span>下架后已购读者仍可阅读，不予退款</span>
            </div>
            <div className="flex items-start gap-2 text-ink-600">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-ink-400 flex-shrink-0" />
              <span>涉及侵权的刊物将被强制下架并全额退款</span>
            </div>
          </div>
          <p className="text-xs text-ink-400">下架规则将在购买页面公开展示，请确认内容无误。</p>
          {!checked && (
            <button
              onClick={onConfirm}
              className="text-xs text-cinnabar-500 font-medium hover:text-cinnabar-600 transition-colors"
            >
              ✓ 确认下架规则
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleConfirm = (key: ChecklistKey) => {
    updateChecklist(projectId!, { [key]: true });
  };

  const handlePublish = () => {
    if (!allComplete || isPublished) return;
    publishProject(projectId!);
    setPublished(true);
  };

  if (isPublished || published) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink-900">{project.name}</h1>
            <p className="text-sm text-ink-400 mt-1">发行确认</p>
          </div>
          <ProjectSubNav projectId={projectId!} />
        </div>

        <div className="ink-card p-12 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
          <motion.div
            initial={{ scale: 2.5, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="relative"
          >
            <div className="border-4 border-cinnabar-500 rounded-lg px-8 py-4 transform rotate-3">
              <span className="text-4xl font-serif font-bold text-cinnabar-500 tracking-widest">已发布</span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-cinnabar-500 rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-8 text-ink-500 text-sm"
          >
            刊物已成功发布上线，读者现在可以购买阅读
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-4"
          >
            <StatusStamp status="published" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-900">{project.name}</h1>
          <p className="text-sm text-ink-400 mt-1">发行确认</p>
        </div>
        <ProjectSubNav projectId={projectId!} />
      </div>

      <div className="ink-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-ink-700">
            检查进度
          </span>
          <span className="text-sm font-serif font-semibold text-cinnabar-500">
            {completedCount}/5 项已完成
          </span>
        </div>
        <ProgressBar value={(completedCount / 5) * 100} size="lg" />
      </div>

      <div className="ink-card p-6 max-w-2xl mx-auto">
        <div className="space-y-0">
          {items.map((item, index) => {
            const isExpanded = expandedKey === item.key;
            const isChecked = checklist[item.key];
            const Icon = item.icon;

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <div
                  className={`py-4 ${index > 0 ? "border-t border-ink-100/60" : ""}`}
                >
                  <button
                    onClick={() => setExpandedKey(isExpanded ? null : item.key)}
                    className="w-full flex items-center gap-4 text-left group"
                  >
                    <motion.div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isChecked
                          ? "bg-cinnabar-500 border-cinnabar-500"
                          : "border-ink-300 bg-white group-hover:border-ink-400"
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isChecked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className={`flex-shrink-0 transition-colors duration-300 ${
                            isChecked ? "text-cinnabar-500" : "text-ink-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium transition-colors duration-300 ${
                            isChecked ? "text-ink-900" : "text-ink-700"
                          }`}
                        >
                          {item.title}
                        </span>
                        {isChecked && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] text-cinnabar-500 font-medium bg-cinnabar-50 px-1.5 py-0.5 rounded"
                          >
                            已确认
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-ink-400 mt-1 ml-7">
                        {item.description}
                      </p>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 text-ink-300"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-11 mt-3 pl-4 border-l-2 border-washi-300">
                          {item.detailContent(isChecked, () => handleConfirm(item.key))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-56 right-0 z-40">
        <div className="bg-white/90 backdrop-blur-md border-t border-ink-100/50 px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <motion.button
              onClick={handlePublish}
              disabled={!allComplete}
              className={`w-full py-3.5 rounded-2xl font-serif font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-500 relative overflow-hidden ${
                allComplete
                  ? "text-white shadow-cinnabar"
                  : "text-ink-400 bg-ink-100 cursor-not-allowed"
              }`}
              whileTap={allComplete ? { scale: 0.98 } : undefined}
            >
              {allComplete && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ background: "linear-gradient(90deg, #c0392b, #e85d4a)" }}
                  animate={{
                    background: [
                      "linear-gradient(90deg, #c0392b, #e85d4a, #c0392b)",
                      "linear-gradient(90deg, #e85d4a, #c0392b, #e85d4a)",
                      "linear-gradient(90deg, #c0392b, #e85d4a, #c0392b)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2.5">
                <motion.div
                  key={allComplete ? "unlocked" : "locked"}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {allComplete ? <Unlock size={18} /> : <Lock size={18} />}
                </motion.div>
                <span>{allComplete ? "发布上线" : "请完成全部检查项"}</span>
                {allComplete && <Rocket size={16} />}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
