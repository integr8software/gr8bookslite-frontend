import type {
	TermManagement,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export const MockTermManagements: TermManagement[] = [
	{
		id: "term-1",
		name: "Standard payment terms",
		description: "Default monthly payment cycle for standard transactions.",
		datemode: "Month",
		period: "1",
		status: "Active",
	},
	{
		id: "term-2",
		name: "Annual review period",
		description: "Yearly review cadence for long-running agreements.",
		datemode: "Year",
		period: "1",
		status: "Inactive",
	},
];

export const TermManagementInitialFormValues: TermManagementFormValues = {
	name: "",
	description: "",
	datemode: "Month",
	period: "",
	status: "Active",
};

export function createTermManagementFormValues(
	term: TermManagement,
): TermManagementFormValues {
	const legacyTerm = term as TermManagement & { description?: string };

	return {
		name: term.name ?? legacyTerm.description ?? "",
		description: term.description ?? "",
		datemode: term.datemode,
		period: term.period,
		status: term.status ?? "Active",
	};
}

export function createTermManagementFromForm(
	values: TermManagementFormValues,
): TermManagement {
	return {
		id: `term-${Date.now()}`,
		name: values.name.trim(),
		description: values.description.trim(),
		datemode: values.datemode,
		period: values.period.trim(),
		status: values.status,
	};
}

export function updateTermManagementFromForm(
	term: TermManagement,
	values: TermManagementFormValues,
): TermManagement {
	return {
		...term,
		name: values.name.trim(),
		description: values.description.trim(),
		datemode: values.datemode,
		period: values.period.trim(),
		status: values.status,
	};
}
