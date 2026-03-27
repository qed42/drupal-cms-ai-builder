"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import StepLayout from "@/components/onboarding/StepLayout";
import InferenceCard from "@/components/onboarding/InferenceCard";
import type { InferenceCardItem } from "@/components/onboarding/InferenceCard";
import { useOnboarding } from "@/hooks/useOnboarding";

// ── Types ──────────────────────────────────────────────────────────

interface ImageUpload {
  id: string;
  filename: string;
  url: string;
  path: string;
  status: "uploading" | "analyzing" | "ready" | "error";
  description: string;
  tags: string[];
  subject: string;
  orientation: string;
  error?: string;
}

// ── Constants ──────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const ACCEPT_STRING = ACCEPTED_EXTENSIONS.join(",");
const MAX_FILES = 20;

// ── Component ──────────────────────────────────────────────────────

export default function ImagesPage() {
  const router = useRouter();
  const { siteId, buildStepUrl, resume, save } = useOnboarding();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loaded, setLoaded] = useState(false);
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [useStockOnly, setUseStockOnly] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Resume saved state
  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.user_images) setImages(d.data.user_images);
        if (d.data?.use_stock_only) setUseStockOnly(d.data.use_stock_only);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  // ── Upload + analyze pipeline ──────────────────────────────────

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_FILES - images.length;
      const toProcess = fileArray.slice(0, remaining);

      if (toProcess.length === 0) return;

      // Create placeholder entries
      const placeholders: ImageUpload[] = toProcess.map((f) => ({
        id: crypto.randomUUID(),
        filename: f.name,
        url: "",
        path: "",
        status: "uploading" as const,
        description: "",
        tags: [],
        subject: "",
        orientation: "",
      }));

      setImages((prev) => [...prev, ...placeholders]);

      // Upload all files in parallel, then analyze
      await Promise.allSettled(
        toProcess.map(async (file, i) => {
          const placeholderId = placeholders[i].id;

          try {
            // Step 1: Upload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "image");
            if (siteId) formData.append("siteId", siteId);

            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!uploadRes.ok) {
              const err = await uploadRes.json();
              throw new Error(err.error || "Upload failed");
            }

            const uploadData = await uploadRes.json();

            // Update with upload result, move to analyzing
            setImages((prev) =>
              prev.map((img) =>
                img.id === placeholderId
                  ? {
                      ...img,
                      id: uploadData.id || img.id,
                      url: uploadData.url,
                      path: uploadData.path,
                      status: "analyzing" as const,
                    }
                  : img
              )
            );

            const imageId = uploadData.id || placeholderId;

            // Step 2: Analyze
            const analyzeRes = await fetch("/api/ai/analyze-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imagePath: uploadData.path,
                siteId,
              }),
            });

            if (!analyzeRes.ok) {
              throw new Error("Analysis failed");
            }

            const analysis = await analyzeRes.json();

            setImages((prev) =>
              prev.map((img) =>
                img.id === imageId
                  ? {
                      ...img,
                      status: "ready" as const,
                      description: analysis.description,
                      tags: analysis.tags || [],
                      subject: analysis.subject || "",
                      orientation: analysis.orientation || "",
                    }
                  : img
              )
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast.error(`Upload failed: ${message}`);
            setImages((prev) =>
              prev.map((img) =>
                img.id === placeholderId
                  ? {
                      ...img,
                      status: "error" as const,
                      error: message,
                    }
                  : img
              )
            );
          }
        })
      );
    },
    [images.length, siteId]
  );

  // ── Drag & drop handlers ───────────────────────────────────────

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so selecting same files again triggers onChange
    e.target.value = "";
  }

  // ── Image management ───────────────────────────────────────────

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  function updateDescription(id: string, description: string) {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, description } : img))
    );
  }

  // ── Submit ─────────────────────────────────────────────────────

  async function handleSubmit() {
    const readyImages = images.filter((img) => img.status === "ready");
    const res = await save("images", {
      user_images: readyImages,
      use_stock_only: useStockOnly,
    });
    if (!res.ok) return false;
    router.push(buildStepUrl("follow-up"));
    return true;
  }

  if (!loaded) return null;

  // ── InferenceCard ──────────────────────────────────────────────

  const readyImages = images.filter((img) => img.status === "ready");
  const allTags = readyImages.flatMap((img) => img.tags);
  const topTags = [...new Set(allTags)].slice(0, 5);

  const inferenceSlot =
    readyImages.length > 0 && !useStockOnly ? (
      <InferenceCard
        title="Archie analyzed your photos"
        items={[
          {
            label: "Photos ready",
            value: `${readyImages.length} image${readyImages.length !== 1 ? "s" : ""}`,
            type: "text" as const,
          },
          ...(topTags.length > 0
            ? [
                {
                  label: "Top themes",
                  value: topTags,
                  type: "list" as const,
                } satisfies InferenceCardItem,
              ]
            : []),
        ]}
        explanation="Your photos will replace stock images wherever they match the content."
        onConfirm={() => {}}
        onEdit={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        editLabel="Review photos above"
      />
    ) : null;

  // ── Render ─────────────────────────────────────────────────────

  const hasUploading = images.some(
    (img) => img.status === "uploading" || img.status === "analyzing"
  );

  return (
    <StepLayout
      step="images"
      title="Show us your business"
      subtitle="Drop your photos here — Archie will figure out where they work best on your site."
      buttonLabel="Next: Brand & Style"
      onSubmit={handleSubmit}
      disabled={hasUploading}
      insightSlot={inferenceSlot}
    >
      <div className="space-y-6 text-left">
        {/* Stock-only toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={useStockOnly}
              onChange={(e) => setUseStockOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 rounded-full bg-white/10 border border-white/20 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
            I don&apos;t have images yet — use stock photos for now
          </span>
        </label>

        {/* Upload zone (hidden when stock-only) */}
        {!useStockOnly && (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
                dragOver
                  ? "border-brand-400 bg-brand-500/10"
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_STRING}
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <svg
                className="w-10 h-10 text-white/30 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="text-white/50 text-sm mb-1">
                Drop images here or click to browse
              </p>
              <p className="text-white/30 text-xs">
                PNG, JPG, WebP — up to 10MB each, {MAX_FILES} max
              </p>
            </div>

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img) => (
                  <ImageCard
                    key={img.id}
                    image={img}
                    onRemove={() => removeImage(img.id)}
                    onUpdateDescription={(desc) =>
                      updateDescription(img.id, desc)
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </StepLayout>
  );
}

// ── ImageCard sub-component ────────────────────────────────────────

function ImageCard({
  image,
  onRemove,
  onUpdateDescription,
}: {
  image: ImageUpload;
  onRemove: () => void;
  onUpdateDescription: (desc: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(image.description);

  // Sync draft when AI analysis completes
  useEffect(() => {
    setDraft(image.description);
  }, [image.description]);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Thumbnail + status */}
      <div className="relative aspect-video bg-black/20">
        {image.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.description || image.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={image.status} />
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors"
          title="Remove image"
        >
          &times;
        </button>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-white/40 truncate">{image.filename}</p>

        {image.status === "error" && (
          <p className="text-xs text-red-400">{image.error}</p>
        )}

        {image.status === "ready" && (
          <>
            {/* Editable description */}
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateDescription(draft);
                      setEditing(false);
                    }}
                    className="text-xs text-brand-400 hover:text-brand-300"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(image.description);
                      setEditing(false);
                    }}
                    className="text-xs text-white/40 hover:text-white/60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                className="text-xs text-white/60 leading-relaxed cursor-pointer hover:text-white/80 transition-colors"
                onClick={() => setEditing(true)}
                title="Click to edit description"
              >
                {image.description || "No description"}
              </p>
            )}

            {/* Tags */}
            {image.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {image.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
                {image.tags.length > 4 && (
                  <span className="text-[10px] px-2 py-0.5 text-white/30">
                    +{image.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {(image.status === "uploading" || image.status === "analyzing") && (
          <p className="text-xs text-white/40 animate-pulse">
            {image.status === "uploading"
              ? "Uploading..."
              : "Archie is analyzing..."}
          </p>
        )}
      </div>
    </div>
  );
}

// ── StatusBadge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ImageUpload["status"] }) {
  const config = {
    uploading: { bg: "bg-yellow-500/80", label: "Uploading" },
    analyzing: { bg: "bg-blue-500/80", label: "Analyzing" },
    ready: { bg: "bg-green-500/80", label: "Ready" },
    error: { bg: "bg-red-500/80", label: "Error" },
  };

  const { bg, label } = config[status];

  return (
    <span
      className={`${bg} text-white text-[10px] font-medium px-2 py-0.5 rounded-full`}
    >
      {label}
    </span>
  );
}
