"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnOrderState,
	type PaginationState,
	type SortingState,
	type VisibilityState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { DiscountManagementTableColumns } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { createDiscountManagementTableRecord } from "@/app/src/data/modules/maintenance/financial-management/discount-management/DiscountManagementData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	fetchTablePreference,
	saveTablePreference,
} from "@/app/src/services/shared/table-preferences/TablePreferencesApi";
import type {
	Discount,
	DiscountManagementTableColumnKey,
	DiscountManagementTableRecord,
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";

const DiscountManagementTablePreferencesStorageKey =
	"gr8booksneo:discount-management:table-preferences";
const DiscountManagementTablePreferencesModuleKey =
	"maintenance:discount-management";
const DefaultColumnOrder = DiscountManagementTableColumns.map((column) =>
	"key" in column ? column.key : "actions",
);
const AuditColumnOrder = ["createdBy", "createdAt", "updatedBy", "updatedAt"];
const DefaultColumnVisibility: VisibilityState = {
	description: false,
	discountType: false,
	accountCode: false,
	createdBy: false,
	createdAt: false,
	updatedBy: false,
	updatedAt: false,
};
const DefaultSorting: SortingState = [{ id: "name", desc: false }];

type DiscountManagementTablePreferences = {
	columnOrder: ColumnOrderState;
	columnVisibility: VisibilityState;
	sorting: SortingState;
};

export function useDiscountManagementTable(discounts: Discount[]) {
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const userId = authProfileQuery.data?.user.id;
	const companyId = authProfileQuery.data?.activeCompanyId;
	const preferencesScope = userId && companyId ? `${userId}:${companyId}` : null;
	const tablePreferenceQuery = useQuery({
		queryKey: [
			"table-preferences",
			DiscountManagementTablePreferencesModuleKey,
			userId,
			companyId,
		],
		queryFn: () =>
			fetchTablePreference(DiscountManagementTablePreferencesModuleKey),
		enabled: Boolean(preferencesScope),
		retry: false,
	});
	const [loadedPreferencesScope, setLoadedPreferencesScope] = useState<
		string | null
	>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
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
				DiscountManagementTablePreferencesModuleKey,
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
	const tableData = useMemo<DiscountManagementTableRecord[]>(
		() => discounts.map(createDiscountManagementTableRecord),
		[discounts],
	);
	const columns = useMemo<ColumnDef<DiscountManagementTableRecord>[]>(
		() =>
			DiscountManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createDiscountManagementColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: tableData,
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
}

function getTablePreferencesStorageKey(userId: number, companyId: number) {
	return `${DiscountManagementTablePreferencesStorageKey}:user:${userId}:company:${companyId}`;
}

function readTablePreferences(
	userId: number,
	companyId: number,
): DiscountManagementTablePreferences {
	try {
		const stored =
			window.localStorage.getItem(
				getTablePreferencesStorageKey(userId, companyId),
			) ??
			window.localStorage.getItem(
				`${DiscountManagementTablePreferencesStorageKey}:user:${userId}`,
			);

		return stored ? normalizeTablePreferences(JSON.parse(stored)) : getDefaults();
	} catch {
		return getDefaults();
	}
}

function getDefaults(): DiscountManagementTablePreferences {
	return {
		columnOrder: DefaultColumnOrder,
		columnVisibility: DefaultColumnVisibility,
		sorting: DefaultSorting,
	};
}

function normalizeTablePreferences(
	value: unknown,
): DiscountManagementTablePreferences {
	const defaults = getDefaults();

	try {
		if (!value || typeof value !== "object") return defaults;

		const parsed = value as Partial<DiscountManagementTablePreferences>;
		const knownColumnIds = new Set<string>(DefaultColumnOrder);
		const storedOrder = Array.isArray(parsed.columnOrder)
			? parsed.columnOrder.filter(
					(columnId): columnId is string =>
						typeof columnId === "string" && knownColumnIds.has(columnId),
				)
			: [];
		const fixedTailColumnIds = new Set([...AuditColumnOrder, "actions"]);
		const storedBodyOrder = storedOrder.filter(
			(columnId) => !fixedTailColumnIds.has(columnId),
		);
		const columnOrder = [
			...storedBodyOrder,
			...DefaultColumnOrder.filter(
				(columnId) =>
					!fixedTailColumnIds.has(columnId) &&
					!storedBodyOrder.includes(columnId),
			),
			...AuditColumnOrder,
			"actions",
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

function createDiscountManagementColumn(
	key: DiscountManagementTableColumnKey,
	header: string,
	className: string,
): ColumnDef<DiscountManagementTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className, label: header },
	};
}
