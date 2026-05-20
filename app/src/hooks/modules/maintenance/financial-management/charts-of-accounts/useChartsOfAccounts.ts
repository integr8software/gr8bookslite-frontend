"use client";

import { useEffect, useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChartsOfAccountsTableColumns,
	ChartsOfAccountsNavs,
	type ChartsOfAccountsNav,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import {
	MockChartAccounts,
	createAccountFromForm,
	flattenAccounts,
	insertAccount,
	removeAccount,
	updateAccountTree,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsData";
import type {
	AccountStatus,
	AccountType,
	ChartAccount,
	ChartAccountFormValues,
	ChartsOfAccountsTableColumnKey,
	FilterValue,
	FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";

const PageSize = 8;

export function useChartsOfAccounts() {
	const [accounts, setAccounts] = useState<ChartAccount[]>(MockChartAccounts);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(
		() => new Set(["assets", "cash-equivalents", "liabilities", "revenue", "expenses"]),
	);
	const [activeTab, setActiveTab] =
		useState<ChartsOfAccountsNav>(ChartsOfAccountsNavs[0]);
	const [searchQuery, setSearchQuery] = useState("");
	const [accountTypeFilter, setAccountTypeFilter] =
		useState<FilterValue<AccountType>>("All");
	const [statusFilter, setStatusFilter] =
		useState<FilterValue<AccountStatus>>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "accountNumber", desc: false },
	]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PageSize,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [drawerAccount, setDrawerAccount] = useState<ChartAccount | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	useEffect(() => {
		const timeout = window.setTimeout(() => setIsLoading(false), 520);
		return () => window.clearTimeout(timeout);
	}, []);

	const flatAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);

	const visibleAccounts = useMemo(() => {
		const expanded = flatAccounts.filter(({ account }) => {
			let parentId = account.parentId;

			while (parentId) {
				if (!expandedIds.has(parentId)) {
					return false;
				}

				parentId =
					flatAccounts.find((item) => item.account.id === parentId)?.account
						.parentId ?? null;
			}

			return true;
		});

		return expanded.filter(({ account }) => {
			const query = searchQuery.trim().toLowerCase();
			const matchesQuery =
				!query ||
				account.accountName.toLowerCase().includes(query) ||
				account.accountNumber.toLowerCase().includes(query);
			const matchesType =
				accountTypeFilter === "All" ||
				account.accountType === accountTypeFilter;
			const matchesStatus =
				statusFilter === "All" || account.status === statusFilter;
			const matchesTab =
				activeTab === "All Accounts" ||
				(activeTab === "Inactive Accounts" &&
					account.status === "Inactive") ||
				account.statementGroup === activeTab;

			return (
				matchesQuery &&
				matchesType &&
				matchesStatus &&
				matchesTab
			);
		});
	}, [
		activeTab,
		accountTypeFilter,
		expandedIds,
		flatAccounts,
		searchQuery,
		statusFilter,
	]);

	const columns = useMemo<ColumnDef<FlattenedChartAccount>[]>(
		() =>
			ChartsOfAccountsTableColumns.map((column) => {
				if (!column.key) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createAccountColumn(
					column.key,
					column.label,
					column.className ?? "",
					column.sortable ?? true,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes table helper functions that React Compiler cannot memoize safely.
	const table = useReactTable({
		data: visibleAccounts,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	function toggleExpanded(accountId: string) {
		setExpandedIds((current) => {
			const next = new Set(current);
			if (next.has(accountId)) {
				next.delete(accountId);
			} else {
				next.add(accountId);
			}
			return next;
		});
	}

	function changeActiveTab(nextTab: ChartsOfAccountsNav) {
		setActiveTab(nextTab);
		table.setPageIndex(0);
	}

	function changeSearchQuery(nextQuery: string) {
		setSearchQuery(nextQuery);
		table.setPageIndex(0);
	}

	function changeAccountTypeFilter(nextFilter: FilterValue<AccountType>) {
		setAccountTypeFilter(nextFilter);
		table.setPageIndex(0);
	}

	function changeStatusFilter(nextFilter: FilterValue<AccountStatus>) {
		setStatusFilter(nextFilter);
		table.setPageIndex(0);
	}

	function openAddDrawer() {
		setDrawerAccount(null);
		setIsDrawerOpen(true);
	}

	function openEditDrawer(account: ChartAccount) {
		setDrawerAccount(account);
		setIsDrawerOpen(true);
	}

	function closeDrawer() {
		setIsDrawerOpen(false);
	}

	function saveAccount(values: ChartAccountFormValues) {
		if (drawerAccount) {
			setAccounts((current) =>
				updateAccountTree(current, drawerAccount.id, {
					...drawerAccount,
					...values,
					bankDetails:
						values.accountCategory === "Cash in Bank"
							? values.bankDetails
							: undefined,
				}),
			);
		} else {
			const newAccount = createAccountFromForm(values);
			setAccounts((current) => insertAccount(current, newAccount));
			setExpandedIds((current) =>
				new Set(values.parentId ? [...current, values.parentId] : current),
			);
		}

		closeDrawer();
	}

	function deleteAccount(accountId: string) {
		setAccounts((current) => removeAccount(current, accountId));
	}

	return {
		accountTypeFilter,
		accounts,
		activeTab,
		drawerAccount,
		expandedIds,
		flatAccounts,
		isDrawerOpen,
		isLoading,
		searchQuery,
		statusFilter,
		table,
		visibleAccounts,
		closeDrawer,
		deleteAccount,
		openAddDrawer,
		openEditDrawer,
		saveAccount,
		setAccountTypeFilter: changeAccountTypeFilter,
		setActiveTab: changeActiveTab,
		setSearchQuery: changeSearchQuery,
		setStatusFilter: changeStatusFilter,
		toggleExpanded,
	};
}

function createAccountColumn(
	id: ChartsOfAccountsTableColumnKey,
	header: string,
	className: string,
	enableSorting = true,
): ColumnDef<FlattenedChartAccount> {
	return {
		id,
		header,
		accessorFn: (row) => row.account[id],
		enableSorting,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
