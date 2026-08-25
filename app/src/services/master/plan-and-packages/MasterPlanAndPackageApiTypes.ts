import type {
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageRecord,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

export type MasterPlanAndPackageApiStatus = "ACTIVE" | "DRAFT" | "INACTIVE";

export type MasterPlanAndPackageApiScope =
	| "ALL"
	| "ONBOARDING"
	| "ADDITIONAL_COMPANY";

export type MasterPlanAndPackageApiBillingCycle =
	| "MONTHLY"
	| "QUARTERLY"
	| "YEARLY";

export type MasterPlanAndPackageApiIntervalUnit = "DAY" | "MONTH" | "YEAR";

export type MasterPlanAndPackageApiMetric =
	| "COMPANY"
	| "BRANCH"
	| "SATELLITE"
	| "USER";

export type MasterPlanAndPackageApiPrice = {
	billingCycle: MasterPlanAndPackageApiBillingCycle;
	compareAtInCents: number | null;
	intervalCount: number;
	intervalUnit: MasterPlanAndPackageApiIntervalUnit;
	priceInCents: number;
};

export type MasterPlanAndPackageApiUsageRule = {
	freeCount: number;
	metric: MasterPlanAndPackageApiMetric;
	unitPriceInCents: number;
};

export type MasterPlanAndPackageApiDiscountTier = {
	discountPercent: number;
	metric: MasterPlanAndPackageApiMetric;
	thresholdCount: number;
};

export type MasterPlanAndPackageApiRecord = {
	code: string;
	createdAt: string;
	currency: string;
	description: string;
	discountTiers: MasterPlanAndPackageApiDiscountTier[];
	id: number;
	isActive: boolean;
	moduleKeys: string[];
	modules: {
		id: number;
		isEnabled: boolean;
		moduleKey: string;
	}[];
	systemCodes: string[];
	systems: {
		code: string;
		description: string;
		id: number;
		isEnabled: boolean;
		moduleCount: number;
		name: string;
	}[];
	name: string;
	prices: MasterPlanAndPackageApiPrice[];
	pricing: {
		monthlyBasePriceInCents: number;
		monthlyCompareAtInCents: number | null;
		yearlyBasePriceInCents: number;
		yearlyCompareAtInCents: number | null;
	};
	scope: MasterPlanAndPackageApiScope;
	status: MasterPlanAndPackageApiStatus;
	trialDays: number;
	updatedAt: string;
	usageRules: MasterPlanAndPackageApiUsageRule[];
};

export type MasterPlanAndPackagesResponse = {
	plans: MasterPlanAndPackageApiRecord[];
};

export type CreateMasterPlanAndPackageRequest = {
	code?: string | null;
	description: string | null;
	discountTiers: MasterPlanAndPackageApiDiscountTier[];
	systemCodes: string[];
	name: string;
	prices: MasterPlanAndPackageApiPrice[];
	scope?: MasterPlanAndPackageApiScope;
	scopes?: MasterPlanAndPackageApiScope[];
	status: MasterPlanAndPackageApiStatus;
	trialDays: number;
	usageRules: MasterPlanAndPackageApiUsageRule[];
};

export type CreateMasterPlanAndPackageResponse = {
	message: string;
	plan: MasterPlanAndPackageApiRecord;
};

export type MasterPlanAndPackagesListModel = {
	plans: MasterPlanAndPackageRecord[];
};

export type MasterPlanAndPackageCreateModel = {
	formValues: MasterPlanAndPackageFormValues;
};
