import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SiteCard from "@/components/dashboard/SiteCard";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const site = await prisma.site.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { subscription: true },
  });

  if (!site) {
    redirect("/onboarding/start");
  }

  const subscription = site.subscription
    ? {
        plan: site.subscription.plan,
        status: site.subscription.status,
        trialEndsAt: site.subscription.trialEndsAt?.toISOString() || null,
      }
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">Manage your website</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
