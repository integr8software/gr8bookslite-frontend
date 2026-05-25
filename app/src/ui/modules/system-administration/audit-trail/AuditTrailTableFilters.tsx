import {
	AuditTrailActionOptions,
	AuditTrailSeverityOptions,
} from "@/app/src/constants/modules/system-administration/audit-trail/AuditTrailConstants";
import type {
	AuditTrailAction,
	AuditTrailModuleOption,
	AuditTrailSeverity,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";
import {
	ModuleTableFilterButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

type AuditTrailTableFiltersProps = {
	actionFilter: AuditTrailAction | "all";
	moduleFilter: string;
	moduleOptions: AuditTrailModuleOption[];
	query: string;
	severityFilter: AuditTrailSeverity | "all";
	onActionFilterChange: (value: AuditTrailAction | "all") => void;
	onModuleFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onSeverityFilterChange: (value: AuditTrailSeverity | "all") => void;
};

export function AuditTrailTableFilters({
	actionFilter,
	moduleFilter,
	moduleOptions,
	onActionFilterChange,
	onModuleFilterChange,
	onQueryChange,
	onSeverityFilterChange,
	query,
	severityFilter,
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
				label="Module"
				value={moduleFilter}
				options={[
					{ label: "All sidebar modules", value: "all" },
					...moduleOptions.map((module) => ({
						label: `${module.section} / ${module.label}`,
						value: module.key,
					})),
				]}
				onChange={onModuleFilterChange}
			/>
			<ModuleTableFilterSelect
				label="Action"
				value={actionFilter}
				options={[
					{ label: "All actions", value: "all" },
					...AuditTrailActionOptions.map((action) => ({
						label: action,
						value: action,
					})),
				]}
				onChange={(value) =>
					onActionFilterChange(value as AuditTrailAction | "all")
				}
			/>
			<ModuleTableFilterSelect
				label="Severity"
				value={severityFilter}
				options={[
					{ label: "All severity", value: "all" },
					...AuditTrailSeverityOptions.map((severity) => ({
						label: severity,
						value: severity,
					})),
				]}
				onChange={(value) =>
					onSeverityFilterChange(value as AuditTrailSeverity | "all")
				}
			/>
			<ModuleTableFilterButton
				onClick={() => {
					onQueryChange("");
					onModuleFilterChange("all");
					onActionFilterChange("all");
					onSeverityFilterChange("all");
				}}
			>
				Reset
			</ModuleTableFilterButton>
		</ModuleTableToolbar>
	);
}
