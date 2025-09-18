"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUp, MessageCircle } from "lucide-react";

export function FloatingButtons() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsVisible(window.scrollY > 250);
    };
    window.addEventListener("scroll", handler);
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-8 right-6 z-50 flex flex-col items-end gap-4">
      <Button
        size="lg"
        variant="default"
        className="shadow-floating"
        asChild
      >
        <Link href="https://wa.me/2347069484903" target="_blank" rel="noreferrer" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Link>
      </Button>
      {isVisible ? (
        <Button
          size="icon"
          variant="primary"
          className="h-12 w-12 rounded-full shadow-floating"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
          <span className="sr-only">Back to top</span>
        </Button>
      ) : null}
    </div>
  );
}
