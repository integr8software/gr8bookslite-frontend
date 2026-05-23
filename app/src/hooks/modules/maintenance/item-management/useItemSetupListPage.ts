"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ItemSetupAllParentsRecordId,
	ItemSetupChildKindByKind,
	ItemSetupConfigByKind,
	ItemSetupTableColumns,
} from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemSetupKind,
	ItemSetupRecord,
	ItemSetupTableColumnKey,
	ItemSetupTableRowData,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { useItemManagementStore } from "./useItemManagement";

const EmptyItemSetupRecords: ItemSetupRecord[] = [];

export function useItemSetupListPage(kind: ItemSetupKind) {
	const store = useItemManagementStore();
	const records = store.getSetupRecords(kind);
	const childKind = ItemSetupChildKindByKind[kind];
	const childRecords = childKind
		? store.getSetupRecords(childKind)
		: EmptyItemSetupRecords;
	const [expandedIds, setExpandedIds] = useState<Set<string>>(
		() =>
			new Set([
				ItemSetupAllParentsRecordId,
				...records.map((record) => record.id),
			]),
	);
	const [pendingDeleteRecord, setPendingDeleteRecord] = useState<{
		kind: ItemSetupKind;
		record: ItemSetupRecord;
	} | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const tableRows = useMemo(
		() =>
			createItemSetupTableRows({
				childKind,
				childRecords,
				expandedIds,
				kind,
				records,
			}),
		[childKind, childRecords, expandedIds, kind, records],
	);
	const columns = useMemo<ColumnDef<ItemSetupTableRowData>[]>(
		() =>
			ItemSetupTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createItemSetupColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: tableRows,
		columns,
		state: {
			pagination,
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	function handleConfirmDelete() {
		if (!pendingDeleteRecord) {
			return;
		}

		store.deleteSetupRecord(
			pendingDeleteRecord.kind,
			pendingDeleteRecord.record.id,
		);
		setPendingDeleteRecord(null);
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
		childKind,
		expandedIds,
		handleConfirmDelete,
		isLoading: store.isLoading,
		isMutating: store.isMutating,
		pendingDeleteRecord,
		setPendingDeleteRecord,
		table,
		toggleExpanded,
	};
}

function createItemSetupColumn(
	key: ItemSetupTableColumnKey,
	header: string,
	className: string,
): ColumnDef<ItemSetupTableRowData> {
	if (key === "code" || key === "name" || key === "status") {
		return {
			id: key,
			accessorFn: (row) => row.record[key],
			enableSorting: false,
			header,
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		enableSorting: false,
		header,
		meta: { className },
	};
}

function createItemSetupTableRows({
	childKind,
	childRecords,
	expandedIds,
	kind,
	records,
}: {
	childKind?: ItemSetupKind;
	childRecords: ItemSetupRecord[];
	expandedIds: Set<string>;
	kind: ItemSetupKind;
	records: ItemSetupRecord[];
}): ItemSetupTableRowData[] {
	if (!childKind) {
		return records.map((record) => createSetupRow(record, kind, 0));
	}

	const reusableChildren = childRecords.filter(isReusableChildRecord);
	const allParentsRows =
		reusableChildren.length > 0
			? createAllParentsRows({
					childKind,
					childRecords: reusableChildren,
					expandedIds,
					parentKind: kind,
				})
			: [];
	const parentRows = records.flatMap((record) => {
		const matchingChildren = childRecords.filter((childRecord) =>
			childAppliesToSpecificParent(childRecord, record.id),
		);
		const rows = [
			createSetupRow(record, kind, 0, {
				hasChildren: matchingChildren.length > 0,
			}),
		];

		if (!expandedIds.has(record.id)) {
			return rows;
		}

		return [
			...rows,
			...matchingChildren.map((childRecord) =>
				createSetupRow(childRecord, childKind, 1, {
					parentRecord: record,
					appliesToLabel: createAppliesToLabel(childRecord, records, kind),
				}),
			),
		];
	});

	return [...allParentsRows, ...parentRows];
}

function createAllParentsRows({
	childKind,
	childRecords,
	expandedIds,
	parentKind,
}: {
	childKind: ItemSetupKind;
	childRecords: ItemSetupRecord[];
	expandedIds: Set<string>;
	parentKind: ItemSetupKind;
}) {
	const allParentsRecord = createAllParentsRecord(parentKind);
	const rows = [
		createSetupRow(allParentsRecord, parentKind, 0, {
			appliesToLabel: "Default parent selection",
			hasChildren: childRecords.length > 0,
			isVirtual: true,
		}),
	];

	if (!expandedIds.has(ItemSetupAllParentsRecordId)) {
		return rows;
	}

	return [
		...rows,
		...childRecords.map((childRecord) =>
			createSetupRow(childRecord, childKind, 1, {
				appliesToLabel: createAppliesToLabel(
					childRecord,
					[],
					parentKind,
				),
				parentRecord: allParentsRecord,
			}),
		),
	];
}

function createAllParentsRecord(parentKind: ItemSetupKind): ItemSetupRecord {
	return {
		id: ItemSetupAllParentsRecordId,
		code: "ALL",
		name: "All",
		description: `Reusable across all ${ItemSetupConfigByKind[
			parentKind
		].title.toLowerCase()} records.`,
		status: "Active",
	};
}

function createSetupRow(
	record: ItemSetupRecord,
	recordKind: ItemSetupKind,
	level: number,
	options: {
		appliesToLabel?: string;
		hasChildren?: boolean;
		isVirtual?: boolean;
		parentRecord?: ItemSetupRecord;
	} = {},
): ItemSetupTableRowData {
	return {
		id: `${recordKind}-${record.id}-${options.parentRecord?.id ?? "root"}`,
		appliesToLabel:
			options.appliesToLabel ??
			(level === 0 ? "Parent record" : "Reusable across all parents"),
		hasChildren: options.hasChildren ?? false,
		isVirtual: options.isVirtual,
		level,
		parentRecord: options.parentRecord,
		record,
		recordKind,
		recordKindLabel: ItemSetupConfigByKind[recordKind].singularTitle,
	};
}

function childAppliesToSpecificParent(record: ItemSetupRecord, parentId: string) {
	const parentIds = record.parentIds ?? [];

	return parentIds.includes(parentId);
}

function isReusableChildRecord(record: ItemSetupRecord) {
	return (record.parentIds ?? []).length === 0;
}

function createAppliesToLabel(
	record: ItemSetupRecord,
	parentRecords: ItemSetupRecord[],
	parentKind: ItemSetupKind,
) {
	const parentIds = record.parentIds ?? [];

	if (parentIds.length === 0) {
		return `All ${ItemSetupConfigByKind[parentKind].title.toLowerCase()} records`;
	}

	return parentIds
		.map(
			(parentId) =>
				parentRecords.find((parentRecord) => parentRecord.id === parentId)
					?.name,
		)
		.filter(Boolean)
		.join(", ");
}
