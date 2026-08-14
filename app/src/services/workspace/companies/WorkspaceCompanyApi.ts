import { ApiClient, ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import {
  workspaceCompaniesControllerCreateV1,
  workspaceCompaniesControllerDeactivateV1,
  workspaceCompaniesControllerFindAllV1,
  workspaceCompaniesControllerFindOneV1,
  workspaceCompaniesControllerGetManagementSummaryV1,
  workspaceCompaniesControllerUpdateV1,
} from "@/app/src/generated/api/workspace-companies/workspace-companies";
import type { WorkspaceCompanyResponseDto, WorkspaceCompanyUnitResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  WorkspaceCompanyApiRecord,
  WorkspaceCompanyBranchRecord,
  WorkspaceCompanyFormValues,
  WorkspaceCompanyRecord,
  WorkspaceCompanyStatus,
  WorkspaceCompanyType,
  WorkspaceCompanyUnitApiRecord,
  WorkspaceCompanyUserRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { MapWorkspaceUserApiRecord } from "@/app/src/services/workspace/users/WorkspaceUserApi";

type WorkspaceCompanyApiLike =
  (WorkspaceCompanyApiRecord | WorkspaceCompanyResponseDto) & {
    countryCode?: string;
    baseCurrencyCode?: string;
  };

type WorkspaceCompanyUnitApiLike = WorkspaceCompanyUnitApiRecord | WorkspaceCompanyUnitResponseDto;

const CompanyCreateTimeoutMs = 60000;
const CompanyLogoUploadTimeoutMs = 60000;

type CreateWorkspaceCompanyBillingApiPayload = {
  planCode?: string;
  billingCycle?: "MONTHLY" | "YEARLY";
  billingMode?: "MANUAL" | "AUTO";
  billingEmail?: string;
  paymentMethodId?: string;
  paymentAttemptId?: number;
  cardBrand?: string;
  cardLast4?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
};

type CreateWorkspaceCompanyApiPayload = {
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
  countryCode: string;
  baseCurrencyCode: string;
  tin: string;
  email: string;
  contactNumber: string;
  reportStartDate: string;
  reportEndDate: string;
  website?: string;
  billing?: CreateWorkspaceCompanyBillingApiPayload;
};

type UpdateWorkspaceCompanyApiPayload = Partial<
  Omit<CreateWorkspaceCompanyApiPayload, "billing">
>;

export async function GetWorkspaceCompanies() {
  const response = await workspaceCompaniesControllerFindAllV1();

  return response.map(MapWorkspaceCompanyApiRecord);
}

export async function GetWorkspaceCompanyManagementSummary(includeUsers = true): Promise<{
  companies: WorkspaceCompanyRecord[];
  users: WorkspaceCompanyUserRecord[];
}> {
  const response = await workspaceCompaniesControllerGetManagementSummaryV1({
    includeUsers: String(includeUsers),
  });

  return {
    companies: response.companies.map(MapWorkspaceCompanyApiRecord),
    users: response.users.map(MapWorkspaceUserApiRecord),
  };
}

export async function GetWorkspaceCompany(companyId: string) {
  const response = await workspaceCompaniesControllerFindOneV1(Number(companyId));

  return MapWorkspaceCompanyApiRecord(response);
}

export async function CreateWorkspaceCompany(
  values: WorkspaceCompanyFormValues,
  options: { paymentAttemptId?: string | number | null } = {},
): Promise<WorkspaceCompanyRecord> {
  const payload = MapWorkspaceCompanyFormToCreateRequest(values, options);
  let company: WorkspaceCompanyRecord;

  try {
    company = await CreateWorkspaceCompanyFromRequest(payload);
  } catch (error) {
    if (!IsRequestTimeout(error)) {
      throw error;
    }

    company = await RecoverCreatedCompanyAfterTimeout(payload);
  }

  if (!values.logoFile) {
    return company;
  }

  return UploadWorkspaceCompanyLogo(company.id, values.logoFile);
}

export async function UpdateWorkspaceCompany(companyId: string, values: WorkspaceCompanyFormValues): Promise<WorkspaceCompanyRecord> {
  const response = await workspaceCompaniesControllerUpdateV1(Number(companyId), MapWorkspaceCompanyFormToUpdateRequest(values));
  const company = MapWorkspaceCompanyApiRecord(response);

  if (!values.logoFile) {
    return company;
  }

  return UploadWorkspaceCompanyLogo(company.id, values.logoFile);
}

export async function DeactivateWorkspaceCompany(companyId: string): Promise<WorkspaceCompanyRecord> {
  const response = await workspaceCompaniesControllerDeactivateV1(Number(companyId));

  return MapWorkspaceCompanyApiRecord(response);
}

export async function CreateWorkspaceCompanyFromRequest(payload: CreateWorkspaceCompanyApiPayload): Promise<WorkspaceCompanyRecord> {
  const response = await workspaceCompaniesControllerCreateV1(payload, {
    timeout: CompanyCreateTimeoutMs,
  });

  return MapWorkspaceCompanyApiRecord(response);
}

export async function UploadWorkspaceCompanyLogo(companyId: string, file: File): Promise<WorkspaceCompanyRecord> {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await ApiClient.post<{
    message: string;
    company: WorkspaceCompanyApiRecord;
  }>(`/workspace/companies/${companyId}/logo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: CompanyLogoUploadTimeoutMs,
  });

  return MapWorkspaceCompanyApiRecord(response.data.company);
}

function MapWorkspaceCompanyApiRecord(company: WorkspaceCompanyApiLike): WorkspaceCompanyRecord {
  return {
    address: company.address ?? "",
    branches: company.units?.map(MapWorkspaceCompanyUnitApiRecord) ?? [],
    baseCurrencyCode: company.baseCurrencyCode ?? "PHP",
    companyType: GetWorkspaceCompanyType(company),
    contactNumber: company.contactNumber ?? "",
    countryCode: company.countryCode ?? "PH",
    createdByUser: company.createdByUser
      ? {
          email: company.createdByUser.email,
          id: String(company.createdByUser.id),
          name: company.createdByUser.name,
        }
      : undefined,
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
    taxpayerType: company.taxpayerType === "INDIVIDUAL" ? "individual" : "non-individual",
    tin: company.tin ?? undefined,
    totalBranches: company.totalUnits ?? 0,
    totalUsers: company.totalUsers ?? 0,
    website: company.website ?? undefined,
  };
}

function MapWorkspaceCompanyUnitApiRecord(unit: WorkspaceCompanyUnitApiLike): WorkspaceCompanyBranchRecord {
  return {
    address: unit.address ?? "",
    branchType: GetWorkspaceCompanyBranchType(unit.type),
    code: unit.code ?? "",
    companyId: String(unit.companyId),
    contactNumber: unit.contactNumber ?? "",
    email: unit.email ?? "",
    id: String(unit.id),
    isMain: unit.type === "HEAD_OFFICE",
    linkedMainBranchId: unit.parentUnitId ? String(unit.parentUnitId) : undefined,
    name: unit.displayName ?? unit.name,
    status: unit.isActive ? "Active" : "Inactive",
    tin: unit.tin ?? "",
  };
}

async function RecoverCreatedCompanyAfterTimeout(payload: CreateWorkspaceCompanyApiPayload) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (attempt > 0) {
      await Wait(1500);
    }

    const companies = await GetWorkspaceCompanies();
    const company = companies.find((record) => IsMatchingCreatedCompany(record, payload));

    if (company) {
      return company;
    }
  }

  throw new ApiClientError("The company may still be creating. Refresh the company list before trying again.", { code: "ECONNABORTED" });
}

function IsRequestTimeout(error: unknown) {
  return (
    error instanceof ApiClientError && (error.code === "ECONNABORTED" || error.message.trim().toLowerCase() === "the request timed out.")
  );
}

function IsMatchingCreatedCompany(company: WorkspaceCompanyRecord, payload: CreateWorkspaceCompanyApiPayload) {
  return (
    NormalizeText(company.name) === NormalizeText(GetCreateRequestName(payload)) &&
    NormalizeText(company.email) === NormalizeText(payload.email) &&
    NormalizeText(company.tin ?? "") === NormalizeText(payload.tin)
  );
}

function GetCreateRequestName(payload: CreateWorkspaceCompanyApiPayload) {
  if (payload.taxpayerType === "individual") {
    return [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ");
  }

  return payload.companyName ?? "";
}

function NormalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function Wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function GetWorkspaceCompanyBranchType(type: WorkspaceCompanyUnitApiLike["type"]): WorkspaceCompanyBranchRecord["branchType"] {
  if (type === "HEAD_OFFICE") {
    return "Head Office";
  }

  return type === "SATELLITE" ? "Satellite" : "Branch";
}

function MapWorkspaceCompanyFormToCreateRequest(
  values: WorkspaceCompanyFormValues,
  options: { paymentAttemptId?: string | number | null } = {},
): CreateWorkspaceCompanyApiPayload {
  const trimmedValues = TrimCompanyFormValues(values);
  const request: CreateWorkspaceCompanyApiPayload = {
    address: trimmedValues.address,
    baseCurrencyCode: trimmedValues.baseCurrencyCode,
    contactNumber: trimmedValues.contactNumber,
    countryCode: trimmedValues.countryCode,
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
    request.nonIndividualTypeOther = trimmedValues.nonIndividualType === "Others" ? trimmedValues.nonIndividualTypeOther : undefined;
  }

  if (trimmedValues.logoName && trimmedValues.logoName !== "Current logo") {
    request.logoFileName = trimmedValues.logoName;
    request.logoMimeType = values.logoFile?.type || undefined;
  }

  const billingEmail = trimmedValues.billingEmail || trimmedValues.email;
  const paymentMethodId = trimmedValues.billingMode === "AUTO" ? trimmedValues.billingPaymentMethodId : "setup-later";

  request.billing = {
    billingCycle: trimmedValues.billingCycle,
    billingEmail,
    billingMode: trimmedValues.billingMode,
    cardBrand: getCardBrand(trimmedValues.billingCardNumber),
    cardExpiryMonth: Number(trimmedValues.billingExpiryMonth) || undefined,
    cardExpiryYear: Number(trimmedValues.billingExpiryYear) || undefined,
    cardLast4: getCardLast4(trimmedValues.billingCardNumber),
    planCode: trimmedValues.billingPlanCode || undefined,
    paymentMethodId: paymentMethodId.startsWith("pm_") ? paymentMethodId : undefined,
    paymentAttemptId: options.paymentAttemptId == null ? undefined : Number(options.paymentAttemptId),
  };

  return request;
}

function MapWorkspaceCompanyFormToUpdateRequest(values: WorkspaceCompanyFormValues): UpdateWorkspaceCompanyApiPayload {
  const trimmedValues = TrimCompanyFormValues(values);
  const request: UpdateWorkspaceCompanyApiPayload = {
    address: trimmedValues.address,
    baseCurrencyCode: trimmedValues.baseCurrencyCode,
    contactNumber: trimmedValues.contactNumber,
    countryCode: trimmedValues.countryCode,
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
    request.companyName = undefined;
    request.nonIndividualType = undefined;
    request.nonIndividualTypeOther = undefined;
  } else {
    request.companyName = trimmedValues.companyName;
    request.nonIndividualType = trimmedValues.nonIndividualType;
    request.nonIndividualTypeOther = trimmedValues.nonIndividualType === "Others" ? trimmedValues.nonIndividualTypeOther : undefined;
    request.firstName = undefined;
    request.lastName = undefined;
    request.middleName = undefined;
  }

  if (!trimmedValues.logoName && !values.logoFile) {
    request.logoFileName = "";
    request.logoMimeType = "";
    request.logoPublicUrl = "";
    request.logoStoragePath = "";
  } else if (trimmedValues.logoName !== "Current logo") {
    request.logoFileName = trimmedValues.logoName || undefined;
    request.logoMimeType = values.logoFile?.type || undefined;
  }

  return request;
}

function GetWorkspaceCompanyPlan(company: WorkspaceCompanyApiLike) {
  return company.subscriptionPlan?.name ?? "Unassigned";
}

function GetWorkspaceCompanyStatus(company: WorkspaceCompanyApiLike): WorkspaceCompanyStatus {
  if (!company.isActive || company.status === "SUSPENDED") {
    return "Inactive";
  }

  if (company.status === "ACTIVE") {
    return "Active";
  }

  return "Pending";
}

function GetWorkspaceCompanyType(company: WorkspaceCompanyApiLike): WorkspaceCompanyType {
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

function GetPrimaryContact(company: WorkspaceCompanyApiLike) {
  if (company.taxpayerType === "INDIVIDUAL") {
    return [company.ownerFirstName, company.ownerMiddleName, company.ownerLastName].filter(Boolean).join(" ");
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
    baseCurrencyCode: values.baseCurrencyCode.trim().toUpperCase(),
    billingCardNumber: values.billingCardNumber.trim(),
    billingEmail: values.billingEmail.trim(),
    billingExpiryMonth: values.billingExpiryMonth.trim(),
    billingExpiryYear: values.billingExpiryYear.trim(),
    billingMode: values.billingMode,
    billingPaymentMethodId: values.billingPaymentMethodId.trim(),
    billingPlanCode: values.billingPlanCode.trim(),
    billingCycle: values.billingCycle,
    companyName: values.companyName.trim(),
    contactNumber: values.contactNumber.trim(),
    countryCode: values.countryCode.trim().toUpperCase(),
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

function getCardLast4(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length >= 4 ? digits.slice(-4) : undefined;
}

function getCardBrand(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return undefined;
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  if (/^(35(2[89]|[3-8]))/.test(digits)) return "jcb";
  if (/^(30[0-5]|36|38|39)/.test(digits)) return "diners";

  return "card";
}
