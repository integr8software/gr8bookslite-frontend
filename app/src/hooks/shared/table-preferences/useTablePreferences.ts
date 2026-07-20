"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
	ColumnOrderState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import {
	createLegacyUserTablePreferencesStorageKey,
	createTablePreferencesStorageKey,
} from "@/app/src/data/shared/table-preferences/TablePreferencesData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	fetchTablePreference,
	saveTablePreference,
} from "@/app/src/services/shared/table-preferences/TablePreferencesApi";
import type {
	TablePreferences,
	TablePreferencesState,
	UseTablePreferencesOptions,
} from "@/app/src/types/shared/table-preferences/TablePreferencesTypes";

export function useTablePreferences({
	defaultColumnOrder,
	defaultColumnVisibility,
	defaultSorting,
	moduleKey,
	storageKey,
}: UseTablePreferencesOptions): TablePreferencesState {
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const userId = authProfileQuery.data?.user.id;
	const companyId = authProfileQuery.data?.activeCompanyId;
	const preferencesScope = userId && companyId ? `${userId}:${companyId}` : null;
	const defaults = useMemo(
		() => ({
			columnOrder: defaultColumnOrder,
			columnVisibility: defaultColumnVisibility,
			sorting: defaultSorting,
		}),
		[defaultColumnOrder, defaultColumnVisibility, defaultSorting],
	);
	const tablePreferenceQuery = useQuery({
		queryKey: ["table-preferences", moduleKey, userId, companyId],
		queryFn: () => fetchTablePreference(moduleKey),
		enabled: Boolean(preferencesScope),
		retry: false,
	});
	const [loadedPreferencesScope, setLoadedPreferencesScope] = useState<
		string | null
	>(null);
	const [columnOrder, setColumnOrder] =
		useState<ColumnOrderState>(defaultColumnOrder);
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(defaultColumnVisibility);
	const [sorting, setSorting] = useState<SortingState>(defaultSorting);

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
			? normalizeTablePreferences(tablePreferenceQuery.data, defaults)
			: readTablePreferences(storageKey, userId, companyId, defaults);
		queueMicrotask(() => {
			setColumnOrder(preferences.columnOrder);
			setColumnVisibility(preferences.columnVisibility);
			setSorting(preferences.sorting);
			setLoadedPreferencesScope(preferencesScope);
		});
	}, [
		companyId,
		defaults,
		preferencesScope,
		storageKey,
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

		const configuration = normalizeTablePreferences(
			{ columnOrder, columnVisibility, sorting },
			defaults,
		);

		try {
			window.localStorage.setItem(
				createTablePreferencesStorageKey(storageKey, userId, companyId),
				JSON.stringify(configuration),
			);
		} catch {
			// Keep table configuration usable when browser storage is unavailable.
		}

		const saveTimer = window.setTimeout(() => {
			void saveTablePreference(moduleKey, configuration).catch(() => undefined);
		}, 600);

		return () => window.clearTimeout(saveTimer);
	}, [
		columnOrder,
		columnVisibility,
		companyId,
		defaults,
		loadedPreferencesScope,
		moduleKey,
		preferencesScope,
		sorting,
		storageKey,
		userId,
	]);

	return {
		columnOrder,
		columnVisibility,
		sorting,
		setColumnOrder,
		setColumnVisibility,
		setSorting,
	};
}

function readTablePreferences(
	storageKey: string,
	userId: number,
	companyId: number,
	defaults: TablePreferences,
) {
	try {
		const stored =
			window.localStorage.getItem(
				createTablePreferencesStorageKey(storageKey, userId, companyId),
			) ??
			window.localStorage.getItem(
				createLegacyUserTablePreferencesStorageKey(storageKey, userId),
			);

		return stored
			? normalizeTablePreferences(JSON.parse(stored), defaults)
			: defaults;
	} catch {
		return defaults;
	}
}

function normalizeTablePreferences(
	value: unknown,
	defaults: TablePreferences,
): TablePreferences {
	try {
		if (!value || typeof value !== "object") return defaults;

		const parsed = value as Partial<TablePreferences>;
		const knownColumnIds = new Set<string>(defaults.columnOrder);
		const storedOrder = Array.isArray(parsed.columnOrder)
			? parsed.columnOrder.filter(
					(columnId): columnId is string =>
						typeof columnId === "string" && knownColumnIds.has(columnId),
				)
			: [];
		const columnOrder = [
			...storedOrder,
			...defaults.columnOrder.filter(
				(columnId) => !storedOrder.includes(columnId),
			),
		];
		const columnVisibility: VisibilityState = {
			...defaults.columnVisibility,
		};

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
			: defaults.sorting;

		return {
			columnOrder,
			columnVisibility,
			sorting: sorting.length > 0 ? sorting : defaults.sorting,
		};
	} catch {
		return defaults;
	}
}
