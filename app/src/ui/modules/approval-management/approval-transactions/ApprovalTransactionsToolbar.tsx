import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type Props = {
	approverOptions: AppAdvancedDropdownOption[];
	isRefreshing: boolean;
	moduleOptions: AppAdvancedDropdownOption[];
	query: string;
	ruleOptions: AppAdvancedDropdownOption[];
	selectedApproverId: string;
	selectedModuleCode: string;
	selectedRuleId: string;
	onApproverChange: (value: string) => void;
	onModuleChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onRuleChange: (value: string) => void;
};

export function ApprovalTransactionsToolbar(props: Props) {
	return (
		<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_3.25rem]">
			<ModuleTableSearch
				label="Search approval transactions"
				placeholder="Search reference, module, rule, or approver"
				value={props.query}
				onChange={props.onQueryChange}
			/>
			<SearchableModuleFilter
				options={props.moduleOptions}
				value={props.selectedModuleCode}
				onChange={props.onModuleChange}
			/>
			<ModuleTableFilterSelect label="Rule" options={toFilterOptions(props.ruleOptions)} value={props.selectedRuleId} onChange={props.onRuleChange} />
			<ModuleTableFilterSelect label="Approver" options={toFilterOptions(props.approverOptions)} value={props.selectedApproverId} onChange={props.onApproverChange} />
			<ModuleTableResetButton isRefreshing={props.isRefreshing} onClick={props.onRefresh} />
		</ModuleTableToolbar>
	);
}

function SearchableModuleFilter({
	onChange,
	options,
	value,
}: {
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	value: string;
}) {
	return (
		<div className="relative min-w-0">
			<label
				htmlFor="approval-transactions-module"
				className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70"
			>
				Module
			</label>
			<AppAdvancedDropdown
				id="approval-transactions-module"
				isClearable={false}
				isSearchable
				options={options}
				placeholder="Select module"
				searchPlaceholder="Search modules"
				value={value}
				onChange={(nextValue) => onChange(String(nextValue))}
			/>
		</div>
	);
}

function toFilterOptions(options: AppAdvancedDropdownOption[]) {
	return options.map((option) => ({
		label: option.name,
		value: option.value,
	}));
}
