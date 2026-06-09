"use client";

import { Activity, AlertTriangle, GitBranch, ListChecks } from "lucide-react";
import { useWorkspaceAuditLogListPage } from "@/app/src/hooks/workspace/audit-logs/useWorkspaceAuditLogListPage";
import type { WorkspaceAuditLogRecord } from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { WorkspaceAuditLogTable } from "@/app/src/ui/workspace/audit-logs/WorkspaceAuditLogTable";

type WorkspaceAuditLogListPageProps = {
	initialRecords?: WorkspaceAuditLogRecord[];
};

export function WorkspaceAuditLogListPage({
	initialRecords,
}: WorkspaceAuditLogListPageProps) {
	const page = useWorkspaceAuditLogListPage({ initialRecords });

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Company Administration"
				title="Audit Logs"
				description="Review company activity across branches, workspace users, modules, records, and approval-sensitive actions."
			/>
			<WorkspaceAuditLogSummary
				branchCount={page.branchCount}
				criticalCount={page.criticalCount}
				filteredCount={page.filteredCount}
				recordCount={page.recordCount}
			/>
			<WorkspaceAuditLogTable {...page} />
		</section>
	);
}

function WorkspaceAuditLogSummary({
	branchCount,
	criticalCount,
	filteredCount,
	recordCount,
}: {
	branchCount: number;
	criticalCount: number;
	filteredCount: number;
	recordCount: number;
}) {
	const metrics = [
		{
			icon: Activity,
			label: "Matched Logs",
			tone: "bg-skyblue/12 text-darknavy",
			value: filteredCount,
		},
		{
			icon: AlertTriangle,
			label: "Critical",
			tone: "bg-coralpink/12 text-coralpink",
			value: criticalCount,
		},
		{
			icon: GitBranch,
			label: "Branches",
			tone: "bg-citron/35 text-darknavy",
			value: branchCount,
		},
		{
			icon: ListChecks,
			label: "Total Logs",
			tone: "bg-offwhite text-darknavy",
			value: recordCount,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;

				return (
					<article
						key={metric.label}
						className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-medium text-darknavy/58">
								{metric.label}
							</p>
							<span
								className={joinClasses(
									"flex h-9 w-9 items-center justify-center rounded-lg",
									metric.tone,
								)}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
							</span>
						</div>
						<p className="mt-3 text-2xl font-semibold text-darknavy">
							{metric.value}
						</p>
					</article>
				);
			})}
		</div>
	);
}
