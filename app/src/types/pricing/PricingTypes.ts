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
