import type {
  CollectionTypeAccountOptionResponseDto,
  CreateCollectionTypeTemplateDto,
  CreateCollectionTypeTemplateDtoAccountSetupMode,
  CreateCollectionTypeTemplateDtoStatus,
  CollectionTypeResponseDto,
  CollectionTypeResponseDtoAccountSetupMode,
  CollectionTypeResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  CollectionType,
  CollectionTypeFormValues,
  CollectionTypeListResult,
  CollectionTypeStatus,
  CollectionTypeMaintenanceKind,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

const CollectionTypeApiPaths: Record<CollectionTypeMaintenanceKind, string> = {
  collection: "/maintenance/financial-management/collection-types",
  disbursement: "/maintenance/financial-management/disbursement-types",
};

export async function fetchCollectionTypes(kind: CollectionTypeMaintenanceKind): Promise<CollectionTypeListResult> {
  const response = (await ApiClient.get<CollectionTypeListApiResponse>(CollectionTypeApiPaths[kind])).data;
  const collectionTypes = response.defaultAccounts.map(mapApiCollectionType);

  return {
    collectionTypes,
    statistics: {
      totalCollectionTypes: response.statistics?.totalDefaultAccounts ?? collectionTypes.length,
      activeCollectionTypes:
        response.statistics?.activeDefaultAccounts ?? collectionTypes.filter((account) => account.status === "Active").length,
      inactiveCollectionTypes:
        response.statistics?.inactiveDefaultAccounts ?? collectionTypes.filter((account) => account.status === "Inactive").length,
      expenseCollectionTypes:
        response.statistics?.expenseDefaultAccounts ?? collectionTypes.filter((account) => account.type === "EXPENSE").length,
      collectionCollectionTypes:
        response.statistics?.collectionDefaultAccounts ?? collectionTypes.filter((account) => account.type === "COLLECTION").length,
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

export async function fetchCollectionTypeOptions(kind: CollectionTypeMaintenanceKind): Promise<CollectionTypeOptionApiResponse["options"]> {
  const response = (
    await ApiClient.get<CollectionTypeOptionApiResponse>(`${CollectionTypeApiPaths[kind]}/options`, { params: { status: "ACTIVE" } })
  ).data;

  return response.options;
}

export async function fetchCollectionTypeAccountOptions(kind: CollectionTypeMaintenanceKind): Promise<ModuleChartAccount[]> {
  const response = (await ApiClient.get<CollectionTypeAccountOptionsApiResponse>(`${CollectionTypeApiPaths[kind]}/account-options`)).data;

  return response.accounts.map(mapApiAccountOption);
}

export async function createCollectionType(values: CollectionTypeFormValues, kind: CollectionTypeMaintenanceKind): Promise<CollectionType> {
  const response = (await ApiClient.post<SaveCollectionTypeApiResponse>(CollectionTypeApiPaths[kind], toApiPayload(values))).data;

  return mapApiCollectionType(response.defaultAccount);
}

export async function updateCollectionType(account: CollectionType, kind: CollectionTypeMaintenanceKind): Promise<CollectionType> {
  const response = (
    await ApiClient.patch<SaveCollectionTypeApiResponse>(`${CollectionTypeApiPaths[kind]}/${account.id}`, toApiPayload(account))
  ).data;

  return mapApiCollectionType(response.defaultAccount);
}

export async function updateCollectionTypeStatus(account: CollectionType, kind: CollectionTypeMaintenanceKind): Promise<CollectionType> {
  const response = (
    await ApiClient.patch<SaveCollectionTypeApiResponse>(`${CollectionTypeApiPaths[kind]}/${account.id}/status`, {
      status: mapStatusToApi(account.status),
    })
  ).data;

  return mapApiCollectionType(response.defaultAccount);
}

function mapApiCollectionType(account: CollectionTypeResponseDto): CollectionType {
  return {
    id: account.id,
    type: account.type,
    collectionTypeName: account.defaultAccountName,
    description: account.description ?? "",
    status: mapStatusFromApi(account.status),
    accountSetupMode: mapSetupModeFromApi(account.accountSetupMode),
    revenueCoaId: account.revenueCoaId ?? account.generatedAccounts.find((generated) => generated.role === "REVENUE")?.chartAccountId ?? "",
    expenseParentCoaId: account.expenseParentCoaId ?? undefined,
    generatedAccounts: account.generatedAccounts,
    createdBy: account.createdBy,
    createdAt: account.createdAt,
    updatedBy: account.updatedBy,
    updatedAt: account.updatedAt ?? undefined,
  };
}

function mapApiAccountOption(account: CollectionTypeAccountOptionResponseDto): ModuleChartAccount {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    accountType: account.accountType,
    statementGroup: account.statementGroup,
    statementSection: account.statementSection,
    normalBalance: account.normalBalance === "Debit" ? "Debit" : "Credit",
    accountCategory: account.accountCategory,
    description: account.description,
    status: account.status === "Inactive" ? "Inactive" : "Active",
  };
}

function toApiPayload(account: CollectionType | CollectionTypeFormValues): CreateCollectionTypeTemplateDto {
  return {
    type: account.type,
    defaultAccountName: account.collectionTypeName.trim(),
    description: account.description.trim(),
    status: mapStatusToApi(account.status),
    accountSetupMode: mapSetupModeToApi(account.accountSetupMode),
    revenueCoaId: account.type === "COLLECTION" && account.accountSetupMode === "Existing" ? account.revenueCoaId || undefined : undefined,
    expenseParentCoaId: account.type === "EXPENSE" ? account.expenseParentCoaId || undefined : undefined,
  };
}

function mapSetupModeFromApi(value: CollectionTypeResponseDtoAccountSetupMode): CollectionType["accountSetupMode"] {
  return value === "EXISTING" ? "Existing" : "Auto";
}

function mapSetupModeToApi(value: CollectionType["accountSetupMode"]): CreateCollectionTypeTemplateDtoAccountSetupMode {
  return value === "Existing" ? "EXISTING" : "AUTO";
}

function mapStatusFromApi(value: CollectionTypeResponseDtoStatus): CollectionTypeStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: CollectionTypeStatus): CreateCollectionTypeTemplateDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

type CollectionTypeListApiResponse = {
  defaultAccounts: CollectionTypeResponseDto[];
  statistics?: {
    totalDefaultAccounts?: number;
    activeDefaultAccounts?: number;
    inactiveDefaultAccounts?: number;
    expenseDefaultAccounts?: number;
    collectionDefaultAccounts?: number;
  };
  permissions?: Partial<CollectionTypeListResult["permissions"]>;
};

type SaveCollectionTypeApiResponse = {
  defaultAccount: CollectionTypeResponseDto;
};

type CollectionTypeAccountOptionsApiResponse = {
  accounts: CollectionTypeAccountOptionResponseDto[];
};

type CollectionTypeOptionApiResponse = {
  options: Array<{
    id: string;
    type: string;
    defaultAccountName: string;
    description: string;
    status: string;
    chartAccountId: string | null;
    accountCode: string | null;
    accountTitle: string | null;
    accountType: string | null;
    accountNature: string | null;
  }>;
};
