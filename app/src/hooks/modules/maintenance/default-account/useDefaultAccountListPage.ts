"use client";

import { useMemo, useState } from "react";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/maintenance/default-account/useDefaultAccount";
import type {
	DefaultAccount,
	DefaultAccountStatusFilter,
	DefaultAccountTypeFilter,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";

export function useDefaultAccountListPage() {
	const defaultAccounts = useDefaultAccountStore((state) => state.defaultAccounts);
	const updateDefaultAccountStatus = useDefaultAccountStore(
		(state) => state.updateDefaultAccountStatus,
	);
	const deleteDefaultAccount = useDefaultAccountStore(
		(state) => state.deleteDefaultAccount,
	);
	const isLoading = useDefaultAccountStore((state) => state.isLoading);
	const isRefreshing = useDefaultAccountStore((state) => state.isRefreshing);
	const lastSyncedAt = useDefaultAccountStore((state) => state.lastSyncedAt);
	const isMutating = useDefaultAccountStore((state) => state.isMutating);
	const permissions = useDefaultAccountStore((state) => state.permissions);
	const statistics = useDefaultAccountStore((state) => state.statistics);
	const refreshDefaultAccounts = useDefaultAccountStore(
		(state) => state.refreshDefaultAccounts,
	);
	const [statusFilter, setStatusFilter] =
		useState<DefaultAccountStatusFilter>("");
	const [typeFilter, setTypeFilter] = useState<DefaultAccountTypeFilter>("");
	const [query, setQuery] = useState("");
	const [pendingStatusAccount, setPendingStatusAccount] =
		useState<DefaultAccount | null>(null);
	const [pendingDeleteAccount, setPendingDeleteAccount] =
		useState<DefaultAccount | null>(null);
	const filteredDefaultAccounts = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return defaultAccounts.filter((account) => {
			if (statusFilter && account.status !== statusFilter) {
				return false;
			}

			if (typeFilter && account.type !== typeFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				account.description,
				account.type,
				account.status,
				...account.generatedAccounts.flatMap((generated) => [
					generated.accountCode,
					generated.accountTitle,
				]),
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [defaultAccounts, query, statusFilter, typeFilter]);

	function resetFilters() {
		setStatusFilter("");
		setTypeFilter("");
		setQuery("");
	}

	function confirmStatusChange() {
		if (!pendingStatusAccount) {
			return;
		}

		void updateDefaultAccountStatus({
			...pendingStatusAccount,
			status:
				pendingStatusAccount.status === "Active" ? "Inactive" : "Active",
		})
			.then(() => setPendingStatusAccount(null))
			.catch(() => undefined);
	}

	function confirmDelete() {
		if (!pendingDeleteAccount) {
			return;
		}

		void deleteDefaultAccount(pendingDeleteAccount)
			.then(() => setPendingDeleteAccount(null))
			.catch(() => undefined);
	}

	return {
		confirmDelete,
		confirmStatusChange,
		defaultAccounts,
		filteredDefaultAccounts,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		pendingDeleteAccount,
		pendingStatusAccount,
		permissions,
		query,
		refreshDefaultAccounts,
		resetFilters,
		setPendingDeleteAccount,
		setPendingStatusAccount,
		setQuery,
		setStatusFilter: setStatusFilter as (value: DefaultAccountStatusFilter) => void,
		setTypeFilter: setTypeFilter as (value: DefaultAccountTypeFilter) => void,
		statistics,
		statusFilter,
		typeFilter,
	};
}
