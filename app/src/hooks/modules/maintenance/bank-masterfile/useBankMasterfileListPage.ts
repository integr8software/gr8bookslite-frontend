"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/maintenance/bank-masterfile/useBankMasterfile";
import type {
	BankMasterfile,
	BankMasterfileStatusFilter,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

export function useBankMasterfileListPage() {
	const {
		addBanks,
		banks,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		permissions,
		refreshBanks,
		statistics,
		updateBankStatus,
	} = useBankMasterfileStore();
	const [statusFilter, setStatusFilter] =
		useState<BankMasterfileStatusFilter>("");
	const [query, setQuery] = useState("");
	const [pendingStatusBank, setPendingStatusBank] =
		useState<BankMasterfile | null>(null);
	const filteredBanks = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

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
				bank.accountTitle,
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

		return updateBankStatus({
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
