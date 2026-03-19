import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SiteCard from "@/components/dashboard/SiteCard";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";
import AddNewSiteButton from "@/components/dashboard/AddNewSiteButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { subscription: true },
  });

  // If no sites at all (shouldn't happen post-registration), redirect to onboarding
  if (sites.length === 0) {
    redirect("/onboarding/start");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 mt-1">Manage your websites</p>
        </div>
        <AddNewSiteButton />
      </div>

      <div className="space-y-6">
        {sites.map((site) => {
          const subscription = site.subscription
            ? {
                plan: site.subscription.plan,
                status: site.subscription.status,
                trialEndsAt:
                  site.subscription.trialEndsAt?.toISOString() || null,
              }
            : null;

          return (
            <div
              key={site.id}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2">
                <SiteCard
                  site={{
                    id: site.id,
                    name: site.name,
                    status: site.status,
                    subdomain: site.subdomain,
                    drupalUrl: site.drupalUrl,
                  }}
                />
              </div>
              <div>
                <SubscriptionStatus subscription={subscription} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
