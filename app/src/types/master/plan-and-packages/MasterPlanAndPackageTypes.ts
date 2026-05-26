export type MasterPlanAndPackageStatus = "Active" | "Draft" | "Inactive";

export type MasterPlanAndPackagePricingKind =
	| "Monthly"
	| "Interval"
	| "Yearly"
	| "Transactional"
	| "Percent Off";

export type MasterPlanAndPackageScaleUnit = "company" | "branch" | "user";

export type MasterPlanAndPackageScaleKind = "Range" | "Add-on" | "Reduction";

export type MasterPlanAndPackageTransactionReset =
	| "Daily"
	| "Monthly"
	| "Yearly"
	| "When Consumed";

export type MasterPlanAndPackageReductionTier = {
	reductionPercent: number;
	thresholdCount: number;
};

export type MasterPlanAndPackagePricing =
	| {
			amount: number;
			kind: "Monthly";
	  }
	| {
			amount: number;
			intervalMonths: number;
			kind: "Interval";
	  }
	| {
			amount: number;
			kind: "Yearly";
	  }
	| {
			amount: number;
			kind: "Transactional";
			reset: MasterPlanAndPackageTransactionReset;
			transactionLimit: number;
	  }
	| {
			appliesFrom: number;
			appliesTo: number;
			baseAmount: number;
			kind: "Percent Off";
			percentOff: number;
	  };

export type MasterPlanAndPackageScaleRule =
	| {
			kind: "Range";
			maxCount: number;
			minCount: number;
	  }
	| {
			addOnPrice: number;
			includedFreeCount: number;
			kind: "Add-on";
	  }
	| {
			kind: "Reduction";
			tiers: MasterPlanAndPackageReductionTier[];
	  };

export type MasterPlanAndPackageScalePricing = Record<
	MasterPlanAndPackageScaleUnit,
	MasterPlanAndPackageScaleRule
>;

export type MasterPlanAndPackageFeatureOption = {
	description: string;
	id: string;
	name: string;
	section: string;
};

export type MasterPlanAndPackageRecord = {
	description: string;
	featureIds: string[];
	id: string;
	name: string;
	pricing: MasterPlanAndPackagePricing;
	scalePricing: MasterPlanAndPackageScalePricing;
	status: MasterPlanAndPackageStatus;
};

export type MasterPlanAndPackageFormValues = {
	amount: number;
	baseAmount: number;
	branchAddOnPrice: number;
	branchIncludedFree: number;
	branchLimitKind: MasterPlanAndPackageScaleKind;
	branchMax: number;
	branchMin: number;
	branchReductionTiers: MasterPlanAndPackageReductionTier[];
	companyAddOnPrice: number;
	companyIncludedFree: number;
	companyLimitKind: MasterPlanAndPackageScaleKind;
	companyMax: number;
	companyMin: number;
	companyReductionTiers: MasterPlanAndPackageReductionTier[];
	description: string;
	discountAppliesFrom: number;
	discountAppliesTo: number;
	featureIds: string[];
	id?: string;
	intervalMonths: number;
	name: string;
	percentOff: number;
	pricingKind: MasterPlanAndPackagePricingKind;
	status: MasterPlanAndPackageStatus;
	transactionLimit: number;
	transactionReset: MasterPlanAndPackageTransactionReset;
	userAddOnPrice: number;
	userIncludedFree: number;
	userLimitKind: MasterPlanAndPackageScaleKind;
	userMax: number;
	userMin: number;
	userReductionTiers: MasterPlanAndPackageReductionTier[];
};

export type MasterPlanAndPackageFormErrors = Partial<
	Record<keyof MasterPlanAndPackageFormValues, string>
>;

export type MasterPlanAndPackageTableColumnKey =
	| "name"
	| "status"
	| "pricing"
	| "scalePricing";
