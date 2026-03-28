"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { resolveStepSlug } from "@/lib/onboarding-steps";

/**
 * Hook that scopes all onboarding API calls to a specific siteId
 * from the URL search params, and provides navigation helpers
 * that preserve the siteId across step transitions.
 */
export function useOnboarding() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");

  const buildStepUrl = useCallback(
    (step: string) => {
      const resolved = resolveStepSlug(step);
      const base = `/onboarding/${resolved}`;
      return siteId ? `${base}?siteId=${siteId}` : base;
    },
    [siteId]
  );

  const resume = useCallback(async () => {
    const url = siteId
      ? `/api/onboarding/resume?siteId=${siteId}`
      : "/api/onboarding/resume";
    const res = await fetch(url);
    return res.json();
  }, [siteId]);

  const save = useCallback(
    async (step: string, data: Record<string, unknown>) => {
      const res = await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data, siteId }),
      });
      return res;
    },
    [siteId]
  );

  return { siteId, buildStepUrl, resume, save };
}
