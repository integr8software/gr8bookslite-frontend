"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TransactionNumberSetupTableColumns } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import { MainLayoutMockData } from "@/app/src/data/shared/MainLayout/MainShellMockData";
import { formatTransactionNumber } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberGenerationService";
import { formatBranchScopeLabel } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberSetupFormatters";
import type {
	TransactionNumberSetupRecord,
	TransactionNumberSetupTableColumnKey,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import { useTransactionNumberSetupStore } from "./useTransactionNumberSetup";

export function useTransactionNumberSetupListPage() {
	const {
		deleteSetup,
		generateNextNumber,
		isLoading,
		isMutating,
		setups,
		usageLogs,
	} = useTransactionNumberSetupStore();
	const [query, setQuery] = useState("");
	const [scopeFilter, setScopeFilter] = useState<
		"all" | "any" | "branch" | "shared"
	>(
		"any",
	);
	const [pendingInactiveSetup, setPendingInactiveSetup] =
		useState<TransactionNumberSetupRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "moduleName", desc: false },
	]);
	const branchNameById = useMemo(
		() =>
			new Map(
				MainLayoutMockData.branches.map((branch) => [branch.id, branch.name]),
			),
		[],
	);
	const filteredSetups = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return setups.filter((setup) => {
			if (scopeFilter !== "any" && setup.scope !== scopeFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				setup.moduleName,
				setup.moduleCode,
				setup.prefix,
				setup.status,
				setup.description,
				formatBranchScopeLabel(setup, branchNameById),
				formatTransactionNumber(setup),
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [branchNameById, query, scopeFilter, setups]);
	const columns = useMemo<ColumnDef<TransactionNumberSetupRecord>[]>(
		() =>
			TransactionNumberSetupTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createTransactionNumberSetupColumn({
					branchNameById,
					className: column.className,
					header: column.label,
					key: column.key,
				});
			}),
		[branchNameById],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredSetups,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleScopeFilterChange(value: "all" | "any" | "branch" | "shared") {
		setScopeFilter(value);
		table.setPageIndex(0);
	}

	function handleConfirmInactive() {
		if (!pendingInactiveSetup) {
			return;
		}

		deleteSetup(pendingInactiveSetup.id);
		setPendingInactiveSetup(null);
	}

	return {
		activeSetupCount: setups.filter((setup) => setup.status === "Active").length,
		branchNameById,
		generateNextNumber,
		handleConfirmInactive,
		handleQueryChange,
		handleScopeFilterChange,
		isLoading,
		isMutating,
		pendingInactiveSetup,
		query,
		recentUsageLogs: usageLogs.slice(-4).reverse(),
		scopeFilter,
		setPendingInactiveSetup,
		sharedSetupCount: setups.filter((setup) => setup.scope !== "branch").length,
		table,
	};
}

function createTransactionNumberSetupColumn({
	branchNameById,
	className,
	header,
	key,
}: {
	branchNameById: Map<string, string>;
	className: string;
	header: string;
	key: TransactionNumberSetupTableColumnKey;
}): ColumnDef<TransactionNumberSetupRecord> {
	if (key === "branchScope") {
		return {
			id: key,
			header,
			accessorFn: (setup) => formatBranchScopeLabel(setup, branchNameById),
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	if (key === "nextNumber") {
		return {
			id: key,
			header,
			accessorFn: (setup) => formatTransactionNumber(setup),
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	if (key === "scope") {
		return {
			id: key,
			header,
			accessorFn: (setup) => {
				if (setup.scope === "all") {
					return "All branches";
				}

				return setup.scope === "branch" ? "Separate per branch" : "Shared";
			},
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
