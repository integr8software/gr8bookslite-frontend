export type WorkspaceCompanyApiStatus =
	| "ACTIVE"
	| "FAILED"
	| "PENDING"
	| "PROVISIONING"
	| "SUSPENDED";

export type WorkspaceCompanyApiTaxpayerType =
	| "INDIVIDUAL"
	| "NON_INDIVIDUAL"
	| null;

export type WorkspaceCompanyApiRecord = {
	id: number;
	name: string;
	slug: string;
	legalName: string | null;
	companyCode: string | null;
	taxpayerType: WorkspaceCompanyApiTaxpayerType;
	ownerLastName: string | null;
	ownerFirstName: string | null;
	ownerMiddleName: string | null;
	organizationType: string | null;
	organizationTypeOther: string | null;
	logoFileName: string | null;
	logoMimeType: string | null;
	logoStoragePath: string | null;
	logoPublicUrl: string | null;
	address: string | null;
	tin: string | null;
	email: string | null;
	website: string | null;
	contactNumber: string | null;
	reportStartDate: string | null;
	reportEndDate: string | null;
	createdByUserId: number | null;
	createdByUser: {
		id: number;
		name: string;
		email: string;
	} | null;
	isActive: boolean;
	status: WorkspaceCompanyApiStatus;
	subscriptionPlan: {
		code: string;
		name: string;
		currency: string;
		billingCycle: "MONTHLY" | "YEARLY";
		monthlyPriceInCents: number;
		yearlyPriceInCents: number;
	} | null;
	totalUsers?: number;
	totalUnits?: number;
	createdAt: string;
	updatedAt: string;
};

export type CreateWorkspaceCompanyBillingApiRequest = {
	planCode?: string;
	billingCycle?: "MONTHLY" | "YEARLY";
	billingEmail?: string;
	paymentMethodId?: string;
	cardBrand?: string;
	cardLast4?: string;
	cardExpiryMonth?: number;
	cardExpiryYear?: number;
};

export type CreateWorkspaceCompanyApiRequest = {
	taxpayerType: "individual" | "non-individual";
	lastName?: string;
	firstName?: string;
	middleName?: string;
	companyName?: string;
	nonIndividualType?: string;
	nonIndividualTypeOther?: string;
	logoFileName?: string;
	logoMimeType?: string;
	logoStoragePath?: string;
	logoPublicUrl?: string;
	address: string;
	tin: string;
	email: string;
	contactNumber: string;
	reportStartDate: string;
	reportEndDate: string;
	website?: string;
	billing?: CreateWorkspaceCompanyBillingApiRequest;
};
