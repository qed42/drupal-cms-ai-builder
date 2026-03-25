import { useState, useEffect } from "react";
import type { ResearchPreview } from "@/lib/transparency/types";

export type PreviewStatus = "loading" | "loaded" | "error";

interface UseResearchPreviewResult {
  preview: ResearchPreview | null;
  status: PreviewStatus;
  cached: boolean;
}

/**
 * One-shot fetch hook for the research preview API.
 * Manages loading/error states and aborts on unmount.
 */
export function useResearchPreview(siteId: string): UseResearchPreviewResult {
  const [preview, setPreview] = useState<ResearchPreview | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [cached, setCached] = useState(false);

  useEffect(() => {
    if (!siteId) {
      setStatus("error");
      return;
    }

    const controller = new AbortController();

    fetch(`/api/ai/research-preview?siteId=${siteId}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPreview(data.data);
          setCached(data.cached);
          setStatus("loaded");
        } else {
          setStatus("error");
        }
      })
      .catch((err) => {
        // Don't set error for intentional aborts
        if (err?.name !== "AbortError") {
          setStatus("error");
        }
      });

    return () => controller.abort();
  }, [siteId]);

  return { preview, status, cached };
}
