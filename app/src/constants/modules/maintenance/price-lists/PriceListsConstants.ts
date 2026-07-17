import type { SortingState } from "@tanstack/react-table";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const PriceListsHref = MODULE_ROUTE_MAP.PLS;

export const PriceListsTitle = "Price Lists";

export const PriceListsDescription =
	"Maintain pricing structures used on item records for different customer groups.";

export const PriceListsDrawerFormId = "price-lists-drawer-form";

export const PriceListsPaginationStorageKey = "maintenance.price-lists";

export const PriceListsFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-not-allowed disabled:bg-offwhite/65";

export const PriceListsTableColumns = [
	{ key: "code", label: "Price List Code", className: "w-[12rem]" },
	{ key: "name", label: "Price List", className: "w-[18rem]" },
	{ key: "customerGroup", label: "Customer Group", className: "w-[16rem]" },
	{ key: "currencyCode", label: "Currency", className: "w-[10rem] text-center" },
	{ key: "status", label: "Status", className: "w-[9rem] text-center" },
	{ label: "Actions", className: "w-[9rem] text-center" },
] as const;

export const PriceListsDefaultSorting: SortingState = [
	{ id: "name", desc: false },
];
