import type {
	TransactionTypeStatus,
	TransactionTypeTableColumnKey,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";

export const TransactionTypeHref =
	"/maintenance/inventory-transaction-type";

export const TransactionTypeParentLabel = "Maintenance";

export const TransactionTypeTitle = "Inventory Transaction Type";

export const TransactionTypeDescription =
	"Maintain inventory transaction types used to classify goods receipt and goods issue movements.";

export const TransactionTypeDrawerFormId =
	"inventory-transaction-type-drawer-form";

export const TransactionTypePaginationStorageKey =
	"maintenance:inventory-transaction-type";

export const TransactionTypeStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly TransactionTypeStatus[];

export const TransactionTypeModuleOptions = [
	{
		label: "Goods Receipt",
		value: "GR",
	},
	{
		label: "Goods Issue",
		value: "GI",
	},
] as const;

export const TransactionTypeTableColumns: Array<
	| {
			className: string;
			key: TransactionTypeTableColumnKey;
			label: string;
	  }
	| {
			className: string;
			label: string;
	  }
> = [
	{
		key: "name",
		label: "Name",
		className: "w-[18%]",
	},
	{
		key: "description",
		label: "Description",
		className: "w-[28%]",
	},
	{
		key: "moduleLabel",
		label: "Module",
		className: "w-[18%]",
	},
	{
		key: "accountLabel",
		label: "Account Title",
		className: "w-[22%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[10%]",
	},
	{
		label: "Action",
		className: "w-[12%] text-center",
	},
] as const;

export const TransactionTypeActionCopy = {
	add: {
		title: "Add Inventory Transaction Type",
		description:
			"Create an inventory movement classification and map it to goods receipt or goods issue.",
	},
	edit: {
		title: "Edit Inventory Transaction Type",
		description:
			"Update the inventory movement details, module availability, and account mapping.",
	},
	view: {
		title: "View Inventory Transaction Type",
		description:
			"Review the inventory transaction type configuration before making changes.",
	},
} as const;
