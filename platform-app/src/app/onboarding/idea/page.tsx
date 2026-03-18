"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";

export default function IdeaPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding/resume")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.idea) setIdea(d.data.idea);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function handleSubmit() {
    const res = await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "idea", data: { idea } }),
    });
    if (res.ok) {
      router.push("/onboarding/audience");
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  return (
    <StepLayout
      step="idea"
      title="What's the big idea?"
      subtitle="In a few lines, tell us what this is all about."
      buttonLabel="Your Audience"
      onSubmit={handleSubmit}
      disabled={idea.trim().length < 1}
    >
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Describe your project or business..."
        rows={4}
        className="w-full rounded-xl bg-white/10 px-6 py-4 text-lg text-white placeholder-white/30 border border-white/10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-center"
        autoFocus
      />
    </StepLayout>
  );
}
