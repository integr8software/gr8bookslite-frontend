"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Edit3, Save, UserCog, X } from "lucide-react";
import {
	WorkspaceCompanyNotFoundDescription,
	WorkspaceUsersManagementHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { useWorkspaceUserActionForm } from "@/app/src/hooks/workspace/users-management/useWorkspaceUserActionForm";
import {
	moduleHeaderActionClassNames,
	ModuleHeader,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { WorkspaceUserAssignmentsSection } from "@/app/src/ui/workspace/users-management/WorkspaceUserAssignmentsSection";
import { WorkspaceUserDetailsSection } from "@/app/src/ui/workspace/users-management/WorkspaceUserDetailsSection";

const WorkspaceUserFormId = "workspace-user-management-form";

export function WorkspaceUserAction() {
	return (
		<Suspense fallback={null}>
			<WorkspaceUserActionInner />
		</Suspense>
	);
}

function WorkspaceUserActionInner() {
	const form = useWorkspaceUserActionForm();

	if (form.mode !== "add" && !form.existingUser) {
		return (
			<ModuleNotFound
				actionHref={WorkspaceUsersManagementHref}
				actionLabel="Back"
				align="center"
				description={WorkspaceCompanyNotFoundDescription}
				title="User Not Found"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={
					form.mode === "view"
						? "View User"
						: form.mode === "edit"
							? "Edit User"
							: "Add User"
				}
				description="Create a workspace user once, then assign access to multiple companies and their branches or satellites."
				eyebrow={
					<>
						<UserCog className="h-3.5 w-3.5" aria-hidden="true" />
						Users Management
					</>
				}
				actions={
					<>
						<Link
							href={WorkspaceUsersManagementHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							{form.mode === "view" ? (
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							) : (
								<X className="h-4 w-4" aria-hidden="true" />
							)}
							{form.mode === "view" ? "Back" : "Cancel"}
						</Link>
						{form.mode === "view" && form.existingUser ? (
							<Link
								href={`${WorkspaceUsersManagementHref}/edit/${form.existingUser.id}`}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Edit3 className="h-4 w-4" aria-hidden="true" />
								Edit
							</Link>
						) : null}
						{!form.isReadonly ? (
							<button
								type="submit"
								form={WorkspaceUserFormId}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save User
							</button>
						) : null}
					</>
				}
			/>
			<form
				id={WorkspaceUserFormId}
				onSubmit={(event) => {
					event.preventDefault();
					form.submit();
				}}
			>
				<div className="grid gap-5">
					<WorkspaceUserDetailsSection
						errors={form.errors}
						isEmailReadonly={form.mode !== "add"}
						isReadonly={form.isReadonly}
						values={form.values}
						onUpdateField={form.updateField}
					/>
					<WorkspaceUserAssignmentsSection
						availableCompanies={form.availableCompanies}
						branches={form.branches}
						companies={form.companies}
						errors={form.errors}
						isReadonly={form.isReadonly}
						selectedCompanyId={form.selectedCompanyId}
						values={form.values}
						onAddCompany={form.openCompanyAssignmentConfirm}
						onRemoveCompany={form.removeCompanyAssignment}
						onSelectedCompanyChange={form.setSelectedCompanyId}
						onToggleBranch={form.toggleBranchAssignment}
					/>
				</div>
			</form>
			<AppDialog
				isOpen={Boolean(form.pendingCompanyId)}
				isPending={false}
				title="Add company access?"
				description="Adding this user to another company may affect billing, including user access costs, payments, or deductions. Confirm before adding the company assignment."
				confirmLabel="Confirm Add"
				cancelLabel="Cancel"
				tone="default"
				onCancel={form.closeCompanyAssignmentConfirm}
				onConfirm={form.confirmCompanyAssignment}
			/>
		</section>
	);
}
