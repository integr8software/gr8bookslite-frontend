export type FormSignatoryRow = {
	id: string;
	label: string;
	name: string;
	position: string;
	signatureName: string;
	signaturePreview: string;
};

export type FormSignatorySetupRecord = {
	id: string;
	branch: string;
	module: string;
	rows: FormSignatoryRow[];
};

export type FormSignatoryActionMode = "add" | "edit" | "list";

export type FormSignatorySelectOption = {
	label: string;
	value: string;
};
