import { motion } from "framer-motion";

export function ProgressBar({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const heightMap = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const color = value >= 100 ? "bg-green-500" : value >= 60 ? "bg-indigo" : value >= 30 ? "bg-gold" : "bg-cinnabar-400";

  return (
    <div className={`${heightMap[size]} w-full bg-ink-100 rounded-full overflow-hidden`}>
      <motion.div
        className={`${heightMap[size]} ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export function CircularProgress({ value, size = 48 }: { value: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 100 ? "#22c55e" : value >= 60 ? "#2c3e7b" : value >= 30 ? "#d4a843" : "#e85d4a";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e8e6f0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-ink-700">{Math.round(value)}%</span>
      </div>
    </div>
  );
}
