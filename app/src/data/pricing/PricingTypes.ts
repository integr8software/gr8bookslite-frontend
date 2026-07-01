export type BillingCycle = "monthly" | "yearly";

export type PricingFeature = {
  label: string;
};

export type PricingPlan = {
  code: string;
  name: string;
  description?: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyCompareAtPrice?: string;
  yearlyCompareAtPrice?: string;
  billingLabel: {
    monthly: string;
    yearly: string;
  };
  ctaLabel: string;
  ctaHref: string;
  features: PricingFeature[];
  highlighted?: boolean;
  trialDays?: number;
};

export const PricingHeader = {
  title: "Plans and Packages",
  description:
    "Choose the package that matches your company modules. Every plan includes one user, with additional users billed as add-ons.",
};

export const BillingOptions: { label: string; value: BillingCycle }[] = [
  {
    label: "Monthly",
    value: "monthly",
  },
  {
    label: "Yearly",
    value: "yearly",
  },
];
