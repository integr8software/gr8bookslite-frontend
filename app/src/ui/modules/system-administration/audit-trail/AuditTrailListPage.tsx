"use client";

import { Activity, ListChecks, ListTree } from "lucide-react";
import { useAuditTrailListPage } from "@/app/src/hooks/modules/system-administration/audit-trail/useAuditTrailListPage";
import {
	ModuleHeader,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { AuditTrailTable } from "@/app/src/ui/modules/system-administration/audit-trail/AuditTrailTable";

export function AuditTrailListPage() {
	const page = useAuditTrailListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Audit Trail"
				description="Review user activity and record changes across every module available in the sidebar."
				eyebrow={
					<>
						<Activity className="h-3.5 w-3.5" aria-hidden="true" />
						System administration
					</>
				}
			/>
			<div className="grid gap-3 lg:grid-cols-3">
				<SummaryTile
					icon={Activity}
					label="Matched Logs"
					tone="bg-skyblue/12 text-darknavy"
					value={page.filteredCount}
				/>
				<SummaryTile
					icon={ListTree}
					label="Modules"
					tone="bg-citron/35 text-darknavy"
					value={page.matchedModuleCount}
				/>
				<SummaryTile
					icon={ListChecks}
					label="Total Logs"
					tone="bg-offwhite text-darknavy"
					value={page.recordCount}
				/>
			</div>
			<AuditTrailTable
				actionFilter={page.actionFilter}
				dateRangeFilter={page.dateRangeFilter}
				handleActionFilterChange={page.handleActionFilterChange}
				handleDateRangeFilterChange={page.handleDateRangeFilterChange}
				handleModuleFilterChange={page.handleModuleFilterChange}
				handleQueryChange={page.handleQueryChange}
				isLoading={page.isLoading}
				moduleFilter={page.moduleFilter}
				moduleOptions={page.moduleOptions}
				query={page.query}
				table={page.table}
			/>
		</section>
	);
}

function SummaryTile({
	icon: Icon,
	label,
	tone,
	value,
}: {
	icon: typeof Activity;
	label: string;
	tone: string;
	value: number;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-darknavy/58">{label}</p>
				<span
					className={joinClasses(
						"flex h-9 w-9 items-center justify-center rounded-lg",
						tone,
					)}
				>
					<Icon className="h-4 w-4" aria-hidden="true" />
				</span>
			</div>
			<p className="mt-3 text-2xl font-semibold text-darknavy">{value}</p>
		</div>
	);
}
