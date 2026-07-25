import type { AccountLevel } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export const AccountLevelLabels: Record<AccountLevel, string> = {
  MAJOR: "Major Account",
  SUB1: "Sub Account I",
  SUB2: "Sub Account II",
  SUB3: "Sub Account III",
  SPECIFIC: "Specific Account",
};

export function getAccountLevelLabel(accountLevel?: string | null) {
  return accountLevel && accountLevel in AccountLevelLabels
    ? AccountLevelLabels[accountLevel as AccountLevel]
    : (accountLevel ?? "");
}
