import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardSiteList from "@/components/dashboard/DashboardSiteList";
import AddNewSiteButton from "@/components/dashboard/AddNewSiteButton";
import EmptyDashboard from "@/components/dashboard/EmptyDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Subscription is site-level (1:1 with Site) — included per site, rendered inline
  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      blueprint: { select: { payload: true } },
    },
  });

  // Show empty state for new users with no sites
  if (sites.length === 0) {
    return <EmptyDashboard />;
  }

  const sitesData = sites.map((site) => {
    // Extract impact bullets from blueprint payload (TASK-421)
    const payload = site.blueprint?.payload as Record<string, unknown> | null;
    const impactBullets = Array.isArray(payload?._impact) ? (payload._impact as string[]) : [];

    return {
      site: {
        id: site.id,
        name: site.name,
        status: site.status,
        subdomain: site.subdomain,
        drupalUrl: site.drupalUrl,
      },
      subscription: site.subscription
        ? {
            plan: site.subscription.plan,
            status: site.subscription.status,
          }
        : null,
      impactBullets,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 mt-1">Manage your websites</p>
        </div>
        <AddNewSiteButton />
      </div>

      <DashboardSiteList sites={sitesData} />
    </div>
  );
}
