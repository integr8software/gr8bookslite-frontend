"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
	AccountSortKey,
	AccountStatus,
	AccountType,
	ChartAccount,
	ChartAccountFormValues,
	FilterValue,
	StatementGroup,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";

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
	const [statementGroupFilter, setStatementGroupFilter] =
		useState<FilterValue<StatementGroup>>("All");
	const [statusFilter, setStatusFilter] =
		useState<FilterValue<AccountStatus>>("All");
	const [sortKey, setSortKey] = useState<AccountSortKey>("accountNumber");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [page, setPage] = useState(1);
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

		return expanded
			.filter(({ account }) => {
				const query = searchQuery.trim().toLowerCase();
				const matchesQuery =
					!query ||
					account.accountName.toLowerCase().includes(query) ||
					account.accountNumber.toLowerCase().includes(query);
				const matchesType =
					accountTypeFilter === "All" ||
					account.accountType === accountTypeFilter;
				const matchesStatement =
					statementGroupFilter === "All" ||
					account.statementGroup === statementGroupFilter;
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
					matchesStatement &&
					matchesStatus &&
					matchesTab
				);
			})
			.sort((left, right) => {
				const leftValue = String(left.account[sortKey]);
				const rightValue = String(right.account[sortKey]);
				const comparison = leftValue.localeCompare(rightValue, undefined, {
					numeric: true,
				});

				return sortDirection === "asc" ? comparison : comparison * -1;
			});
	}, [
		activeTab,
		accountTypeFilter,
		expandedIds,
		flatAccounts,
		searchQuery,
		sortDirection,
		sortKey,
		statementGroupFilter,
		statusFilter,
	]);

	const pageSize = 8;
	const totalPages = Math.max(1, Math.ceil(visibleAccounts.length / pageSize));
	const paginatedAccounts = visibleAccounts.slice(
		(page - 1) * pageSize,
		page * pageSize,
	);

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

	function handleSort(nextSortKey: AccountSortKey) {
		if (sortKey === nextSortKey) {
			setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
			return;
		}

		setSortKey(nextSortKey);
		setSortDirection("asc");
	}

	function changeActiveTab(nextTab: ChartsOfAccountsNav) {
		setActiveTab(nextTab);
		setPage(1);
	}

	function changeSearchQuery(nextQuery: string) {
		setSearchQuery(nextQuery);
		setPage(1);
	}

	function changeAccountTypeFilter(nextFilter: FilterValue<AccountType>) {
		setAccountTypeFilter(nextFilter);
		setPage(1);
	}

	function changeStatementGroupFilter(nextFilter: FilterValue<StatementGroup>) {
		setStatementGroupFilter(nextFilter);
		setPage(1);
	}

	function changeStatusFilter(nextFilter: FilterValue<AccountStatus>) {
		setStatusFilter(nextFilter);
		setPage(1);
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
		page,
		paginatedAccounts,
		searchQuery,
		sortDirection,
		sortKey,
		statementGroupFilter,
		statusFilter,
		totalPages,
		visibleAccounts,
		closeDrawer,
		deleteAccount,
		handleSort,
		openAddDrawer,
		openEditDrawer,
		saveAccount,
		setAccountTypeFilter: changeAccountTypeFilter,
		setActiveTab: changeActiveTab,
		setPage,
		setSearchQuery: changeSearchQuery,
		setStatementGroupFilter: changeStatementGroupFilter,
		setStatusFilter: changeStatusFilter,
		toggleExpanded,
	};
}
