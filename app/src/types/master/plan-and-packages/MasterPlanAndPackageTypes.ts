export type MasterPlanAndPackageStatus = "Active" | "Draft" | "Inactive";

export type MasterPlanAndPackageScalePeriod = "monthly" | "yearly";

export type MasterPlanAndPackageScaleUnit = "branch" | "user";

export type MasterPlanAndPackageScope = "ALL" | "ONBOARDING" | "ADDITIONAL_COMPANY";

export type MasterPlanAndPackageReductionTier = {
	reductionPercent: number;
	thresholdCount: number;
};

export type MasterPlanAndPackagePricing = {
	monthlyBasePrice: number;
	monthlyPercentOff: number;
	yearlyBasePrice: number;
	yearlyPercentOff: number;
};

export type MasterPlanAndPackageScaleRule = {
	addOnPrice: number;
	includedFreeCount: number;
	reductionTiers: MasterPlanAndPackageReductionTier[];
};

export type MasterPlanAndPackageScaleRules = Record<
	MasterPlanAndPackageScaleUnit,
	MasterPlanAndPackageScaleRule
>;

export type MasterPlanAndPackageScalePricing = MasterPlanAndPackageScaleRules;

export type MasterPlanAndPackageFeatureOption = {
	description: string;
	id: string;
	name: string;
	section: string;
};

export type MasterPlanAndPackageRecord = {
	code: string;
	description: string;
	featureIds: string[];
	id: string;
	name: string;
	pricing: MasterPlanAndPackagePricing;
	scalePricing: MasterPlanAndPackageScalePricing;
	scope: MasterPlanAndPackageScope;
	status: MasterPlanAndPackageStatus;
	trialDays: number;
	trialPrice: number;
};

export type MasterPlanAndPackageFormValues = {
	code?: string;
	description: string;
	featureIds: string[];
	id?: string;
	branchAddOnPrice?: number;
	branchIncludedFree?: number;
	branchReductionTiers?: MasterPlanAndPackageReductionTier[];
	hasTrial?: boolean;
	monthlyBasePrice: number;
	monthlyPercentOff: number;
	name: string;
	scope: MasterPlanAndPackageScope;
	scopes: MasterPlanAndPackageScope[];
	status: MasterPlanAndPackageStatus;
	trialDays: number;
	trialPrice: number;
	userAddOnPrice?: number;
	userIncludedFree?: number;
	userReductionTiers?: MasterPlanAndPackageReductionTier[];
	yearlyBasePrice: number;
	yearlyPercentOff: number;
};

export type MasterPlanAndPackageFormErrors = Partial<
	Record<keyof MasterPlanAndPackageFormValues, string>
>;

export type MasterPlanAndPackageTableColumnKey =
	| "name"
	| "status"
	| "pricing";

export type MasterPlanAndPackageDetailsPageProps = {
	recordId: string;
};

export type MasterPlanAndPackageFormPageProps = {
	mode: "add" | "edit";
	recordId?: string;
};

export type MasterPlanAndPackageTableRowProps = {
	row: import("@tanstack/react-table").Row<MasterPlanAndPackageRecord>;
	onToggleStatus: (recordId: string) => void;
};

export type ScaleRuleValues = {
	addOnPrice: number;
	includedFree: number;
	reductionTiers: MasterPlanAndPackageReductionTier[];
};

export type ScaleRuleSectionProps = ScaleRuleValues & {
	errors: Partial<Record<keyof ScaleRuleValues, string>>;
	icon: import("lucide-react").LucideIcon;
	unitLabel: string;
	onUpdate: (values: ScaleRuleValues) => void;
};

export type NumberFieldConfig = {
	error?: string;
	value: number;
	onChange: (value: number) => void;
};

// API and backend mapping models
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
	trialPriceInCents?: number;
	updatedAt: string;
	usageRules: MasterPlanAndPackageApiUsageRule[];
};

import type { CreateMasterPlanAndPackageDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

export type { CreateMasterPlanAndPackageDto };

export type MasterPlanAndPackagesData = {
	plans: MasterPlanAndPackageApiRecord[];
};

export type MasterPlanAndPackageCreateResult = {
	message: string;
	plan: MasterPlanAndPackageApiRecord;
};

export type MasterPlanAndPackagesListModel = {
	plans: MasterPlanAndPackageRecord[];
};

export type MasterPlanAndPackageCreateModel = {
	formValues: MasterPlanAndPackageFormValues;
};

