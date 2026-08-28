"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit3, LoaderCircle, Save } from "lucide-react";
import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
	useWorkspaceUserActionForm,
	type WorkspaceUserActionMode,
} from "@/app/src/hooks/workspace/users-management/useWorkspaceUserActionForm";
import type { WorkspaceCompanyUserRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { BillingNoticeDialog } from "@/app/src/ui/shared/app/BillingNoticeDialog";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";

import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { WorkspaceUserAssignmentsSection } from "@/app/src/ui/workspace/users-management/WorkspaceUserAssignmentsSection";
import { WorkspaceUserDrawerSpotlightTutorial } from "@/app/src/ui/workspace/users-management/WorkspaceUserDrawerSpotlightTutorial";
import { WorkspaceUserDetailsSection } from "@/app/src/ui/workspace/users-management/WorkspaceUserDetailsSection";

const WorkspaceUserFormId = "workspace-user-management-form";

type WorkspaceUserDrawerProps = {
	isOpen: boolean;
	mode: WorkspaceUserActionMode;
	onClose: () => void;
	showSpotlightTutorial?: boolean;
	user?: WorkspaceCompanyUserRecord;
};

export function WorkspaceUserDrawer({
	isOpen,
	mode,
	onClose,
	showSpotlightTutorial = true,
	user,
}: WorkspaceUserDrawerProps) {
	return (
		<WorkspaceUserDrawerPanel
			key={`${mode}-${user?.id ?? "new-user"}`}
			isOpen={isOpen}
			mode={mode}
			onClose={onClose}
			showSpotlightTutorial={showSpotlightTutorial}
			user={user}
		/>
	);
}

function WorkspaceUserDrawerPanel({
	isOpen,
	mode,
	onClose,
	showSpotlightTutorial = true,
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

	async function handleConfirmSaveUser() {
		await form.submit();
		setIsSaveUserConfirmOpen(false);
	}

	return (
		<>
			<ModuleDrawer
				isOpen={isOpen}
				title={title}
				description="Create a workspace user once, then assign access to multiple companies and their branches or satellites."
				eyebrow="Users management"
				maxWidthClassName="max-w-5xl"
				onClose={onClose}
				spotlightId="workspace-user-drawer"
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
								data-spotlight-id="workspace-user-drawer-save"
								disabled={form.isSaving}
								aria-busy={form.isSaving}
								className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								{form.isSaving ? (
									<LoaderCircle
										className="h-4 w-4 animate-spin"
										aria-hidden="true"
									/>
								) : (
									<Save className="h-4 w-4" aria-hidden="true" />
								)}
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
					<div data-spotlight-id="workspace-user-drawer-details">
						<WorkspaceUserDetailsSection
							errors={form.errors}
							isEmailReadonly={!form.canEditEmail}
							isReadonly={form.isReadonly}
							values={form.values}
							onUpdateField={form.updateField}
						/>
					</div>
					<div data-spotlight-id="workspace-user-drawer-assignments">
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
							onUpdateCompanyRole={form.updateCompanyRole}
						/>
					</div>
				</form>

			</ModuleDrawer>
			{showSpotlightTutorial && (form.mode === "add" || form.mode === "edit") ? (
				<WorkspaceUserDrawerSpotlightTutorial
					isOpen={isOpen}
					mode={form.mode}
				/>
			) : null}
			<BillingNoticeDialog
				isOpen={Boolean(form.pendingCompanyId)}
				targetType="company_access"
				onCancel={form.closeCompanyAssignmentConfirm}
				onConfirm={form.confirmCompanyAssignment}
			/>
			<BillingNoticeDialog
				isOpen={isSaveUserConfirmOpen}
				isPending={form.isSaving}
				targetType="user"
				targetName={form.values.name}
				onCancel={() => setIsSaveUserConfirmOpen(false)}
				onConfirm={handleConfirmSaveUser}
			/>
		</>
	);

}
