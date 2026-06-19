"use client";

import { ShieldCheck } from "lucide-react";
import { useApprovalManagementListPage } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagementListPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ApprovalManagementCatalog } from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementCatalog";
import { ApprovalManagementEditor } from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementEditor";

export function ApprovalManagementListPage() {
	const page = useApprovalManagementListPage();

	return (
		<section className="grid min-h-0 gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Approval Management"
				description="Maintain approval matrices with amount limits and staged approvers."
				eyebrow={
					<>
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
						System administration
					</>
				}
			/>

			<div className="approval-management-workspace grid min-h-[38rem] min-w-0 items-stretch overflow-hidden rounded-lg border shadow-sm xl:grid-cols-[minmax(20rem,0.8fr)_minmax(32rem,1.35fr)]">
				<ApprovalManagementCatalog
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
					approverOptions={page.approverOptions}
					errors={page.errors}
					isLoading={page.isLoading}
					isMutating={page.isMutating}
					selectedWorkflow={page.selectedWorkflow}
					values={page.values}
					onAddAmountConditionRule={page.addAmountConditionRule}
					onAmountConditionModeChange={page.updateAmountConditionMode}
					onInputChange={page.handleInputChange}
					onRemoveAmountConditionRule={page.removeAmountConditionRule}
					onRoutingRuleFieldChange={page.updateRoutingRuleField}
					onRoutingRuleStageToggle={page.toggleRoutingRuleStage}
					onStageFieldChange={page.updateStageField}
					onSubmit={page.handleSubmit}
				/>
			</div>
		</section>
	);
}
