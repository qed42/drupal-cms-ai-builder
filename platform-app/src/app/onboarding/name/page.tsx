"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function NamePage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.name) setName(d.data.name);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  async function handleSubmit() {
    const res = await save("name", { name });
    if (res.ok) {
      router.push(buildStepUrl("idea"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  return (
    <StepLayout
      step="name"
      title="What are we calling this?"
      subtitle="Give your project a name — you can always change it later."
      buttonLabel="Continue"
      onSubmit={handleSubmit}
      disabled={name.trim().length < 2}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name of the Project"
        className="w-full rounded-xl bg-white/10 px-6 py-4 text-lg text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-center"
        autoFocus
      />
    </StepLayout>
  );
}
