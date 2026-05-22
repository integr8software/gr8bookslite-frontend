export const DiscountManagementHref =
	"/maintenance/financial-management/discount-management";

export const DiscountManagementTablePaginationStorageKey =
	"maintenance:financial-management:discount-management";

export const DiscountManagementTableColumns = [
	{
		key: "description",
		label: "Description",
		className: "w-[34%]",
	},
	{
		key: "percentage",
		label: "Discount %",
		className: "w-[18%]",
	},
	{
		key: "accountLabel",
		label: "Account",
		className: "w-[34%]",
	},
	{
		label: "Actions",
		className: "w-[14%] text-right",
	},
] as const;

export const DiscountManagementActionCopy = {
	add: {
		title: "Add Discount",
		description: "Create a discount and map it to the right chart account.",
	},
	edit: {
		title: "Edit Discount",
		description: "Update the discount percentage and account mapping.",
	},
	view: {
		title: "View Discount",
		description: "Review the configured discount details before making changes.",
	},
} as const;
