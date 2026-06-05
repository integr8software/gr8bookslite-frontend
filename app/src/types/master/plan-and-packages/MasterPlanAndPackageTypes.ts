export type MasterPlanAndPackageStatus = "Active" | "Draft" | "Inactive";

export type MasterPlanAndPackageScalePeriod = "monthly" | "yearly";

export type MasterPlanAndPackageScaleUnit = "branch" | "user";

export type MasterPlanAndPackageScope = "ONBOARDING" | "ADDITIONAL_COMPANY";

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
};

export type MasterPlanAndPackageFormValues = {
	code: string;
	description: string;
	featureIds: string[];
	id?: string;
	branchAddOnPrice: number;
	branchIncludedFree: number;
	branchReductionTiers: MasterPlanAndPackageReductionTier[];
	monthlyBasePrice: number;
	monthlyPercentOff: number;
	name: string;
	scope: MasterPlanAndPackageScope;
	status: MasterPlanAndPackageStatus;
	trialDays: number;
	userAddOnPrice: number;
	userIncludedFree: number;
	userReductionTiers: MasterPlanAndPackageReductionTier[];
	yearlyBasePrice: number;
	yearlyPercentOff: number;
};

export type MasterPlanAndPackageFormErrors = Partial<
	Record<keyof MasterPlanAndPackageFormValues, string>
>;

export type MasterPlanAndPackageTableColumnKey =
	| "name"
	| "status"
	| "pricing"
	| "scalePricing";
