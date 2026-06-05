export const BillingQueryKeys = {
  all: ["billing"] as const,
  plans: (scope?: string | null) =>
    [...BillingQueryKeys.all, "plans", scope ?? "all"] as const,
  paymentMethods: () => [...BillingQueryKeys.all, "payment-methods"] as const,
  subscriptionSetup: (scope?: string | null) =>
    [...BillingQueryKeys.all, "subscription-setup", scope ?? "all"] as const,
  currentSubscription: () =>
    [...BillingQueryKeys.all, "subscription", "current"] as const,
};
