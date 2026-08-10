import {
  EmptyAccountFormValues,
  EmptyBankDetails,
} from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsDefaults";
import { accountToFormValues } from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsMappers";
import type {
  AccountLevel,
  AccountType,
  ChartAccount,
  ChartAccountFormValues,
  NormalBalance,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export function getAvailableAccountLevels(accounts: ChartAccount[], parentAccountId: string | null): AccountLevel[] {
  if (!parentAccountId) {
    return ["SPECIFIC"];
  }

  const parentAccount = findAccountById(accounts, parentAccountId);

  switch (parentAccount?.accountLevel) {
    case "MAJOR":
      return ["SUB1"];
    case "SUB1":
      return ["SUB2", "SPECIFIC"];
    case "SUB2":
      return ["SUB3", "SPECIFIC"];
    case "SUB3":
      return ["SPECIFIC"];
    default:
      return ["SPECIFIC"];
  }
}

export function currentAccountLevelOrDefault(
  currentAccountLevel: AccountLevel | "",
  availableAccountLevels: AccountLevel[],
  preferSpecific = false,
) {
  if (preferSpecific && availableAccountLevels.includes("SPECIFIC")) {
    return "SPECIFIC";
  }

  return currentAccountLevel && availableAccountLevels.includes(currentAccountLevel) ? currentAccountLevel : availableAccountLevels[0];
}

export function getStandardNormalBalance(accountType: AccountType | ""): NormalBalance | "" {
  if (!accountType) {
    return "";
  }

  return accountType === "ASSET" || accountType === "EXPENSE" ? "DEBIT" : "CREDIT";
}

export function getStandardStatementSection(accountType: AccountType | "") {
  if (!accountType) {
    return "";
  }

  return accountType === "REVENUE" || accountType === "EXPENSE" ? "Income Statement" : "Balance Sheet";
}

export function getInitialFormValues(account: ChartAccount | null, parentAccount: ChartAccount | null): ChartAccountFormValues {
  const values = account ? accountToFormValues(account) : EmptyAccountFormValues;
  const childAccountLevel = parentAccount
    ? currentAccountLevelOrDefault("", getAvailableAccountLevels([parentAccount], parentAccount.id), true)
    : values.accountLevel;

  return {
    ...values,
    ...(account || !parentAccount
      ? {}
      : {
          accountLevel: childAccountLevel,
          accountType: parentAccount.accountType,
          normalBalance: getStandardNormalBalance(parentAccount.accountType),
          parentId: parentAccount.id,
          statementGroup: parentAccount.statementGroup,
          statementSection: parentAccount.statementSection,
          isPostingAccount: childAccountLevel === "SPECIFIC",
        }),
    bankDetails: {
      ...(values.bankDetails ?? EmptyBankDetails),
    },
    isBankLinked: account?.isBankLinked ?? (childAccountLevel === "SPECIFIC" && isCashInBankAccount(parentAccount)),
  };
}

export function isCashInBankParent(accounts: ChartAccount[], parentAccountId: string | null) {
  if (!parentAccountId) {
    return false;
  }

  return isCashInBankAccount(findAccountById(accounts, parentAccountId));
}

function findAccountById(accounts: ChartAccount[], accountId: string): ChartAccount | null {
  for (const account of accounts) {
    if (account.id === accountId) {
      return account;
    }

    const childAccount = findAccountById(account.children ?? [], accountId);

    if (childAccount) {
      return childAccount;
    }
  }

  return null;
}

function isCashInBankAccount(account: ChartAccount | null | undefined) {
  const label = account?.accountName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  return label === "cash in bank" || label === "cash in banks";
}
