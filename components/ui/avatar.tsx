import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-primary)]/10 text-sm font-semibold text-[var(--brand-primary)]",
        className,
      )}
      {...props}
    >
      {src ? (
        <Image src={src} alt={alt ?? ""} fill className="object-cover" sizes="40px" />
      ) : (
        <span>{alt?.charAt(0).toUpperCase()}</span>
      )}
    </div>
  ),
);
Avatar.displayName = "Avatar";
