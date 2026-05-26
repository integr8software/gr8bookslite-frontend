export type MasterPlanAndPackageStatus = "Active" | "Draft" | "Inactive";

export type MasterPlanAndPackageScalePeriod = "monthly" | "yearly";

export type MasterPlanAndPackageScaleUnit = "branch" | "user";

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

export type MasterPlanAndPackageScalePricing = Record<
	MasterPlanAndPackageScalePeriod,
	MasterPlanAndPackageScaleRules
>;

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
	status: MasterPlanAndPackageStatus;
	trialDays: number;
};

export type MasterPlanAndPackageFormValues = {
	code: string;
	description: string;
	featureIds: string[];
	id?: string;
	monthlyBasePrice: number;
	monthlyBranchAddOnPrice: number;
	monthlyBranchIncludedFree: number;
	monthlyBranchReductionTiers: MasterPlanAndPackageReductionTier[];
	monthlyPercentOff: number;
	monthlyUserAddOnPrice: number;
	monthlyUserIncludedFree: number;
	monthlyUserReductionTiers: MasterPlanAndPackageReductionTier[];
	name: string;
	status: MasterPlanAndPackageStatus;
	trialDays: number;
	yearlyBasePrice: number;
	yearlyBranchAddOnPrice: number;
	yearlyBranchIncludedFree: number;
	yearlyBranchReductionTiers: MasterPlanAndPackageReductionTier[];
	yearlyPercentOff: number;
	yearlyUserAddOnPrice: number;
	yearlyUserIncludedFree: number;
	yearlyUserReductionTiers: MasterPlanAndPackageReductionTier[];
};

export type MasterPlanAndPackageFormErrors = Partial<
	Record<keyof MasterPlanAndPackageFormValues, string>
>;

export type MasterPlanAndPackageTableColumnKey =
	| "name"
	| "status"
	| "pricing"
	| "scalePricing";
