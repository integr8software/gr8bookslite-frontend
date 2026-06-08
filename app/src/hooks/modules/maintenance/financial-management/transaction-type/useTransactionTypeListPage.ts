"use client";

import { useMemo, useState } from "react";
import { useTransactionTypeStore } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionType";
import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import type { TransactionType } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export function useTransactionTypeListPage() {
	const transactionTypes = useTransactionTypeStore(
		(state) => state.transactionTypes,
	);
	const updateTransactionType = useTransactionTypeStore(
		(state) => state.updateTransactionType,
	);
	const isLoading = useTransactionTypeStore((state) => state.isLoading);
	const isMutating = useTransactionTypeStore((state) => state.isMutating);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"" | (typeof TransactionTypeStatusOptions)[number]
	>("");

	const filteredTransactionTypes = useMemo(() => {
		const normalizedSearchTerm = searchTerm.trim().toLowerCase();

		return transactionTypes.filter((transactionType) => {
			const legacyTransactionType = transactionType as TransactionType & {
				type?: string;
			};
			const matchesSearch =
				!normalizedSearchTerm ||
				[
					transactionType.name ?? legacyTransactionType.type,
					transactionType.description,
					transactionType.moduleName,
					transactionType.accountTitle,
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedSearchTerm);
			const matchesStatus =
				!statusFilter || transactionType.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [searchTerm, statusFilter, transactionTypes]);

	function toggleTransactionTypeStatus(transactionType: TransactionType) {
		updateTransactionType({
			...transactionType,
			status: transactionType.status === "Active" ? "Inactive" : "Active",
		});
	}

	return {
		filteredTransactionTypes,
		isLoading,
		isMutating,
		searchTerm,
		statusFilter,
		transactionTypes,
		setSearchTerm,
		setStatusFilter,
		toggleTransactionTypeStatus,
	};
}

