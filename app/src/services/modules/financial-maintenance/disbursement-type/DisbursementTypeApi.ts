import type {
  CreateChartAccountDto,
  CreateDisbursementTypeTemplateDto,
  CreateDisbursementTypeTemplateDtoStatus,
  DisbursementTypeExpenseParentOptionResponseDto,
  DisbursementTypeOptionResponseDto,
  DisbursementTypeResponseDto,
  DisbursementTypeResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  DisbursementType,
  DisbursementTypeExpenseParentOption,
  DisbursementTypeFormValues,
  DisbursementTypeListResult,
  DisbursementTypeStatus,
  DisbursementTypeMaintenanceKind,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { ChartAccountFormValues } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

const DisbursementTypeApiPaths: Record<DisbursementTypeMaintenanceKind, string> = {
  collection: "/maintenance/financial-management/collection-types",
  disbursement: "/maintenance/financial-management/disbursement-types",
};

export async function fetchDisbursementTypes(kind: DisbursementTypeMaintenanceKind): Promise<DisbursementTypeListResult> {
  const response = (await ApiClient.get<DisbursementTypeListApiResponse>(DisbursementTypeApiPaths[kind])).data;
  const disbursementTypes = response.defaultAccounts.map(mapApiDisbursementType);

  return {
    disbursementTypes,
    statistics: {
      totalDisbursementTypes: response.statistics?.totalDefaultAccounts ?? disbursementTypes.length,
      activeDisbursementTypes:
        response.statistics?.activeDefaultAccounts ?? disbursementTypes.filter((account) => account.status === "Active").length,
      inactiveDisbursementTypes:
        response.statistics?.inactiveDefaultAccounts ?? disbursementTypes.filter((account) => account.status === "Inactive").length,
      expenseDisbursementTypes:
        response.statistics?.expenseDefaultAccounts ?? disbursementTypes.filter((account) => account.type === "EXPENSE").length,
      collectionDisbursementTypes:
        response.statistics?.collectionDefaultAccounts ?? disbursementTypes.filter((account) => account.type === "COLLECTION").length,
    },
    permissions: {
      canView: response.permissions?.canView ?? false,
      canCreate: response.permissions?.canCreate ?? false,
      canUpdate: response.permissions?.canUpdate ?? false,
      canCancel: response.permissions?.canCancel ?? false,
      canExport: response.permissions?.canExport ?? false,
      canImport: response.permissions?.canImport ?? response.permissions?.canCreate ?? false,
    },
  };
}

export async function fetchDisbursementTypeOptions(kind: DisbursementTypeMaintenanceKind): Promise<DisbursementTypeOptionResponseDto[]> {
  const response = (await ApiClient.get<DisbursementTypeOptionApiResponse>(`${DisbursementTypeApiPaths[kind]}/options`, { params: { status: "ACTIVE" } })).data;

  return response.options;
}

export async function createDisbursementType(
  values: DisbursementTypeFormValues,
  kind: DisbursementTypeMaintenanceKind,
): Promise<DisbursementType> {
  const response = (await ApiClient.post<SaveDisbursementTypeApiResponse>(DisbursementTypeApiPaths[kind], toApiPayload(values))).data;

  return mapApiDisbursementType(response.defaultAccount);
}

export async function fetchDisbursementTypeExpenseParentOptions(
  kind: DisbursementTypeMaintenanceKind,
): Promise<DisbursementTypeExpenseParentOption[]> {
  const response = (await ApiClient.get<DisbursementTypeExpenseParentOptionsApiResponse>(`${DisbursementTypeApiPaths[kind]}/expense-parent-options`)).data;

  return response.options.map(mapApiExpenseParentOption);
}

export async function fetchDisbursementTypeAccountOptions(kind: DisbursementTypeMaintenanceKind): Promise<ModuleChartAccount[]> {
  const response = (await ApiClient.get<DisbursementTypeAccountOptionsApiResponse>(`${DisbursementTypeApiPaths[kind]}/account-options`)).data;

  return response.accounts;
}

export async function updateDisbursementType(account: DisbursementType, kind: DisbursementTypeMaintenanceKind): Promise<DisbursementType> {
  const response = (await ApiClient.patch<SaveDisbursementTypeApiResponse>(`${DisbursementTypeApiPaths[kind]}/${account.id}`, toApiPayload(account))).data;

  return mapApiDisbursementType(response.defaultAccount);
}

export async function updateDisbursementTypeStatus(account: DisbursementType, kind: DisbursementTypeMaintenanceKind): Promise<DisbursementType> {
  const response = (
    await ApiClient.patch<SaveDisbursementTypeApiResponse>(`${DisbursementTypeApiPaths[kind]}/${account.id}/status`, {
      status: mapStatusToApi(account.status),
    })
  ).data;

  return mapApiDisbursementType(response.defaultAccount);
}

export async function createDisbursementTypeExpenseSubAccount(
  values: ChartAccountFormValues & { accountGroup?: string | string[] },
  kind: DisbursementTypeMaintenanceKind,
) {
  const response = (
    await ApiClient.post<SaveDisbursementTypeExpenseSubAccountApiResponse>(
      `${DisbursementTypeApiPaths[kind]}/expense-sub-accounts`,
      createDisbursementTypeExpenseSubAccountPayload(values),
    )
  ).data;

  return response.account;
}

function createDisbursementTypeExpenseSubAccountPayload(
  values: ChartAccountFormValues & { accountGroup?: string | string[] },
): CreateChartAccountDto {
  return {
    accountGroup: values.accountGroup ?? "",
    accountLevel: values.accountLevel || "SPECIFIC",
    accountNature: values.normalBalance || undefined,
    accountTitle: values.accountName,
    accountType: values.accountType || undefined,
    description: values.description || undefined,
    isPostingAccount: values.isPostingAccount,
    parentAccountId: values.parentId ?? undefined,
    reportAlias: values.showInReports ? values.reportAlias : "",
    statementSection: values.statementSection,
    showTotal: values.showInReports,
    status: values.status ? mapStatusToApi(values.status) : undefined,
  };
}

function mapApiDisbursementType(account: DisbursementTypeResponseDto): DisbursementType {
  return {
    id: account.id,
    type: account.type,
    disbursementTypeName: account.defaultAccountName,
    description: account.description ?? "",
    status: mapStatusFromApi(account.status),
    accountSetupMode: "Auto",
    expenseCoaId: account.generatedAccounts.find((generated) => generated.role === "EXPENSE")?.chartAccountId ?? "",
    expenseParentCoaId: account.expenseParentCoaId ?? undefined,
    generatedAccounts: account.generatedAccounts,
    createdBy: account.createdBy,
    createdAt: account.createdAt,
    updatedBy: account.updatedBy,
    updatedAt: account.updatedAt ?? undefined,
  };
}

function mapApiExpenseParentOption(option: DisbursementTypeExpenseParentOptionResponseDto): DisbursementTypeExpenseParentOption {
  return {
    id: option.id,
    accountCode: option.accountCode,
    accountTitle: option.accountTitle,
    accountLevel: option.accountLevel,
    parentAccountId: option.parentAccountId,
  };
}

type DisbursementTypeSavePayload = CreateDisbursementTypeTemplateDto & {
  expenseCoaId?: string;
};

function toApiPayload(account: DisbursementType | DisbursementTypeFormValues): DisbursementTypeSavePayload {
  return {
    type: account.type,
    defaultAccountName: account.disbursementTypeName.trim(),
    description: account.description.trim(),
    status: mapStatusToApi(account.status),
    expenseCoaId: account.type === "EXPENSE" && account.accountSetupMode === "Existing" ? account.expenseCoaId || undefined : undefined,
    expenseParentCoaId: account.type === "EXPENSE" && account.accountSetupMode === "Auto" ? account.expenseParentCoaId || undefined : undefined,
  };
}

function mapStatusFromApi(value: DisbursementTypeResponseDtoStatus): DisbursementTypeStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: DisbursementTypeStatus): CreateDisbursementTypeTemplateDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

type DisbursementTypeListApiResponse = {
  defaultAccounts: DisbursementTypeResponseDto[];
  statistics?: {
    totalDefaultAccounts?: number;
    activeDefaultAccounts?: number;
    inactiveDefaultAccounts?: number;
    expenseDefaultAccounts?: number;
    collectionDefaultAccounts?: number;
  };
  permissions?: Partial<DisbursementTypeListResult["permissions"]>;
};

type SaveDisbursementTypeApiResponse = {
  defaultAccount: DisbursementTypeResponseDto;
};

type DisbursementTypeExpenseParentOptionsApiResponse = {
  options: DisbursementTypeExpenseParentOptionResponseDto[];
};

type DisbursementTypeAccountOptionsApiResponse = {
  accounts: ModuleChartAccount[];
};

type SaveDisbursementTypeExpenseSubAccountApiResponse = {
  account: {
    id: string;
    accountCode: string;
    accountTitle: string;
  };
};

type DisbursementTypeOptionApiResponse = {
  options: DisbursementTypeOptionResponseDto[];
};
