import type { MaterialRequestStatus } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import type { ModuleTableFilterOption } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const MaterialRequestHref = "/inventory/material-request";

export const MaterialRequestStorageKey = "gr8books.materialRequests";

export const MaterialRequestTablePaginationStorageKey =
	"inventory.material-request";

export const MaterialRequestStatusOptions: MaterialRequestStatus[] = [
	"Pending",
	"Approved",
	"Rejected",
	"Completed",
];

export const MaterialRequestWarehouseOptions = [
	"Main Warehouse",
	"Central Warehouse",
	"Site Warehouse 1",
	"Site Warehouse 2",
	"Site Warehouse 3",
	"Site Warehouse 4",
] as const;

export const MaterialRequestUomOptions = [
	"Bag",
	"Box",
	"Bundle",
	"Can",
	"Kg",
	"Pc",
	"Roll",
] as const;

export const MaterialRequestStatusFilterOptions: ModuleTableFilterOption[] = [
	{ label: "All Statuses", value: "all" },
	...MaterialRequestStatusOptions.map((status) => ({
		label: status,
		value: status,
	})),
];

export const MaterialRequestWarehouseFilterOptions: ModuleTableFilterOption[] = [
	{ label: "All Warehouses", value: "all" },
	...MaterialRequestWarehouseOptions.map((warehouse) => ({
		label: warehouse,
		value: warehouse,
	})),
];

export const MaterialRequestActionPageCopy = {
	add: {
		title: "New Material Request",
		description:
			"Request materials from one warehouse for transfer, picking, and issue processing.",
	},
	edit: {
		title: "Edit Material Request",
		description:
			"Update warehouse, requester, purpose, status, and requested item details.",
	},
	view: {
		title: "Material Request",
		description:
			"Review warehouse transfer request details and requested material lines.",
	},
} as const;
