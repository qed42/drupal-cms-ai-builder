"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import FileUploadZone from "@/components/onboarding/FileUploadZone";
import ColorSwatch from "@/components/onboarding/ColorSwatch";
import { useOnboarding } from "@/hooks/useOnboarding";

interface ColorEntry {
  hex: string;
  role: string;
}

export default function BrandPage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [loaded, setLoaded] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [paletteFile, setPaletteFile] = useState<string | null>(null);
  const [paletteUrl, setPaletteUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.logo_filename) setLogoFile(d.data.logo_filename);
        if (d.data?.logo_url) setLogoUrl(d.data.logo_url);
        if (d.data?.palette_filename) setPaletteFile(d.data.palette_filename);
        if (d.data?.palette_url) setPaletteUrl(d.data.palette_url);
        if (d.data?.colors) {
          const colorEntries = Object.entries(d.data.colors).map(([role, hex]) => ({
            role,
            hex: hex as string,
          }));
          if (colorEntries.length > 0) setColors(colorEntries);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  async function extractColors(filePath: string, type: "logo" | "palette") {
    setExtracting(true);
    try {
      const res = await fetch("/api/ai/extract-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, type }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.colors?.length > 0) {
          setColors(data.colors);
        }
      }
    } finally {
      setExtracting(false);
    }
  }

  function updateColor(index: number, hex: string) {
    const updated = [...colors];
    updated[index] = { ...updated[index], hex };
    setColors(updated);
  }

  function removeColor(index: number) {
    setColors(colors.filter((_, i) => i !== index));
  }

  function addColor() {
    const roles = ["primary", "secondary", "accent", "muted", "dark", "light"];
    const usedRoles = new Set(colors.map((c) => c.role));
    const nextRole = roles.find((r) => !usedRoles.has(r)) || `custom-${colors.length + 1}`;
    setColors([...colors, { hex: "#6366F1", role: nextRole }]);
  }

  async function handleSubmit() {
    const colorMap = colors.reduce(
      (acc, c) => ({ ...acc, [c.role]: c.hex }),
      {} as Record<string, string>
    );

    const res = await save("brand", {
      logo_url: logoUrl,
      logo_filename: logoFile,
      palette_url: paletteUrl,
      palette_filename: paletteFile,
      colors: colorMap,
    });
    if (res.ok) {
      router.push(buildStepUrl("fonts"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  return (
    <StepLayout
      step="brand"
      title="Give it a face."
      subtitle="Drop your logo, brand kit, or inspiration. We'll extract the colors and typography to shape your preview."
      buttonLabel="Pick Your Fonts"
      onSubmit={handleSubmit}
    >
      <div className="space-y-6">
        {/* Upload zones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileUploadZone
            label="Add logo"
            accept=".png,.jpg,.jpeg,.svg"
            uploadType="logo"
            currentFile={logoFile}
            onUploadComplete={(result) => {
              setLogoFile(result.filename);
              setLogoUrl(result.url);
              extractColors(result.path, "logo");
            }}
            onRemove={() => {
              setLogoFile(null);
              setLogoUrl(null);
            }}
          />
          <FileUploadZone
            label="Add color palette reference"
            accept=".png,.jpg,.jpeg,.pdf"
            uploadType="palette"
            currentFile={paletteFile}
            onUploadComplete={(result) => {
              setPaletteFile(result.filename);
              setPaletteUrl(result.url);
              extractColors(result.path, "palette");
            }}
            onRemove={() => {
              setPaletteFile(null);
              setPaletteUrl(null);
            }}
          />
        </div>

        {/* Color swatches */}
        {extracting ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-white/50 text-sm">Extracting colors...</span>
          </div>
        ) : colors.length > 0 ? (
          <div className="space-y-3">
            <p className="text-white/40 text-xs text-center uppercase tracking-wide">
              Extracted Colors
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {colors.map((color, i) => (
                <ColorSwatch
                  key={`${color.role}-${i}`}
                  hex={color.hex}
                  role={color.role}
                  onChange={(hex) => updateColor(i, hex)}
                  onRemove={colors.length > 1 ? () => removeColor(i) : undefined}
                />
              ))}
              <button
                type="button"
                onClick={addColor}
                className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/40 transition-colors"
                title="Add color"
              >
                +
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </StepLayout>
  );
}
