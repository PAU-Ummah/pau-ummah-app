export function StoriesBar() {
  const items = ["Community", "Education", "Spiritual", "Youth", "Charity"];
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-3">
      {items.map((title) => (
        <div key={title} className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--brand-secondary)] bg-white/10 text-xs font-semibold text-white/90">
            {title[0]}
          </div>
          <p className="mt-2 whitespace-nowrap text-xs font-semibold text-white/80">{title}</p>
        </div>
      ))}
    </div>
  );
}
