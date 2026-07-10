"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { FetchChartAccountsTree } from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsApi";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export function usePartyManagementAccountOptions() {
	const query = useQuery({
		queryKey: ["party-management", "chart-account-options"],
		queryFn: FetchChartAccountsTree,
		staleTime: 5 * 60 * 1000,
	});

	const accountOptions = useMemo(
		() => mapChartAccountsToModuleAccounts(query.data ?? []),
		[query.data],
	);
	const defaultAccounts = useMemo(
		() => getPartyDefaultAccountingAccounts(accountOptions),
		[accountOptions],
	);

	return {
		accountOptions,
		defaultAccounts,
		isLoading: query.isLoading,
	};
}

export type PartyDefaultAccountingAccountIds = {
	customerAdvanceAccount: string;
	defaultPayableAccount: string;
	defaultReceivableAccount: string;
	employeeAdvanceAccount: string;
	employeePayableAccount: string;
	vendorAdvanceAccount: string;
};

function mapChartAccountsToModuleAccounts(
	accounts: ChartAccount[],
): ModuleChartAccount[] {
	return accounts.map((account) => ({
		id: account.id,
		accountNumber: account.accountNumber,
		accountName: account.accountName,
		accountType: mapAccountType(account.accountType),
		statementGroup: account.statementGroup,
		statementSection: account.statementSection,
		normalBalance: account.normalBalance === "CREDIT" ? "Credit" : "Debit",
		accountCategory: account.statementSection,
		description: account.description || account.accountName,
		status: account.status,
		children: account.children
			? mapChartAccountsToModuleAccounts(account.children)
			: undefined,
	}));
}

function getPartyDefaultAccountingAccounts(
	accounts: ModuleChartAccount[],
): PartyDefaultAccountingAccountIds {
	return {
		defaultReceivableAccount:
			getAccountForPurpose(accounts, "customerReceivable")?.id ?? "",
		customerAdvanceAccount:
			getAccountForPurpose(accounts, "customerAdvance")?.id ?? "",
		defaultPayableAccount:
			getAccountForPurpose(accounts, "vendorPayable")?.id ?? "",
		vendorAdvanceAccount:
			getAccountForPurpose(accounts, "vendorAdvance")?.id ?? "",
		employeeAdvanceAccount:
			getAccountForPurpose(accounts, "employeeAdvance")?.id ?? "",
		employeePayableAccount:
			getAccountForPurpose(accounts, "employeePayable")?.id ?? "",
	};
}

type PartyAccountPurpose =
	| "customerAdvance"
	| "customerReceivable"
	| "employeeAdvance"
	| "employeePayable"
	| "vendorAdvance"
	| "vendorPayable";

function getAccountForPurpose(
	accounts: ModuleChartAccount[],
	purpose: PartyAccountPurpose,
) {
	return flattenAccounts(accounts).find((account) => {
		if (account.status !== "Active" || account.children?.length) {
			return false;
		}

		const name = account.accountName.toLowerCase();
		const category = account.accountCategory.toLowerCase();

		switch (purpose) {
			case "customerReceivable":
				return category.includes("receivable") && name.includes("receivable");
			case "customerAdvance":
				return category.includes("liabilit");
			case "vendorPayable":
				return category.includes("payable");
			case "vendorAdvance":
				return category.includes("receivable") && name.includes("supplier");
			case "employeeAdvance":
				return (
					category.includes("receivable") &&
					(name.includes("employee") ||
						(name.includes("advance") && !name.includes("supplier")))
				);
			case "employeePayable":
				return category.includes("liabilit");
		}
	});
}

function flattenAccounts(accounts: ModuleChartAccount[]): ModuleChartAccount[] {
	return accounts.flatMap((account) => [
		account,
		...(account.children ? flattenAccounts(account.children) : []),
	]);
}

function mapAccountType(accountType: ChartAccount["accountType"]) {
	switch (accountType) {
		case "ASSET":
			return "Assets";
		case "LIABILITY":
			return "Liabilities";
		case "EQUITY":
			return "Equity";
		case "REVENUE":
			return "Revenues";
		case "EXPENSE":
			return "Expenses";
	}
}
