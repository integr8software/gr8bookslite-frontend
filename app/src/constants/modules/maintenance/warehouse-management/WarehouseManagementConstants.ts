import type {
	WarehouseDetailsTab,
	WarehouseStatus,
	WarehouseTableColumnKey,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

export const WarehouseManagementHref = "/maintenance/warehouse-management";

export const WarehouseManagementTablePaginationStorageKey =
	"maintenance.warehouse-management";

export const WarehouseStatusOptions: WarehouseStatus[] = ["Active", "Inactive"];

export const WarehouseDetailsTabs: Array<{
	key: WarehouseDetailsTab;
	label: string;
}> = [
	{ key: "information", label: "Information" },
	{ key: "access", label: "Warehouse Access" },
	{ key: "items", label: "Items" },
];

export const WarehouseManagementTableColumns: Array<
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
	{ key: "code", label: "Code", className: "w-[9rem]" },
	{ key: "name", label: "Warehouse", className: "w-[18rem]" },
	{ key: "branchName", label: "Branch", className: "w-[14rem]" },
	{ key: "managerName", label: "Manager", className: "w-[14rem]" },
	{ key: "itemCount", label: "Items", className: "w-[8rem] text-right" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[10rem]" },
];

export const WarehouseFormPageCopy = {
	add: {
		title: "Add Warehouse",
		description:
			"Create a warehouse location and assign its operating branch and manager.",
	},
	edit: {
		title: "Edit Warehouse",
		description:
			"Update warehouse information used by inventory receiving and issuing workflows.",
	},
	view: {
		title: "Warehouse Management",
		description:
			"Review warehouse information, access assignments, and item counts.",
	},
} as const;

