import type {
	ChartAccount,
	FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";

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
