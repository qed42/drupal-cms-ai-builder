/**
 * TASK-517: LivePreviewFrame — sandboxed iframe wrapper for live preview.
 *
 * Renders the preview HTML in a sandboxed iframe and handles
 * postMessage communication with the parent page.
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { buildPreviewHtml } from "@/lib/preview/build-preview-html";
import { isPostMessageAllowed, validatePostMessageOrigin } from "@/lib/preview/sanitize";
import type { PreviewPayload, ViewportSize } from "@/lib/preview/types";
import { VIEWPORT_CONFIGS } from "@/lib/preview/types";

interface LivePreviewFrameProps {
  payload: PreviewPayload;
  onSectionClick?: (index: number) => void;
  onReady?: () => void;
  viewport?: ViewportSize;
}

export default function LivePreviewFrame({
  payload,
  onSectionClick,
  onReady,
  viewport = "desktop",
}: LivePreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [srcdoc, setSrcdoc] = useState("");

  // Build srcdoc when payload changes
  useEffect(() => {
    setIsReady(false);
    const html = buildPreviewHtml(payload);
    setSrcdoc(html);
  }, [payload]);

  // PostMessage listener
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Validate origin — srcdoc iframes have "null" origin
      if (!validatePostMessageOrigin(String(event.origin))) return;

      const data = event.data;
      if (!data || typeof data.type !== "string") return;

      // Validate message type against whitelist
      if (!isPostMessageAllowed(data.type)) return;

      switch (data.type) {
        case "ready":
          setIsReady(true);
          onReady?.();
          break;
        case "section-click":
          if (typeof data.sectionIndex === "number") {
            onSectionClick?.(data.sectionIndex);
          }
          break;
        case "error":
          console.warn("[LivePreview] iframe error:", data.message);
          break;
      }
    },
    [onSectionClick, onReady]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const viewportWidth = VIEWPORT_CONFIGS[viewport].width;

  return (
    <div className="relative w-full h-full flex items-start justify-center bg-gray-100 overflow-auto">
      {/* Loading skeleton */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400 mt-3">Rendering preview...</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        srcDoc={srcdoc}
        title="Website Preview"
        className="border-0 bg-white shadow-lg transition-all duration-300"
        style={{
          width: viewportWidth,
          maxWidth: "100%",
          minHeight: "100%",
        }}
      />
    </div>
  );
}
