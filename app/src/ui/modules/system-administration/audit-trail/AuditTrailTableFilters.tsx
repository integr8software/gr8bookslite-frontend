import { Search, X } from "lucide-react";
import {
	AuditTrailActionOptions,
	AuditTrailSeverityOptions,
} from "@/app/src/constants/modules/system-administration/audit-trail/AuditTrailConstants";
import type {
	AuditTrailAction,
	AuditTrailModuleOption,
	AuditTrailSeverity,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

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
		<div className="grid gap-3 border-b border-darknavy/10 bg-white p-4 xl:grid-cols-[minmax(16rem,1fr)_minmax(12rem,18rem)_auto] xl:items-center">
			<label className="relative min-w-0">
				<span className="sr-only">Search audit trail records</span>
				<Search
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35"
					aria-hidden="true"
				/>
				<input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Search activity, user, module, record, or IP"
					className="h-11 w-full rounded-md border border-darknavy/10 bg-offwhite/55 pl-9 pr-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
				/>
			</label>
			<select
				value={moduleFilter}
				onChange={(event) => onModuleFilterChange(event.target.value)}
				className={filterClassName}
				aria-label="Filter by module"
			>
				<option value="all">All sidebar modules</option>
				{moduleOptions.map((module) => (
					<option key={module.key} value={module.key}>
						{module.section} / {module.label}
					</option>
				))}
			</select>
			<div className="flex flex-wrap gap-2">
				<select
					value={actionFilter}
					onChange={(event) =>
						onActionFilterChange(event.target.value as AuditTrailAction | "all")
					}
					className={filterClassName}
					aria-label="Filter by action"
				>
					<option value="all">All actions</option>
					{AuditTrailActionOptions.map((action) => (
						<option key={action} value={action}>
							{action}
						</option>
					))}
				</select>
				<select
					value={severityFilter}
					onChange={(event) =>
						onSeverityFilterChange(
							event.target.value as AuditTrailSeverity | "all",
						)
					}
					className={filterClassName}
					aria-label="Filter by severity"
				>
					<option value="all">All severity</option>
					{AuditTrailSeverityOptions.map((severity) => (
						<option key={severity} value={severity}>
							{severity}
						</option>
					))}
				</select>
				<button
					type="button"
					onClick={() => {
						onQueryChange("");
						onModuleFilterChange("all");
						onActionFilterChange("all");
						onSeverityFilterChange("all");
					}}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30"
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Reset
				</button>
			</div>
		</div>
	);
}

const filterClassName =
	"h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20";
