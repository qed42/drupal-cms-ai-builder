"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProgressStepper from "@/components/onboarding/ProgressStepper";
import { useOnboarding } from "@/hooks/useOnboarding";

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  features: string[];
}

const THEMES: ThemeOption[] = [
  {
    id: "space_ds",
    name: "Space DS",
    description: "Modern, flexible design system with compositional layouts and rich component library.",
    features: ["31 components", "Flexible grid system", "Runtime brand customization"],
  },
  {
    id: "mercury",
    name: "Mercury",
    description: "Clean, minimal theme built for Drupal Canvas with Tailwind CSS and design tokens.",
    features: ["22 components", "Tailwind v4 + CVA", "Dark mode support"],
  },
  // CivicTheme adapter exists but is not yet supported in the pipeline
  // {
  //   id: "civictheme",
  //   name: "CivicTheme",
  //   description: "Enterprise-grade design system with pre-composed organisms and accessibility focus.",
  //   features: ["60+ components", "Light/dark themes", "Atomic design"],
  // },
];

export default function ThemeSelectionPage() {
  const router = useRouter();
  const { save, buildStepUrl } = useOnboarding();
  const [selected, setSelected] = useState("space_ds");

  const handleNext = async () => {
    await save("theme", { designSystemId: selected });
    router.push(buildStepUrl("name"));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-6">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">
        Pick a design foundation
      </h1>
      <p className="text-white/50 text-lg mb-10 text-center max-w-lg">
        Each theme has a distinct visual style. Archie will customize it with your brand.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setSelected(theme.id)}
            className={`text-left p-6 rounded-2xl border-2 transition-all ${
              selected === theme.id
                ? "border-brand-500 bg-white/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              {theme.name}
            </h3>
            <p className="text-white/50 text-sm mb-4">{theme.description}</p>
            <ul className="space-y-1">
              {theme.features.map((feature) => (
                <li
                  key={feature}
                  className="text-white/40 text-xs flex items-center gap-1.5"
                >
                  <span className="text-brand-400">&#10003;</span> {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="rounded-full bg-brand-500 px-10 py-4 text-lg font-medium text-white transition-all hover:bg-brand-400 flex items-center gap-2 shadow-lg shadow-brand-500/25"
      >
        Continue
        <span className="text-xl">&rarr;</span>
      </button>

      <div className="mt-14">
        <ProgressStepper currentStep="theme" />
      </div>
    </div>
  );
}
