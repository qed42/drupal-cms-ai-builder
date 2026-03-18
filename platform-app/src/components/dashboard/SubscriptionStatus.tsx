interface SubscriptionStatusProps {
  subscription: {
    plan: string;
    status: string;
    trialEndsAt: string | null;
  } | null;
}

export default function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Subscription</h3>
        <p className="text-white/50 text-sm">No subscription found.</p>
      </div>
    );
  }

  const planLabels: Record<string, string> = {
    trial: "Free Trial",
    basic: "Basic",
    pro: "Professional",
  };

  const daysRemaining = subscription.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.trialEndsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
      <h3 className="text-lg font-semibold text-white">Subscription</h3>

      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm">Plan</span>
        <span className="text-white font-medium text-sm">
          {planLabels[subscription.plan] || subscription.plan}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm">Status</span>
        <span
          className={`text-sm font-medium ${
            subscription.status === "active"
              ? "text-emerald-400"
              : "text-amber-400"
          }`}
        >
          {subscription.status === "active" ? "Active" : subscription.status}
        </span>
      </div>

      {daysRemaining !== null && subscription.plan === "trial" && (
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Trial ends in</span>
          <span
            className={`text-sm font-medium ${
              daysRemaining <= 3 ? "text-red-400" : "text-white"
            }`}
          >
            {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
          </span>
        </div>
      )}

      {subscription.plan === "trial" && (
        <button
          disabled
          className="w-full mt-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/50 cursor-not-allowed"
        >
          Upgrade Plan (Coming Soon)
        </button>
      )}
    </div>
  );
}
