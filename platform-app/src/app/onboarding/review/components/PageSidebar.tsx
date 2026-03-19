"use client";

interface PageSidebarProps {
  pages: Array<{ slug: string; title: string }>;
  activePageIndex: number;
  viewedPages: Set<number>;
  onPageSelect: (index: number) => void;
}

export default function PageSidebar({
  pages,
  activePageIndex,
  viewedPages,
  onPageSelect,
}: PageSidebarProps) {
  return (
    <nav className="w-64 shrink-0 border-r border-white/10 bg-white/[0.02] overflow-y-auto">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Pages
        </h2>
        <p className="text-xs text-white/40 mt-1">
          {viewedPages.size} of {pages.length} reviewed
        </p>
      </div>

      <ul className="py-2">
        {pages.map((page, index) => {
          const isActive = index === activePageIndex;
          const isViewed = viewedPages.has(index);

          return (
            <li key={page.slug}>
              <button
                type="button"
                onClick={() => onPageSelect(index)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  isActive
                    ? "bg-indigo-500/10 border-r-2 border-indigo-500"
                    : "hover:bg-white/5"
                }`}
              >
                {/* Viewed indicator */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isViewed
                      ? "bg-emerald-400"
                      : "bg-white/20"
                  }`}
                />
                <span
                  className={`text-sm truncate ${
                    isActive
                      ? "text-white font-medium"
                      : isViewed
                        ? "text-white/70"
                        : "text-white/50"
                  }`}
                >
                  {page.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
