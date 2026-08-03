"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useTransactionTypeStore } from "@/app/src/hooks/modules/item-management/inventory-transaction-type/useTransactionType";
import { useTransactionTypeTable } from "@/app/src/hooks/modules/item-management/inventory-transaction-type/useTransactionTypeTable";
import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import type { TransactionType } from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";

export function useTransactionTypeListPage() {
	const {
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		refreshTransactionTypes,
		transactionTypes,
		updateTransactionType,
	} = useTransactionTypeStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"" | (typeof TransactionTypeStatusOptions)[number]
	>("Active");
	const [moduleFilter, setModuleFilter] = useState("");
	const [pendingStatusTransactionType, setPendingStatusTransactionType] =
		useState<TransactionType | null>(null);

	const filteredTransactionTypes = useMemo(() => {
		const normalizedSearchTerm = normalizeLowercaseText(searchTerm);

		return transactionTypes.filter((transactionType) => {
			const legacyTransactionType = transactionType as TransactionType & {
				type?: string;
			};
			const matchesSearch =
				!normalizedSearchTerm ||
				[
					transactionType.name ?? legacyTransactionType.type,
					transactionType.description,
					transactionType.moduleNames?.join(" ") ??
						transactionType.moduleName,
					transactionType.accountTitle,
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedSearchTerm);
			const matchesStatus =
				!statusFilter || transactionType.status === statusFilter;
			const matchesModule =
				!moduleFilter ||
				getTransactionTypeModuleValues(transactionType).includes(
					moduleFilter,
				);

			return matchesSearch && matchesStatus && matchesModule;
		});
	}, [moduleFilter, searchTerm, statusFilter, transactionTypes]);

	const moduleFilterOptions = useMemo(
		() => createModuleFilterOptions(transactionTypes),
		[transactionTypes],
	);
	const table = useTransactionTypeTable(filteredTransactionTypes);
	const hasActiveFilters =
		Boolean(searchTerm) || Boolean(moduleFilter) || Boolean(statusFilter);

	function confirmTransactionTypeStatusChange() {
		if (!pendingStatusTransactionType) {
			return;
		}

		updateTransactionType({
			...pendingStatusTransactionType,
			status:
				pendingStatusTransactionType.status === "Active"
					? "Inactive"
					: "Active",
		});
		setPendingStatusTransactionType(null);
	}

	return {
		confirmTransactionTypeStatusChange,
		filteredTransactionTypes,
		hasActiveFilters,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		moduleFilter,
		moduleFilterOptions,
		pendingStatusTransactionType,
		refreshTransactionTypes,
		searchTerm,
		statusFilter,
		table,
		transactionTypes,
		setModuleFilter: (value: string) => {
			setModuleFilter(value);
			table.setPageIndex(0);
		},
		setPendingStatusTransactionType,
		setSearchTerm: (value: string) => {
			setSearchTerm(value);
			table.setPageIndex(0);
		},
		setStatusFilter: (
			value: "" | (typeof TransactionTypeStatusOptions)[number],
		) => {
			setStatusFilter(value);
			table.setPageIndex(0);
		},
	};
}

function createModuleFilterOptions(transactionTypes: TransactionType[]) {
	const moduleOptions = new Map<string, string>();

	transactionTypes.forEach((transactionType) => {
		const moduleIds = transactionType.moduleIds ?? [];
		const moduleNames = transactionType.moduleNames ?? [];

		if (moduleIds.length > 0) {
			moduleIds.forEach((moduleId, index) => {
				moduleOptions.set(
					moduleId,
					moduleNames[index] ?? moduleId,
				);
			});
			return;
		}

		if (transactionType.moduleName) {
			moduleOptions.set(
				transactionType.moduleId ?? transactionType.moduleName,
				transactionType.moduleName,
			);
		}
	});

	return Array.from(moduleOptions, ([value, label]) => ({
		label,
		value,
	})).sort((first, second) => first.label.localeCompare(second.label));
}

function getTransactionTypeModuleValues(transactionType: TransactionType) {
	return [
		...(transactionType.moduleIds ?? []),
		...(transactionType.moduleNames ?? []),
		transactionType.moduleId,
		transactionType.moduleName,
	].filter(Boolean);
}

