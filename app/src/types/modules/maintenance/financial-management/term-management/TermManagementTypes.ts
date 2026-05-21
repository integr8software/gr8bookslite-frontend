export type TermManagementDatemode = "Day" | "Month" | "Year";

export type TermManagement = {
	id: string;
	description: string;
	datemode: TermManagementDatemode;
	period: string;
};

export type TermManagementFormValues = {
	description: string;
	datemode: TermManagementDatemode;
	period: string;
};

export type TermManagementFormErrors = Partial<
	Record<keyof TermManagementFormValues, string>
>;

export type TermManagementActionMode = "add" | "edit" | "view";
