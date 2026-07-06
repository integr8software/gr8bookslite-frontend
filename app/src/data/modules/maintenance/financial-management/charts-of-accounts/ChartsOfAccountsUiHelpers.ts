 
import type {
  ActiveDragAccount,
  ChartAccount,
  ChartsOfAccountsActionMode,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export function getChartsOfAccountsActionMode(
  pathname: string,
): ChartsOfAccountsActionMode {
  if (pathname.includes("/edit/")) {
    return "edit";
  }

  if (pathname.includes("/view/")) {
    return "view";
  }

  return "add";
}

export function getAccountPercentage(count: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

export function getCanDropOnAccount({
  activeDragAccount,
  targetAccount,
  targetIsSpecific,
}: {
  activeDragAccount?: ActiveDragAccount;
  targetAccount: ChartAccount;
  targetIsSpecific: boolean;
}) {
  if (!activeDragAccount || activeDragAccount.id === targetAccount.id) {
    return false;
  }

  if (activeDragAccount.isSpecific) {
    return true;
  }

  return (
    !targetIsSpecific && activeDragAccount.parentId === targetAccount.parentId
  );
}

export function isSpecificAccountNumber(accountNumber: string) {
  return !accountNumber.endsWith("000");
}

export function isSpecificAccountLevel(account: ChartAccount) {
  return account.accountLevel === "SPECIFIC";
}
