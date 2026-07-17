import type {
  ActiveDragAccount,
  ChartAccount,
  ChartsOfAccountsDropPlacement,
  FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export function flattenAccounts(
  accounts: ChartAccount[],
  level = 0,
  parentAccountNumber = "",
  parentPath: string[] = [],
): FlattenedChartAccount[] {
  const currentParentPath = parentPath.join(" > ");

  return accounts.flatMap((account) => [
    { account, level, parentAccountNumber, parentPath: currentParentPath },
    ...flattenAccounts(
      account.children ?? [],
      level + 1,
      account.accountNumber,
      [...parentPath, account.accountName],
    ),
  ]);
}

export function insertAccount(
  accounts: ChartAccount[],
  newAccount: ChartAccount,
): ChartAccount[] {
  if (!newAccount.parentId) {
    return [...accounts, newAccount];
  }

  return accounts.map((account) => {
    if (account.id === newAccount.parentId) {
      return {
        ...account,
        children: [...(account.children ?? []), newAccount],
      };
    }

    return {
      ...account,
      children: account.children
        ? insertAccount(account.children, newAccount)
        : account.children,
    };
  });
}

export function updateAccountTree(
  accounts: ChartAccount[],
  accountId: string,
  updatedAccount: ChartAccount,
): ChartAccount[] {
  return accounts.map((account) => {
    if (account.id === accountId) {
      return { ...updatedAccount, children: account.children };
    }

    return {
      ...account,
      children: account.children
        ? updateAccountTree(account.children, accountId, updatedAccount)
        : account.children,
    };
  });
}

export function moveOrReorderAccount(
  accounts: ChartAccount[],
  accountId: string,
  overAccountId: string,
  placement: ChartsOfAccountsDropPlacement = "before",
): ChartAccount[] {
  if (accountId === overAccountId) {
    return accounts;
  }

  const accountToMove = findAccount(accounts, accountId);
  const overAccount = findAccount(accounts, overAccountId);

  if (!accountToMove || !overAccount) {
    return accounts;
  }

  if (isSpecificAccount(accountToMove)) {
    if (placement === "inside" && !isSpecificAccount(overAccount)) {
      return insertAccount(removeAccount(accounts, accountId), {
        ...accountToMove,
        parentId: overAccount.id,
      });
    }

    if (placement === "after") {
      return moveSpecificAccountAfter(accounts, accountToMove, overAccount);
    }

    if (placement === "before") {
      return moveSpecificAccountBefore(accounts, accountToMove, overAccount);
    }

    return accounts;
  }

  if (accountToMove.parentId !== overAccount.parentId) {
    return accounts;
  }

  if (isSpecificAccount(overAccount)) {
    return accounts;
  }

  if (!accountToMove.parentId) {
    return reorderDirectAccounts(accounts, accountId, overAccountId, placement);
  }

  return updateAccountChildren(accounts, accountToMove.parentId, (children) =>
    reorderDirectAccounts(children, accountId, overAccountId, placement),
  );
}

export function isSpecificAccount(account: ChartAccount): boolean {
  return !account.accountNumber.endsWith("000");
}

export function isSpecificAccountNumber(accountNumber: string) {
  return !accountNumber.endsWith("000");
}

export function isSpecificAccountLevel(account: ChartAccount) {
  return account.accountLevel === "SPECIFIC";
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

export function getDropPlacementMode({
  activeDragAccount,
  placement,
  targetAccount,
  targetIsSpecific,
}: {
  activeDragAccount?: ActiveDragAccount;
  placement: ChartsOfAccountsDropPlacement;
  targetAccount: ChartAccount;
  targetIsSpecific: boolean;
}): ChartsOfAccountsDropPlacement | null {
  if (
    !getCanDropOnAccount({
      activeDragAccount,
      targetAccount,
      targetIsSpecific,
    })
  ) {
    return null;
  }

  if (placement === "inside" && targetIsSpecific) {
    return activeDragAccount?.parentId === targetAccount.parentId
      ? "after"
      : "before";
  }

  return placement;
}

export function getPointerDropPlacement({
  pointerY,
  targetAccountLevel,
  targetHeight,
  targetTop,
}: {
  pointerY: number | null;
  targetAccountLevel: string;
  targetHeight?: number;
  targetTop?: number;
}): ChartsOfAccountsDropPlacement {
  if (typeof targetTop !== "number" || typeof targetHeight !== "number") {
    return "before";
  }

  const relativeY =
    typeof pointerY === "number" ? pointerY - targetTop : targetHeight / 2;

  if (targetAccountLevel !== "SPECIFIC") {
    return relativeY <= targetHeight * 0.25 ? "before" : "inside";
  }

  if (relativeY <= targetHeight * 0.35) {
    return "before";
  }

  if (relativeY >= targetHeight * 0.65) {
    return "after";
  }

  return "before";
}

export function removeAccount(
  accounts: ChartAccount[],
  accountId: string,
): ChartAccount[] {
  return accounts
    .filter((account) => account.id !== accountId)
    .map((account) => ({
      ...account,
      children: account.children
        ? removeAccount(account.children, accountId)
        : account.children,
    }));
}

function findAccount(
  accounts: ChartAccount[],
  accountId: string,
): ChartAccount | null {
  for (const account of accounts) {
    if (account.id === accountId) {
      return account;
    }

    const childAccount = findAccount(account.children ?? [], accountId);

    if (childAccount) {
      return childAccount;
    }
  }

  return null;
}

function updateAccountChildren(
  accounts: ChartAccount[],
  parentId: string,
  updateChildren: (children: ChartAccount[]) => ChartAccount[],
): ChartAccount[] {
  return accounts.map((account) => {
    if (account.id === parentId) {
      return {
        ...account,
        children: updateChildren(account.children ?? []),
      };
    }

    return {
      ...account,
      children: account.children
        ? updateAccountChildren(account.children, parentId, updateChildren)
        : account.children,
    };
  });
}

function moveSpecificAccountBefore(
  accounts: ChartAccount[],
  accountToMove: ChartAccount,
  overAccount: ChartAccount,
): ChartAccount[] {
  const targetParentId = overAccount.parentId;
  const updatedAccount = {
    ...accountToMove,
    parentId: targetParentId,
  };
  const accountsWithoutMovedAccount = removeAccount(accounts, accountToMove.id);

  if (!targetParentId) {
    return insertDirectAccountBefore(
      accountsWithoutMovedAccount,
      updatedAccount,
      overAccount.id,
    );
  }

  return updateAccountChildren(
    accountsWithoutMovedAccount,
    targetParentId,
    (children) =>
      insertDirectAccountBefore(children, updatedAccount, overAccount.id),
  );
}

function moveSpecificAccountAfter(
  accounts: ChartAccount[],
  accountToMove: ChartAccount,
  overAccount: ChartAccount,
): ChartAccount[] {
  const targetParentId = overAccount.parentId;
  const updatedAccount = {
    ...accountToMove,
    parentId: targetParentId,
  };
  const accountsWithoutMovedAccount = removeAccount(accounts, accountToMove.id);

  if (!targetParentId) {
    return insertDirectAccountAfter(
      accountsWithoutMovedAccount,
      updatedAccount,
      overAccount.id,
    );
  }

  return updateAccountChildren(
    accountsWithoutMovedAccount,
    targetParentId,
    (children) =>
      insertDirectAccountAfter(children, updatedAccount, overAccount.id),
  );
}

function insertDirectAccountBefore(
  accounts: ChartAccount[],
  accountToInsert: ChartAccount,
  overAccountId: string,
): ChartAccount[] {
  const nextIndex = accounts.findIndex(
    (account) => account.id === overAccountId,
  );

  if (nextIndex < 0) {
    return [...accounts, accountToInsert];
  }

  const nextAccounts = [...accounts];
  nextAccounts.splice(nextIndex, 0, accountToInsert);

  return nextAccounts;
}

function insertDirectAccountAfter(
  accounts: ChartAccount[],
  accountToInsert: ChartAccount,
  overAccountId: string,
): ChartAccount[] {
  const nextIndex = accounts.findIndex(
    (account) => account.id === overAccountId,
  );

  if (nextIndex < 0) {
    return [...accounts, accountToInsert];
  }

  const nextAccounts = [...accounts];
  nextAccounts.splice(nextIndex + 1, 0, accountToInsert);

  return nextAccounts;
}

function reorderDirectAccounts(
  accounts: ChartAccount[],
  accountId: string,
  overAccountId: string,
  placement: ChartsOfAccountsDropPlacement,
): ChartAccount[] {
  const currentIndex = accounts.findIndex(
    (account) => account.id === accountId,
  );
  const nextIndex = accounts.findIndex(
    (account) => account.id === overAccountId,
  );

  if (currentIndex < 0 || nextIndex < 0) {
    return accounts;
  }

  const reorderedAccounts = [...accounts];
  const [accountToMove] = reorderedAccounts.splice(currentIndex, 1);
  const overIndex = reorderedAccounts.findIndex(
    (account) => account.id === overAccountId,
  );

  reorderedAccounts.splice(
    placement === "after" ? overIndex + 1 : overIndex,
    0,
    accountToMove,
  );

  return reorderedAccounts;
}
