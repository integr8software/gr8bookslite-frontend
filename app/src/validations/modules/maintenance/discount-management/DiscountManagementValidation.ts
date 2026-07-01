import type {
	DiscountManagementFormErrors,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";

export function validateDiscountManagementForm(
	values: DiscountManagementFormValues,
): DiscountManagementFormErrors {
	const errors: DiscountManagementFormErrors = {};
	const amount = Number(values.amount);

	if (!values.name.trim()) {
		errors.name = "Enter a discount name.";
	}

	if (!values.description.trim()) {
		errors.description = "Enter a description.";
	} else if (values.description.trim().length > 500) {
		errors.description = "Description must be 500 characters or fewer.";
	}

	if (!values.discountType) {
		errors.discountType = "Select discount type.";
	}

	if (!values.amount.trim()) {
		errors.amount = "Enter a discount value.";
	} else if (Number.isNaN(amount) || amount < 0) {
		errors.amount = "Enter a valid discount value.";
	} else if (values.discountType === "Percentage" && amount > 100) {
		errors.amount = "Enter a percentage from 0 to 100.";
	}

	if (values.moduleIds.length === 0) {
		errors.moduleIds = "Select at least one module.";
	}

	if (!values.status) {
		errors.status = "Select status.";
	}

	if (!values.accountId) {
		errors.accountId = "Select an account.";
	}

	return errors;
}
