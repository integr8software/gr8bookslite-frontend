export type FormSignatoryRow = {
	id: string;
	label: string;
	isThisTemporary?: boolean | null;
	name: string;
	position: string;
	setupId?: string;
	signatureName: string;
	signaturePreview: string;
	signatureValidUntil: string;
};

export type FormSignatorySetupRecord = {
	id: string;
	branch: string;
	branchName: string;
	module: string;
	moduleName: string;
	rows: FormSignatoryRow[];
};

export type FormSignatoryActionMode = "add" | "edit" | "list";

export type FormSignatorySelectOption = {
	label: string;
	value: string;
};

export type FormSignatoryBranchOption = FormSignatorySelectOption & {
	code?: string | null;
	type?: string;
};

export type FormSignatoryModuleOption = FormSignatorySelectOption & {
	id?: string;
};

export type FormSignatoryOptions = {
	branches: FormSignatoryBranchOption[];
	modules: FormSignatoryModuleOption[];
};

export type FormSignatoryBootstrap = FormSignatoryOptions & {
	setups: FormSignatorySetupRecord[];
};

export type FormSignatoryToolbarProps = {
	branch: string;
	branchOptions: FormSignatoryBranchOption[];
	isEditing: boolean;
	isLoading: boolean;
	isScopedRowEdit: boolean;
	maxRows: number;
	module: string;
	moduleOptions: FormSignatoryModuleOption[];
	signatoryFilterLabel: string;
	signatoryCount: number;
	onAddRow: () => void;
	onBranchChange: (value: string) => void;
	onModuleChange: (value: string) => void;
	onReset: () => void;
	onSignatoryFilterChange: (value: string) => void;
};

