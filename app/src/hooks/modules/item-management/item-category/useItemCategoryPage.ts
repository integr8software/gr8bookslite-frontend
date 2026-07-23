"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import {
	ItemCategoryInitialFormValues,
	createAllItemCategorySetupRecords,
	createItemCategoryFormValues,
	createItemCategoryGeneratedAccountingSetup,
	createItemCategoryParentOptions,
	createItemCategoryRows,
	getItemCategoryAccountingSetupMode,
	normalizeRootItemCategoryAccountingSetup,
} from "@/app/src/data/modules/item-management/item-category/ItemCategoryData";
import { useItemCategoryStore } from "@/app/src/hooks/modules/item-management/item-category/useItemCategory";
import type {
	ItemActionMode,
	ItemCategoryAccountingSetupMode,
	ItemCategoryAccountingSetupStatusFilter,
	ItemCategoryFormErrors,
	ItemCategoryFormValues,
	ItemBehavior,
	ItemStatus,
	ItemCategoryStatusFilter,
	ItemCategoryTableRowData,
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/item-management/item-category/ItemCategoryTypes";
import { validateItemCategoryForm } from "@/app/src/validations/modules/item-management/item-category/ItemCategoryValidation";

const AllStatusesFilter = "";
const AllAccountingStatusesFilter = "";
const DefaultStatusFilter = "Active";

export type ItemCategoryDrawerState = {
	mode: ItemActionMode;
	row?: ItemCategoryTableRowData;
} | null;

export function useItemCategoryPage() {
	const store = useItemCategoryStore();
	const setupRecords = useSetupRecordsByKind(store.records);
	const allRecords = useMemo(
		() => createAllItemCategorySetupRecords(setupRecords),
		[setupRecords],
	);
	const [accountingFilter, setAccountingFilterState] =
		useState<ItemCategoryAccountingSetupStatusFilter>(
			AllAccountingStatusesFilter,
		);
	const [drawerState, setDrawerState] = useState<ItemCategoryDrawerState>(null);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(
		() => new Set(allRecords.map((record) => record.id)),
	);
	const [pendingStatusRow, setPendingStatusRow] =
		useState<ItemCategoryTableRowData | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilterState] =
		useState<ItemCategoryStatusFilter>(DefaultStatusFilter);
	const backendRowByRecordId = useMemo(
		() => new Map(store.categories.map((row) => [row.record.id, row])),
		[store.categories],
	);
	const tableRows = useMemo(
		() =>
			enrichItemCategoryRows(
				createItemCategoryRows({
					expandedIds,
					items: [],
					setupRecords,
				}),
				backendRowByRecordId,
			),
		[backendRowByRecordId, expandedIds, setupRecords],
	);
	const allRows = useMemo(
		() =>
			enrichItemCategoryRows(
				createItemCategoryRows({
					expandedIds: new Set(allRecords.map((record) => record.id)),
					items: [],
					setupRecords,
				}).filter((row) => !row.isVirtual),
				backendRowByRecordId,
			),
		[allRecords, backendRowByRecordId, setupRecords],
	);
	const filteredRows = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

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
	const metrics = store.statistics;

	function handleAccountingFilterChange(
		value: ItemCategoryAccountingSetupStatusFilter,
	) {
		setAccountingFilterState(value);
	}

	function handleQueryChange(value: string) {
		setQuery(value);
	}

	function handleStatusFilterChange(value: ItemCategoryStatusFilter) {
		setStatusFilterState(value);
	}

	function handleConfirmStatusChange() {
		if (!pendingStatusRow || pendingStatusRow.isVirtual) {
			return;
		}

		const nextStatus =
			pendingStatusRow.record.status === "Active" ? "Inactive" : "Active";
		void store
			.updateCategory(pendingStatusRow.record.id, {
				...createItemCategoryFormValues(pendingStatusRow.record),
				parentId: pendingStatusRow.parentId,
				status: nextStatus,
			})
			.then(() => setPendingStatusRow(null))
			.catch(() => undefined);
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

	return {
		accountingFilter,
		allRows,
		drawerState,
		expandedIds,
		filteredRows,
		handleAccountingFilterChange,
		handleConfirmStatusChange,
		handleQueryChange,
		handleStatusFilterChange,
		isLoading: store.isLoading,
		isRefreshing: store.isRefreshing,
		isMutating: store.isMutating,
		lastSyncedAt: store.lastSyncedAt,
		metrics,
		pendingStatusRow,
		permissions: store.permissions,
		query,
		refreshCategories: store.refreshCategories,
		setDrawerState,
		setPendingStatusRow,
		statusFilter,
		toggleExpanded,
	};
}

function enrichItemCategoryRows(
	rows: ItemCategoryTableRowData[],
	sourceRows: Map<string, ItemCategoryTableRowData>,
) {
	return rows.map((row) => {
		const source = sourceRows.get(row.record.id);

		if (!source) {
			return row;
		}

		return {
			...row,
			effectiveAccountingSetup:
				source.effectiveAccountingSetup ?? row.effectiveAccountingSetup,
			inheritedAccountingSourceName:
				source.inheritedAccountingSourceName ?? row.inheritedAccountingSourceName,
			usedByItemCount: source.usedByItemCount,
		};
	});
}

export function useItemCategoryFormPage({
	mode: providedMode,
	onSaved,
	row,
}: {
	mode?: ItemActionMode;
	onSaved?: () => void;
	row?: ItemCategoryTableRowData;
} = {}) {
	const store = useItemCategoryStore();
	const setupRecords = useSetupRecordsByKind(store.records);
	const allRecords = useMemo(
		() => createAllItemCategorySetupRecords(setupRecords),
		[setupRecords],
	);
	const mode = providedMode ?? "add";
	const existingRef = useMemo(
		() =>
			row
				? {
						kind: row.recordKind,
						parentId: row.parentId,
						record: row.record,
					}
				: undefined,
		[row],
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<ItemCategoryFormValues>(() => {
		const initialValues = existingRef
			? {
					...createItemCategoryFormValues(existingRef.record),
					parentId:
						existingRef.parentId && existingRef.parentId !== ""
							? existingRef.parentId
							: (existingRef.record.parentIds?.[0] ?? ""),
				}
			: ItemCategoryInitialFormValues;

		return normalizeRootItemCategoryAccountingSetup(initialValues);
	});
	const [errors, setErrors] = useState<ItemCategoryFormErrors>({});
	const parentOptions = useMemo(
		() =>
			createItemCategoryParentOptions({
				currentRecordId: existingRef?.record.id,
				items: [],
				setupRecords,
			}),
		[existingRef?.record.id, setupRecords],
	);
	const needsInheritanceChangeConfirmation =
		mode === "edit" &&
		existingRef !== undefined &&
		getItemCategoryAccountingSetupMode(existingRef.record) === "own" &&
		values.accountingSetupMode === "inherit";

	function updateField<TField extends keyof ItemCategoryFormValues>(
		field: TField,
		value: ItemCategoryFormValues[TField],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const nextValues = { ...current, [field]: value };

			if (field === "name" && nextValues.accountingSetupMode === "own") {
				return {
					...nextValues,
					accountingSetup: createItemCategoryGeneratedAccountingSetup(
						String(value),
					),
				};
			}

			return nextValues;
		});
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

		updateField(name as keyof ItemCategoryFormValues, value as never);
	}

	function handleBehaviorChange(behavior: ItemBehavior) {
		const behaviors = values.behaviors.includes(behavior)
			? values.behaviors.filter((currentBehavior) => currentBehavior !== behavior)
			: [...values.behaviors, behavior];

		updateField("behaviors", behaviors);
	}

	function handleStatusChange(status: ItemStatus) {
		updateField("status", status);
	}

	function handleAllowSubCategoryChange(allowSubCategory: boolean) {
		updateField("allowSubCategory", allowSubCategory);
	}

	function handleAccountRequirementChange(
		field:
			| "requiresInventoryAccount"
			| "requiresSalesAccount"
			| "requiresCostOfSalesAccount"
			| "requiresExpenseAccount",
		required: boolean,
	) {
		updateField(field, required);
		setErrors((current) => ({
			...current,
			requiresInventoryAccount: undefined,
			requiresSalesAccount: undefined,
			requiresCostOfSalesAccount: undefined,
			requiresExpenseAccount: undefined,
		}));
	}

	function handleAccountingModeChange(
		accountingSetupMode: ItemCategoryAccountingSetupMode,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const nextAccountingSetupMode =
				accountingSetupMode === "inherit" && !current.parentId
					? "own"
					: accountingSetupMode;

			return {
				...current,
				accountingSetupMode: nextAccountingSetupMode,
				accountingSetup:
					nextAccountingSetupMode === "own"
						? createItemCategoryGeneratedAccountingSetup(current.name)
						: current.accountingSetup,
			};
		});
		setErrors((current) => ({ ...current, accountingSetupMode: undefined }));
	}

	function handleParentChange(parentId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const shouldSwitchMode =
				mode === "add" &&
				(current.accountingSetupMode === "inherit" ||
					current.accountingSetupMode === "own");
			const accountingSetupMode = shouldSwitchMode
				? parentId
					? "inherit"
					: "own"
				: current.accountingSetupMode;

			return {
				...current,
				parentId,
				accountingSetupMode,
				accountingSetup:
					accountingSetupMode === "own"
						? createItemCategoryGeneratedAccountingSetup(current.name)
						: current.accountingSetup,
			};
		});
		setErrors((current) => ({ ...current, parentId: undefined }));
	}

	function validateBeforeSubmit() {
		const normalizedValues = normalizeRootItemCategoryAccountingSetup(values);
		const nextErrors = validateItemCategoryForm(normalizedValues, {
			recordId: existingRef?.record.id,
			records: allRecords,
		});

		if (normalizedValues !== values) {
			setValues(normalizedValues);
		}

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted category fields.");
			return false;
		}

		return true;
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!validateBeforeSubmit()) {
			return;
		}

		if (mode === "edit") {
			if (!existingRef) {
				toast.error("Could not find the category to update.");
				return;
			}

			void store
				.updateCategory(
					existingRef.record.id,
					normalizeRootItemCategoryAccountingSetup(values),
				)
				.then(() => onSaved?.())
				.catch(() => undefined);
			return;
		}

		if (mode === "view") {
			return;
		}

		void store
			.addCategory(normalizeRootItemCategoryAccountingSetup(values))
			.then(() => onSaved?.())
			.catch(() => undefined);
	}

	return {
		errors,
		existingRecord: existingRef?.record,
		handleAccountingModeChange,
		handleAccountRequirementChange,
		handleAllowSubCategoryChange,
		handleBehaviorChange,
		handleInputChange,
		handleParentChange,
		handleStatusChange,
		handleSubmit,
		isMutating: store.isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		needsInheritanceChangeConfirmation,
		parentOptions,
		validateBeforeSubmit,
		values,
	};
}

function useSetupRecordsByKind(records: ItemSetupRecord[]) {
	return useMemo(
		() => ({
			category: records,
			subcategory: [],
			type: [],
			subtype: [],
		}) satisfies Record<ItemSetupKind, ItemSetupRecord[]>,
		[records],
	);
}
