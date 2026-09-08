import type {
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherExpenseLine,
  AccountsPayableVoucherLookupAccount,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

export function mergeLookupAccountOptions(...groups: Array<Array<AccountsPayableVoucherLookupAccount | null | undefined>>) {
  const mergedAccounts: AccountsPayableVoucherLookupAccount[] = [];
  const seenKeys = new Set<string>();

  groups.forEach((accounts) => {
    accounts.forEach((account) => {
      if (!account) {
        return;
      }

      const keys = getLookupAccountKeys(account);

      if (keys.some((key) => seenKeys.has(key))) {
        return;
      }

      mergedAccounts.push(account);
      keys.forEach((key) => seenKeys.add(key));
    });
  });

  return mergedAccounts;
}

function getLookupAccountKeys(account: AccountsPayableVoucherLookupAccount) {
  return [account.id, account.accountNumber, account.accountName].map((value) => value.trim().toLowerCase()).filter(Boolean);
}

export function createExpenseLineLookupAccount(line: AccountsPayableVoucherExpenseLine): AccountsPayableVoucherLookupAccount | null {
  return createFallbackLookupAccount({
    accountId: line.expenseAccountId,
    accountName: line.expenseType,
    accountNumber: line.expenseAccountCode,
    accountType: "Expenses",
    normalBalance: "Debit",
    statementGroup: "Income Statement",
    statementSection: "Expenses",
  });
}

export function createAccountingEntryLookupAccount(
  entry: AccountsPayableVoucherAccountingEntry,
): AccountsPayableVoucherLookupAccount | null {
  return createFallbackLookupAccount({
    accountId: entry.accountId,
    accountName: entry.accountTitle,
    accountNumber: entry.accountCode,
    accountType: "",
    normalBalance: Number(entry.credit) > 0 ? "Credit" : "Debit",
    statementGroup: "",
    statementSection: "",
  });
}

function createFallbackLookupAccount({
  accountId,
  accountName,
  accountNumber,
  accountType,
  normalBalance,
  statementGroup,
  statementSection,
}: {
  accountId?: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  normalBalance: "Debit" | "Credit";
  statementGroup: string;
  statementSection: string;
}): AccountsPayableVoucherLookupAccount | null {
  const normalizedAccountId = accountId?.trim() ?? "";
  const normalizedAccountName = accountName.trim();
  const normalizedAccountNumber = accountNumber.trim();

  if (!normalizedAccountName && !normalizedAccountNumber) {
    return null;
  }

  const fallbackId = `fallback:${normalizedAccountNumber || normalizedAccountName}`;
  const normalizedStatementSection = statementSection.trim() || accountType.trim();

  return {
    id: normalizedAccountId || fallbackId,
    accountCategory: normalizedStatementSection || "Detail",
    accountName: normalizedAccountName || normalizedAccountNumber,
    accountNumber: normalizedAccountNumber,
    accountType,
    description: normalizedAccountName || normalizedAccountNumber,
    normalBalance,
    statementGroup,
    statementSection: normalizedStatementSection,
    status: "Active",
  };
}

export function getSelectableLookupAccountId(account: AccountsPayableVoucherLookupAccount | null) {
  const accountId = account?.id.trim() ?? "";

  return accountId && !accountId.startsWith("fallback:") ? accountId : "";
}

export function getLookupAccountEmptyMessage(query: { isError: boolean; isFetching: boolean; isLoading: boolean }, emptyMessage: string) {
  if (query.isLoading || query.isFetching) {
    return "Loading accounts...";
  }

  if (query.isError) {
    return "Could not load accounts.";
  }

  return emptyMessage;
}
