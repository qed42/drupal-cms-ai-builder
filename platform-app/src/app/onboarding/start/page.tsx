"use client";

import { useRouter } from "next/navigation";
import ProgressDots from "@/components/onboarding/ProgressDots";

export default function StartPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-xl mx-auto px-6 text-center">
      {/* Animated icon */}
      <div className="mb-8 flex gap-1 items-end">
        {[20, 32, 24, 36, 28].map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-purple-400"
            style={{
              height: h,
              animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Let&apos;s shape your big idea.
      </h1>

      <p className="text-white/60 text-lg mb-10 max-w-md">
        In just a few guided steps, we&apos;ll turn your vision into a living,
        breathing digital space.
      </p>

      <button
        onClick={() => router.push("/onboarding/name")}
        className="rounded-full bg-white px-8 py-3 font-medium text-[#0a0a2e] transition-all hover:bg-white/90 flex items-center gap-2"
      >
        Start Building
        <span className="text-lg">&rarr;</span>
      </button>

      <div className="mt-12">
        <ProgressDots currentStep="start" />
      </div>
    </div>
  );
}
