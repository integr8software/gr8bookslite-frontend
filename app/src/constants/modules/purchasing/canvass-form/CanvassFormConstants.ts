import type { CanvassFormStatus } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";

export const CanvassFormHref = "/purchasing/canvass-form";
export const CanvassFormStorageKey = "gr8books.canvassForms";
export const CanvassFormTablePaginationStorageKey = "purchasing.canvass-form";

export const CanvassFormCurrencyOptions = ["PHP", "USD", "JPY", "EUR"] as const;
export const CanvassFormPurchaseTypeOptions = ["Goods", "Services", "Assets"] as const;
export const CanvassFormUomOptions = ["PC", "BOX", "LOT", "SET", "KG"] as const;
export const CanvassFormStatusOptions: CanvassFormStatus[] = [
	"Draft",
	"For Approval",
	"Posted",
	"Disapproved",
	"Cancelled",
];

export const CanvassFormPageCopy = {
	add: {
		title: "Add Canvass Order",
		description:
			"Compare supplier quotations, requested details, and selected costs before saving.",
	},
	edit: {
		title: "Edit Canvass Order",
		description: "Update request details, supplier quotations, and selected supplier costs.",
	},
	view: {
		title: "View Canvass Order",
		description: "Review canvass details, supplier comparisons, and printable report.",
	},
} as const;
