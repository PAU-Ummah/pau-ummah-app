"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AlignJustify, X } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetClose, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DonateModal } from "@/components/mosque/DonateModal";

const SECTION_IDS = NAVIGATION_ITEMS.map((item) => item.href.replace("#", ""));

export function Navigation() {
  const [isSticky, setIsSticky] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0]);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 60);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          threshold: 0.4,
        },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [pathname]);

  const handleSmoothScroll = (href: string) => {
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent transition-all",
        isSticky ? "backdrop-blur-xl border-b-white/10 bg-white/80 shadow-floating" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="#home" className="flex items-center gap-3" onClick={() => handleSmoothScroll("#home")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)]">
            <Image src="/logo.jpg" alt="PAU Mosque logo" width={50} height={50} priority className="object-contain" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">PAU Muslim Ummah</p>
            <p className="text-base font-bold text-[var(--brand-primary)]">Pan Atlantic University</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleSmoothScroll(item.href)}
              className={cn(
                "text-sm font-semibold uppercase tracking-widest transition",
                activeSection === item.href.replace("#", "")
                  ? "text-[var(--brand-secondary)]"
                  : "text-slate-600 hover:text-[var(--brand-primary)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <DonateModal
            accountName="HAMEEDAH OYINDASOLA ALLI-KAMAL"
            accountNumber="4235303561"
            bankName="Zenith Bank PIc"
            label="Donate Now"
            triggerVariant="secondary"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button className="rounded-full border border-slate-200 p-3 text-slate-600 lg:hidden">
              <AlignJustify className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="mt-12 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--brand-primary)]">Navigation</h3>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border border-slate-200">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
              <div className="flex flex-col gap-4 text-left">
                {NAVIGATION_ITEMS.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <button
                      type="button"
                      onClick={() => handleSmoothScroll(item.href)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-base font-semibold",
                        activeSection === item.href.replace("#", "")
                          ? "border-[var(--brand-secondary)] bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)]"
                          : "border-transparent bg-slate-100/80 text-slate-700",
                      )}
                    >
                      {item.label}
                    </button>
                  </SheetClose>
                ))}
              </div>
              <div>
                <DonateModal
                  accountName="PAU Mosque"
                  accountNumber="0000000000"
                  bankName="Your Bank"
                  label="Donate Now"
                  triggerVariant="primary"
                  triggerClassName="w-full"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
