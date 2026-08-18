import type {
	MasterAddOnStatus,
	MasterAddOnTableColumnKey,
} from "@/app/src/types/master/add-ons/MasterAddOnTypes";

export const MasterAddOnsHref = "/master/add-ons";

export function getMasterAddOnViewHref(recordId: string) {
	return `${MasterAddOnsHref}/view/${recordId}`;
}

export function getMasterAddOnEditHref(recordId: string) {
	return `${MasterAddOnsHref}/edit/${recordId}`;
}

export const MasterAddOnAddHref = `${MasterAddOnsHref}/add`;

export const MasterAddOnPaginationStorageKey = "master-add-ons";

export const MasterAddOnStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly MasterAddOnStatus[];

export type MasterAddOnStatusFilterValue = "ALL" | MasterAddOnStatus;

export const MasterAddOnStatusFilterOptions = [
	{ label: "All", value: "ALL" },
	...MasterAddOnStatusOptions.map((status) => ({
		label: status,
		value: status,
	})),
] as const satisfies readonly {
	label: string;
	value: MasterAddOnStatusFilterValue;
}[];

export const MasterAddOnTableColumns = [
	{ key: "name", label: "Add-On", className: "w-[24rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "pricing", label: "Pricing", className: "w-[20rem]" },
	{ key: "modules", label: "Modules", className: "w-[12rem]" },
	{ label: "Actions", className: "w-[6rem] text-center" },
] as const satisfies readonly (
	| {
			key: MasterAddOnTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];
