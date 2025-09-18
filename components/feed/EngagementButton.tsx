"use client";

import { motion } from "framer-motion";
import { cn, formatNumber } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EngagementButtonProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export function EngagementButton({ icon: Icon, label, count, active, onClick }: EngagementButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-full bg-black/30 px-3 py-2 text-white backdrop-blur-xl transition",
        active ? "bg-[var(--brand-secondary)]/80" : "hover:bg-black/50",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</span>
      {typeof count !== "undefined" ? (
        <span className="text-xs font-semibold text-white/80">{formatNumber(count)}</span>
      ) : null}
    </motion.button>
  );
}
