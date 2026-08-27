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
		numberOfUsers?: string;
	};
	ctaLabel: string;
	ctaHref: string;
	features: PricingFeature[];
	highlighted?: boolean;
	trialDays?: number;
	trialPrice?: string;
};

export const PricingPlans: PricingPlan[] = [
	{
		code: "ACCOUNTING",
		name: "Accounting",
		description: "Essential bookkeeping and financial tools for growing teams.",
		monthlyPrice: "PHP 399.00",
		yearlyPrice: "PHP 3,999.00",
		monthlyCompareAtPrice: "PHP 499.00",
		yearlyCompareAtPrice: "PHP 4,788.00",
		billingLabel: {
			monthly: "Per company/month",
			yearly: "Per company/year",
			numberOfUsers: "1 user included",
		},
		ctaLabel: "Get started",
		ctaHref: "/signup",
		features: [
			{ label: "Accounting modules" },
			{ label: "1 included user" },
			{ label: "Additional users at PHP 100/user/month" },
			{ label: "Branch and satellite add-ons" },
		],
	},
	{
		code: "ACCOUNTING_INVENTORY",
		name: "Accounting & Inventory",
		description: "Keep your books and stock movement in one connected workspace.",
		monthlyPrice: "PHP 499.00",
		yearlyPrice: "PHP 4,999.00",
		monthlyCompareAtPrice: "PHP 599.00",
		yearlyCompareAtPrice: "PHP 5,988.00",
		billingLabel: {
			monthly: "Per company/month",
			yearly: "Per company/year",
			numberOfUsers: "1 user included",
		},
		ctaLabel: "Get started",
		ctaHref: "/signup",
		features: [
			{ label: "Accounting and inventory modules" },
			{ label: "1 included user" },
			{ label: "Additional users at PHP 100/user/month" },
			{ label: "Branch and satellite add-ons" },
		],
		highlighted: true,
	},
	{
		code: "ADDITIONAL_COMPANY",
		name: "Additional Company",
		description: "Bring another business entity into your existing workspace.",
		monthlyPrice: "PHP 100.00",
		yearlyPrice: "PHP 1,000.00",
		monthlyCompareAtPrice: "PHP 125.00",
		yearlyCompareAtPrice: "PHP 1,200.00",
		billingLabel: {
			monthly: "Per company/month",
			yearly: "Per company/year",
      numberOfUsers: "1 user included",
		},
		ctaLabel: "Get started",
		ctaHref: "/signup",
		features: [
			{ label: "Additional tenant company" },
			{ label: "Uses selected package rules" },
			{ label: "Company-level billing visibility" },
			{ label: "Admin-scoped access control" },
		],
	},
];

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

