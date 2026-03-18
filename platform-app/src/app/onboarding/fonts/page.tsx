"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import FontPreviewTile from "@/components/onboarding/FontPreviewTile";
import FontSelector from "@/components/onboarding/FontSelector";
import FileUploadZone from "@/components/onboarding/FileUploadZone";
import { getGoogleFontsUrl, GOOGLE_FONTS } from "@/lib/fonts";

const DEFAULT_COLORS = [
  { primary: "#6366F1", secondary: "#1E1B4B", accent: "#00F1C6", light: "#E0E7FF" },
];

export default function FontsPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [headingFont, setHeadingFont] = useState(GOOGLE_FONTS[0].name);
  const [bodyFont, setBodyFont] = useState(GOOGLE_FONTS[3].name);
  const [colors, setColors] = useState(DEFAULT_COLORS[0]);
  const [customFontFile, setCustomFontFile] = useState<string | null>(null);
  const [customFontUrl, setCustomFontUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/onboarding/resume")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.fonts?.heading) setHeadingFont(d.data.fonts.heading);
        if (d.data?.fonts?.body) setBodyFont(d.data.fonts.body);
        if (d.data?.colors) {
          setColors({
            primary: d.data.colors.primary || DEFAULT_COLORS[0].primary,
            secondary: d.data.colors.secondary || d.data.colors.dark || DEFAULT_COLORS[0].secondary,
            accent: d.data.colors.accent || DEFAULT_COLORS[0].accent,
            light: d.data.colors.light || d.data.colors.muted || DEFAULT_COLORS[0].light,
          });
        }
        if (d.data?.custom_fonts?.[0]) {
          setCustomFontFile(d.data.custom_fonts[0].name);
          setCustomFontUrl(d.data.custom_fonts[0].file_url);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Load Google Fonts dynamically
  const fontsUrl = getGoogleFontsUrl([headingFont, bodyFont]);

  async function handleSubmit() {
    const customFonts = customFontUrl
      ? [{ name: customFontFile, file_url: customFontUrl }]
      : [];

    const res = await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "fonts",
        data: {
          fonts: { heading: headingFont, body: bodyFont },
          custom_fonts: customFonts,
          onboarding_complete: true,
        },
      }),
    });
    if (res.ok) {
      // Mark onboarding complete — for now redirect to a confirmation
      router.push("/onboarding/start");
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  // Build 4 preview tile color combos from user colors
  const tileCombos = [
    { bg: colors.primary, text: "#FFFFFF", font: headingFont },
    { bg: colors.secondary, text: colors.accent, font: headingFont },
    { bg: colors.accent, text: colors.secondary, font: bodyFont },
    { bg: colors.light, text: colors.primary, font: bodyFont },
  ];

  return (
    <StepLayout
      step="fonts"
      title="Select a font"
      subtitle="Select a primary and a secondary font"
      buttonLabel="Visualize my site"
      onSubmit={handleSubmit}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsUrl} />

      <div className="space-y-6">
        {/* Preview tiles */}
        <div className="grid grid-cols-2 gap-3">
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
    </StepLayout>
  );
}
