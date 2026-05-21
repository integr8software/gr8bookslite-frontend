import type {
	TermManagement,
	TermManagementFormValues,
	TermManagementFormErrors,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export const MockTermManagements: TermManagement[] = [
	{
		id: "term-1",
		description: "Standard payment terms",
		datemode: "Month",
		period: "1",
	},
	{
		id: "term-2",
		description: "Annual review period",
		datemode: "Year",
		period: "1",
	},
];

export const TermManagementInitialFormValues: TermManagementFormValues = {
	description: "",
	datemode: "Month",
	period: "",
};

export function createTermManagementFormValues(
	term: TermManagement,
): TermManagementFormValues {
	return {
		description: term.description,
		datemode: term.datemode,
		period: term.period,
	};
}

export function createTermManagementFromForm(
	values: TermManagementFormValues,
): TermManagement {
	return {
		id: `term-${Date.now()}`,
		...values,
	};
}

export function updateTermManagementFromForm(
	term: TermManagement,
	values: TermManagementFormValues,
): TermManagement {
	return {
		...term,
		...values,
	};
}

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
