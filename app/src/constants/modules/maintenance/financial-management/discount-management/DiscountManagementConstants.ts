export const DiscountManagementHref =
	"/maintenance/discount-management";

export const DiscountManagementTablePaginationStorageKey =
	"maintenance:financial-management:discount-management";

export const DiscountManagementTableColumns = [
	{
		key: "name",
		label: "Name",
		className: "w-[18%]",
	},
	{
		key: "description",
		label: "Description",
		className: "w-[24%]",
	},
	{
		key: "amountLabel",
		label: "Value",
		className: "w-[16%]",
	},
	{
		key: "accountLabel",
		label: "Account Title",
		className: "w-[18%]",
	},
	{
		key: "moduleLabel",
		label: "Module",
		className: "w-[14%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[10%]",
	},
	{
		label: "Actions",
		className: "w-[8%] text-center",
	},
] as const;

export const DiscountManagementActionCopy = {
	add: {
		title: "Add Discount",
		description: "Create a discount and map it to the right chart account.",
	},
	edit: {
		title: "Edit Discount",
		description: "Update the discount value, module availability, and account mapping.",
	},
	view: {
		title: "View Discount",
		description: "Review the configured discount details before making changes.",
	},
} as const;
