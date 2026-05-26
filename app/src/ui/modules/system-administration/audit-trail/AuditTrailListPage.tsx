"use client";

import { Activity, AlertTriangle, ListTree } from "lucide-react";
import { useAuditTrailListPage } from "@/app/src/hooks/modules/system-administration/audit-trail/useAuditTrailListPage";
import {
	ModuleHeader,
} from "@/app/src/ui/shared/module/ModuleHeader";
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
					label="Audit Events"
					value={String(page.recordCount)}
				/>
				<SummaryTile
					icon={ListTree}
					label="Sidebar Modules"
					value={String(page.moduleOptions.length)}
				/>
				<SummaryTile
					icon={AlertTriangle}
					label="Critical Events"
					value={String(page.criticalCount)}
				/>
			</div>
			<AuditTrailTable
				actionFilter={page.actionFilter}
				handleActionFilterChange={page.handleActionFilterChange}
				handleModuleFilterChange={page.handleModuleFilterChange}
				handleQueryChange={page.handleQueryChange}
				handleSeverityFilterChange={page.handleSeverityFilterChange}
				isLoading={page.isLoading}
				moduleFilter={page.moduleFilter}
				moduleOptions={page.moduleOptions}
				query={page.query}
				severityFilter={page.severityFilter}
				table={page.table}
			/>
		</section>
	);
}

function SummaryTile({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Activity;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
			<div className="flex items-center gap-3">
				<span className="flex h-10 w-10 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
					<Icon className="h-5 w-5" aria-hidden="true" />
				</span>
				<div>
					<div className="text-xl font-semibold text-darknavy">{value}</div>
					<div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
						{label}
					</div>
				</div>
			</div>
		</div>
	);
}
