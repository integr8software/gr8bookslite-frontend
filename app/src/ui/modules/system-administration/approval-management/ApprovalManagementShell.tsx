"use client";

import { ShieldCheck } from "lucide-react";
import { useApprovalManagementListPage } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagementListPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ApprovalManagementSidepanel } from "@/app/src/ui/modules/system-administration/approval-management/sidepanel/ApprovalManagementSidepanel";
import { ApprovalManagementEditor } from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementEditor";

export function ApprovalManagementShell() {
	const page = useApprovalManagementListPage();

	return (
		<section className="approval-management-shell grid min-h-0 gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Approval Management"
				description="Maintain approval matrices with amount limits and staged approvers."
				eyebrow={
					<>
						<ShieldCheck
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
						System administration
					</>
				}
			/>

			<div className="approval-management-list-page grid min-h-[38rem] min-w-0 items-stretch overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm xl:grid-cols-[minmax(22rem,0.85fr)_minmax(0,1.35fr)]">
				<ApprovalManagementSidepanel
					isLoading={page.isLoading}
					query={page.query}
					selectedWorkflowId={page.selectedWorkflowId}
					statusFilter={page.statusFilter}
					workflows={page.workflows}
					onQueryChange={page.handleQueryChange}
					onSelectWorkflow={page.handleSelectWorkflow}
					onStatusFilterChange={page.handleStatusFilterChange}
				/>

				<ApprovalManagementEditor
					derivedApprovalLevelCount={page.derivedApprovalLevelCount}
					errors={page.errors}
					isApproverSetupsLoading={page.isApproverSetupsLoading}
					isLoading={page.isLoading}
					isMutating={page.isMutating}
					selectedApproverType={page.selectedApproverType}
					selectedWorkflow={page.selectedWorkflow}
					values={page.values}
					visibleApproverSetupRecords={page.visibleApproverSetupRecords}
					onAddAmountConditionRule={page.addAmountConditionRule}
					onAmountConditionModeChange={page.updateAmountConditionMode}
					onApproverTypeChange={page.setSelectedApproverType}
					onRemoveAmountConditionRule={page.removeAmountConditionRule}
					onRoutingRuleFieldChange={page.updateRoutingRuleField}
					onRoutingRuleStageToggle={page.toggleRoutingRuleStage}
					onSubmit={page.handleSubmit}
				/>
			</div>
		</section>
	);
}
