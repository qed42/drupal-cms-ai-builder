"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function EmptyDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      {/* Abstract wireframe illustration */}
      <div className="mb-8 w-32 h-24 relative">
        <svg viewBox="0 0 128 96" className="w-full h-full" fill="none">
          {/* Browser frame */}
          <rect x="4" y="4" width="120" height="88" rx="8" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
          <rect x="4" y="4" width="120" height="16" rx="8" fill="white" fillOpacity="0.03" />
          <circle cx="16" cy="12" r="3" fill="white" fillOpacity="0.1" />
          <circle cx="26" cy="12" r="3" fill="white" fillOpacity="0.1" />
          <circle cx="36" cy="12" r="3" fill="white" fillOpacity="0.1" />
          {/* Content lines */}
          <rect x="16" y="30" width="40" height="4" rx="2" fill="white" fillOpacity="0.08" />
          <rect x="16" y="40" width="96" height="3" rx="1.5" fill="white" fillOpacity="0.05" />
          <rect x="16" y="48" width="80" height="3" rx="1.5" fill="white" fillOpacity="0.05" />
          {/* Image placeholder */}
          <rect x="16" y="58" width="44" height="26" rx="4" fill="white" fillOpacity="0.03" stroke="white" strokeOpacity="0.06" />
          <rect x="68" y="58" width="44" height="26" rx="4" fill="white" fillOpacity="0.03" stroke="white" strokeOpacity="0.06" />
          {/* Brand accent */}
          <rect x="16" y="30" width="8" height="4" rx="2" fill="#4F46E5" fillOpacity="0.3" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        Build your first website
      </h2>
      <p className="text-white/50 mb-8 max-w-sm">
        Archie will design and write your site in under 5 minutes. Just tell us about your business.
      </p>

      <Button
        variant="default"
        size="xl"
        className="rounded-full shadow-lg shadow-brand-500/25"
        onClick={() => router.push("/onboarding/start")}
      >
        Get Started Free
        <span className="text-xl">&rarr;</span>
      </Button>

      <p className="text-white/30 text-sm mt-4">
        No credit card required
      </p>
    </div>
  );
}
