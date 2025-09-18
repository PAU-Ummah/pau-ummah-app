"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  label: string;
  hours: number;
  minutes: number;
  seconds: number;
  progress?: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 54;

export function CountdownTimer({ label, hours, minutes, seconds, progress = 0 }: CountdownTimerProps) {
  // Base motion value that reflects the incoming progress prop [0..1]
  const progressMV = useMotionValue(progress);

  // Update the motion value whenever the prop changes
  useEffect(() => {
    progressMV.set(progress);
  }, [progress, progressMV]);

  // Smooth spring based on the progress motion value
  const animated = useSpring(progressMV, { stiffness: 120, damping: 20 });

  // Derived motion value for the strokeDashoffset
  const dashOffset = useTransform(animated, (value) => CIRCUMFERENCE - value * CIRCUMFERENCE);

  return (
    <div className="relative flex flex-col items-center justify-center gap-3">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full rotate-[-90deg]">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="transparent"
            stroke="rgba(88, 164, 77, 0.15)"
            strokeWidth="8"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="transparent"
            stroke="url(#gradient)"
            strokeWidth="10"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#58a44d" />
              <stop offset="100%" stopColor="#34495e" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-white/80 text-[var(--brand-primary)]">
          <span className="text-lg font-semibold">{String(hours).padStart(2, "0")}</span>
          <span className="text-xs uppercase tracking-widest text-slate-500">hrs</span>
          <span className="text-lg font-semibold">{String(minutes).padStart(2, "0")}</span>
          <span className="text-xs uppercase tracking-widest text-slate-500">min</span>
        </div>
      </div>
      <span className={cn("text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-secondary)]")}>{label}</span>
      <p className="text-xs text-slate-500">
        Next prayer in {`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
      </p>
    </div>
  );
}
