export type MasterAddOnStatus = "Active" | "Inactive";

export type MasterAddOnPricing = {
	monthlyPrice: number;
	yearlyPrice: number;
};

export type MasterAddOnRecord = {
	id: string;
	code: string;
	name: string;
	description: string;
	status: MasterAddOnStatus;
	featureIds: string[];
	pricing: MasterAddOnPricing;
	createdAt: string;
	updatedAt: string;
};

export type MasterAddOnFormValues = {
	id?: string;
	code?: string;
	name: string;
	description: string;
	status: MasterAddOnStatus;
	featureIds: string[];
	monthlyPrice: number;
	yearlyPrice: number;
};


export type MasterAddOnFormErrors = Partial<
	Record<keyof MasterAddOnFormValues, string>
>;

export type MasterAddOnTableColumnKey =
	| "name"
	| "status"
	| "pricing"
	| "modules";
