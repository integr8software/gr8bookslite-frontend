import {
  chartOfAccountsControllerCreateV1,
  chartOfAccountsControllerFindNextCodeV1,
  chartOfAccountsControllerFindTreeV1,
  chartOfAccountsControllerUpdateStatusV1,
  chartOfAccountsControllerUpdateV1,
} from "@/app/src/generated/api/chart-of-accounts/chart-of-accounts";
import type {
  ChartAccountResponseDto,
  ChartAccountResponseDtoStatus,
  ChartAccountTreeNodeResponseDto,
  CreateChartAccountDto,
  CreateChartAccountDtoStatus,
  UpdateChartAccountDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  AccountStatus,
  ChartAccount,
  ChartAccountFormValues,
  StatementGroup,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
  mapBankAccountTypeToApi,
} from "@/app/src/services/modules/financial-maintenance/bank-masterfile/BankAccountTypeMapper";
import { cleanOptional, toOptionalNumber } from "@/app/src/utils/string.util";

type ApiChartAccountLevel = "MAJOR" | "SUB1" | "SUB2" | "SUB3" | "SPECIFIC";

export async function FetchChartAccountsTree() {
  const response = await chartOfAccountsControllerFindTreeV1();

  return response.accounts.map(MapChartAccount);
}

export async function FetchNextChartAccountCode({
  accountLevel,
  parentAccountId,
}: {
  accountLevel: ApiChartAccountLevel;
  parentAccountId?: string | null;
}) {
  const response = await chartOfAccountsControllerFindNextCodeV1({
    accountLevel,
    parentAccountId: parentAccountId || undefined,
  });

  return response.accountCode;
}

export async function SaveChartAccount(
  values: ChartAccountFormValues & { accountGroup?: string | string[] },
  account?: ChartAccount | null,
) {
  const payload = CreateSaveChartAccountPayload(values, account);
  const response = account
    ? await chartOfAccountsControllerUpdateV1(account.id, payload)
    : await chartOfAccountsControllerCreateV1(payload as CreateChartAccountDto);
  const savedAccount = response.account;

  if (values.status && MapStatusToApi(values.status) !== savedAccount.status) {
    await chartOfAccountsControllerUpdateStatusV1(String(savedAccount.id), {
      status: MapStatusToApi(values.status),
    });
  }

  return MapChartAccount(savedAccount);
}

export async function DeactivateChartAccount(accountId: string) {
  return UpdateChartAccountStatus(accountId, "Inactive");
}

export async function UpdateChartAccountStatus(accountId: string, status: AccountStatus) {
  const response = await chartOfAccountsControllerUpdateStatusV1(accountId, {
    status: MapStatusToApi(status),
  });

  return MapChartAccount(response.account);
}

function CreateSaveChartAccountPayload(
  values: ChartAccountFormValues & { accountGroup?: string | string[] },
  account?: ChartAccount | null,
): UpdateChartAccountDto {
  const payload: UpdateChartAccountDto = {
    accountGroup: values.accountGroup ?? "",
    accountNature: values.normalBalance || undefined,
    accountTitle: values.accountName,
    accountType: values.accountType || undefined,
    description: values.description || undefined,
    isPostingAccount: values.isPostingAccount,
    reportAlias: values.showInReports ? values.reportAlias : "",
    statementSection: values.statementSection,
    showTotal: values.showInReports,
    status: values.status ? MapStatusToApi(values.status) : undefined,
  };

  if (!account && values.isBankLinked) {
    payload.currencyCode = cleanOptional(values.bankDetails.currency);
    payload.linkedDetails = {
      kind: "BANK",
      bankName: cleanOptional(values.bankDetails.bankName),
      branch: cleanOptional(values.bankDetails.branch),
      accountNumber: cleanOptional(values.bankDetails.bankAccountNumber),
      accountType: mapBankAccountTypeToApi(values.bankDetails.accountType),
      currencyCode: cleanOptional(values.bankDetails.currency),
      currencyExchangeRate: toOptionalNumber(values.bankDetails.currencyExchangeRate),
    };
  }

  if (!account || account.accountLevel !== values.accountLevel) {
    payload.accountLevel = values.accountLevel || undefined;
  }

  if (!account || account.parentId !== values.parentId) {
    payload.parentAccountId = values.parentId ?? undefined;
  }

  return payload;
}

function MapChartAccount(account: ChartAccountResponseDto | ChartAccountTreeNodeResponseDto): ChartAccount {
  const bankAccount = account.bankAccounts[0];

  return {
    accountLevel: account.accountLevel,
    accountGroup: account.accountGroup ?? "",
    accountName: account.accountTitle,
    accountNumber: account.accountCode,
    accountType: account.accountType ?? "ASSET",
    children: "children" in account ? account.children.map(MapChartAccount) : undefined,
    description: account.description ?? "",
    id: String(account.id),
    isBankLinked: Boolean(account.isBankLinked ?? account.bankAccounts.length),
    isPostingAccount: account.isPostingAccount,
    isSystemDefault: Boolean(account.isSystemDefault),
    isUserCreated: Boolean(account.isUserCreated),
    normalBalance: account.accountNature ?? "DEBIT",
    parentId: account.parentAccountId === null ? null : String(account.parentAccountId),
    showInReports: account.showTotal,
    statementGroup: InferStatementGroup(account),
    statementSection: account.statementSection ?? InferStatementGroup(account),
    reportAlias: account.reportAlias ?? "",
    status: MapStatusFromApi(account.status),
    createdBy: account.createdBy,
    createdAt: account.createdAt,
    updatedBy: account.updatedBy ?? "",
    updatedAt: account.updatedAt ?? "",
    bankDetails: bankAccount
      ? {
          accountType: "",
          bankAccountNumber: bankAccount.accountNumber,
          bankName: bankAccount.bankName,
          branch: bankAccount.branch ?? "",
          currency: bankAccount.currencyCode ?? account.currencyCode ?? "PHP",
          currencyExchangeRate: "",
        }
      : undefined,
  };
}

function MapStatusToApi(status: AccountStatus): CreateChartAccountDtoStatus {
  return status === "Inactive" ? "INACTIVE" : "ACTIVE";
}

function MapStatusFromApi(status: ChartAccountResponseDtoStatus): AccountStatus {
  return status === "INACTIVE" ? "Inactive" : "Active";
}

function InferStatementGroup(account: ChartAccountResponseDto | ChartAccountTreeNodeResponseDto): StatementGroup {
  if (account.accountType === "REVENUE" || account.accountType === "EXPENSE") {
    return "Income Statement";
  }

  return "Balance Sheet";
}
