"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import DesignOptionCard from "@/components/onboarding/DesignOptionCard";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function DesignPage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [designSource, setDesignSource] = useState<"ai" | "figma">("ai");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.design_source) setDesignSource(d.data.design_source);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  async function handleSubmit() {
    const res = await save("design", { design_source: designSource });
    if (res.ok) {
      router.push(buildStepUrl("brand"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  return (
    <StepLayout
      step="design"
      title="How should it feel?"
      subtitle="Upload a design reference or let Archie style it based on your brand."
      buttonLabel="Continue"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DesignOptionCard
          title="Provide Figma details"
          subtitle="Upload your design or paste a URL"
          icon={
            <svg className="w-8 h-8 text-white/70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5zM12 2h3.5a3.5 3.5 0 1 1 0 7H12V2zm0 12.5V9h3.5a3.5 3.5 0 1 1 0 7H12v-3.5zm-7 0A3.5 3.5 0 0 0 8.5 18H12v-7H8.5A3.5 3.5 0 0 0 5 14.5zM5 12a3.5 3.5 0 0 1 3.5-3.5H12v7H8.5A3.5 3.5 0 0 1 5 12z" />
            </svg>
          }
          selected={designSource === "figma"}
          disabled={true}
          badge="Coming soon"
          onSelect={() => {}}
        />
        <DesignOptionCard
          title="Let Space AI choose"
          subtitle="We'll generate a template based on your answers"
          icon={
            <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          }
          selected={designSource === "ai"}
          onSelect={() => setDesignSource("ai")}
        />
      </div>
    </StepLayout>
  );
}
