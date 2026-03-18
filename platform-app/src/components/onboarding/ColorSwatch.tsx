"use client";

import { useRef } from "react";

interface ColorSwatchProps {
  hex: string;
  role: string;
  onChange: (hex: string) => void;
  onRemove?: () => void;
}

export default function ColorSwatch({ hex, role, onChange, onRemove }: ColorSwatchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-1 group relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-12 h-12 rounded-full border-2 border-white/20 hover:border-white/50 transition-colors shadow-lg"
        style={{ backgroundColor: hex }}
        title={`${role}: ${hex}`}
      />
      <input
        ref={inputRef}
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
      />
      <span className="text-white/40 text-[10px] uppercase tracking-wide">{role}</span>
      <span className="text-white/30 text-[10px]">{hex}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          &times;
        </button>
      )}
    </div>
  );
}
