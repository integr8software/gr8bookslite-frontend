import type {
	WarehouseBranchAvailability,
	WarehouseStatus,
	WarehouseTableColumnKey,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export const WarehouseHref = "/maintenance/warehouses";

export const WarehouseTablePaginationStorageKey =
	"maintenance.warehouses";

export const WarehouseStatusOptions: WarehouseStatus[] = ["Active", "Inactive"];

export const WarehouseBranchOptions = [
	"Main Branch",
	"North Branch",
	"South Branch",
	"Cebu Branch",
] as const;

export const WarehouseBranchAvailabilityOptions = [
	"Home Branch Only",
	"Selected Branches",
	"All Branches",
] as const satisfies readonly WarehouseBranchAvailability[];

export const WarehouseTableColumns: Array<
	| {
			key: WarehouseTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "code", label: "Warehouse Code", className: "w-[12rem]" },
	{ key: "name", label: "Warehouse", className: "w-[18rem]" },
	{
		key: "availableBranchLabel",
		label: "Branch",
		className: "w-[14rem]",
	},
	{ key: "managerName", label: "Manager", className: "w-[14rem]" },
	{ key: "totalItems", label: "Total Items", className: "w-[10rem]" },
	{ key: "inventoryValue", label: "Inventory Value", className: "w-[12rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[14rem]" },
];

export const WarehouseFormPageCopy = {
	add: {
		title: "Add Warehouse",
		description:
			"Create a warehouse location and assign its available branches and manager.",
	},
	edit: {
		title: "Edit Warehouse",
		description:
			"Update warehouse information used by inventory receiving and issuing workflows.",
	},
	view: {
		title: "Warehouse Management",
		description:
			"Review warehouse information, available branches, and access assignments.",
	},
} as const;

export function createWarehouseAccessHref(warehouseId: string) {
	return `${WarehouseHref}/view/${warehouseId}/access`;
}

export function createWarehouseItemsHref(warehouseId: string) {
	return `${WarehouseHref}/view/${warehouseId}/items`;
}
