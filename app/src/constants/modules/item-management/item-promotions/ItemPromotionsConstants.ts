import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
	ItemPromotionTableColumnKey,
	ItemPromotionType,
} from "@/app/src/types/modules/item-management/item-promotions/ItemPromotionsTypes";

export const ItemPromotionsHref = MODULE_ROUTE_MAP.IPR;

export const ItemPromotionsFormId = "item-promotions-form";

export const ItemPromotionsTablePaginationStorageKey =
	"maintenance.item-promotions.records";

export const ItemPromotionTypeOptions = [
	"Percentage Discount",
	"Fixed Discount",
	"Bundle Discount",
	"Buy 1 Take 1",
] as const satisfies readonly ItemPromotionType[];

export const ItemPromotionStatusFilterOptions = [
	{ label: "All", value: "All" },
	{ label: "Active", value: "Active" },
	{ label: "Inactive", value: "Inactive" },
] as const;

export const ItemPromotionsTableColumns: Array<
	| {
			key: ItemPromotionTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "code", label: "Promotion Code", className: "w-[11rem]" },
	{ key: "name", label: "Promotion", className: "w-[18rem]" },
	{ key: "type", label: "Type", className: "w-[14rem]" },
	{ key: "item", label: "Item", className: "w-[14rem]" },
	{ key: "valueLabel", label: "Value", className: "w-[10rem]" },
	{
		key: "discountMaintenanceRule",
		label: "Discount Maintenance",
		className: "w-[18rem]",
	},
	{ key: "validity", label: "Validity", className: "w-[16rem]" },
	{ key: "status", label: "Status", className: "w-[9rem] text-center" },
	{ id: "actions", label: "Actions", className: "w-[10rem] text-center" },
];
