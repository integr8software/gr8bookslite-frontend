import type {
	TermManagementFormErrors,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export function validateTermManagementForm(
	values: TermManagementFormValues,
): TermManagementFormErrors {
	const errors: TermManagementFormErrors = {};

	if (!values.description.trim()) {
		errors.description = "Enter a description.";
	}

	if (!values.datemode) {
		errors.datemode = "Select a datemode.";
	}

	if (!values.period.trim()) {
		errors.period = "Enter a period.";
	} else if (Number(values.period) <= 0 || Number.isNaN(Number(values.period))) {
		errors.period = "Enter a valid period.";
	}

	return errors;
}
