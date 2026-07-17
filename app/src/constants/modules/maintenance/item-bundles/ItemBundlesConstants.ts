import type { ItemBundleTableColumnKey } from "@/app/src/types/modules/maintenance/item-bundles/ItemBundlesTypes";

export const ItemBundlesHref = "/maintenance/item-bundles";

export const ItemBundlesFormId = "item-bundles-form";

export const ItemBundlesTablePaginationStorageKey =
	"maintenance.item-bundles.records";

export const ItemBundleStatusFilterOptions = [
	{ label: "All", value: "All" },
	{ label: "Active", value: "Active" },
	{ label: "Inactive", value: "Inactive" },
] as const;

export const ItemBundlesTableColumns: Array<
	| {
			key: ItemBundleTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "code", label: "Bundle Code", className: "w-[10rem]" },
	{ key: "bundleItem", label: "Bundle Item", className: "w-[16rem]" },
	{ key: "components", label: "Component Items", className: "w-[24rem]" },
	{ key: "totalCost", label: "Total Cost", className: "w-[10rem] text-right" },
	{
		key: "originalSelling",
		label: "Original Selling",
		className: "w-[11rem] text-right",
	},
	{
		key: "bundlePrice",
		label: "Bundle Price",
		className: "w-[10rem] text-right",
	},
	{ key: "savings", label: "Savings", className: "w-[10rem] text-right" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[10rem] text-center" },
];
