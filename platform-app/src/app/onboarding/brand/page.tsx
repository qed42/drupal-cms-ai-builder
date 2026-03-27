"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import InferenceCard from "@/components/onboarding/InferenceCard";
import type { InferenceCardItem } from "@/components/onboarding/InferenceCard";
import FileUploadZone from "@/components/onboarding/FileUploadZone";
import ColorSwatch from "@/components/onboarding/ColorSwatch";
import FontPreviewTile from "@/components/onboarding/FontPreviewTile";
import FontSelector from "@/components/onboarding/FontSelector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getGoogleFontsUrl, GOOGLE_FONTS } from "@/lib/fonts";
import { useOnboarding } from "@/hooks/useOnboarding";

interface ColorEntry {
  hex: string;
  role: string;
}

const DEFAULT_COLORS = { primary: "#6366F1", secondary: "#1E1B4B", accent: "#00F1C6", light: "#E0E7FF" };

export default function BrandPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buildStepUrl, resume, save } = useOnboarding();

  // Tab state — default to "colors", but support ?tab=typography for redirect
  const initialTab = searchParams.get("tab") === "typography" ? "typography" : "colors";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Colors tab state
  const [loaded, setLoaded] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [paletteFile, setPaletteFile] = useState<string | null>(null);
  const [paletteUrl, setPaletteUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [extracting, setExtracting] = useState(false);

  // Typography tab state
  const [headingFont, setHeadingFont] = useState(GOOGLE_FONTS[0].name);
  const [bodyFont, setBodyFont] = useState(GOOGLE_FONTS[3].name);
  const [fontColors, setFontColors] = useState(DEFAULT_COLORS);
  const [customFontFile, setCustomFontFile] = useState<string | null>(null);
  const [customFontUrl, setCustomFontUrl] = useState<string | null>(null);

  const [inferenceConfirmed, setInferenceConfirmed] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        // Colors data
        if (d.data?.logo_filename) setLogoFile(d.data.logo_filename);
        if (d.data?.logo_url) setLogoUrl(d.data.logo_url);
        if (d.data?.palette_filename) setPaletteFile(d.data.palette_filename);
        if (d.data?.palette_url) setPaletteUrl(d.data.palette_url);
        if (d.data?.colors) {
          const colorEntries = Object.entries(d.data.colors).map(([role, hex]) => ({
            role,
            hex: hex as string,
          }));
          if (colorEntries.length > 0) {
            setColors(colorEntries);
            // Also update font preview colors
            setFontColors({
              primary: (d.data.colors as Record<string, string>).primary || DEFAULT_COLORS.primary,
              secondary: (d.data.colors as Record<string, string>).secondary || (d.data.colors as Record<string, string>).dark || DEFAULT_COLORS.secondary,
              accent: (d.data.colors as Record<string, string>).accent || DEFAULT_COLORS.accent,
              light: (d.data.colors as Record<string, string>).light || (d.data.colors as Record<string, string>).muted || DEFAULT_COLORS.light,
            });
          }
        }

        // Fonts data
        if (d.data?.fonts?.heading) setHeadingFont(d.data.fonts.heading);
        if (d.data?.fonts?.body) setBodyFont(d.data.fonts.body);
        if (d.data?.custom_fonts?.[0]) {
          setCustomFontFile(d.data.custom_fonts[0].name);
          setCustomFontUrl(d.data.custom_fonts[0].file_url);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  // Keep font colors synced with extracted colors
  useEffect(() => {
    if (colors.length > 0) {
      const colorMap = colors.reduce((acc, c) => ({ ...acc, [c.role]: c.hex }), {} as Record<string, string>);
      setFontColors({
        primary: colorMap.primary || DEFAULT_COLORS.primary,
        secondary: colorMap.secondary || colorMap.dark || DEFAULT_COLORS.secondary,
        accent: colorMap.accent || DEFAULT_COLORS.accent,
        light: colorMap.light || colorMap.muted || DEFAULT_COLORS.light,
      });
    }
  }, [colors]);

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

    const customFonts = customFontUrl
      ? [{ name: customFontFile, file_url: customFontUrl }]
      : [];

    const res = await save("brand", {
      logo_url: logoUrl,
      logo_filename: logoFile,
      palette_url: paletteUrl,
      palette_filename: paletteFile,
      colors: colorMap,
      fonts: { heading: headingFont, body: bodyFont },
      custom_fonts: customFonts,
    });
    if (res.ok) {
      router.push(buildStepUrl("pages"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  // Load Google Fonts dynamically
  const fontsUrl = getGoogleFontsUrl([headingFont, bodyFont]);

  // Font preview tile combos
  const tileCombos = [
    { bg: fontColors.primary, text: "#FFFFFF", font: headingFont },
    { bg: fontColors.secondary, text: fontColors.accent, font: headingFont },
    { bg: fontColors.accent, text: fontColors.secondary, font: bodyFont },
    { bg: fontColors.light, text: fontColors.primary, font: bodyFont },
  ];

  // Build inference card based on active tab
  const inferenceItems: InferenceCardItem[] = [];
  if (colors.length > 0) {
    inferenceItems.push({
      label: "Primary color",
      value: colors[0]?.hex || "",
      type: "text",
    });
    inferenceItems.push({
      label: "Palette",
      value: `${colors.length} colors extracted`,
      type: "text",
    });
  }
  inferenceItems.push({
    label: "Headings",
    value: headingFont,
    type: "text",
  });
  inferenceItems.push({
    label: "Body text",
    value: bodyFont,
    type: "text",
  });

  const inferenceSlot =
    !extracting && (colors.length > 0 || headingFont) ? (
      <InferenceCard
        title="Your brand identity"
        items={inferenceItems}
        explanation="Colors, fonts, and logo will be applied consistently across your entire site."
        variant={inferenceConfirmed ? "compact" : "full"}
        onConfirm={() => setInferenceConfirmed(true)}
        onEdit={() => {
          setInferenceConfirmed(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        editLabel="Adjust brand above"
      />
    ) : null;

  return (
    <StepLayout
      step="brand"
      layoutMode="split"
      title="Your brand identity"
      subtitle="Upload your logo for color extraction, then fine-tune your typography."
      buttonLabel="Next: Site Pages"
      onSubmit={handleSubmit}
      insightSlot={inferenceSlot}
      emptyStateText="Upload your logo and pick fonts — Archie will apply them across your entire site."
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsUrl} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="colors" className="flex-1">
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex-1">
            Typography
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
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
        </TabsContent>

        <TabsContent value="typography">
          <div className="space-y-6">
            {/* Preview tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {tileCombos.map((combo, i) => (
                <FontPreviewTile
                  key={i}
                  bgColor={combo.bg}
                  textColor={combo.text}
                  fontFamily={combo.font}
                />
              ))}
            </div>

            {/* Font selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FontSelector
                label="Heading Font"
                value={headingFont}
                onChange={setHeadingFont}
              />
              <FontSelector
                label="Body Font"
                value={bodyFont}
                onChange={setBodyFont}
              />
            </div>

            {/* Custom font upload */}
            <FileUploadZone
              label="Add font files locally"
              accept=".woff,.woff2,.ttf,.otf"
              uploadType="font"
              currentFile={customFontFile}
              onUploadComplete={(result) => {
                setCustomFontFile(result.filename);
                setCustomFontUrl(result.url);
              }}
              onRemove={() => {
                setCustomFontFile(null);
                setCustomFontUrl(null);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </StepLayout>
  );
}
