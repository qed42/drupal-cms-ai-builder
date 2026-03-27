"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { downloadBlueprint } from "@/lib/download";
import ImpactSummary from "./ImpactSummary";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  onboarding: { label: "Setting Up", color: "text-warning", bg: "bg-warning/10" },
  generating: { label: "Generating", color: "text-brand-400", bg: "bg-brand-400/10" },
  blueprint_ready: { label: "Blueprint Ready", color: "text-success", bg: "bg-success/10" },
  provisioning: { label: "Provisioning", color: "text-info", bg: "bg-info/10" },
  live: { label: "Live", color: "text-success", bg: "bg-success/10" },
  provisioning_failed: { label: "Setup Failed", color: "text-error", bg: "bg-error/10" },
  suspended: { label: "Suspended", color: "text-error", bg: "bg-error/10" },
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
  impactBullets?: string[];
}

export default function SiteCard({ site, subscription, impactBullets }: SiteCardProps) {
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
    } catch {
      toast.error("Failed to download blueprint");
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
        toast.error("Failed to open site editor");
        setEditLoading(false);
        return;
      }

      window.open(data.url, "_blank");
      setEditLoading(false);
    } catch {
      toast.error("Failed to open site editor");
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
        toast.error("Failed to retry provisioning");
        setRetryLoading(false);
      }
    } catch {
      toast.error("Failed to retry provisioning");
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
          <Button onClick={handleContinueSetup} disabled={resumeLoading} size="sm">
            {resumeLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resuming...
              </>
            ) : (
              "Continue Setup"
            )}
          </Button>
        );
      case "generating":
        return (
          <Button
            onClick={() => router.push(`/onboarding/progress?siteId=${site.id}`)}
            className="bg-brand-600/50 text-white/70 cursor-default hover:bg-brand-600/50"
            size="sm"
          >
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </Button>
        );
      case "blueprint_ready":
        return (
          <Button disabled size="sm" className="bg-emerald-600/50 text-white/70 hover:bg-emerald-600/50">
            Awaiting Provisioning
          </Button>
        );
      case "live":
        return (
          <div className="flex items-center gap-2">
            <Button onClick={handleEditSite} disabled={editLoading} size="sm">
              {editLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening...
                </>
              ) : (
                "Edit Site"
              )}
            </Button>
            {site.drupalUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={site.drupalUrl} target="_blank" rel="noopener noreferrer">
                  Visit Site
                </a>
              </Button>
            )}
          </div>
        );
      case "provisioning":
        return (
          <Button
            onClick={() => router.push(`/onboarding/progress?siteId=${site.id}`)}
            className="bg-blue-600/50 text-white/70 cursor-default hover:bg-blue-600/50"
            size="sm"
          >
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Provisioning...
          </Button>
        );
      case "provisioning_failed":
        return (
          <Button variant="destructive" onClick={handleRetryProvisioning} disabled={retryLoading} size="sm">
            {retryLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Retrying...
              </>
            ) : (
              "Retry Setup"
            )}
          </Button>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-white/10">
                  <DropdownMenuItem
                    onClick={handleDownloadBlueprint}
                    disabled={downloadLoading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                    </svg>
                    {downloadLoading ? "Downloading..." : "Download Blueprint"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {impactBullets && impactBullets.length > 0 && (
          <ImpactSummary bullets={impactBullets} />
        )}

        <div className="pt-2">
          {getActionButton()}
        </div>
      </div>
    </div>
  );
}
