import type {
  ChartAccount,
  FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export function flattenAccounts(
  accounts: ChartAccount[],
  level = 0,
): FlattenedChartAccount[] {
  return accounts.flatMap((account) => [
    { account, level },
    ...flattenAccounts(account.children ?? [], level + 1),
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
    if (isSpecificAccount(overAccount)) {
      return moveSpecificAccountBefore(accounts, accountToMove, overAccount);
    }

    return insertAccount(removeAccount(accounts, accountId), {
      ...accountToMove,
      parentId: overAccount.id,
    });
  }

  if (accountToMove.parentId !== overAccount.parentId) {
    return accounts;
  }

  if (isSpecificAccount(overAccount)) {
    return accounts;
  }

  if (!accountToMove.parentId) {
    return reorderDirectAccounts(accounts, accountId, overAccountId);
  }

  return updateAccountChildren(accounts, accountToMove.parentId, (children) =>
    reorderDirectAccounts(children, accountId, overAccountId),
  );
}

export function isSpecificAccount(account: ChartAccount): boolean {
  return !account.accountNumber.endsWith("000");
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

function reorderDirectAccounts(
  accounts: ChartAccount[],
  accountId: string,
  overAccountId: string,
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

  reorderedAccounts.splice(overIndex, 0, accountToMove);

  return reorderedAccounts;
}
