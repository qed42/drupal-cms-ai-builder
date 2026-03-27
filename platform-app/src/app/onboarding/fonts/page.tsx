"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import InferenceCard from "@/components/onboarding/InferenceCard";
import FontPreviewTile from "@/components/onboarding/FontPreviewTile";
import FontSelector from "@/components/onboarding/FontSelector";
import FileUploadZone from "@/components/onboarding/FileUploadZone";
import { getGoogleFontsUrl, GOOGLE_FONTS } from "@/lib/fonts";
import { useOnboarding } from "@/hooks/useOnboarding";

const DEFAULT_COLORS = [
  { primary: "#6366F1", secondary: "#1E1B4B", accent: "#00F1C6", light: "#E0E7FF" },
];

export default function FontsPage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [loaded, setLoaded] = useState(false);
  const [headingFont, setHeadingFont] = useState(GOOGLE_FONTS[0].name);
  const [bodyFont, setBodyFont] = useState(GOOGLE_FONTS[3].name);
  const [colors, setColors] = useState(DEFAULT_COLORS[0]);
  const [customFontFile, setCustomFontFile] = useState<string | null>(null);
  const [customFontUrl, setCustomFontUrl] = useState<string | null>(null);
  const [inferenceConfirmed, setInferenceConfirmed] = useState(false);

  useEffect(() => {
    resume()
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
  }, [resume]);

  // Load Google Fonts dynamically
  const fontsUrl = getGoogleFontsUrl([headingFont, bodyFont]);

  async function handleSubmit() {
    const customFonts = customFontUrl
      ? [{ name: customFontFile, file_url: customFontUrl }]
      : [];

    const res = await save("fonts", {
      fonts: { heading: headingFont, body: bodyFont },
      custom_fonts: customFonts,
    });
    if (!res.ok) return false;

    router.push(buildStepUrl("images"));
    return true;
  }

  if (!loaded) return null;

  // Build 4 preview tile color combos from user colors
  const tileCombos = [
    { bg: colors.primary, text: "#FFFFFF", font: headingFont },
    { bg: colors.secondary, text: colors.accent, font: headingFont },
    { bg: colors.accent, text: colors.secondary, font: bodyFont },
    { bg: colors.light, text: colors.primary, font: bodyFont },
  ];

  const inferenceSlot = (
    <InferenceCard
      title="How Archie uses your fonts"
      items={[
        { label: "Headings", value: headingFont || "Not yet selected", type: "text" },
        { label: "Body text", value: bodyFont || "Not yet selected", type: "text" },
      ]}
      explanation="Your heading font appears in hero sections and page titles. Body font is used for paragraphs and descriptions."
      variant={inferenceConfirmed ? "compact" : "full"}
      onConfirm={() => setInferenceConfirmed(true)}
      onEdit={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      editLabel="Change selection"
    />
  );

  return (
    <StepLayout
      step="fonts"
      layoutMode="split"
      title="Choose your typography"
      subtitle="Your font pairing sets the tone. Archie applies it to all headings and body text."
      buttonLabel="Continue"
      onSubmit={handleSubmit}
      insightSlot={inferenceSlot}
      emptyStateText="Pick your fonts and Archie will show how they\u2019ll be used across your site."
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsUrl} />

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
    </StepLayout>
  );
}
