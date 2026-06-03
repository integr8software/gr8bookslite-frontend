"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import {
	WorkspaceCompanyPlanOptions,
	WorkspaceCompanyStatusOptions,
	WorkspaceCompanyTableColumns,
	WorkspaceCompanyTypeOptions,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyPlan,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableColumnKey,
	WorkspaceCompanyTableRecord,
	WorkspaceCompanyType,
	WorkspaceCompanyRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export function useWorkspaceCompaniesTable({
	branches,
	companies,
}: {
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
}) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [planFilter, setPlanFilterState] = useState<WorkspaceCompanyPlan | "All">(
		"All",
	);
	const [statusFilter, setStatusFilterState] = useState<
		WorkspaceCompanyStatus | "All"
	>("All");
	const [typeFilter, setTypeFilterState] = useState<
		WorkspaceCompanyType | "All"
	>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableData = useMemo<WorkspaceCompanyTableRecord[]>(
		() =>
			companies.map((company) => ({
				...company,
				totalBranches:
					company.totalBranches ??
					branches.filter((branch) => branch.companyId === company.id).length,
				totalUsers: company.totalUsers ?? 0,
			})),
		[branches, companies],
	);
	const filteredCompanies = useMemo(
		() =>
			tableData.filter((company) => {
				const searchable = [
					company.name,
					company.email,
					company.companyType,
					company.plan,
					company.status,
					company.primaryContact,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(query.toLowerCase()) &&
					(planFilter === "All" || company.plan === planFilter) &&
					(statusFilter === "All" || company.status === statusFilter) &&
					(typeFilter === "All" || company.companyType === typeFilter)
				);
			}),
		[planFilter, query, statusFilter, tableData, typeFilter],
	);
	const columns = useMemo<ColumnDef<WorkspaceCompanyTableRecord>[]>(
		() =>
			WorkspaceCompanyTableColumns.map((column) => {
				if (!("key" in column)) {
					return createActionColumn(column.label, column.className);
				}

				return createColumn(column.key, column.label, column.className);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredCompanies,
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

	function resetFilters() {
		setQueryState("");
		setPlanFilterState("All");
		setStatusFilterState("All");
		setTypeFilterState("All");
		table.setPageIndex(0);
	}

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setPlanFilter(value: WorkspaceCompanyPlan | "All") {
		setPlanFilterState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: WorkspaceCompanyStatus | "All") {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	function setTypeFilter(value: WorkspaceCompanyType | "All") {
		setTypeFilterState(value);
		table.setPageIndex(0);
	}

	return {
		planFilter,
		planOptions: WorkspaceCompanyPlanOptions,
		query,
		resetFilters,
		setPlanFilter,
		setQuery,
		setStatusFilter,
		setTypeFilter,
		statusFilter,
		statusOptions: WorkspaceCompanyStatusOptions,
		table,
		typeFilter,
		typeOptions: WorkspaceCompanyTypeOptions,
	};
}

function createActionColumn<TRecord>(
	header: string,
	className: string,
): ColumnDef<TRecord> {
	return {
		id: "actions",
		header,
		enableSorting: false,
		meta: { className },
	};
}

function createColumn(
	key: WorkspaceCompanyTableColumnKey,
	header: string,
	className: string,
): ColumnDef<WorkspaceCompanyTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
