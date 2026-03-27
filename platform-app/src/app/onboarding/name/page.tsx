"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { Input } from "@/components/ui/input";
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
      title="What's your business called?"
      subtitle="This becomes your site title and appears in search results."
      buttonLabel="Continue"
      onSubmit={handleSubmit}
      disabled={name.trim().length < 2}
    >
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name of the Project"
        inputSize="xl"
        className="text-center"
        autoFocus
      />
    </StepLayout>
  );
}
