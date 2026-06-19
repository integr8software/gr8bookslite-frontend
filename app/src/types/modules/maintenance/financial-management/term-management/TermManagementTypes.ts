export type TermManagementDatemode = "Day" | "Month" | "Year";

export type TermManagementStatus = "Active" | "Inactive";

export type TermManagement = {
	id: string;
	name: string;
	description: string;
	datemode: TermManagementDatemode;
	period: string;
	status: TermManagementStatus;
};

export type TermManagementFormValues = {
	name: string;
	description: string;
	datemode: TermManagementDatemode;
	period: string;
	status: TermManagementStatus;
};

export type TermManagementFormErrors = Partial<
	Record<keyof TermManagementFormValues, string>
>;

export type TermManagementActionMode = "add" | "edit" | "view";

export type TermManagementTableColumnKey =
	| "name"
	| "description"
	| "datemode"
	| "period"
	| "status";
