"use client";

import { useMemo, useState } from "react";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/maintenance/bank-masterfile/useBankMasterfile";
import type {
	BankMasterfile,
	BankMasterfileStatusFilter,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

export function useBankMasterfileListPage() {
	const banks = useBankMasterfileStore((state) => state.banks);
	const addBanks = useBankMasterfileStore((state) => state.addBanks);
	const updateBankStatus = useBankMasterfileStore(
		(state) => state.updateBankStatus,
	);
	const isLoading = useBankMasterfileStore((state) => state.isLoading);
	const isRefreshing = useBankMasterfileStore((state) => state.isRefreshing);
	const lastSyncedAt = useBankMasterfileStore((state) => state.lastSyncedAt);
	const isMutating = useBankMasterfileStore((state) => state.isMutating);
	const permissions = useBankMasterfileStore((state) => state.permissions);
	const statistics = useBankMasterfileStore((state) => state.statistics);
	const refreshBanks = useBankMasterfileStore((state) => state.refreshBanks);
	const [statusFilter, setStatusFilter] =
		useState<BankMasterfileStatusFilter>("");
	const [query, setQuery] = useState("");
	const [pendingStatusBank, setPendingStatusBank] =
		useState<BankMasterfile | null>(null);
	const filteredBanks = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return banks.filter((bank) => {
			if (statusFilter && bank.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				bank.bankName,
				bank.branch,
				bank.accountNumber,
				bank.accountName,
				bank.accountCode,
				bank.currencyCode,
				bank.status,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [banks, query, statusFilter]);

	function resetFilters() {
		setStatusFilter("");
		setQuery("");
	}

	function confirmBankStatusChange() {
		if (!pendingStatusBank) {
			return;
		}

		void updateBankStatus({
			...pendingStatusBank,
			status: pendingStatusBank.status === "Active" ? "Inactive" : "Active",
		})
			.then(() => setPendingStatusBank(null))
			.catch(() => undefined);
	}

	return {
		addBanks,
		banks,
		confirmBankStatusChange,
		filteredBanks,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		pendingStatusBank,
		permissions,
		query,
		refreshBanks,
		resetFilters,
		setPendingStatusBank,
		setQuery,
		setStatusFilter: setStatusFilter as (value: BankMasterfileStatusFilter) => void,
		statistics,
		statusFilter,
	};
}
