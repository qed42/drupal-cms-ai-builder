"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { downloadBlueprint } from "@/lib/download";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  onboarding: { label: "Setting Up", color: "text-amber-400", bg: "bg-amber-400/10" },
  generating: { label: "Generating", color: "text-brand-400", bg: "bg-brand-400/10" },
  blueprint_ready: { label: "Blueprint Ready", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  provisioning: { label: "Provisioning", color: "text-blue-400", bg: "bg-blue-400/10" },
  live: { label: "Live", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  provisioning_failed: { label: "Setup Failed", color: "text-red-400", bg: "bg-red-400/10" },
  suspended: { label: "Suspended", color: "text-red-400", bg: "bg-red-400/10" },
  expired: { label: "Expired", color: "text-gray-400", bg: "bg-gray-400/10" },
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Free Trial",
  basic: "Basic",
  pro: "Pro Plan",
};

interface SiteCardProps {
  site: {
    id: string;
    name: string | null;
    status: string;
    subdomain: string | null;
    drupalUrl: string | null;
  };
  subscription?: {
    plan: string;
    status: string;
  } | null;
}

export default function SiteCard({ site, subscription }: SiteCardProps) {
  const router = useRouter();
  const [editLoading, setEditLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const config = STATUS_CONFIG[site.status] || STATUS_CONFIG.onboarding;

  const hasBlueprintReady = ["blueprint_ready", "provisioning", "live", "provisioning_failed"].includes(site.status);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleDownloadBlueprint() {
    setDownloadLoading(true);
    setMenuOpen(false);
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

  const [resumeLoading, setResumeLoading] = useState(false);

  async function handleContinueSetup() {
    setResumeLoading(true);
    try {
      const res = await fetch(`/api/onboarding/resume?siteId=${site.id}`);
      const data = await res.json();
      const step = data.step && data.step !== "start" ? data.step : "start";
      router.push(`/onboarding/${step}?siteId=${site.id}`);
    } catch {
      router.push(`/onboarding/start?siteId=${site.id}`);
    }
  }

  function getActionButton() {
    switch (site.status) {
      case "onboarding":
        return (
          <button
            onClick={handleContinueSetup}
            disabled={resumeLoading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {resumeLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resuming...
              </>
            ) : (
              "Continue Setup"
            )}
          </button>
        );
      case "generating":
        return (
          <button
            onClick={() => router.push(`/onboarding/progress?siteId=${site.id}`)}
            className="rounded-lg bg-brand-600/50 px-4 py-2 text-sm font-medium text-white/70 cursor-default flex items-center gap-2"
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditSite}
              disabled={editLoading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            {site.drupalUrl && (
              <a
                href={site.drupalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Visit Site
              </a>
            )}
          </div>
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
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Visual preview bar — stylized color strip using status */}
      <div className={`h-2 ${site.status === "live" ? "bg-gradient-to-r from-brand-500 to-brand-400" : "bg-white/5"}`} />

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Site avatar */}
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-brand-400">
                {(site.name || "U")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {site.name || "Untitled Site"}
              </h2>
              {site.subdomain && (
                <p className="text-white/35 text-sm mt-0.5">
                  {site.subdomain}.drupalcms.app
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
              {config.label}
            </span>
            {subscription && (
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white/60 bg-white/5 border border-white/10">
                {PLAN_LABELS[subscription.plan] || subscription.plan}
              </span>
            )}

            {/* Overflow menu for developer actions */}
            {hasBlueprintReady && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-10 w-48 rounded-lg bg-slate-800 border border-white/10 shadow-xl py-1 z-10">
                    <button
                      onClick={handleDownloadBlueprint}
                      disabled={downloadLoading}
                      className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                      </svg>
                      {downloadLoading ? "Downloading..." : "Download Blueprint"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          {getActionButton()}
        </div>
      </div>
    </div>
  );
}
