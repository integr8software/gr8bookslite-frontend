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

export type FormSignatoryApiRow = {
	id: number;
	label: string;
	name: string;
	position: string | null;
	signatureName: string | null;
	signatureImage: string | null;
	signatureValidUntil: string | null;
	isThisTemporary: boolean | null;
};

export type FormSignatoryApiSetup = {
	id: number;
	companyId: number;
	unit: {
		id: number;
		companyId: number;
		code: string | null;
		name: string;
		displayName: string | null;
		type: string;
	};
	module: {
		id: number;
		code: string;
		name: string;
	};
	rows: FormSignatoryApiRow[];
	createdAt: string;
	updatedAt: string;
};

export type FormSignatoryOptionsApiResponse = {
	branches: Array<{
		id: number;
		companyId: number;
		code: string | null;
		name: string;
		displayName: string | null;
		type: string;
	}>;
	modules: Array<{
		id: number;
		code: string;
		name: string;
	}>;
};

export type SaveFormSignatoryRequest = {
	unitId: number;
	moduleCode: string;
	moduleName: string;
	rows: Array<{
		label: string;
		name: string;
		position?: string;
		signatureName?: string;
		signatureImage?: string;
		signatureValidUntil?: string;
		isThisTemporary?: boolean | null;
	}>;
};
