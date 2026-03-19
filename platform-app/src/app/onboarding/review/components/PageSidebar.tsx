"use client";

import { useState } from "react";

interface PageSidebarProps {
  pages: Array<{ slug: string; title: string }>;
  activePageIndex: number;
  viewedPages: Set<number>;
  onPageSelect: (index: number) => void;
  onAddPage?: (title: string, description: string) => Promise<void>;
  onRemovePage?: (pageIndex: number) => Promise<void>;
}

export default function PageSidebar({
  pages,
  activePageIndex,
  viewedPages,
  onPageSelect,
  onAddPage,
  onRemovePage,
}: PageSidebarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  async function handleAdd() {
    if (!addTitle.trim() || !onAddPage) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await onAddPage(addTitle.trim(), addDescription.trim());
      setShowAddForm(false);
      setAddTitle("");
      setAddDescription("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add page");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleRemove(pageIndex: number) {
    if (!onRemovePage) return;
    setRemoveLoading(true);
    try {
      await onRemovePage(pageIndex);
      setConfirmRemove(null);
    } catch {
      // Error handled by parent
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <nav className="w-64 shrink-0 border-r border-white/10 bg-white/[0.02] overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Pages
        </h2>
        <p className="text-xs text-white/40 mt-1">
          {viewedPages.size} of {pages.length} reviewed
        </p>
      </div>

      <ul className="py-2 flex-1">
        {pages.map((page, index) => {
          const isActive = index === activePageIndex;
          const isViewed = viewedPages.has(index);

          return (
            <li key={page.slug} className="group relative">
              <button
                type="button"
                onClick={() => onPageSelect(index)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  isActive
                    ? "bg-brand-500/10 border-r-2 border-brand-500"
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
                  className={`text-sm truncate flex-1 ${
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

              {/* Remove button (show on hover, only if more than 1 page) */}
              {pages.length > 1 && onRemovePage && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {confirmRemove === index ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        disabled={removeLoading}
                        className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        {removeLoading ? "..." : "Remove"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(null)}
                        className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/40"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmRemove(index);
                      }}
                      className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                      title="Remove page"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add Page section */}
      <div className="border-t border-white/10 p-3">
        {showAddForm ? (
          <div className="space-y-2">
            <input
              type="text"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              placeholder="Page title"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-brand-500/50"
            />
            <textarea
              value={addDescription}
              onChange={(e) => setAddDescription(e.target.value)}
              placeholder="Brief description (optional)"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-brand-500/50 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!addTitle.trim() || addLoading}
                className="flex-1 py-1.5 text-xs rounded-md bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50"
              >
                {addLoading ? "Adding..." : "Add Page"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddTitle("");
                  setAddDescription("");
                  setAddError(null);
                }}
                className="py-1.5 px-3 text-xs rounded-md bg-white/5 text-white/50 hover:text-white/80"
              >
                Cancel
              </button>
            </div>
            {addError && <p className="text-xs text-red-400">{addError}</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            disabled={pages.length >= 15}
            className="w-full py-2 text-xs rounded-lg border border-dashed border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            + Add Page
          </button>
        )}
      </div>
    </nav>
  );
}
