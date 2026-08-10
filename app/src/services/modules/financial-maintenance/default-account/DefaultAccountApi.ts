import {
  defaultAccountControllerCreateExpenseSubAccountV1,
  defaultAccountControllerCreateV1,
  defaultAccountControllerFindAllV1,
  defaultAccountControllerFindExpenseParentOptionsV1,
  defaultAccountControllerUpdateStatusV1,
  defaultAccountControllerUpdateV1,
} from "@/app/src/generated/api/default-account/default-account";
import type {
  CreateChartAccountDto,
  CreateDefaultAccountTemplateDto,
  CreateDefaultAccountTemplateDtoStatus,
  DefaultAccountExpenseParentOptionResponseDto,
  DefaultAccountResponseDto,
  DefaultAccountResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  DefaultAccount,
  DefaultAccountExpenseParentOption,
  DefaultAccountFormValues,
  DefaultAccountListResponse,
  DefaultAccountStatus,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import type { ChartAccountFormValues } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export async function fetchDefaultAccounts(): Promise<DefaultAccountListResponse> {
  const response = await defaultAccountControllerFindAllV1();
  const defaultAccounts = response.defaultAccounts.map(mapApiDefaultAccount);

  return {
    defaultAccounts,
    statistics: {
      totalDefaultAccounts: response.statistics?.totalDefaultAccounts ?? defaultAccounts.length,
      activeDefaultAccounts:
        response.statistics?.activeDefaultAccounts ?? defaultAccounts.filter((account) => account.status === "Active").length,
      inactiveDefaultAccounts:
        response.statistics?.inactiveDefaultAccounts ?? defaultAccounts.filter((account) => account.status === "Inactive").length,
      expenseDefaultAccounts:
        response.statistics?.expenseDefaultAccounts ?? defaultAccounts.filter((account) => account.type === "EXPENSE").length,
      collectionDefaultAccounts:
        response.statistics?.collectionDefaultAccounts ?? defaultAccounts.filter((account) => account.type === "COLLECTION").length,
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

export async function createDefaultAccount(values: DefaultAccountFormValues): Promise<DefaultAccount> {
  const response = await defaultAccountControllerCreateV1(toApiPayload(values));

  return mapApiDefaultAccount(response.defaultAccount);
}

export async function fetchDefaultAccountExpenseParentOptions(): Promise<DefaultAccountExpenseParentOption[]> {
  const response = await defaultAccountControllerFindExpenseParentOptionsV1();

  return response.options.map(mapApiExpenseParentOption);
}

export async function updateDefaultAccount(account: DefaultAccount): Promise<DefaultAccount> {
  const response = await defaultAccountControllerUpdateV1(account.id, toApiPayload(account));

  return mapApiDefaultAccount(response.defaultAccount);
}

export async function updateDefaultAccountStatus(account: DefaultAccount): Promise<DefaultAccount> {
  const response = await defaultAccountControllerUpdateStatusV1(account.id, {
    status: mapStatusToApi(account.status),
  });

  return mapApiDefaultAccount(response.defaultAccount);
}

export async function createDefaultAccountExpenseSubAccount(values: ChartAccountFormValues & { accountGroup?: string | string[] }) {
  const response = await defaultAccountControllerCreateExpenseSubAccountV1(createDefaultAccountExpenseSubAccountPayload(values));

  return response.account;
}

function createDefaultAccountExpenseSubAccountPayload(
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

function mapApiDefaultAccount(account: DefaultAccountResponseDto): DefaultAccount {
  return {
    id: account.id,
    type: account.type,
    defaultAccountName: account.defaultAccountName,
    description: account.description ?? "",
    status: mapStatusFromApi(account.status),
    expenseParentCoaId: account.expenseParentCoaId ?? undefined,
    generatedAccounts: account.generatedAccounts,
    createdBy: account.createdBy,
    createdAt: account.createdAt,
    updatedBy: account.updatedBy,
    updatedAt: account.updatedAt ?? undefined,
  };
}

function mapApiExpenseParentOption(option: DefaultAccountExpenseParentOptionResponseDto): DefaultAccountExpenseParentOption {
  return {
    id: option.id,
    accountCode: option.accountCode,
    accountTitle: option.accountTitle,
    accountLevel: option.accountLevel,
    parentAccountId: option.parentAccountId,
  };
}

function toApiPayload(account: DefaultAccount | DefaultAccountFormValues): CreateDefaultAccountTemplateDto {
  return {
    type: account.type,
    defaultAccountName: account.defaultAccountName.trim(),
    description: account.description.trim(),
    status: mapStatusToApi(account.status),
    expenseParentCoaId: account.type === "EXPENSE" ? account.expenseParentCoaId || undefined : undefined,
  };
}

function mapStatusFromApi(value: DefaultAccountResponseDtoStatus): DefaultAccountStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: DefaultAccountStatus): CreateDefaultAccountTemplateDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}
