"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
	ItemCategoryClassificationTableColumns,
	ItemCategoryHref,
	ItemCategorySystemDefaultAccountingSetup,
	ItemCategoryUnassignedRecordId,
} from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import {
	ItemCategoryClassificationInitialFormValues,
	createItemCategoryClassificationFormValues,
	createItemCategoryClassificationRecord,
	getItemCategoryAccountingSetupMode,
	normalizeItemCategoryAccountingSetup,
	updateItemCategoryClassificationRecord,
} from "@/app/src/data/modules/maintenance/item-management/ItemManagementData";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/item-management/useItemManagement";
import type {
	ItemActionMode,
	ItemCategoryAccountingSetup,
	ItemCategoryAccountingSetupMode,
	ItemCategoryAccountingSetupStatus,
	ItemCategoryClassificationFormErrors,
	ItemCategoryClassificationFormValues,
	ItemCategoryClassificationTableColumnKey,
	ItemCategoryClassificationTableRowData,
	ItemRecord,
	ItemSetupKind,
	ItemSetupRecord,
	ItemStatus,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { validateItemCategoryClassificationForm } from "@/app/src/validations/modules/maintenance/item-management/ItemManagementValidation";

const AllStatusesFilter = "All";
const AllAccountingStatusesFilter = "All";

type ItemCategoryAccountingStatusFilter =
	| typeof AllAccountingStatusesFilter
	| ItemCategoryAccountingSetupStatus;

type ItemCategoryStatusFilter = typeof AllStatusesFilter | ItemStatus;

export type ItemCategoryDrawerState = {
	mode: ItemActionMode;
	row?: ItemCategoryClassificationTableRowData;
} | null;

type ClassificationRecordRef = {
	kind: ItemSetupKind;
	record: ItemSetupRecord;
	parentId?: string;
};

export function useItemCategoryClassificationPage() {
	const store = useItemManagementStore();
	const setupRecords = useSetupRecordsByKind(store.getSetupRecords);
	const allRecords = useAllSetupRecords(setupRecords);
	const [accountingFilter, setAccountingFilterState] =
		useState<ItemCategoryAccountingStatusFilter>(AllAccountingStatusesFilter);
	const [drawerState, setDrawerState] = useState<ItemCategoryDrawerState>(null);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(
		() => new Set(allRecords.map((record) => record.id)),
	);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pendingStatusRow, setPendingStatusRow] =
		useState<ItemCategoryClassificationTableRowData | null>(null);
	const [query, setQuery] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);
	const [statusFilter, setStatusFilterState] =
		useState<ItemCategoryStatusFilter>(AllStatusesFilter);
	const tableRows = useMemo(
		() =>
			createItemCategoryClassificationRows({
				expandedIds,
				items: store.items,
				setupRecords,
			}),
		[expandedIds, setupRecords, store.items],
	);
	const filteredTableRows = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return tableRows.filter((row) => {
			if (
				statusFilter !== AllStatusesFilter &&
				row.record.status !== statusFilter
			) {
				return false;
			}

			if (
				accountingFilter !== AllAccountingStatusesFilter &&
				row.accountingSetupStatus !== accountingFilter
			) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				row.record.name,
				row.record.description,
				row.recordKindLabel,
				row.parentName,
				row.accountingSetupStatus,
				row.record.status,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [accountingFilter, query, statusFilter, tableRows]);
	const columns = useMemo<ColumnDef<ItemCategoryClassificationTableRowData>[]>(
		() =>
			ItemCategoryClassificationTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createItemCategoryClassificationColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredTableRows,
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

	function handleAccountingFilterChange(value: string) {
		setAccountingFilterState(value as ItemCategoryAccountingStatusFilter);
		table.setPageIndex(0);
	}

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleStatusFilterChange(value: string) {
		setStatusFilterState(value as ItemCategoryStatusFilter);
		table.setPageIndex(0);
	}

	function handleConfirmStatusChange() {
		if (!pendingStatusRow || pendingStatusRow.isVirtual) {
			return;
		}

		store.updateSetupRecord(pendingStatusRow.recordKind, {
			...pendingStatusRow.record,
			status:
				pendingStatusRow.record.status === "Active" ? "Inactive" : "Active",
		});
		setPendingStatusRow(null);
	}

	function resetFilters() {
		setAccountingFilterState(AllAccountingStatusesFilter);
		setQuery("");
		setStatusFilterState(AllStatusesFilter);
		table.setPageIndex(0);
	}

	function toggleExpanded(recordId: string) {
		setExpandedIds((current) => {
			const next = new Set(current);

			if (next.has(recordId)) {
				next.delete(recordId);
			} else {
				next.add(recordId);
			}

			return next;
		});
	}

	const metrics = useMemo(() => {
		const realRows = tableRows.filter((row) => !row.isVirtual);

		return {
			activeCount: realRows.filter((row) => row.record.status === "Active")
				.length,
			inheritedCount: realRows.filter(
				(row) => row.accountingSetupStatus === "Inherited",
			).length,
			overrideCount: realRows.filter(
				(row) => row.accountingSetupStatus === "Override",
			).length,
			totalCount: realRows.length,
		};
	}, [tableRows]);

	return {
		accountingFilter,
		drawerState,
		expandedIds,
		handleAccountingFilterChange,
		handleConfirmStatusChange,
		handleQueryChange,
		handleStatusFilterChange,
		isLoading: store.isLoading,
		isMutating: store.isMutating,
		metrics,
		pendingStatusRow,
		query,
		resetFilters,
		setDrawerState,
		setPendingStatusRow,
		statusFilter,
		table,
		toggleExpanded,
	};
}

export function useItemCategoryClassificationFormPage({
	mode: providedMode,
	onSaved,
	row,
}: {
	mode?: ItemActionMode;
	onSaved?: () => void;
	row?: ItemCategoryClassificationTableRowData;
} = {}) {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const store = useItemManagementStore();
	const setupRecords = useSetupRecordsByKind(store.getSetupRecords);
	const allRecords = useAllSetupRecords(setupRecords);
	const mode = providedMode ?? getActionMode(pathname);
	const existingRef = useMemo(
		() =>
			row
				? {
						kind: row.recordKind,
						parentId: row.parentId,
						record: row.record,
					}
				: findClassificationRecordRef(setupRecords, params.recordId),
		[params.recordId, row, setupRecords],
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<ItemCategoryClassificationFormValues>(
		() =>
			existingRef
				? {
						...createItemCategoryClassificationFormValues(
							existingRef.record,
						),
						parentId:
							existingRef.parentId &&
							existingRef.parentId !== ItemCategoryUnassignedRecordId
								? existingRef.parentId
								: existingRef.record.parentIds?.[0] ?? "",
					}
				: ItemCategoryClassificationInitialFormValues,
	);
	const [errors, setErrors] =
		useState<ItemCategoryClassificationFormErrors>({});
	const parentOptions = useMemo(
		() =>
			createParentOptions({
				currentRecordId: existingRef?.record.id,
				items: store.items,
				setupRecords,
			}),
		[existingRef?.record.id, setupRecords, store.items],
	);

	function updateField<
		TField extends keyof ItemCategoryClassificationFormValues,
	>(
		field: TField,
		value: ItemCategoryClassificationFormValues[TField],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const { name, type } = event.target;
		const value =
			type === "checkbox"
				? (event.target as HTMLInputElement).checked
				: event.target.value;

		updateField(
			name as keyof ItemCategoryClassificationFormValues,
			value as never,
		);
	}

	function handleAccountingFieldChange(
		field: keyof ItemCategoryAccountingSetup,
		value: string,
	) {
		if (isReadonly || values.accountingSetupMode !== "own") {
			return;
		}

		setValues((current) => ({
			...current,
			accountingSetup: {
				...current.accountingSetup,
				[field]: value,
			},
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleAccountingModeChange(
		accountingSetupMode: ItemCategoryAccountingSetupMode,
	) {
		updateField("accountingSetupMode", accountingSetupMode);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateItemCategoryClassificationForm(values, {
			recordId: existingRef?.record.id,
			records: allRecords,
		});

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted category fields.");
			return;
		}

		if (mode === "edit") {
			if (!existingRef) {
				toast.error("Could not find the category to update.");
				return;
			}

			store.updateSetupRecord(
				existingRef.kind,
				updateItemCategoryClassificationRecord(existingRef.record, values),
			);
			onSaved?.();
			if (!onSaved) {
				router.push(`${ItemCategoryHref}/view/${existingRef.record.id}`);
			}
			return;
		}

		if (mode === "view") {
			return;
		}

		store.addSetupRecord("category", createItemCategoryClassificationRecord(values));
		onSaved?.();
		if (!onSaved) {
			router.push(ItemCategoryHref);
		}
	}

	return {
		errors,
		existingRecord: existingRef?.record,
		handleAccountingFieldChange,
		handleAccountingModeChange,
		handleInputChange,
		handleSubmit,
		isMutating: store.isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		parentOptions,
		values,
	};
}

function useSetupRecordsByKind(
	getSetupRecords: (kind: ItemSetupKind) => ItemSetupRecord[],
) {
	const category = getSetupRecords("category");
	const subcategory = getSetupRecords("subcategory");
	const type = getSetupRecords("type");
	const subtype = getSetupRecords("subtype");

	return useMemo(
		() => ({ category, subcategory, type, subtype }),
		[category, subcategory, subtype, type],
	);
}

function useAllSetupRecords(
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>,
) {
	return useMemo(
		() => [
			...setupRecords.category,
			...setupRecords.subcategory,
			...setupRecords.type,
			...setupRecords.subtype,
		],
		[setupRecords],
	);
}

function createItemCategoryClassificationColumn(
	key: ItemCategoryClassificationTableColumnKey,
	header: string,
	className: string,
): ColumnDef<ItemCategoryClassificationTableRowData> {
	if (key === "name") {
		return {
			id: key,
			accessorFn: (row) => row.record.name,
			header,
			meta: { className },
		};
	}

	if (key === "status") {
		return {
			id: key,
			accessorFn: (row) => row.record.status,
			header,
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header,
		meta: { className },
	};
}

function createItemCategoryClassificationRows({
	expandedIds,
	items,
	setupRecords,
}: {
	expandedIds: Set<string>;
	items: ItemRecord[];
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
}) {
	const typeParentIdsByTypeId = inferTypeParentIdsByTypeId(
		setupRecords,
		items,
	);
	const rootCategories = setupRecords.category.filter(
		(record) => (record.parentIds ?? []).length === 0,
	);
	const unassignedChildren = getUnassignedChildren({
		setupRecords,
		typeParentIdsByTypeId,
	});
	const rootRows = rootCategories.flatMap((record) =>
		createRowsForRecord({
			expandedIds,
			items,
			kind: "category",
			level: 0,
			parentAccountingSourceName: undefined,
			parentEffectiveAccountingSetup: undefined,
			parentId: "",
			parentName: "---",
			pathIds: [],
			record,
			setupRecords,
			typeParentIdsByTypeId,
		}),
	);

	if (unassignedChildren.length === 0) {
		return rootRows;
	}

	const unassignedRecord = createUnassignedRecord();

	return [
		...rootRows,
		...createRowsForRecord({
			expandedIds,
			items,
			kind: "category",
			level: 0,
			parentAccountingSourceName: undefined,
			parentEffectiveAccountingSetup: undefined,
			parentId: "",
			parentName: "---",
			pathIds: [],
			record: unassignedRecord,
			setupRecords,
			typeParentIdsByTypeId,
			isVirtual: true,
		}),
	];
}

function createRowsForRecord({
	expandedIds,
	isVirtual = false,
	items,
	kind,
	level,
	parentAccountingSourceName,
	parentEffectiveAccountingSetup,
	parentId,
	parentName,
	pathIds,
	record,
	setupRecords,
	typeParentIdsByTypeId,
}: {
	expandedIds: Set<string>;
	isVirtual?: boolean;
	items: ItemRecord[];
	kind: ItemSetupKind;
	level: number;
	parentAccountingSourceName?: string;
	parentEffectiveAccountingSetup?: ItemCategoryAccountingSetup;
	parentId: string;
	parentName: string;
	pathIds: string[];
	record: ItemSetupRecord;
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
	typeParentIdsByTypeId: Map<string, string[]>;
}): ItemCategoryClassificationTableRowData[] {
	if (pathIds.includes(record.id)) {
		return [];
	}

	const accountingSetupMode = getItemCategoryAccountingSetupMode(record);
	const ownAccountingSetup = accountingSetupMode === "own"
		? normalizeItemCategoryAccountingSetup(record.accountingSetup)
		: undefined;
	const accountingSetupStatus = getAccountingSetupStatus({
		accountingSetupMode,
		hasParentAccountingSetup: Boolean(parentEffectiveAccountingSetup),
	});
	const effectiveAccountingSetup =
		accountingSetupMode === "notSet"
			? undefined
			: (ownAccountingSetup ??
				parentEffectiveAccountingSetup ??
				ItemCategorySystemDefaultAccountingSetup);
	const inheritedAccountingSourceName =
		accountingSetupMode === "inherit"
			? parentAccountingSourceName ?? "System Defaults"
			: undefined;
	const row: ItemCategoryClassificationTableRowData = {
		id: `${kind}-${record.id}-${parentId || "root"}-${level}`,
		accountingSetupStatus,
		effectiveAccountingSetup,
		hasChildren: false,
		inheritedAccountingSourceName,
		isVirtual,
		level,
		parentId,
		parentName,
		record,
		recordKind: kind,
		recordKindLabel: getRecordKindLabel(kind, isVirtual),
		usedByItemCount: isVirtual ? 0 : getUsedByItemCount(kind, record, items),
	};
	const children = createChildRecords({
		parentKind: kind,
		parentRecord: record,
		setupRecords,
		typeParentIdsByTypeId,
	});

	row.hasChildren = children.length > 0;

	if (!row.hasChildren || !expandedIds.has(record.id)) {
		return [row];
	}

	return [
		row,
		...children.flatMap((child) =>
			createRowsForRecord({
				expandedIds,
				items,
				kind: child.kind,
				level: level + 1,
				parentAccountingSourceName: ownAccountingSetup
					? record.name
					: inheritedAccountingSourceName,
				parentEffectiveAccountingSetup: effectiveAccountingSetup,
				parentId: record.id,
				parentName: record.name,
				pathIds: [...pathIds, record.id],
				record: child.record,
				setupRecords,
				typeParentIdsByTypeId,
			}),
		),
	];
}

function createChildRecords({
	parentKind,
	parentRecord,
	setupRecords,
	typeParentIdsByTypeId,
}: {
	parentKind: ItemSetupKind;
	parentRecord: ItemSetupRecord;
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
	typeParentIdsByTypeId: Map<string, string[]>;
}) {
	const children: Array<{ kind: ItemSetupKind; record: ItemSetupRecord }> = [];
	const isUnassignedParent = parentRecord.id === ItemCategoryUnassignedRecordId;

	if (!isUnassignedParent) {
		children.push(
			...setupRecords.category
				.filter((record) => (record.parentIds ?? []).includes(parentRecord.id))
				.map((record) => ({ kind: "category" as const, record })),
		);
	}

	if (parentKind === "category") {
		children.push(
			...setupRecords.subcategory
				.filter((record) =>
					isUnassignedParent
						? (record.parentIds ?? []).length === 0
						: (record.parentIds ?? []).includes(parentRecord.id),
				)
				.map((record) => ({ kind: "subcategory" as const, record })),
		);
		children.push(
			...setupRecords.type
				.filter((record) => {
					const parentIds = getTypeParentIds(record, typeParentIdsByTypeId);

					return isUnassignedParent
						? parentIds.length === 0
						: parentIds.includes(parentRecord.id);
				})
				.map((record) => ({ kind: "type" as const, record })),
		);
	}

	if (parentKind === "type") {
		children.push(
			...setupRecords.subtype
				.filter((record) => {
					const parentIds = record.parentIds ?? [];

					return parentIds.length === 0 || parentIds.includes(parentRecord.id);
				})
				.map((record) => ({ kind: "subtype" as const, record })),
		);
	}

	return children;
}

function createParentOptions({
	currentRecordId,
	items,
	setupRecords,
}: {
	currentRecordId?: string;
	items: ItemRecord[];
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
}) {
	const rows = createItemCategoryClassificationRows({
		expandedIds: new Set([
			...setupRecords.category,
			...setupRecords.subcategory,
			...setupRecords.type,
			...setupRecords.subtype,
			createUnassignedRecord(),
		].map((record) => record.id)),
		items,
		setupRecords,
	});
	const blockedIds = new Set<string>(currentRecordId ? [currentRecordId] : []);

	if (currentRecordId) {
		rows
			.filter((row) => row.parentId === currentRecordId)
			.forEach((row) => blockedIds.add(row.record.id));
	}

	const seenIds = new Set<string>();

	return rows
		.filter((row) => !row.isVirtual)
		.filter((row) => row.record.status === "Active")
		.filter((row) => row.record.allowSubCategory !== false)
		.filter((row) => !blockedIds.has(row.record.id))
		.filter((row) => {
			if (seenIds.has(row.record.id)) {
				return false;
			}

			seenIds.add(row.record.id);
			return true;
		})
		.map((row) => ({
			id: row.record.id,
			label: `${"  ".repeat(row.level)}${row.record.name}`,
			kindLabel: row.recordKindLabel,
		}));
}

function inferTypeParentIdsByTypeId(
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>,
	items: ItemRecord[],
) {
	const categoryIdByName = new Map(
		setupRecords.category.map((record) => [record.name, record.id]),
	);
	const inferred = new Map<string, Set<string>>();

	setupRecords.type.forEach((typeRecord) => {
		inferred.set(typeRecord.id, new Set(typeRecord.parentIds ?? []));
	});

	items.forEach((item) => {
		const typeRecord = setupRecords.type.find(
			(record) => record.name === item.type,
		);
		const categoryId = categoryIdByName.get(item.category);

		if (!typeRecord || !categoryId) {
			return;
		}

		const parentIds = inferred.get(typeRecord.id) ?? new Set<string>();

		parentIds.add(categoryId);
		inferred.set(typeRecord.id, parentIds);
	});

	return new Map(
		Array.from(inferred.entries()).map(([typeId, parentIds]) => [
			typeId,
			Array.from(parentIds),
		]),
	);
}

function getTypeParentIds(
	record: ItemSetupRecord,
	typeParentIdsByTypeId: Map<string, string[]>,
) {
	const explicitParentIds = record.parentIds ?? [];

	return explicitParentIds.length > 0
		? explicitParentIds
		: typeParentIdsByTypeId.get(record.id) ?? [];
}

function getUnassignedChildren({
	setupRecords,
	typeParentIdsByTypeId,
}: {
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
	typeParentIdsByTypeId: Map<string, string[]>;
}) {
	return [
		...setupRecords.subcategory.filter(
			(record) => (record.parentIds ?? []).length === 0,
		),
		...setupRecords.type.filter(
			(record) => getTypeParentIds(record, typeParentIdsByTypeId).length === 0,
		),
	];
}

function getAccountingSetupStatus({
	accountingSetupMode,
	hasParentAccountingSetup,
}: {
	accountingSetupMode: ItemCategoryAccountingSetupMode;
	hasParentAccountingSetup: boolean;
}): ItemCategoryAccountingSetupStatus {
	if (accountingSetupMode === "notSet") {
		return "Not Set";
	}

	if (accountingSetupMode === "inherit") {
		return "Inherited";
	}

	if (hasParentAccountingSetup) {
		return "Override";
	}

	return "Configured";
}

function getUsedByItemCount(
	kind: ItemSetupKind,
	record: ItemSetupRecord,
	items: ItemRecord[],
) {
	return items.filter((item) => {
		if (kind === "category") {
			return item.category === record.name;
		}

		if (kind === "subcategory") {
			return item.subcategory === record.name;
		}

		if (kind === "type") {
			return item.type === record.name;
		}

		return item.subtype === record.name;
	}).length;
}

function getRecordKindLabel(kind: ItemSetupKind, isVirtual?: boolean) {
	if (isVirtual) {
		return "Unassigned";
	}

	if (kind === "type") {
		return "Item Type";
	}

	if (kind === "subtype") {
		return "Item Subtype";
	}

	if (kind === "subcategory") {
		return "Sub Category";
	}

	return "Item Category";
}

function createUnassignedRecord(): ItemSetupRecord {
	return {
		id: ItemCategoryUnassignedRecordId,
		code: "UNASSIGNED",
		name: "Unassigned",
		description: "Records waiting for category assignment.",
		allowSubCategory: true,
		status: "Active",
	};
}

function findClassificationRecordRef(
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>,
	recordId?: string,
): ClassificationRecordRef | undefined {
	if (!recordId) {
		return undefined;
	}

	const kinds: ItemSetupKind[] = ["category", "subcategory", "type", "subtype"];

	for (const kind of kinds) {
		const record = setupRecords[kind].find(
			(currentRecord) => currentRecord.id === recordId,
		);

		if (record) {
			return { kind, record };
		}
	}

	return undefined;
}

function getActionMode(pathname: string): ItemActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
