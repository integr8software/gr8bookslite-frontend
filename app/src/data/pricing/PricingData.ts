export type BillingCycle = "monthly" | "yearly";

export type PricingFeature = {
  label: string;
};

export type PricingPlan = {
  name: string;
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
};

export const PricingHeader = {
  title: "Our Pricing Plans",
  description:
    "Explore the right plan tailored to match your specific requirements and ambitions.",
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

export const PricingPlans: PricingPlan[] = [
  {
    name: "Accounting",
    monthlyPrice: "₱ 399.00",
    yearlyPrice: "₱ 3,990.00",
    monthlyCompareAtPrice: "₱ 499.00",
    yearlyCompareAtPrice: "₱ 4,788.00",
    billingLabel: {
      monthly: "Per month/user",
      yearly: "Per year/user",
    },
    ctaLabel: "Get started",
    ctaHref: "/signup",
    features: [
      { label: "Increased Usage Limits" },
      { label: "Priority Support" },
      { label: "Multi-User Support" },
      { label: "Increased Storage" },
    ],
  },
  {
    name: "Accounting & Inventory",
    monthlyPrice: "₱ 499.00",
    yearlyPrice: "₱ 4,990.00",
    monthlyCompareAtPrice: "₱ 599.00",
    yearlyCompareAtPrice: "₱ 5,988.00",
    billingLabel: {
      monthly: "Per month/user",
      yearly: "Per year/user",
    },
    ctaLabel: "Get started",
    ctaHref: "/signup",
    features: [
      { label: "Increased Usage Limits" },
      { label: "Priority Support" },
      { label: "Multi-User Support" },
      { label: "Increased Storage" },
    ],
    highlighted: true,
  },
  {
    name: "Additional Company",
    monthlyPrice: "₱ 100.00",
    yearlyPrice: "₱ 1,000.00",
    monthlyCompareAtPrice: "₱ 125.00",
    yearlyCompareAtPrice: "₱ 1,200.00",
    billingLabel: {
      monthly: "Per company/month",
      yearly: "Per company/year",
    },
    ctaLabel: "Get started",
    ctaHref: "/signup",
    features: [
      { label: "Increased Usage Limits" },
      { label: "Priority Support" },
      { label: "Multi-User Support" },
      { label: "Increased Storage" },
    ],
  },
];
