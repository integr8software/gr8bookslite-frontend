export type AppAdvancedDropdownOption = {
	children?: AppAdvancedDropdownOption[];
	description?: string;
	disabled?: boolean;
	href?: string;
	label?: string;
	name: string;
	selectedDetails?: string;
	/** Stable record ID or business code. Never use the display name. */
	value: string;
};

export type AppAdvancedDropdownAddAction = {
	disabled?: boolean;
	label: string;
	onClick: () => void;
};

export type AppAdvancedDropdownOptionView = "grid" | "list";

export type AppAdvancedDropdownSelectionMode = "single" | "multiple";

export type AppAdvancedDropdownProps = {
	addAction?: AppAdvancedDropdownAddAction;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean;
	"aria-labelledby"?: string;
	ariaDescribedBy?: string;
	ariaInvalid?: boolean;
	ariaLabelledBy?: string;
	className?: string;
	disabled?: boolean;
	emptyMessage?: string;
	id?: string;
	isClearable?: boolean;
	isSearchable?: boolean;
	menuMinWidth?: number;
	name?: string;
	menuPortal?: boolean;
	optionViewToggle?: boolean;
	options: AppAdvancedDropdownOption[];
	placeholder?: string;
	readOnly?: boolean;
	removeSelectionOnSelectedOptionClick?: boolean;
	searchPlaceholder?: string;
	selectionMode?: AppAdvancedDropdownSelectionMode;
	showSelectionIndicator?: boolean;
	showSelectedDetails?: boolean;
	showSelectionRemoveButton?: boolean;
	title?: string;
	value: string | string[];
	onChange: (value: string | string[]) => void;
	onOpen?: () => void;
	onSelectOption?: (option: AppAdvancedDropdownOption) => void;
};

export type AppLookupDropdownProps = {
	addAction?: AppAdvancedDropdownAddAction;
	emptyMessage?: string;
	id?: string;
	onChange: (idOrCode: string, name: string) => void;
	options: AppAdvancedDropdownOption[];
	placeholder: string;
	readOnly?: boolean;
	searchPlaceholder: string;
	value: string;
};
