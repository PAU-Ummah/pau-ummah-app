import { RefObject, useEffect, useRef, useState } from "react";

type IntersectionArgs = IntersectionObserverInit & { freezeOnceVisible?: boolean };

export function useIntersection<T extends Element>(options: IntersectionArgs = {}): {
  ref: RefObject<T>;
  entry: IntersectionObserverEntry | null;
  isVisible: boolean;
} {
  const { freezeOnceVisible = false, root, rootMargin, threshold } = options;
  const ref = useRef<T | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = ref.current;
    if (!node || frozen) return;

    const observer = new IntersectionObserver((entries) => {
      setEntry(entries[0]);
    }, { root, rootMargin, threshold });

    observer.observe(node);

    return () => observer.disconnect();
  }, [frozen, root, rootMargin, threshold]);

  return {
    ref,
    entry,
    isVisible: Boolean(entry?.isIntersecting),
  };
}
