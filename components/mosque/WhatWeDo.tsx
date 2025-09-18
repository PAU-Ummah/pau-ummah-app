"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WHAT_WE_DO_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { LucideIcon, BookOpen, Heart, MoonStar, Users } from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, LucideIcon> = {
  "moon-star": MoonStar,
  "book-open": BookOpen,
  heart: Heart,
  users: Users,
};

export function WhatWeDo() {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => WHAT_WE_DO_ITEMS, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <section id="services" className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-8 md:gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">
              What the mosque offers
            </p>
            <h2 className="text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
              Flourish with programs tailored for holistic growth
            </h2>
            <p className="text-base text-slate-600">
              Our weekly schedule nurtures the spiritual, intellectual, and social wellbeing of every community member. Explore
              signature programmes that bring people together with purpose.
            </p>
          </div>
          <div className="flex gap-3">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2 w-8 rounded-full transition ${activeIndex === index ? "bg-[var(--brand-secondary)]" : "bg-slate-300"}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-[1fr_1.2fr] md:gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={items[activeIndex].id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-floating md:p-8"
            >
              <div className="inline-flex items-center gap-3 rounded-full bg-[var(--brand-secondary)]/15 px-5 py-2">
                {(() => {
                  const Icon = ICON_MAP[items[activeIndex].icon] ?? Users;
                  return <Icon className="h-5 w-5 text-[var(--brand-secondary)]" />;
                })()}
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-secondary)]">
                  {items[activeIndex].title}
                </span>
              </div>
              <p className="mt-6 text-lg font-semibold text-[var(--brand-primary)]">
                {items[activeIndex].description}
              </p>
              <Button variant="link" className="mt-6 px-0 text-[var(--brand-secondary)]" asChild>
                <Link href={items[activeIndex].href}>{items[activeIndex].ctaLabel}</Link>
              </Button>
            </motion.div>
          </AnimatePresence>

          <div className="grid gap-5 sm:grid-cols-2 md:gap-6">
            {items.map((item, index) => {
              const Icon = ICON_MAP[item.icon] ?? Users;
              const isActive = index === activeIndex;
              return (
                <motion.div
                  key={item.id}
                  className={`rounded-3xl border p-5 transition md:p-6 ${isActive ? "border-[var(--brand-secondary)] bg-white shadow-floating" : "border-slate-200 bg-white/80"}`}
                  whileHover={{ translateY: -4 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-secondary)]/15">
                    <Icon className="h-5 w-5 text-[var(--brand-secondary)]" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-[var(--brand-primary)]">{item.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
