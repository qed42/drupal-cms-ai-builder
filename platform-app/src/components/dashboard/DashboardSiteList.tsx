"use client";

import { useState } from "react";
import SiteCard from "./SiteCard";
import ViewToggle, { type ViewMode } from "./ViewToggle";

interface SiteData {
  id: string;
  name: string | null;
  status: string;
  subdomain: string | null;
  drupalUrl: string | null;
}

interface SubscriptionData {
  plan: string;
  status: string;
}

interface DashboardSiteListProps {
  sites: {
    site: SiteData;
    subscription: SubscriptionData | null;
    impactBullets?: string[];
  }[];
}

export default function DashboardSiteList({ sites }: DashboardSiteListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <div>
      <div className="flex justify-end mb-4">
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {sites.map(({ site, subscription, impactBullets }) => (
          <SiteCard
            key={site.id}
            site={site}
            subscription={subscription}
            impactBullets={impactBullets}
          />
        ))}
      </div>
    </div>
  );
}
