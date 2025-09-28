import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-[#001f3f] via-[#0c2a50] to-[#34495e] py-16 text-white md:py-20">
      <div className="absolute inset-0 pattern-overlay opacity-20" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 text-center md:px-6">
        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Stay connected
        </span>
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready to contribute, learn, or seek support? We are here for you.
        </h2>
        <p className="max-w-3xl text-base text-white/80">
          Become an active part of the PAU Muslim Community—join study circles, volunteer initiatives, or partner with us on
          impactful campus projects.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" variant="default" asChild>
            <Link href="https://wa.me/2347069484903" target="_blank" rel="noreferrer">
              Chat with our coordinators
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white/60 bg-transparent text-black hover:bg-white/10 hover:text-white transition-colors duration-200" asChild>
            <Link href="mailto:pro.muslimummah@gmail.com">Email the Mosque Board</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
