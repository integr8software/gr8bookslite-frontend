"use client";

import { useMemo } from "react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
	type AppAdvancedDropdownProps,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type ChartAccountDropdownProps = Omit<
	AppAdvancedDropdownProps,
	"options" | "selectionMode" | "value" | "onChange" | "onSelectOption"
> & {
	accounts: ChartAccount[];
	value: string;
	onChange: (accountId: string) => void;
	onSelectAccount?: (account: ChartAccount | null) => void;
};

export function ChartAccountDropdown({
	accounts,
	emptyMessage = "No chart accounts found.",
	placeholder = "Select account",
	searchPlaceholder = "Search account name or code",
	showSelectedDetails = false,
	value,
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
				]),
			),
		[flatAccounts],
	);
	const accountOptions = useMemo(
		() => createAccountOptions(flatAccounts),
		[flatAccounts],
	);
	const selectedAccount = accountByValue.get(value);
	const normalizedValue = selectedAccount?.accountNumber ?? value;

	function handleChange(nextValue: string | string[]) {
		const accountValue = Array.isArray(nextValue)
			? nextValue[0] ?? ""
			: nextValue;
		const nextAccount = accountByValue.get(accountValue) ?? null;

		onChange(nextAccount?.accountNumber ?? accountValue);
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
	accounts: ChartAccount[],
): AppAdvancedDropdownOption[] {
	return accounts.filter(isAccountSelectable).map((account) => ({
		description: account.description || account.accountType,
		label: account.accountNumber,
		name: account.accountName,
		value: account.accountNumber,
	}));
}

function flattenAccounts(accounts: ChartAccount[]): ChartAccount[] {
	return accounts.flatMap((account) => [
		account,
		...(account.children ? flattenAccounts(account.children) : []),
	]);
}

function isAccountSelectable(account: ChartAccount) {
	return (
		account.status === "Active" &&
		!account.children?.length &&
		account.accountCategory !== "Header"
	);
}
