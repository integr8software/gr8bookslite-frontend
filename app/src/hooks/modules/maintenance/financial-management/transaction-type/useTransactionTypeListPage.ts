"use client";

import { useMemo, useState } from "react";
import { useTransactionTypeStore } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionType";
import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import type { TransactionType } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export function useTransactionTypeListPage() {
	const transactionTypes = useTransactionTypeStore(
		(state) => state.transactionTypes,
	);
	const deleteTransactionType = useTransactionTypeStore(
		(state) => state.deleteTransactionType,
	);
	const isLoading = useTransactionTypeStore((state) => state.isLoading);
	const isMutating = useTransactionTypeStore((state) => state.isMutating);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"" | (typeof TransactionTypeStatusOptions)[number]
	>("");
	const [pendingDeleteTransactionType, setPendingDeleteTransactionType] =
		useState<TransactionType | null>(null);

	const filteredTransactionTypes = useMemo(() => {
		const normalizedSearchTerm = searchTerm.trim().toLowerCase();

		return transactionTypes.filter((transactionType) => {
			const matchesSearch =
				!normalizedSearchTerm ||
				[
					transactionType.type,
					transactionType.description,
					transactionType.accountCode,
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

	function handleConfirmDelete() {
		if (!pendingDeleteTransactionType) {
			return;
		}

		deleteTransactionType(pendingDeleteTransactionType.id);
		setPendingDeleteTransactionType(null);
	}

	return {
		filteredTransactionTypes,
		isLoading,
		isMutating,
		pendingDeleteTransactionType,
		searchTerm,
		statusFilter,
		handleConfirmDelete,
		setPendingDeleteTransactionType,
		setSearchTerm,
		setStatusFilter,
	};
}

