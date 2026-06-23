import type {
	TermManagement,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";

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
