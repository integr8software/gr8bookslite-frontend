import { ApiClient } from "@/app/src/services/shared/ApiClient";
import type {
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyType,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import type { WorkspaceCompanyApiRecord } from "./WorkspaceCompanyApiTypes";

function GetAuthorizationHeaders(accessToken: string) {
	return {
		Authorization: `Bearer ${accessToken}`,
	};
}

export async function GetWorkspaceCompanies(accessToken: string) {
	const response = await ApiClient.get<WorkspaceCompanyApiRecord[]>(
		"/workspace/companies",
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return response.data.map(MapWorkspaceCompanyApiRecord);
}

function MapWorkspaceCompanyApiRecord(
	company: WorkspaceCompanyApiRecord,
): WorkspaceCompanyRecord {
	return {
		address: company.address ?? "",
		companyType: GetWorkspaceCompanyType(company),
		contactNumber: company.contactNumber ?? "",
		createdAt: FormatDate(company.createdAt),
		email: company.email ?? "",
		firstName: company.ownerFirstName ?? undefined,
		id: String(company.id),
		initials: GetInitials(company.name),
		lastName: company.ownerLastName ?? undefined,
		logoUrl: company.logoPublicUrl ?? undefined,
		middleName: company.ownerMiddleName ?? undefined,
		name: company.name,
		nonIndividualType: company.organizationType ?? undefined,
		nonIndividualTypeOther: company.organizationTypeOther ?? undefined,
		plan: "Accounting + Inventory",
		primaryContact: GetPrimaryContact(company),
		reportEndDate: GetDateInputValue(company.reportEndDate),
		reportStartDate: GetDateInputValue(company.reportStartDate),
		status: GetWorkspaceCompanyStatus(company),
		taxpayerType:
			company.taxpayerType === "INDIVIDUAL" ? "individual" : "non-individual",
		tin: company.tin ?? undefined,
		totalBranches: company.totalUnits ?? 0,
		totalUsers: company.totalUsers ?? 0,
		website: company.website ?? undefined,
	};
}

function GetWorkspaceCompanyStatus(
	company: WorkspaceCompanyApiRecord,
): WorkspaceCompanyStatus {
	if (!company.isActive || company.status === "SUSPENDED") {
		return "Inactive";
	}

	if (company.status === "ACTIVE") {
		return "Active";
	}

	return "Pending";
}

function GetWorkspaceCompanyType(
	company: WorkspaceCompanyApiRecord,
): WorkspaceCompanyType {
	if (company.taxpayerType === "INDIVIDUAL") {
		return "Individual";
	}

	const type = company.organizationType;

	if (
		type === "Corporation" ||
		type === "Partnership" ||
		type === "Association" ||
		type === "Non Stock" ||
		type === "Non Profit Organization" ||
		type === "Others"
	) {
		return type;
	}

	return "Corporation";
}

function GetPrimaryContact(company: WorkspaceCompanyApiRecord) {
	if (company.taxpayerType === "INDIVIDUAL") {
		return [company.ownerFirstName, company.ownerMiddleName, company.ownerLastName]
			.filter(Boolean)
			.join(" ");
	}

	return company.name;
}

function GetInitials(value: string) {
	const initials = value
		.split(/\s+/)
		.map((part) => part[0])
		.filter(Boolean)
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return initials || "CO";
}

function FormatDate(value: string) {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

function GetDateInputValue(value: string | null) {
	if (!value) {
		return undefined;
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return date.toISOString().slice(0, 10);
}
