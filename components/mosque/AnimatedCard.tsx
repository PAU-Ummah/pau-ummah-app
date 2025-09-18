"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  loading?: boolean;
}

export function AnimatedCard({ children, className, delay = 0, loading = false }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      viewport={{ once: true, amount: 0.2 }}
      className={cn("relative", className)}
    >
      <motion.div
        whileHover={{ translateY: -4, boxShadow: "0px 16px 35px rgba(0,31,63,0.12)" }}
        className="h-full rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur-sm"
      >
        {loading ? <Skeleton className="h-40 w-full" /> : children}
      </motion.div>
    </motion.div>
  );
}
