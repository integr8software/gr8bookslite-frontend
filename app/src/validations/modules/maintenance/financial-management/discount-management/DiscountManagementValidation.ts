import type {
	DiscountManagementFormErrors,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

export function validateDiscountManagementForm(
	values: DiscountManagementFormValues,
): DiscountManagementFormErrors {
	const errors: DiscountManagementFormErrors = {};
	const percentage = Number(values.percentage);

	if (!values.description.trim()) {
		errors.description = "Enter a description.";
	}

	if (!values.percentage.trim()) {
		errors.percentage = "Enter a discount percentage.";
	} else if (
		Number.isNaN(percentage) ||
		percentage < 0 ||
		percentage > 100
	) {
		errors.percentage = "Enter a percentage from 0 to 100.";
	}

	if (!values.accountId) {
		errors.accountId = "Select an account.";
	}

	return errors;
}
