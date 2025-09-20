"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HERO_STATS = [
  { label: "Active Members", value: "400+" },
  { label: "Weekly Programs", value: "4" },
  { label: "Volunteer Hours", value: "24/7" },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const parallax = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-[#001f3f] via-[#34495e] to-[#0c2a50] text-white"
    >
      <div className="absolute inset-0 pattern-overlay opacity-30" />
      <motion.div
        style={{ y: parallax, opacity: fade }}
        className="pointer-events-none absolute -right-48 top-24 h-[600px] w-[600px] rounded-full bg-[var(--brand-secondary)]/20 blur-3xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#001f3f]/30 to-[#001f3f]/70" />

      <div className="relative z-10 mx-auto flex min-h-[90vh] w-full max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:gap-12 md:px-6 md:py-24">
        <div className="max-w-2xl space-y-6 md:space-y-8">
          <Badge className="bg-white/10 text-white">Pan Atlantic University Muslim Community</Badge>
          <h1 className="text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-6xl">
            A sacred space for connection, learning, and compassionate service on campus.
          </h1>
          <p className="max-w-xl text-base text-white/80 md:text-lg">
            Discover spiritually uplifting programs, vibrant community events, and the warmth of brotherhood and sisterhood in the
            heart of Pan Atlantic University.
          </p>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Button size="lg" variant="default" asChild>
              <Link href="#prayer-times">View Prayer Timings</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/60 bg-transparent text-black hover:bg-white/10 hover:text-white transition-colors duration-200" asChild>
              <Link href="/feed">Explore Media Feed</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1 }}
          className="relative mt-10 w-full max-w-lg md:mt-0"
        >
          <div className="absolute inset-4 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl" />
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/80 p-5 text-[var(--brand-primary)] shadow-floating md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-secondary)]/20 text-2xl">
                🕌
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--brand-secondary)]">Faith. Knowledge. Service.</p>
                <p className="text-lg font-semibold">Experience the PAU Muslim Community</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Join students, alumni, and faculty in a shared journey of spiritual growth, intellectual exploration, and lasting
              friendships across our weekly programmes and flagship events.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-3 text-sm font-semibold">
                <span>Daily congregational prayers</span>
                <span className="text-[var(--brand-secondary)]">5x</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-3 text-sm font-semibold">
                <span>Weekly knowledge circles</span>
                <span className="text-[var(--brand-secondary)]">7</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-3 text-sm font-semibold">
                <span>Volunteer opportunities</span>
                <span className="text-[var(--brand-secondary)]">25+</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
