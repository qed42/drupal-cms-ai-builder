"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { Input } from "@/components/ui/input";
import InferenceCard from "@/components/onboarding/InferenceCard";
import type { InferenceCardItem } from "@/components/onboarding/InferenceCard";
import {
  getQuestionsForIndustry,
  type IndustryQuestion,
} from "@/lib/onboarding/industry-questions";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function DetailsPage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [loaded, setLoaded] = useState(false);
  const [questions, setQuestions] = useState<IndustryQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiSelections, setMultiSelections] = useState<
    Record<string, string[]>
  >({});
  const [inferenceConfirmed, setInferenceConfirmed] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        const industry = d.data?.industry || "_default";
        const qs = getQuestionsForIndustry(industry);
        setQuestions(qs);

        if (d.data?.followUpAnswers) {
          const saved = d.data.followUpAnswers as Record<string, string>;
          setAnswers(saved);
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
      setAnswers((a) => ({ ...a, [questionId]: updated.join(", ") }));
      return { ...prev, [questionId]: updated };
    });
  }

  async function handleSubmit() {
    const res = await save("details", { followUpAnswers: answers });
    if (res.ok) {
      router.push(buildStepUrl("review-settings"));
      return true;
    }
    return false;
  }

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  const inferenceItems: InferenceCardItem[] = useMemo(() => {
    const items: InferenceCardItem[] = [];
    const answeredQuestions = questions.filter(
      (q) => answers[q.id] && answers[q.id].trim().length > 0
    );

    if (answeredQuestions.length === 0) return items;

    items.push({
      label: "Details provided",
      value: answeredQuestions.map((q) => q.text.replace(/\?$/, "")),
      type: "list",
    });

    const firstAnswer = answeredQuestions[0];
    if (firstAnswer) {
      items.push({
        label: "Business focus",
        value: answers[firstAnswer.id],
        type: "text",
      });
    }

    return items;
  }, [questions, answers]);

  const inferenceSlot =
    answeredCount >= 2 ? (
      <InferenceCard
        title="Archie is learning"
        items={inferenceItems}
        explanation="These details shape your page copy, service descriptions, and calls to action."
        variant={inferenceConfirmed ? "compact" : "full"}
        onConfirm={() => setInferenceConfirmed(true)}
        onEdit={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        editLabel="Edit answers above"
      />
    ) : null;

  if (!loaded) return null;

  return (
    <StepLayout
      step="details"
      layoutMode="split"
      title="Help Archie write better content"
      subtitle="These details go directly into your page copy — specific answers make specific content."
      buttonLabel="Next: Review & Launch"
      onSubmit={handleSubmit}
      insightSlot={inferenceSlot}
      emptyStateText="Answer a couple of questions and I'll show what I've learned..."
    >
      <div className="space-y-6 text-left">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium text-white/80 mb-2">
              {q.text}
            </label>

            {q.inputType === "text" && (
              <>
                <Input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  inputSize="lg"
                />
                {!answers[q.id] && (
                  <p className="text-xs text-white/30 mt-1">
                    Archie needs this to write your content
                  </p>
                )}
                {answers[q.id] && (answers[q.id] || "").length < 20 && (
                  <p className="text-xs text-amber-400/60 mt-1">
                    A bit more detail helps Archie write specific content
                  </p>
                )}
                {(answers[q.id] || "").length >= 50 && (
                  <p className="text-xs text-emerald-400/80 mt-1">
                    Great &mdash; Archie has plenty to work with
                  </p>
                )}
              </>
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
                        ? "bg-brand-500/30 border-brand-500 text-white"
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
                          ? "bg-brand-500/30 border-brand-500 text-white"
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
