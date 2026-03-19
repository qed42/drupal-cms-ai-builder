"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ApproveButtonProps {
  siteId: string;
  totalPages: number;
  viewedPages: Set<number>;
}

export default function ApproveButton({
  siteId,
  totalPages,
  viewedPages,
}: ApproveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allViewed = viewedPages.size >= totalPages;
  const remaining = totalPages - viewedPages.size;

  async function startProvisioning() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/provision/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start provisioning");
      }
      router.push(`/onboarding/progress?siteId=${siteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border-t border-white/10 bg-white/[0.02]">
      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}

      <button
        type="button"
        onClick={startProvisioning}
        disabled={!allViewed || loading}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
          allViewed && !loading
            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
            : "bg-white/5 text-white/30 cursor-not-allowed"
        }`}
      >
        {loading
          ? "Starting..."
          : allViewed
            ? "Approve & Build Site"
            : `Review ${remaining} more page${remaining !== 1 ? "s" : ""}`}
      </button>

      {!allViewed && (
        <button
          type="button"
          onClick={startProvisioning}
          disabled={loading}
          className="w-full mt-2 py-2 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Skip review — I&apos;ll edit later in Drupal
        </button>
      )}
    </div>
  );
}
