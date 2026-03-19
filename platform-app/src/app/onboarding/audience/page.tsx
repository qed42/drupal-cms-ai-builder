"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function AudiencePage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [audience, setAudience] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.audience) setAudience(d.data.audience);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  async function handleSubmit() {
    const res = await save("audience", { audience });
    if (res.ok) {
      router.push(buildStepUrl("pages"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  return (
    <StepLayout
      step="audience"
      title="Who is this for?"
      subtitle="Describe your ideal audience — who will visit your site?"
      buttonLabel="Plan the Structure"
      onSubmit={handleSubmit}
      disabled={false}
    >
      <input
        type="text"
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        placeholder="Describe your ideal audience..."
        className="w-full rounded-xl bg-white/10 px-6 py-4 text-lg text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-center"
        autoFocus
      />
    </StepLayout>
  );
}
