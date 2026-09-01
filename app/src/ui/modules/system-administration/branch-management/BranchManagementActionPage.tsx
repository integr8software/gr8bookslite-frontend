"use client";

import { Building2 } from "lucide-react";
import { useBranchManagementActionPage } from "@/app/src/hooks/modules/system-administration/branch-management/useBranchManagementActionPage";
import { BillingNoticeDialog } from "@/app/src/ui/shared/app/BillingNoticeDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { BranchDetailsFields } from "@/app/src/ui/modules/system-administration/branch-management/BranchDetailsFields";
import { BranchManagementActionActions } from "@/app/src/ui/modules/system-administration/branch-management/BranchManagementActionActions";
import { BranchNotFound } from "@/app/src/ui/modules/system-administration/branch-management/BranchNotFound";


export function BranchManagementActionPage() {
	const action = useBranchManagementActionPage();

	if (action.needsRecord && !action.existingBranch) {
		return <BranchNotFound />;
	}

	return (
		<>
			<form onSubmit={action.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={BranchManagementActionCopy[action.mode].title}
					description={BranchManagementActionCopy[action.mode].description}
					eyebrow={
						<>
							<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
							System administration
						</>
					}
					actions={
						<BranchManagementActionActions
							branch={action.existingBranch}
							isReadonly={action.isReadonly}
							mode={action.mode}
							onDeleteBranch={action.handleDeleteBranch}
						/>
					}
				/>
				<BranchDetailsFields
					errors={action.errors}
					isReadonly={action.isReadonly}
					mainBranchOptions={action.mainBranchOptions}
					values={action.values}
					onInputChange={action.handleInputChange}
					onUpdateField={action.updateField}
				/>
			</form>
			<BillingNoticeDialog
				isOpen={action.isSaveBranchConfirmOpen}
				targetType={
					action.values.classification === "satellite"
						? "satellite"
						: "branch"
				}
				targetName={action.values.name}
				onCancel={() => action.setIsSaveBranchConfirmOpen(false)}
				onConfirm={action.handleConfirmSave}
			/>
		</>
	);
}



const BranchManagementActionCopy = {
	add: {
		title: "Add Branch",
		description:
			"New records are added to the branch list used by the topbar switcher.",
	},
	edit: {
		title: "Edit Branch",
		description: "Update the branch record shared with the topbar switcher.",
	},
	view: {
		title: "View Branch",
		description:
			"Review branch and satellite details used by the topbar switcher.",
	},
} as const;
