"use client";

import { useMemo } from "react";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type {
	AppAdvancedDropdownOption,
	AppAdvancedDropdownProps,
} from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type ChartAccountDropdownProps = Omit<
	AppAdvancedDropdownProps,
	"options" | "selectionMode" | "value" | "onChange" | "onSelectOption"
> & {
	accounts: ModuleChartAccount[];
	valueField?: "accountName" | "accountNumber" | "id";
	value: string;
	onChange: (accountId: string) => void;
	onSelectAccount?: (account: ModuleChartAccount | null) => void;
};

export function ChartAccountDropdown({
	accounts,
	emptyMessage = "No chart accounts found.",
	placeholder = "--Select Account--",
	searchPlaceholder = "Search account name or code",
	showSelectedDetails = false,
	value,
	valueField = "accountNumber",
	onChange,
	onSelectAccount,
	...dropdownProps
}: ChartAccountDropdownProps) {
	const flatAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);
	const accountByValue = useMemo(
		() =>
			new Map(
				flatAccounts.flatMap((account) => [
					[account.id, account],
					[account.accountNumber, account],
					[account.accountName, account],
				]),
			),
		[flatAccounts],
	);
	const accountOptions = useMemo(
		() => createAccountOptions(flatAccounts, valueField),
		[flatAccounts, valueField],
	);
	const selectedAccount = accountByValue.get(value);
	const normalizedValue = selectedAccount?.[valueField] ?? value;

	function handleChange(nextValue: string | string[]) {
		const accountValue = Array.isArray(nextValue)
			? nextValue[0] ?? ""
			: nextValue;
		const nextAccount = accountByValue.get(accountValue) ?? null;

		onChange(nextAccount?.[valueField] ?? accountValue);
		onSelectAccount?.(nextAccount);
	}

	return (
		<AppAdvancedDropdown
			{...dropdownProps}
			emptyMessage={emptyMessage}
			options={accountOptions}
			placeholder={placeholder}
			searchPlaceholder={searchPlaceholder}
			showSelectedDetails={showSelectedDetails}
			value={normalizedValue}
			onChange={handleChange}
		/>
	);
}

function createAccountOptions(
	accounts: ModuleChartAccount[],
	valueField: "accountName" | "accountNumber" | "id",
): AppAdvancedDropdownOption[] {
	return accounts
		.filter(isAccountSelectable)
		.map((account) => {
			const description =
				account.description.trim().toLowerCase() ===
				account.accountName.trim().toLowerCase()
					? ""
					: account.description || account.accountType;

			return {
				description,
				label: account.accountNumber,
				name: account.accountName,
				value: account[valueField],
			};
		});
}

function flattenAccounts(accounts: ModuleChartAccount[]): ModuleChartAccount[] {
	return accounts.flatMap((account) => [
		account,
		...(account.children ? flattenAccounts(account.children) : []),
	]);
}

function isAccountSelectable(account: ModuleChartAccount) {
	return (
		account.status === "Active" &&
		!account.children?.length &&
		account.accountCategory !== "Header"
	);
}
