"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleOff, Edit3, Save, ShieldCheck, X } from "lucide-react";
import { useApprovalManagementFormPage } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagementFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ApprovalManagementForm } from "./ApprovalManagementForm";
import { ApprovalManagementNotFound } from "./ApprovalManagementNotFound";

export function ApprovalManagementFormPage() {
	return (
		<Suspense fallback={null}>
			<ApprovalManagementFormPageInner />
		</Suspense>
	);
}

function ApprovalManagementFormPageInner() {
	const page = useApprovalManagementFormPage();
	const [isInactiveDialogOpen, setIsInactiveDialogOpen] = useState(false);

	if (page.needsRecord && !page.existingWorkflow) {
		return <ApprovalManagementNotFound />;
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={
					page.mode === "view"
						? "View Approval Workflow"
						: page.mode === "edit"
							? "Edit Approval Workflow"
							: "Add Approval Workflow"
				}
				description="Set the module, approval stages, approvers, and stage completion rule."
				eyebrow={
					<>
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
						System administration
					</>
				}
				actions={
					<>
						{page.mode === "view" ? (
							<Link
								href={page.cancelHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
								Back
							</Link>
						) : null}
						{page.mode === "view" && page.editHref ? (
							<Link
								href={page.editHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Edit3 className="h-4 w-4" aria-hidden="true" />
								Edit
							</Link>
						) : null}
						{page.mode !== "view" ? (
							<Link
								href={page.cancelHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<X className="h-4 w-4" aria-hidden="true" />
								Cancel
							</Link>
						) : null}
						{page.existingWorkflow &&
						page.existingWorkflow.status === "Active" ? (
							<button
								type="button"
								onClick={() => setIsInactiveDialogOpen(true)}
								className={moduleHeaderActionClassNames.danger}
							>
								<CircleOff className="h-4 w-4" aria-hidden="true" />
								Set Inactive
							</button>
						) : null}
						{!page.isReadonly ? (
							<button
								type="submit"
								form="approval-management-form"
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						) : null}
					</>
				}
			/>
			<ApprovalManagementForm
				approverOptions={page.approverOptions}
				errors={page.errors}
				isReadonly={page.isReadonly}
				values={page.values}
				onInputChange={page.handleInputChange}
				onModuleCodeChange={page.handleModuleCodeChange}
				onStageFieldChange={page.updateStageField}
				onSubmit={page.handleSubmit}
			/>
			<AppDialog
				isOpen={isInactiveDialogOpen}
				isPending={page.isMutating}
				title="Set workflow as inactive?"
				description={`This will stop ${page.existingWorkflow?.moduleName ?? "the selected workflow"} from routing new approvals.`}
				confirmLabel="Set Inactive"
				tone="danger"
				onCancel={() => setIsInactiveDialogOpen(false)}
				onConfirm={page.handleStatusChange}
			/>
		</section>
	);
}
