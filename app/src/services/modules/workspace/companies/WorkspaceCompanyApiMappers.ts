import type {
	WorkspaceCompanyFormValues,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyType,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import type {
	CreateWorkspaceCompanyApiRequest,
	WorkspaceCompanyApiRecord,
} from "./WorkspaceCompanyApiTypes";

export function MapWorkspaceCompanyApiRecord(
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
		plan: GetWorkspaceCompanyPlan(company),
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

export function MapWorkspaceCompanyFormToCreateRequest(
	values: WorkspaceCompanyFormValues,
): CreateWorkspaceCompanyApiRequest {
	const trimmedValues = TrimCompanyFormValues(values);
	const request: CreateWorkspaceCompanyApiRequest = {
		address: trimmedValues.address,
		contactNumber: trimmedValues.contactNumber,
		email: trimmedValues.email.toLowerCase(),
		reportEndDate: trimmedValues.reportEndDate,
		reportStartDate: trimmedValues.reportStartDate,
		taxpayerType: trimmedValues.taxpayerType,
		tin: trimmedValues.tin,
		website: trimmedValues.website || undefined,
	};

	if (trimmedValues.taxpayerType === "individual") {
		request.firstName = trimmedValues.firstName;
		request.lastName = trimmedValues.lastName;
		request.middleName = trimmedValues.middleName || undefined;
	} else {
		request.companyName = trimmedValues.companyName;
		request.nonIndividualType = trimmedValues.nonIndividualType;
		request.nonIndividualTypeOther =
			trimmedValues.nonIndividualType === "Others"
				? trimmedValues.nonIndividualTypeOther
				: undefined;
	}

	if (trimmedValues.logoName && trimmedValues.logoName !== "Current logo") {
		request.logoFileName = trimmedValues.logoName;
		request.logoMimeType = values.logoFile?.type || undefined;
	}

	const billingEmail = trimmedValues.billingEmail || trimmedValues.email;
	const paymentMethodId = trimmedValues.billingPaymentMethodId;

	request.billing = {
		billingCycle: trimmedValues.billingCycle,
		billingEmail,
		planCode: trimmedValues.billingPlanCode || undefined,
		paymentMethodId: paymentMethodId.startsWith("pm_")
			? paymentMethodId
			: undefined,
	};

	return request;
}

function GetWorkspaceCompanyPlan(company: WorkspaceCompanyApiRecord) {
	return company.subscriptionPlan?.name ?? "Unassigned";
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
		return [
			company.ownerFirstName,
			company.ownerMiddleName,
			company.ownerLastName,
		]
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

function TrimCompanyFormValues(values: WorkspaceCompanyFormValues) {
	return {
		address: values.address.trim(),
		billingEmail: values.billingEmail.trim(),
		billingPaymentMethodId: values.billingPaymentMethodId.trim(),
		billingPlanCode: values.billingPlanCode.trim(),
		billingCycle: values.billingCycle,
		companyName: values.companyName.trim(),
		contactNumber: values.contactNumber.trim(),
		email: values.email.trim(),
		firstName: values.firstName.trim(),
		lastName: values.lastName.trim(),
		logoName: values.logoName.trim(),
		middleName: values.middleName.trim(),
		nonIndividualType: values.nonIndividualType.trim(),
		nonIndividualTypeOther: values.nonIndividualTypeOther.trim(),
		reportEndDate: values.reportEndDate.trim(),
		reportStartDate: values.reportStartDate.trim(),
		taxpayerType: values.taxpayerType,
		tin: values.tin.trim(),
		website: values.website.trim(),
	};
}
