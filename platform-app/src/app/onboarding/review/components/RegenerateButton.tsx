"use client";

import { useState } from "react";
import type { PageSection } from "@/lib/blueprint/types";

interface RegenerateButtonProps {
  siteId: string;
  pageIndex: number;
  sectionIndex: number;
  onRegenerated: (newSection: PageSection, previousSection: PageSection) => void;
}

export default function RegenerateButton({
  siteId,
  pageIndex,
  sectionIndex,
  onRegenerated,
}: RegenerateButtonProps) {
  const [showGuidance, setShowGuidance] = useState(false);
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/blueprint/${siteId}/regenerate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIndex, sectionIndex, guidance: guidance || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Regeneration failed");
      }

      const data = await res.json();
      onRegenerated(data.section, data.previousSection);
      setShowGuidance(false);
      setGuidance("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (showGuidance) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder="Any specific instructions? (optional)"
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-indigo-500/50 resize-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading}
            className="flex-1 py-1.5 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Regenerating..." : "Regenerate"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowGuidance(false);
              setGuidance("");
            }}
            disabled={loading}
            className="py-1.5 px-3 text-xs rounded-md bg-white/5 text-white/50 hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowGuidance(true)}
      className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
      title="Regenerate this section with AI"
    >
      ↻ Regenerate
    </button>
  );
}
