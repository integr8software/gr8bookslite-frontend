export type MasterPlanAndPackageStatus = "Active" | "Draft" | "Inactive";

export type MasterPlanAndPackagePricingKind =
	| "Monthly"
	| "Interval"
	| "Yearly"
	| "Transactional"
	| "Percent Off";

export type MasterPlanAndPackageScaleUnit = "company" | "branch" | "user";

export type MasterPlanAndPackageScaleKind = "Fixed" | "Range" | "Add-on";

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
			includedCount: number;
			kind: "Fixed";
	  }
	| {
			kind: "Range";
			maxCount: number;
			minCount: number;
	  }
	| {
			addOnPrice: number;
			addOnStart: number;
			includedFreeCount: number;
			kind: "Add-on";
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
	branchAddOnStart: number;
	branchIncludedFree: number;
	branchLimitKind: MasterPlanAndPackageScaleKind;
	branchMax: number;
	branchMin: number;
	companyAddOnPrice: number;
	companyAddOnStart: number;
	companyIncludedFree: number;
	companyLimitKind: MasterPlanAndPackageScaleKind;
	companyMax: number;
	companyMin: number;
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
	userAddOnPrice: number;
	userAddOnStart: number;
	userIncludedFree: number;
	userLimitKind: MasterPlanAndPackageScaleKind;
	userMax: number;
	userMin: number;
};

export type MasterPlanAndPackageFormErrors = Partial<
	Record<keyof MasterPlanAndPackageFormValues, string>
>;

export type MasterPlanAndPackageTableColumnKey =
	| "name"
	| "status"
	| "pricing"
	| "scalePricing";
