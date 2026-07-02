import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  AccountStatus,
  ChartAccount,
  ChartAccountFormValues,
  StatementGroup,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";

type ApiChartAccountLevel = "MAJOR" | "SUB1" | "SUB2" | "SUB3" | "SPECIFIC";
type ApiChartAccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "REVENUE"
  | "EXPENSE";
type ApiAccountNature = "DEBIT" | "CREDIT";
type ApiChartAccountStatus = "ACTIVE" | "INACTIVE";

type ApiBankAccount = {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string | null;
  currencyCode: string | null;
  isDefault: boolean;
};

type ApiChartAccount = {
  id: number;
  parentAccountId: number | null;
  accountCode: string;
  accountTitle: string;
  accountLevel: ApiChartAccountLevel;
  accountType: ApiChartAccountType | null;
  accountNature: ApiAccountNature | null;
  accountGroup: string | null;
  reportAlias: string | null;
  class: string | null;
  isPostingAccount: boolean;
  showTotal: boolean;
  status: ApiChartAccountStatus;
  currencyCode: string | null;
  bankAccounts: ApiBankAccount[];
  children?: ApiChartAccount[];
};

type ChartAccountsTreeResponse = {
  accounts: ApiChartAccount[];
};

type ChartAccountSaveResponse = {
  account: ApiChartAccount;
  message: string;
};

type ChartAccountNextCodeResponse = {
  accountCode: string;
};

type SaveChartAccountPayload = {
  parentAccountId?: string;
  accountLevel?: ApiChartAccountLevel;
  accountTitle: string;
  accountType?: ApiChartAccountType;
  accountNature?: ApiAccountNature;
  accountGroup?: string;
  reportAlias?: string;
  class?: string;
  isPostingAccount?: boolean;
  showTotal?: boolean;
  currencyCode?: string;
};

const ChartOfAccountsUrl = "/maintenance/chart-of-accounts";

export async function FetchChartAccountsTree() {
  const response = await ApiClient.get<ChartAccountsTreeResponse>(
    `${ChartOfAccountsUrl}/tree`,
  );

  return response.data.accounts.map(MapChartAccount);
}

export async function FetchNextChartAccountCode({
  accountLevel,
  parentAccountId,
}: {
  accountLevel: ApiChartAccountLevel;
  parentAccountId?: string | null;
}) {
  const response = await ApiClient.get<ChartAccountNextCodeResponse>(
    `${ChartOfAccountsUrl}/next-code`,
    {
      params: {
        accountLevel,
        parentAccountId: parentAccountId || undefined,
      },
    },
  );

  return response.data.accountCode;
}

export async function SaveChartAccount(
  values: ChartAccountFormValues,
  account?: ChartAccount | null,
) {
  const payload = CreateSaveChartAccountPayload(values, account);
  const response = account
    ? await ApiClient.patch<ChartAccountSaveResponse>(
        `${ChartOfAccountsUrl}/${account.id}`,
        payload,
      )
    : await ApiClient.post<ChartAccountSaveResponse>(
        ChartOfAccountsUrl,
        payload,
      );
  const savedAccount = response.data.account;

  if (values.status && MapStatusToApi(values.status) !== savedAccount.status) {
    await ApiClient.patch<ChartAccountSaveResponse>(
      `${ChartOfAccountsUrl}/${savedAccount.id}/status`,
      { status: MapStatusToApi(values.status) },
    );
  }

  return MapChartAccount(savedAccount);
}

export async function DeactivateChartAccount(accountId: string) {
  return UpdateChartAccountStatus(accountId, "Inactive");
}

export async function UpdateChartAccountStatus(
  accountId: string,
  status: AccountStatus,
) {
  const response = await ApiClient.patch<ChartAccountSaveResponse>(
    `${ChartOfAccountsUrl}/${accountId}/status`,
    { status: MapStatusToApi(status) },
  );

  return MapChartAccount(response.data.account);
}

function CreateSaveChartAccountPayload(
  values: ChartAccountFormValues,
  account?: ChartAccount | null,
): SaveChartAccountPayload {
  const payload: SaveChartAccountPayload = {
    accountGroup: values.accountLevel
      ? GetAccountGroupLabel(values.accountLevel)
      : undefined,
    accountNature: values.normalBalance || undefined,
    accountTitle: values.accountName,
    accountType: values.accountType || undefined,
    class: values.description ? values.description.slice(0, 50) : undefined,
    isPostingAccount: values.isPostingAccount,
    reportAlias: values.statementSection,
    showTotal: values.showInReports,
  };

  if (!account || account.accountLevel !== values.accountLevel) {
    payload.accountLevel = values.accountLevel || undefined;
  }

  if (!account || account.parentId !== values.parentId) {
    payload.parentAccountId = values.parentId ?? undefined;
  }

  return payload;
}

function MapChartAccount(account: ApiChartAccount): ChartAccount {
  return {
    accountLevel: account.accountLevel,
    accountName: account.accountTitle,
    accountNumber: account.accountCode,
    accountType: account.accountType ?? "ASSET",
    children: account.children?.map(MapChartAccount),
    description: account.class ?? "",
    id: String(account.id),
    isPostingAccount: account.isPostingAccount,
    normalBalance: account.accountNature ?? "DEBIT",
    parentId:
      account.parentAccountId === null ? null : String(account.parentAccountId),
    showInReports: account.showTotal,
    statementGroup: InferStatementGroup(account),
    statementSection: account.reportAlias ?? InferStatementGroup(account),
    status: MapStatusFromApi(account.status),
  };
}

function MapStatusToApi(status: AccountStatus): ApiChartAccountStatus {
  return status === "Inactive" ? "INACTIVE" : "ACTIVE";
}

function MapStatusFromApi(status: ApiChartAccountStatus): AccountStatus {
  return status === "INACTIVE" ? "Inactive" : "Active";
}

function InferStatementGroup(account: ApiChartAccount): StatementGroup {
  if (account.accountType === "REVENUE" || account.accountType === "EXPENSE") {
    return "Income Statement";
  }

  return "Balance Sheet";
}

function GetAccountGroupLabel(accountLevel: ApiChartAccountLevel) {
  switch (accountLevel) {
    case "MAJOR":
      return "Major Acct Type";
    case "SUB1":
      return "Sub Acct 1";
    case "SUB2":
      return "Sub Acct 2";
    case "SUB3":
      return "Sub Acct 3";
    case "SPECIFIC":
      return "Specific Acct";
  }
}
