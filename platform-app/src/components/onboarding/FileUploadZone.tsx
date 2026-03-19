"use client";

import { useRef, useState } from "react";

interface FileUploadZoneProps {
  label: string;
  accept: string;
  uploadType: "logo" | "palette" | "font";
  onUploadComplete: (result: { url: string; filename: string; path: string }) => void;
  currentFile?: string | null;
  onRemove?: () => void;
}

export default function FileUploadZone({
  label,
  accept,
  uploadType,
  onUploadComplete,
  currentFile,
  onRemove,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUploadComplete(data);
      }
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (currentFile) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/10 px-4 py-3">
        <svg className="w-5 h-5 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-white text-sm truncate flex-1">{currentFile}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
        dragOver
          ? "border-brand-400 bg-brand-500/10"
          : "border-white/20 bg-white/5 hover:border-white/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? (
        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-8 h-8 text-white/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
          <p className="text-white/50 text-sm">{label}</p>
        </>
      )}
    </div>
  );
}
