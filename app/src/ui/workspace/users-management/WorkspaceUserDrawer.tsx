"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit3, Save } from "lucide-react";
import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
	useWorkspaceUserActionForm,
	type WorkspaceUserActionMode,
} from "@/app/src/hooks/workspace/users-management/useWorkspaceUserActionForm";
import type { WorkspaceCompanyUserRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { WorkspaceUserAssignmentsSection } from "@/app/src/ui/workspace/users-management/WorkspaceUserAssignmentsSection";
import { WorkspaceUserDetailsSection } from "@/app/src/ui/workspace/users-management/WorkspaceUserDetailsSection";

const WorkspaceUserFormId = "workspace-user-management-form";

type WorkspaceUserDrawerProps = {
	isOpen: boolean;
	mode: WorkspaceUserActionMode;
	onClose: () => void;
	user?: WorkspaceCompanyUserRecord;
};

export function WorkspaceUserDrawer({
	isOpen,
	mode,
	onClose,
	user,
}: WorkspaceUserDrawerProps) {
	return (
		<WorkspaceUserDrawerPanel
			key={`${mode}-${user?.id ?? "new-user"}`}
			isOpen={isOpen}
			mode={mode}
			onClose={onClose}
			user={user}
		/>
	);
}

function WorkspaceUserDrawerPanel({
	isOpen,
	mode,
	onClose,
	user,
}: WorkspaceUserDrawerProps) {
	const form = useWorkspaceUserActionForm({
		existingUser: user,
		mode,
		onSaved: onClose,
	});
	const [isSaveUserConfirmOpen, setIsSaveUserConfirmOpen] = useState(false);
	const title =
		form.mode === "view"
			? "View User"
			: form.mode === "edit"
				? "Edit User"
				: "Add User";

	return (
		<>
			<ModuleDrawer
				isOpen={isOpen}
				title={title}
				description="Create a workspace user once, then assign access to multiple companies and their branches or satellites."
				eyebrow="Users management"
				maxWidthClassName="max-w-5xl"
				onClose={onClose}
				actions={
					form.mode === "view" && form.existingUser ? (
						<Link
							href={`${WorkspaceUsersManagementHref}/edit/${form.existingUser.id}`}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					) : null
				}
				footer={
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={onClose}
							disabled={form.isSaving}
							className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-60`}
						>
							{form.isReadonly ? "Close" : "Cancel"}
						</button>
						{!form.isReadonly ? (
							<button
								type="submit"
								form={WorkspaceUserFormId}
								disabled={form.isSaving}
								className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								{form.isSaving ? "Saving..." : "Save User"}
							</button>
						) : null}
					</div>
				}
			>
				<form
					id={WorkspaceUserFormId}
					onSubmit={(event) => {
						event.preventDefault();

						if (form.mode === "add") {
							if (form.validate()) {
								setIsSaveUserConfirmOpen(true);
							}
							return;
						}

						void form.submit();
					}}
					className="grid gap-5 px-6 py-5"
				>
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
				</form>
			</ModuleDrawer>
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
			<AppDialog
				isOpen={isSaveUserConfirmOpen}
				isPending={form.isSaving}
				title="Create user?"
				description={`Adding ${form.values.name || "this user"} may affect workspace billing, payments, or deductions. Type confirm add user before saving.`}
				confirmationPhrase="confirm add user"
				confirmLabel="Save User"
				pendingLabel="Saving..."
				cancelLabel="Cancel"
				tone="default"
				onCancel={() => setIsSaveUserConfirmOpen(false)}
				onConfirm={() => {
					void form
						.submit()
						.catch(() => undefined)
						.finally(() => setIsSaveUserConfirmOpen(false));
				}}
			/>
		</>
	);
}
