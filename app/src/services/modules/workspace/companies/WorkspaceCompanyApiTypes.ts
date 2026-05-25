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
	isActive: boolean;
	status: WorkspaceCompanyApiStatus;
	totalUsers?: number;
	totalUnits?: number;
	createdAt: string;
	updatedAt: string;
};
