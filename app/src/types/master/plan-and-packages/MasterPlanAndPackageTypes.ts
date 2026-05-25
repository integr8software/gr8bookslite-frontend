export type MasterPlanAndPackageStatus = "Active" | "Draft" | "Inactive";

export type MasterPlanAndPackagePricingKind =
	| "Monthly"
	| "Interval"
	| "Yearly"
	| "Transactional"
	| "Percent Off";

export type MasterPlanAndPackageUserLimitKind =
	| "Fixed"
	| "Range"
	| "Add-on";

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
			unitLabel: string;
	  }
	| {
			baseAmount: number;
			billingLabel: string;
			kind: "Percent Off";
			percentOff: number;
	  };

export type MasterPlanAndPackageUserLimit =
	| {
			includedUsers: number;
			kind: "Fixed";
	  }
	| {
			kind: "Range";
			maxUsers: number;
			minUsers: number;
	  }
	| {
			addOnPrice: number;
			addOnStart: number;
			includedFreeUsers: number;
			kind: "Add-on";
	  };

export type MasterPlanAndPackageRecord = {
	code: string;
	description: string;
	features: string[];
	id: string;
	name: string;
	pricing: MasterPlanAndPackagePricing;
	status: MasterPlanAndPackageStatus;
	userLimit: MasterPlanAndPackageUserLimit;
};

export type MasterPlanAndPackageFormValues = {
	amount: number;
	baseAmount: number;
	billingLabel: string;
	code: string;
	description: string;
	features: string;
	id?: string;
	intervalMonths: number;
	name: string;
	percentOff: number;
	pricingKind: MasterPlanAndPackagePricingKind;
	status: MasterPlanAndPackageStatus;
	unitLabel: string;
	userAddOnPrice: number;
	userAddOnStart: number;
	userIncludedFree: number;
	userLimitKind: MasterPlanAndPackageUserLimitKind;
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
	| "users";
