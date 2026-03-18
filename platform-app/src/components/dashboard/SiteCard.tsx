"use client";

import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  onboarding: { label: "Setting Up", color: "text-amber-400", bg: "bg-amber-400/10" },
  generating: { label: "Generating", color: "text-indigo-400", bg: "bg-indigo-400/10" },
  blueprint_ready: { label: "Blueprint Ready", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  provisioning: { label: "Provisioning", color: "text-blue-400", bg: "bg-blue-400/10" },
  live: { label: "Live", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  suspended: { label: "Suspended", color: "text-red-400", bg: "bg-red-400/10" },
  expired: { label: "Expired", color: "text-gray-400", bg: "bg-gray-400/10" },
};

interface SiteCardProps {
  site: {
    id: string;
    name: string | null;
    status: string;
    subdomain: string | null;
    drupalUrl: string | null;
  };
}

export default function SiteCard({ site }: SiteCardProps) {
  const router = useRouter();
  const config = STATUS_CONFIG[site.status] || STATUS_CONFIG.onboarding;

  function getActionButton() {
    switch (site.status) {
      case "onboarding":
        return (
          <button
            onClick={() => router.push("/onboarding/start")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Continue Setup
          </button>
        );
      case "generating":
        return (
          <button
            onClick={() => router.push("/onboarding/progress")}
            className="rounded-lg bg-indigo-600/50 px-4 py-2 text-sm font-medium text-white/70 cursor-default flex items-center gap-2"
          >
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </button>
        );
      case "blueprint_ready":
        return (
          <button
            disabled
            className="rounded-lg bg-emerald-600/50 px-4 py-2 text-sm font-medium text-white/70 cursor-not-allowed"
          >
            Awaiting Provisioning
          </button>
        );
      case "live":
        return (
          <a
            href={site.drupalUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors inline-block"
          >
            Edit Site
          </a>
        );
      default:
        return null;
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {site.name || "Untitled Site"}
          </h2>
          {site.subdomain && (
            <p className="text-white/40 text-sm mt-1">
              {site.subdomain}.drupalcms.app
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
          {config.label}
        </span>
      </div>

      {site.drupalUrl && site.status === "live" && (
        <p className="text-white/50 text-sm truncate">{site.drupalUrl}</p>
      )}

      <div className="pt-2">{getActionButton()}</div>
    </div>
  );
}
