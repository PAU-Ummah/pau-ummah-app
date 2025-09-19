"use client";

import { cn } from "@/lib/utils";

interface FilterPillsProps<TValue extends string> {
  filters: { label: string; value: TValue }[];
  active: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  variant?: "default" | "compact";
}

export function FilterPills<TValue extends string>({ filters, active, onChange, className, variant = "default" }: FilterPillsProps<TValue>) {
  return (
    <div
      className={cn(
        "flex flex-wrap",
        variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
    >
      {filters.map((filter) => {
        const isActive = filter.value === active;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={cn(
              "rounded-full border font-semibold transition",
              variant === "compact" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
              isActive
                ? "border-transparent bg-[var(--brand-secondary)] text-white shadow"
                : "border-slate-200 bg-white text-slate-600 hover:border-[var(--brand-secondary)]/60 hover:text-[var(--brand-primary)]",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
