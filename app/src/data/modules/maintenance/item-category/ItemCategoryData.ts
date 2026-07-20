import {
	ItemCategorySystemDefaultAccountingSetup,
	ItemCategoryUnassignedRecordId,
} from "@/app/src/constants/modules/maintenance/item-category/ItemCategoryConstants";
import {
	ItemCategoryInitialFormValues,
	MockItemSetupRecords,
	MockItems,
	createItemCategoryFormValues,
	createItemCategoryGeneratedAccountingSetup,
	createItemCategoryRecord,
	getItemCategoryAccountingSetupMode,
	normalizeItemCategoryAccountingSetup,
	updateItemCategoryRecord,
} from "@/app/src/data/modules/maintenance/items/ItemManagementData";
import type {
	ItemCategoryAccountingSetup,
	ItemCategoryAccountingSetupMode,
	ItemCategoryAccountingSetupStatus,
	ItemCategoryFormValues,
	ItemCategoryTableRowData,
	ItemRecord,
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";

export {
	createItemCategoryFormValues,
	createItemCategoryGeneratedAccountingSetup,
	createItemCategoryRecord,
	getItemCategoryAccountingSetupMode,
	ItemCategoryInitialFormValues,
	MockItemSetupRecords,
	MockItems,
	normalizeItemCategoryAccountingSetup,
	updateItemCategoryRecord,
};

export function normalizeRootItemCategoryAccountingSetup(
	values: ItemCategoryFormValues,
): ItemCategoryFormValues {
	if (values.parentId || values.accountingSetupMode === "own") {
		return values;
	}

	return {
		...values,
		accountingSetupMode: "own",
		accountingSetup: createItemCategoryGeneratedAccountingSetup(values.name),
	};
}

export function createAllItemCategorySetupRecords(
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>,
) {
	return [
		...setupRecords.category,
		...setupRecords.subcategory,
		...setupRecords.type,
		...setupRecords.subtype,
	];
}

export function createItemCategoryRows({
	expandedIds,
	items,
	setupRecords,
}: {
	expandedIds: Set<string>;
	items: ItemRecord[];
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
}) {
	const typeParentIdsByTypeId = inferTypeParentIdsByTypeId(setupRecords, items);
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
			parentName: "",
			pathIds: [],
			pathNames: [],
			record,
			setupRecords,
			typeParentIdsByTypeId,
		}),
	);

	if (unassignedChildren.length === 0) {
		return rootRows;
	}

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
			parentName: "",
			pathIds: [],
			pathNames: [],
			record: createUnassignedRecord(),
			setupRecords,
			typeParentIdsByTypeId,
			isVirtual: true,
		}),
	];
}

export function createItemCategoryStatusUpdates({
	items,
	record,
	recordKind,
	setupRecords,
}: {
	items: ItemRecord[];
	record: ItemSetupRecord;
	recordKind: ItemSetupKind;
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
}) {
	const updatedAt = new Date().toISOString();
	const updates = [
		{ kind: recordKind, record: createAuditedSetupRecord(record, updatedAt) },
	];

	if (record.status !== "Inactive" && record.status !== "Active") {
		return updates;
	}

	const typeParentIdsByTypeId = inferTypeParentIdsByTypeId(setupRecords, items);
	const shouldDisableDescendants = record.status === "Inactive";
	const shouldRestoreDescendants = record.status === "Active";

	collectDescendantRecords({
		parentKind: recordKind,
		parentRecord: record,
		pathIds: [],
		setupRecords,
		typeParentIdsByTypeId,
	}).forEach((descendant) => {
		const nextDescendantRecord = shouldDisableDescendants
			? createParentDisabledRecord(descendant.record, record.id)
			: createParentRestoredRecord(descendant.record, record.id);

		if (!shouldDisableDescendants && !shouldRestoreDescendants) {
			return;
		}

		updates.push({
			kind: descendant.kind,
			record: createAuditedSetupRecord(nextDescendantRecord, updatedAt),
		});
	});

	return dedupeStatusUpdates(updates);
}

export function createItemCategoryParentOptions({
	currentRecordId,
	items,
	setupRecords,
}: {
	currentRecordId?: string;
	items: ItemRecord[];
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
}) {
	const rows = createItemCategoryRows({
		expandedIds: new Set(
			[
				...setupRecords.category,
				...setupRecords.subcategory,
				...setupRecords.type,
				...setupRecords.subtype,
				createUnassignedRecord(),
			].map((record) => record.id),
		),
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
			accountingSetup: row.effectiveAccountingSetup,
			id: row.record.id,
			label: row.record.name,
			kindLabel: row.recordKindLabel,
			pathName: row.pathName,
		}));
}

