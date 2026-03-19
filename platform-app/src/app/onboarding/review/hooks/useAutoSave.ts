"use client";

import { useRef, useCallback, useEffect } from "react";

interface AutoSaveOptions {
  siteId: string;
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: string) => void;
}

interface EditPayload {
  pageIndex: number;
  sectionIndex: number;
  field: string;
  value: string;
}

export function useAutoSave({
  siteId,
  debounceMs = 500,
  onSaveStart,
  onSaveComplete,
  onSaveError,
}: AutoSaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<EditPayload | null>(null);

  const flush = useCallback(async () => {
    const payload = pendingRef.current;
    if (!payload) return;
    pendingRef.current = null;

    onSaveStart?.();
    try {
      const res = await fetch(`/api/blueprint/${siteId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      onSaveComplete?.();
    } catch (err) {
      onSaveError?.(err instanceof Error ? err.message : "Save failed");
    }
  }, [siteId, onSaveStart, onSaveComplete, onSaveError]);

  const save = useCallback(
    (payload: EditPayload) => {
      pendingRef.current = payload;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(flush, debounceMs);
    },
    [flush, debounceMs]
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Fire remaining save synchronously on unmount
      if (pendingRef.current) {
        const payload = pendingRef.current;
        pendingRef.current = null;
        fetch(`/api/blueprint/${siteId}/edit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    };
  }, [siteId]);

  return { save };
}
