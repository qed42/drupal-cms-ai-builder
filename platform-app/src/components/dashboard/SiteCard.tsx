"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { downloadBlueprint } from "@/lib/download";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  onboarding: { label: "Setting Up", color: "text-amber-400", bg: "bg-amber-400/10" },
  generating: { label: "Generating", color: "text-indigo-400", bg: "bg-indigo-400/10" },
  blueprint_ready: { label: "Blueprint Ready", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  provisioning: { label: "Provisioning", color: "text-blue-400", bg: "bg-blue-400/10" },
  live: { label: "Live", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  provisioning_failed: { label: "Setup Failed", color: "text-red-400", bg: "bg-red-400/10" },
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
  const [editLoading, setEditLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const config = STATUS_CONFIG[site.status] || STATUS_CONFIG.onboarding;

  const hasBlueprintReady = ["blueprint_ready", "provisioning", "live", "provisioning_failed"].includes(site.status);

  async function handleDownloadBlueprint() {
    setDownloadLoading(true);
    try {
      await downloadBlueprint(site.id, site.name || "site");
    } catch (error) {
      console.error("Error downloading blueprint:", error);
    } finally {
      setDownloadLoading(false);
    }
  }

  async function handleEditSite() {
    setEditLoading(true);
    try {
      const res = await fetch("/api/auth/create-login-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to create login token:", data.error);
        setEditLoading(false);
        return;
      }

      // Open Drupal Canvas editor in new tab via auto-login URL.
      window.open(data.url, "_blank");
      setEditLoading(false);
    } catch (error) {
      console.error("Error launching editor:", error);
      setEditLoading(false);
    }
  }

  async function handleRetryProvisioning() {
    setRetryLoading(true);
    try {
      const res = await fetch("/api/provision/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push(`/onboarding/progress?siteId=${site.id}`);
      } else {
        console.error("Failed to retry provisioning");
        setRetryLoading(false);
      }
    } catch (error) {
      console.error("Error retrying provisioning:", error);
      setRetryLoading(false);
    }
  }

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
            onClick={() => router.push(`/onboarding/progress?siteId=${site.id}`)}
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
          <button
            onClick={handleEditSite}
            disabled={editLoading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {editLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Opening...
              </>
            ) : (
              "Edit Site"
            )}
          </button>
        );
      case "provisioning":
        return (
          <button
            onClick={() => router.push(`/onboarding/progress?siteId=${site.id}`)}
            className="rounded-lg bg-blue-600/50 px-4 py-2 text-sm font-medium text-white/70 cursor-default flex items-center gap-2"
          >
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Provisioning...
          </button>
        );
      case "provisioning_failed":
        return (
          <button
            onClick={handleRetryProvisioning}
            disabled={retryLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {retryLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Retrying...
              </>
            ) : (
              "Retry Setup"
            )}
          </button>
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

      <div className="pt-2 flex items-center gap-3">
        {getActionButton()}
        {hasBlueprintReady && (
          <button
            onClick={handleDownloadBlueprint}
            disabled={downloadLoading}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {downloadLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                </svg>
                Blueprint JSON
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
