"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	type ColumnOrderState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	WorkspaceCompanyStatusOptions,
	WorkspaceCompanyTableColumns,
	WorkspaceCompanyTypeOptions,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	fetchTablePreference,
	saveTablePreference,
} from "@/app/src/services/shared/table-preferences/TablePreferencesApi";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyPlan,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableColumnKey,
	WorkspaceCompanyTableRecord,
	WorkspaceCompanyType,
	WorkspaceCompanyRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

const WorkspaceCompaniesTablePreferencesStorageKey =
	"gr8booksneo:workspace-companies:table-preferences";
const WorkspaceCompaniesTablePreferencesModuleKey = "workspace:companies";
const DefaultColumnOrder = WorkspaceCompanyTableColumns.map((column) =>
	"key" in column ? column.key : "actions",
);
const DefaultColumnVisibility: VisibilityState = {};
const DefaultSorting: SortingState = [{ id: "name", desc: false }];

type WorkspaceCompaniesTablePreferences = {
	columnOrder: ColumnOrderState;
	columnVisibility: VisibilityState;
	sorting: SortingState;
};

export function useWorkspaceCompaniesTable({
	branches,
	companies,
	planOptions = [],
}: {
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
	planOptions?: readonly WorkspaceCompanyPlan[];
}) {
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const userId = authProfileQuery.data?.user.id;
	const companyId = authProfileQuery.data?.activeCompanyId;
	const preferencesScope = userId && companyId ? `${userId}:${companyId}` : null;
	const tablePreferenceQuery = useQuery({
		queryKey: [
			"table-preferences",
			WorkspaceCompaniesTablePreferencesModuleKey,
			userId,
			companyId,
		],
		queryFn: () =>
			fetchTablePreference(WorkspaceCompaniesTablePreferencesModuleKey),
		enabled: Boolean(preferencesScope),
		retry: false,
	});
	const [loadedPreferencesScope, setLoadedPreferencesScope] = useState<
		string | null
	>(null);
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
	const [columnOrder, setColumnOrder] =
		useState<ColumnOrderState>(DefaultColumnOrder);
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(DefaultColumnVisibility);
	const [sorting, setSorting] = useState<SortingState>(DefaultSorting);

	useEffect(() => {
		if (
			!userId ||
			!companyId ||
			!preferencesScope ||
			!tablePreferenceQuery.isFetched
		) {
			return;
		}

		const preferences = tablePreferenceQuery.data
			? normalizeTablePreferences(tablePreferenceQuery.data)
			: readTablePreferences(userId, companyId);
		setColumnOrder(preferences.columnOrder);
		setColumnVisibility(preferences.columnVisibility);
		setSorting(preferences.sorting);
		setLoadedPreferencesScope(preferencesScope);
	}, [
		companyId,
		preferencesScope,
		tablePreferenceQuery.data,
		tablePreferenceQuery.isFetched,
		userId,
	]);

	useEffect(() => {
		if (
			!userId ||
			!companyId ||
			!preferencesScope ||
			loadedPreferencesScope !== preferencesScope
		) {
			return;
		}

		const configuration = { columnOrder, columnVisibility, sorting };

		try {
			window.localStorage.setItem(
				getTablePreferencesStorageKey(userId, companyId),
				JSON.stringify(configuration),
			);
		} catch {
			// Keep table configuration usable when browser storage is unavailable.
		}

		const saveTimer = window.setTimeout(() => {
			void saveTablePreference(
				WorkspaceCompaniesTablePreferencesModuleKey,
				configuration,
			).catch(() => undefined);
		}, 600);

		return () => window.clearTimeout(saveTimer);
	}, [
		columnOrder,
		columnVisibility,
		companyId,
		loadedPreferencesScope,
		preferencesScope,
		sorting,
		userId,
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
	const availablePlanOptions = useMemo(
		() =>
			Array.from(
				new Set(
					[...planOptions, ...tableData.map((company) => company.plan)].filter(
						Boolean,
					),
				),
			).sort((first, second) => first.localeCompare(second)),
		[planOptions, tableData],
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
		initialState: {
			columnOrder: DefaultColumnOrder,
			columnVisibility: DefaultColumnVisibility,
			sorting: DefaultSorting,
		},
		state: {
			columnOrder,
			columnVisibility,
			pagination,
			sorting,
		},
		onColumnOrderChange: setColumnOrder,
		onColumnVisibilityChange: setColumnVisibility,
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
		filteredRecords: filteredCompanies,
		hasActiveFilters:
			query.trim().length > 0 ||
			planFilter !== "All" ||
			statusFilter !== "All" ||
			typeFilter !== "All",
		planFilter,
		planOptions: availablePlanOptions,
		query,
		records: tableData,
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

function getTablePreferencesStorageKey(userId: number, companyId: number) {
	return `${WorkspaceCompaniesTablePreferencesStorageKey}:user:${userId}:company:${companyId}`;
}

function readTablePreferences(
	userId: number,
	companyId: number,
): WorkspaceCompaniesTablePreferences {
	try {
		const stored =
			window.localStorage.getItem(
				getTablePreferencesStorageKey(userId, companyId),
			) ??
			window.localStorage.getItem(
				`${WorkspaceCompaniesTablePreferencesStorageKey}:user:${userId}`,
			);

		return stored ? normalizeTablePreferences(JSON.parse(stored)) : getDefaults();
	} catch {
		return getDefaults();
	}
}

function getDefaults(): WorkspaceCompaniesTablePreferences {
	return {
		columnOrder: DefaultColumnOrder,
		columnVisibility: DefaultColumnVisibility,
		sorting: DefaultSorting,
	};
}

function normalizeTablePreferences(
	value: unknown,
): WorkspaceCompaniesTablePreferences {
	const defaults = getDefaults();

	try {
		if (!value || typeof value !== "object") return defaults;

		const parsed = value as Partial<WorkspaceCompaniesTablePreferences>;
		const knownColumnIds = new Set<string>(DefaultColumnOrder);
		const storedOrder = Array.isArray(parsed.columnOrder)
			? parsed.columnOrder.filter(
					(columnId): columnId is string =>
						typeof columnId === "string" && knownColumnIds.has(columnId),
				)
			: [];
		const columnOrder = [
			...storedOrder,
			...DefaultColumnOrder.filter((columnId) => !storedOrder.includes(columnId)),
		];
		const columnVisibility = { ...DefaultColumnVisibility };

		if (parsed.columnVisibility && typeof parsed.columnVisibility === "object") {
			for (const [columnId, isVisible] of Object.entries(
				parsed.columnVisibility,
			)) {
				if (knownColumnIds.has(columnId) && typeof isVisible === "boolean") {
					columnVisibility[columnId] = isVisible;
				}
			}
		}

		const sorting = Array.isArray(parsed.sorting)
			? parsed.sorting.filter(
					(sort) =>
						sort &&
						typeof sort.id === "string" &&
						knownColumnIds.has(sort.id) &&
						typeof sort.desc === "boolean",
				)
			: DefaultSorting;

		return {
			columnOrder,
			columnVisibility,
			sorting: sorting.length > 0 ? sorting : DefaultSorting,
		};
	} catch {
		return defaults;
	}
}

function createActionColumn<TRecord>(
	header: string,
	className: string,
): ColumnDef<TRecord> {
	return {
		id: "actions",
		header,
		enableSorting: false,
		meta: { className, label: header },
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
		meta: { className, label: header },
	};
}
