import type {
	TermManagement,
	TermManagementFormValues,
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