function createRowsForRecord({
	expandedIds,
	hasInactiveAncestor = false,
	isVirtual = false,
	items,
	kind,
	level,
	parentAccountingSourceName,
	parentEffectiveAccountingSetup,
	parentId,
	parentName,
	pathIds,
	pathNames,
	record,
	setupRecords,
	typeParentIdsByTypeId,
}: {
	expandedIds: Set<string>;
	hasInactiveAncestor?: boolean;
	isVirtual?: boolean;
	items: ItemRecord[];
	kind: ItemSetupKind;
	level: number;
	parentAccountingSourceName?: string;
	parentEffectiveAccountingSetup?: ItemCategoryAccountingSetup;
	parentId: string;
	parentName: string;
	pathIds: string[];
	pathNames: string[];
	record: ItemSetupRecord;
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
	typeParentIdsByTypeId: Map<string, string[]>;
}): ItemCategoryTableRowData[] {
	if (pathIds.includes(record.id)) {
		return [];
	}

	const accountingSetupMode = getItemCategoryAccountingSetupMode(record);
	const ownAccountingSetup =
		accountingSetupMode === "own"
			? normalizeItemCategoryAccountingSetup(record.accountingSetup)
			: undefined;
	const accountingSetupStatus = getAccountingSetupStatus(accountingSetupMode);
	const effectiveAccountingSetup =
		ownAccountingSetup ??
		parentEffectiveAccountingSetup ??
		ItemCategorySystemDefaultAccountingSetup;
	const inheritedAccountingSourceName =
		accountingSetupMode === "inherit"
			? (parentAccountingSourceName ?? "System Defaults")
			: undefined;
	const rowRecord =
		hasInactiveAncestor && !isVirtual
			? ({
					...record,
					status: "Inactive",
				} satisfies ItemSetupRecord)
			: record;
	const row: ItemCategoryTableRowData = {
		id: `${kind}-${record.id}-${parentId || "root"}-${level}`,
		accountingSetupStatus,
		effectiveAccountingSetup,
		hasInactiveAncestor,
		hasChildren: false,
		inheritedAccountingSourceName,
		isVirtual,
		level,
		parentId,
		parentName,
		pathName: `/${[...pathNames, record.name].join("/")}`,
		record: rowRecord,
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
				hasInactiveAncestor:
					hasInactiveAncestor || record.status === "Inactive",
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
				pathNames: [...pathNames, record.name],
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

function createAuditedSetupRecord(
	record: ItemSetupRecord,
	updatedAt: string,
): ItemSetupRecord {
	return {
		...record,
		updatedAt,
		updatedBy: "Current User",
	};
}

function createParentDisabledRecord(
	record: ItemSetupRecord,
	parentId: string,
): ItemSetupRecord {
	const parentInactiveSourceIds = Array.from(
		new Set([...(record.parentInactiveSourceIds ?? []), parentId]),
	);

	return {
		...record,
		statusBeforeParentInactive:
			record.statusBeforeParentInactive ??
			(record.parentInactiveSourceIds?.length ? undefined : record.status),
		parentInactiveSourceIds,
		status: "Inactive",
	};
}

function createParentRestoredRecord(
	record: ItemSetupRecord,
	parentId: string,
): ItemSetupRecord {
	if (!record.statusBeforeParentInactive) {
		return record;
	}

	const previousStatus = record.statusBeforeParentInactive;
	const parentInactiveSourceIds = (record.parentInactiveSourceIds ?? []).filter(
		(sourceId) => sourceId !== parentId,
	);

	if (parentInactiveSourceIds.length > 0) {
		return {
			...record,
			parentInactiveSourceIds,
			status: "Inactive",
		};
	}

	const restoredRecord = { ...record };

	delete restoredRecord.parentInactiveSourceIds;
	delete restoredRecord.statusBeforeParentInactive;

	return {
		...restoredRecord,
		status: previousStatus,
	};
}

function collectDescendantRecords({
	parentKind,
	parentRecord,
	pathIds,
	setupRecords,
	typeParentIdsByTypeId,
}: {
	parentKind: ItemSetupKind;
	parentRecord: ItemSetupRecord;
	pathIds: string[];
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>;
	typeParentIdsByTypeId: Map<string, string[]>;
}): Array<{ kind: ItemSetupKind; record: ItemSetupRecord }> {
	if (pathIds.includes(parentRecord.id)) {
		return [];
	}

	const children = createChildRecords({
		parentKind,
		parentRecord,
		setupRecords,
		typeParentIdsByTypeId,
	});

	return children.flatMap((child) => [
		child,
		...collectDescendantRecords({
			parentKind: child.kind,
			parentRecord: child.record,
			pathIds: [...pathIds, parentRecord.id],
			setupRecords,
			typeParentIdsByTypeId,
		}),
	]);
}

function dedupeStatusUpdates(
	updates: Array<{ kind: ItemSetupKind; record: ItemSetupRecord }>,
) {
	const updateByKey = new Map<
		string,
		{ kind: ItemSetupKind; record: ItemSetupRecord }
	>();

	updates.forEach((update) => {
		updateByKey.set(`${update.kind}:${update.record.id}`, update);
	});

	return Array.from(updateByKey.values());
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
		: (typeParentIdsByTypeId.get(record.id) ?? []);
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

function getAccountingSetupStatus(
	accountingSetupMode: ItemCategoryAccountingSetupMode,
): ItemCategoryAccountingSetupStatus {
	return accountingSetupMode === "inherit" ? "Inherited" : "Configured";
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
		return "Item Category";
	}

	if (kind === "subtype" || kind === "subcategory") {
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
