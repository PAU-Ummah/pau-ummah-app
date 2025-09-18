import { cn } from "@/lib/utils";
import { Phone, Mail, MapPin } from "lucide-react";

export function ContactBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "hidden w-full items-center justify-center bg-[var(--brand-secondary)]/95 py-2 text-sm text-white md:flex",
        className,
      )}
    >
      <div className="flex w-full max-w-6xl items-center justify-between px-6">
        <span className="flex items-center gap-2">
          <Phone className="h-4 w-4" /> +234 706 948 4903
        </span>
        <span className="flex items-center gap-2">
          <Mail className="h-4 w-4" /> pro.muslimummah@gmail.com
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Pan Atlantic University, Ibeju-Lekki
        </span>
      </div>
    </div>
  );
}
