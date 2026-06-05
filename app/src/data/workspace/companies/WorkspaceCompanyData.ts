import { GetCalendarYearReportDates } from "@/app/src/data/onboarding/OnboardingData";
import type {
	WorkspaceCompanyFormValues,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

const DefaultWorkspaceCompanyReportYear = GetCalendarYearReportDates();

export const InitialWorkspaceCompanyFormValues: WorkspaceCompanyFormValues = {
	address: "",
	billingAddress: "",
	billingCardNumber: "",
	billingCardholderName: "",
	billingCvc: "",
	billingEmail: "",
	billingExpiryMonth: "",
	billingExpiryYear: "",
	billingPaymentMethodId: "setup-later",
	billingPlanCode: "",
	billingCycle: "MONTHLY",
	companyName: "",
	contactNumber: "",
	email: "",
	firstName: "",
	lastName: "",
	logoFile: null,
	logoName: "",
	logoUrl: "",
	middleName: "",
	nonIndividualType: "Corporation",
	nonIndividualTypeOther: "",
	plan: "Accounting + Inventory",
	reportEndDate: DefaultWorkspaceCompanyReportYear.reportEndDate,
	reportStartDate: DefaultWorkspaceCompanyReportYear.reportStartDate,
	status: "Active",
	taxpayerType: "non-individual",
	tin: "",
	website: "",
};

export const InitialWorkspaceCompanyUserFormValues: WorkspaceCompanyUserFormValues =
	{
		companyAssignments: [],
		contactNumber: "",
		email: "",
		name: "",
	};

export function createWorkspaceCompanyFormValues(
	company: WorkspaceCompanyRecord,
): WorkspaceCompanyFormValues {
	const taxpayerType = company.taxpayerType ?? "non-individual";

	return {
		address: company.address,
		billingAddress: "",
		billingCardNumber: "",
		billingCardholderName: "",
		billingCvc: "",
		billingEmail: company.email,
		billingExpiryMonth: "",
		billingExpiryYear: "",
		billingPaymentMethodId: company.billingPaymentMethodId ?? "setup-later",
		billingPlanCode: "",
		billingCycle: "MONTHLY",
		companyName: taxpayerType === "non-individual" ? company.name : "",
		contactNumber: company.contactNumber,
		email: company.email,
		firstName: company.firstName ?? "",
		lastName: company.lastName ?? "",
		logoFile: null,
		logoName: company.logoUrl ? "Current logo" : "",
		logoUrl: company.logoUrl ?? "",
		middleName: company.middleName ?? "",
		nonIndividualType: company.nonIndividualType ?? company.companyType,
		nonIndividualTypeOther: company.nonIndividualTypeOther ?? "",
		plan: company.plan,
		reportEndDate:
			company.reportEndDate ?? DefaultWorkspaceCompanyReportYear.reportEndDate,
		reportStartDate:
			company.reportStartDate ??
			DefaultWorkspaceCompanyReportYear.reportStartDate,
		status: company.status,
		taxpayerType,
		tin: company.tin ?? "",
		website: company.website ?? "",
	};
}

export function getNextWorkspaceCompanyStatus(
	status: WorkspaceCompanyStatus,
): WorkspaceCompanyStatus {
	return status === "Inactive" ? "Active" : "Inactive";
}
