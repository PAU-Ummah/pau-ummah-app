import { ContactBar } from "@/components/mosque/ContactBar";
import { Navigation } from "@/components/mosque/Navigation";
import { HeroSection } from "@/components/mosque/HeroSection";
import { PrayerTimings } from "@/components/mosque/PrayerTimings";
import { WhatWeDo } from "@/components/mosque/WhatWeDo";
import { PastEvents } from "@/components/mosque/PastEvents";
import { CallToAction } from "@/components/mosque/CallToAction";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <ContactBar />
      <Navigation />
      <HeroSection />
      <section id="about" className="bg-white py-14 md:py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 md:gap-6 md:px-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">
              Our Aim
            </p>
            <h2 className="text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
              Supporting every student on their journey of faith and excellence
            </h2>
            <p className="text-base text-slate-600">
              The Pan-Atlantic University Muslim Ummah nurtures a community anchored in the Quran and Sunnah while empowering students
              to excel academically, spiritually, and socially. We foster belonging, offer mentorship, and cultivate leaders who
              serve society with ihsan.
            </p>
          </div>
          <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm md:p-6">
            <ul className="space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)]">
                  1
                </span>
                <p>
                  Provide spiritually enriching environments for daily congregational prayers, weekly halaqahs, and campus-wide
                  programmes.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)]">
                  2
                </span>
                <p>
                  Cultivate compassion through volunteer initiatives, charity drives, and partnerships that positively impact
                  PAU communities.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)]">
                  3
                </span>
                <p>
                  Support the wellbeing of every student via mentorship programmes, counselling referrals, and safe spaces for
                  connection.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <PrayerTimings />
      <WhatWeDo />
      <PastEvents />
      <CallToAction />
    </main>
  );
}
