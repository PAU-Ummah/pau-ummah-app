"use client";

import { cn } from "@/lib/utils";

interface FilterPillsProps<TValue extends string> {
  filters: { label: string; value: TValue }[];
  active: TValue;
  onChange: (value: TValue) => void;
  className?: string;
}

export function FilterPills<TValue extends string>({ filters, active, onChange, className }: FilterPillsProps<TValue>) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {filters.map((filter) => {
        const isActive = filter.value === active;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
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
