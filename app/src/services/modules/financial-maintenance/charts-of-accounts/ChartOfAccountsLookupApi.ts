import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  ChartOfAccountsLookupOption,
  ChartOfAccountsLookupQuery,
  PostingAccountLookupOption,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartOfAccountsLookupTypes";

type ChartAccountBackendResponse = {
  id: string;
  accountCode: string;
  accountTitle: string;
  accountType?: string;
  accountNature?: string;
  isPostingAccount?: boolean;
  status?: string;
  [key: string]: unknown;
};

export async function fetchPostingAccountLookupOptions(
  query: ChartOfAccountsLookupQuery = {},
): Promise<PostingAccountLookupOption[]> {
  const response = await ApiClient.get<{ accounts: ChartAccountBackendResponse[] }>(
    "/maintenance/chart-of-accounts/options/posting-accounts",
    { params: query },
  );

  return (response.data.accounts ?? []).map(mapAccountToLookupOption);
}

export async function fetchAllAccountLookupOptions(
  query: ChartOfAccountsLookupQuery = {},
): Promise<ChartOfAccountsLookupOption[]> {
  const response = await ApiClient.get<{ accounts: ChartAccountBackendResponse[] }>(
    "/maintenance/chart-of-accounts/options",
    { params: query },
  );

  return (response.data.accounts ?? []).map(mapAccountToLookupOption);
}

function mapAccountToLookupOption(account: ChartAccountBackendResponse): ChartOfAccountsLookupOption {
  return {
    ...account,
    name: account.accountTitle,
    label: account.accountCode,
    value: account.accountCode,
    description: account.accountTitle,
    accountId: account.id,
    accountCode: account.accountCode,
    accountTitle: account.accountTitle,
  };
}
