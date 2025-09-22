"use client";

import { PRAYER_SCHEDULE } from "@/lib/constants";
import { usePrayerTimes } from "@/lib/hooks/usePrayerTimes";
import { CountdownTimer } from "@/components/mosque/CountdownTimer";
import { CalendarSubscription } from "@/components/mosque/CalendarSubscription";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PrayerSchedule } from "@/types";

export function PrayerTimings() {
  const { state, todaysSchedule } = usePrayerTimes(PRAYER_SCHEDULE);
  const { currentPrayer, nextPrayer, timeUntilNext, progress } = state;
  
  // Use todaysSchedule if available, otherwise fall back to PRAYER_SCHEDULE
  const displaySchedule = todaysSchedule?.length ? todaysSchedule : PRAYER_SCHEDULE;

  return (
    <section id="prayer-times" className="relative bg-white py-16 md:py-20">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#001f3f] via-[#34495e] to-[#58a44d]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-10 px-4 md:gap-12 md:px-6 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-5 md:space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">
              Prayer Timings
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
              Stay aligned with the rhythm of salah
            </h2>
            <p className="mt-3 max-w-xl text-base text-slate-600 md:mt-4">
              We maintain updated prayer times for the PAU campus community using reliable calculation methods tailored to Lagos.
              Never miss a congregation with smart reminders and the countdown to the next salah.
            </p>
          </motion.div>

          {timeUntilNext && nextPrayer ? (
            <div className="rounded-3xl bg-slate-50/80 p-5 shadow-sm md:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-secondary)]">
                Up Next: {nextPrayer.displayName}
              </p>
              <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row md:gap-6">
                <CountdownTimer
                  label={nextPrayer.displayName ?? nextPrayer.name}
                  hours={timeUntilNext.hours}
                  minutes={timeUntilNext.minutes}
                  seconds={timeUntilNext.seconds}
                  progress={progress}
                />
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/90 px-4 py-3 shadow-sm">
                    <span>Call to Prayer</span>
                    <span className="font-semibold text-[var(--brand-primary)]">{nextPrayer.callToPrayer}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/90 px-4 py-3 shadow-sm">
                    <span>Congregation</span>
                    <span className="font-semibold text-[var(--brand-primary)]">{nextPrayer.congregation}</span>
                  </div>
                  <div className="mt-4 flex justify-center">
                  <CalendarSubscription />
                </div>
                  <div className="h-12"></div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile: Stacked cards */}
        <motion.div
          className="block w-full rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-floating md:hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mx-auto w-full max-w-md space-y-3">
            {displaySchedule.map((prayer: PrayerSchedule) => {
              const isActive = currentPrayer?.name === prayer.name;
              const isNext = nextPrayer?.name === prayer.name;
              return (
                <div
                  key={prayer.name}
                  className={cn(
                    "rounded-2xl border border-slate-100 p-4 transition-colors",
                    isActive ? "bg-[var(--brand-secondary)]/10" : isNext ? "bg-slate-50" : "bg-white/90",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-[var(--brand-primary)]">
                      {prayer.displayName ?? prayer.name}
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[var(--brand-secondary)]">
                          Now
                        </span>
                      ) : null}
                      {isNext && !isActive ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--brand-secondary)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--brand-secondary)]">
                          Next
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="rounded-xl bg-white/90 px-3 py-2">
                      <span className="block text-[0.7rem] uppercase tracking-wider text-slate-500">Adhan</span>
                      <span className="font-semibold text-[var(--brand-primary)]">{prayer.callToPrayer}</span>
                    </div>
                    <div className="rounded-xl bg-white/90 px-3 py-2">
                      <span className="block text-[0.7rem] uppercase tracking-wider text-slate-500">Iqamah</span>
                      <span className="font-semibold text-[var(--brand-primary)]">{prayer.congregation}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={isActive ? (progress ?? 0) * 100 : isNext ? 5 : 0} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Desktop/Tablet: Table */}
        <motion.div
          className="hidden flex-1 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-floating md:block md:p-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[560px] w-full">
                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.25em] text-slate-500 md:text-sm">
                  <tr>
                    <th className="px-4 py-3 md:py-4">Prayer</th>
                    <th className="px-4 py-3 md:py-4">Adhan</th>
                    <th className="px-4 py-3 md:py-4">Iqamah</th>
                    <th className="px-4 py-3 md:py-4">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displaySchedule.map((prayer: PrayerSchedule) => {
                    const isActive = currentPrayer?.name === prayer.name;
                    const isNext = nextPrayer?.name === prayer.name;
                    return (
                      <tr
                        key={prayer.name}
                        className={cn(
                          "transition-colors",
                          isActive ? "bg-[var(--brand-secondary)]/10" : isNext ? "bg-slate-50" : "bg-white",
                        )}
                      >
                        <td className="px-4 py-4 text-sm font-semibold text-[var(--brand-primary)]">
                          {prayer.displayName ?? prayer.name}
                          {isActive ? (
                            <span className="ml-2 inline-flex items-center rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--brand-secondary)]">
                              Now
                            </span>
                          ) : null}
                          {isNext && !isActive ? (
                            <span className="ml-2 inline-flex items-center rounded-full bg-[var(--brand-secondary)]/20 px-2 py-1 text-xs font-semibold text-[var(--brand-secondary)]">
                              Next
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{prayer.callToPrayer}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{prayer.congregation}</td>
                        <td className="px-4 py-4">
                          <Progress value={isActive ? (progress ?? 0) * 100 : isNext ? 5 : 0} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
