"use client";

import Link from "next/link";
import { CheckCircle2, ListChecks, Plus, ShieldCheck, Users } from "lucide-react";
import { ApprovalManagementHref } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import { useApprovalManagementListPage } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagementListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ApprovalManagementTable } from "./ApprovalManagementTable";

export function ApprovalManagementListPage() {
	const page = useApprovalManagementListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Approval Management"
				description="Maintain module approval workflows with staged approvers and proceed conditions."
				eyebrow={
					<>
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
						System administration
					</>
				}
				actions={
					<Link
						href={`${ApprovalManagementHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Workflow
					</Link>
				}
			/>
			<div className="grid gap-3 lg:grid-cols-3">
				<SummaryTile
					icon={ShieldCheck}
					label="Active Workflows"
					value={String(page.activeWorkflowCount)}
				/>
				<SummaryTile
					icon={ListChecks}
					label="Approval Stages"
					value={String(page.totalStageCount)}
				/>
				<SummaryTile
					icon={Users}
					label="All-Approver Stages"
					value={String(page.allApproverStageCount)}
				/>
			</div>
			<ApprovalManagementTable
				approverNameById={page.approverNameById}
				handleQueryChange={page.handleQueryChange}
				handleStatusFilterChange={page.handleStatusFilterChange}
				isLoading={page.isLoading}
				query={page.query}
				setPendingInactiveWorkflow={page.setPendingInactiveWorkflow}
				statusFilter={page.statusFilter}
				table={page.table}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingInactiveWorkflow)}
				isPending={page.isMutating}
				title="Set workflow as inactive?"
				description={`This will stop ${page.pendingInactiveWorkflow?.moduleName ?? "the selected workflow"} from routing new approvals.`}
				confirmLabel="Set Inactive"
				tone="danger"
				onCancel={() => page.setPendingInactiveWorkflow(null)}
				onConfirm={page.handleConfirmInactive}
			/>
		</section>
	);
}

function SummaryTile({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof CheckCircle2;
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
