"use client";

import {
	Activity,
	Building2,
	CheckCircle2,
	Database,
	XCircle,
} from "lucide-react";
import { useMasterAuditLogListPage } from "@/app/src/hooks/master/audit-logs/useMasterAuditLogListPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MasterAuditLogTable } from "@/app/src/ui/master/audit-logs/MasterAuditLogTable";

export function MasterAuditLogListPage() {
	const page = useMasterAuditLogListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Platform Logs"
				title="Audit Logs"
				description="Review tenant activity across companies, modules, users, records, and security-sensitive actions."
			/>
			<MasterAuditLogSummary
				errorCount={page.errorCount}
				filteredCount={page.filteredCount}
				isResultCapped={page.isResultCapped}
				recordCount={page.recordCount}
				successCount={page.successCount}
				tableRecordCount={page.tableRecordCount}
				uniqueCompanies={page.uniqueCompanies}
			/>
			<MasterAuditLogTable {...page} />
		</section>
	);
}

function MasterAuditLogSummary({
	errorCount,
	filteredCount,
	isResultCapped,
	recordCount,
	successCount,
	tableRecordCount,
	uniqueCompanies,
}: {
	errorCount: number;
	filteredCount: number;
	isResultCapped: boolean;
	recordCount: number;
	successCount: number;
	tableRecordCount: number;
	uniqueCompanies: number;
}) {
	const metrics = [
		{
			icon: Activity,
			label: "Matched Logs",
			tone: "bg-skyblue/12 text-darknavy",
			value: filteredCount,
		},
		{
			icon: CheckCircle2,
			label: "Success",
			tone: "bg-citron/35 text-darknavy",
			value: successCount,
		},
		{
			icon: XCircle,
			label: "Errors",
			tone: "bg-coralpink/12 text-coralpink",
			value: errorCount,
		},
		{
			icon: Building2,
			label: "Companies",
			tone: "bg-citron/35 text-darknavy",
			value: uniqueCompanies,
		},
		{
			icon: Database,
			label: isResultCapped ? "Loaded Cap" : "Loaded",
			tone: "bg-offwhite text-darknavy",
			value: `${tableRecordCount}/${recordCount}`,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
