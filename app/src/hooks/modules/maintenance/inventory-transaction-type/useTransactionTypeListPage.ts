"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useTransactionTypeStore } from "@/app/src/hooks/modules/maintenance/inventory-transaction-type/useTransactionType";
import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/inventory-transaction-type/TransactionTypeConstants";
import type { TransactionType } from "@/app/src/types/modules/maintenance/inventory-transaction-type/TransactionTypeTypes";

export function useTransactionTypeListPage() {
	const transactionTypes = useTransactionTypeStore(
		(state) => state.transactionTypes,
	);
	const updateTransactionType = useTransactionTypeStore(
		(state) => state.updateTransactionType,
	);
	const isLoading = useTransactionTypeStore((state) => state.isLoading);
	const lastSyncedAt = useTransactionTypeStore((state) => state.lastSyncedAt);
	const isMutating = useTransactionTypeStore((state) => state.isMutating);
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
		isLoading,
		isMutating,
		lastSyncedAt,
		moduleFilter,
		moduleFilterOptions,
		pendingStatusTransactionType,
		searchTerm,
		statusFilter,
		transactionTypes,
		setModuleFilter,
		setPendingStatusTransactionType,
		setSearchTerm,
		setStatusFilter,
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

