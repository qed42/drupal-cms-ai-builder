"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddNewSiteButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/new", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to create new site:", data.error);
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl);
    } catch (error) {
      console.error("Error creating new site:", error);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add new website
        </>
      )}
    </button>
  );
}
