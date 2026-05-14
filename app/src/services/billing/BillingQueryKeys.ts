export const BillingQueryKeys = {
  all: ["billing"] as const,
  plans: () => [...BillingQueryKeys.all, "plans"] as const,
  currentSubscription: () =>
    [...BillingQueryKeys.all, "subscription", "current"] as const,
};
