import {
	AuditTrailActionOptions,
	AuditTrailDateRangeOptions,
} from "@/app/src/constants/modules/system-administration/audit-trail/AuditTrailConstants";
import type {
	AuditTrailAction,
	AuditTrailDateRange,
	AuditTrailModuleOption,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type AuditTrailTableFiltersProps = {
	actionFilter: AuditTrailAction | "all";
	dateRangeFilter: AuditTrailDateRange;
	moduleFilter: string;
	moduleOptions: AuditTrailModuleOption[];
	query: string;
	onActionFilterChange: (value: AuditTrailAction | "all") => void;
	onDateRangeFilterChange: (value: AuditTrailDateRange) => void;
	onModuleFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
};

export function AuditTrailTableFilters({
	actionFilter,
	dateRangeFilter,
	moduleFilter,
	moduleOptions,
	onActionFilterChange,
	onDateRangeFilterChange,
	onModuleFilterChange,
	onQueryChange,
	query,
}: AuditTrailTableFiltersProps) {
	return (
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none xl:grid-cols-[minmax(24rem,2.5fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(11rem,1fr)]">
			<ModuleTableSearch
				label="Search audit trail records"
				value={query}
				onChange={onQueryChange}
				placeholder="Search activity, user, module, record, or IP"
			/>
			<ModuleTableFilterSelect
				label="Date"
				value={dateRangeFilter}
				options={AuditTrailDateRangeOptions}
				onChange={(value) =>
					onDateRangeFilterChange(value as AuditTrailDateRange)
				}
			/>
			<ModuleTableFilterSelect
				label="Module"
				value={moduleFilter}
				options={[
					{ label: "All", value: "all" },
					...moduleOptions.map((module) => ({
						label: module.label,
						value: module.key,
					})),
				]}
				onChange={onModuleFilterChange}
			/>
			<ModuleTableFilterSelect
				label="Action"
				value={actionFilter}
				options={[
					{ label: "All", value: "all" },
					...AuditTrailActionOptions.map((action) => ({
						label: action,
						value: action,
					})),
				]}
				onChange={(value) =>
					onActionFilterChange(value as AuditTrailAction | "all")
				}
			/>
			<ModuleTableResetButton
				onClick={() => {
					onQueryChange("");
					onDateRangeFilterChange("30d");
					onModuleFilterChange("all");
					onActionFilterChange("all");
				}}
			>
				Reset
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}
