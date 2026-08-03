"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { InventoryCountRecords } from "@/app/src/data/modules/inventory/inventory-count/InventoryCountData";
import type {
	InventoryCountRecord,
	InventoryCountStatus,
} from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";

const columnHelper = createColumnHelper<InventoryCountRecord>();

export function useInventoryCountListPage() {
	const [records, setRecords] = useState(InventoryCountRecords);

	const columns = useMemo(
		() => [
			columnHelper.accessor("countNo", {
				header: "Inventory Count No.",
				meta: { className: "w-[12rem]" },
			}),
			columnHelper.accessor("countDate", {
				header: "Inventory Count Date",
				meta: { className: "w-[10rem]" },
			}),
			columnHelper.accessor("warehouse", {
				header: "Warehouse",
				meta: { className: "w-[14rem]" },
			}),
			columnHelper.accessor("uploader", {
				header: "Uploader",
				meta: { className: "w-[12rem]" },
			}),
			columnHelper.accessor("category", {
				header: "Item Category",
				meta: { className: "w-[14rem]" },
			}),
			columnHelper.accessor("totalItems", {
				header: "Items",
				meta: { className: "w-[8rem]" },
			}),
			columnHelper.accessor("variance", {
				header: "Variance",
				meta: { className: "w-[10rem]" },
			}),
			columnHelper.accessor("status", {
				header: "Status",
				meta: { className: "w-[10rem]" },
			}),
			columnHelper.display({
				id: "actions",
				header: "Actions",
				meta: { className: "w-[10rem] text-center" },
			}),
		],
		[],
	);

	function updateInventoryCountStatus(
		record: InventoryCountRecord,
		status: InventoryCountStatus,
	) {
		setRecords((currentRecords) =>
			currentRecords.map((currentRecord) =>
				currentRecord.id === record.id
					? { ...currentRecord, status }
					: currentRecord,
			),
		);
	}

	return {
		columns,
		records,
		updateInventoryCountStatus,
	};
}

export function canEditInventoryCountStatus(status: InventoryCountStatus) {
	return status === "Draft" || status === "In Progress";
}

export function canApproveInventoryCountStatus(status: InventoryCountStatus) {
	return (
		status === "Draft" ||
		status === "In Progress" ||
		status === "Approved"
	);
}

export function canDisapproveInventoryCountStatus(status: InventoryCountStatus) {
	return (
		status === "Draft" ||
		status === "In Progress" ||
		status === "Disapproved"
	);
}

export function canCancelInventoryCountStatus(status: InventoryCountStatus) {
	return status !== "Approved";
}
