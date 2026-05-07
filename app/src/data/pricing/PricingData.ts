export type BillingCycle = "monthly" | "yearly";

export type PricingFeature = {
  label: string;
};

export type PricingPlan = {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
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
    monthlyPrice: "P 399.00",
    yearlyPrice: "P 3,990.00",
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
    monthlyPrice: "P 499.00",
    yearlyPrice: "P 4,990.00",
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
    monthlyPrice: "P100.00",
    yearlyPrice: "P1,000.00",
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
