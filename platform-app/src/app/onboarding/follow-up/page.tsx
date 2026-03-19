"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import {
  getQuestionsForIndustry,
  type IndustryQuestion,
} from "@/lib/onboarding/industry-questions";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function FollowUpPage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [loaded, setLoaded] = useState(false);
  const [questions, setQuestions] = useState<IndustryQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiSelections, setMultiSelections] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    resume()
      .then((d) => {
        const industry = d.data?.industry || "_default";
        const qs = getQuestionsForIndustry(industry);
        setQuestions(qs);

        // Restore saved answers if any
        if (d.data?.followUpAnswers) {
          const saved = d.data.followUpAnswers as Record<string, string>;
          setAnswers(saved);
          // Reconstruct multi-select state from comma-separated strings
          qs.forEach((q) => {
            if (q.inputType === "multi-select" && saved[q.id]) {
              setMultiSelections((prev) => ({
                ...prev,
                [q.id]: saved[q.id].split(", "),
              }));
            }
          });
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMultiSelect(questionId: string, option: string) {
    setMultiSelections((prev) => {
      const current = prev[questionId] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      // Also sync to answers as comma-separated string
      setAnswers((a) => ({ ...a, [questionId]: updated.join(", ") }));
      return { ...prev, [questionId]: updated };
    });
  }

  async function handleSubmit() {
    const res = await save("follow-up", { followUpAnswers: answers });
    if (res.ok) {
      router.push(buildStepUrl("tone"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  return (
    <StepLayout
      step="follow-up"
      title="Tell us more about your business"
      subtitle="These details help us generate content that's specific to what you do."
      buttonLabel="Continue"
      onSubmit={handleSubmit}
    >
      <div className="space-y-6 text-left">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium text-white/80 mb-2">
              {q.text}
            </label>

            {q.inputType === "text" && (
              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-indigo-500 focus:outline-none"
              />
            )}

            {q.inputType === "select" && q.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateAnswer(q.id, option)}
                    className={`rounded-xl px-4 py-3 text-sm text-left transition-all border ${
                      answers[q.id] === option
                        ? "bg-indigo-500/30 border-indigo-500 text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/30"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {q.inputType === "multi-select" && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((option) => {
                  const selected = (
                    multiSelections[q.id] || []
                  ).includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleMultiSelect(q.id, option)}
                      className={`rounded-full px-4 py-2 text-sm transition-all border ${
                        selected
                          ? "bg-indigo-500/30 border-indigo-500 text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {selected && <span className="mr-1">&#10003;</span>}
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </StepLayout>
  );
}
