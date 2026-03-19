"use client";

import { GOOGLE_FONTS } from "@/lib/fonts";

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
}

export default function FontSelector({ label, value, onChange }: FontSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-white/50 text-xs uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl bg-white/10 px-4 py-3 text-white border border-white/10 focus:border-brand-500 focus:outline-none appearance-none cursor-pointer"
        style={{ fontFamily: value }}
      >
        {GOOGLE_FONTS.map((font) => (
          <option
            key={font.name}
            value={font.name}
            style={{ fontFamily: font.family, color: "#000" }}
          >
            {font.name}
          </option>
        ))}
      </select>
    </div>
  );
}
