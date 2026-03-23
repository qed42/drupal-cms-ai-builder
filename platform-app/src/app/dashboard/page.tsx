import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardSiteList from "@/components/dashboard/DashboardSiteList";
import AddNewSiteButton from "@/components/dashboard/AddNewSiteButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Subscription is site-level (1:1 with Site) — included per site, rendered inline
  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { subscription: true },
  });

  // If no sites at all (shouldn't happen post-registration), redirect to onboarding
  if (sites.length === 0) {
    redirect("/onboarding/start");
  }

  const sitesData = sites.map((site) => ({
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
  }));

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
