"use client";

import { useState, type ReactNode } from "react";
import { LoaderCircle, Save } from "lucide-react";
import {
	AnimatedPendingLabel,
	AppDialog,
} from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { MaintenanceSavingLabel } from "@/app/src/ui/modules/maintenance/shared/MaintenanceLoadingLabels";

type MaintenanceFormDrawerProps = {
	children: ReactNode;
	description: string;
	eyebrow: string;
	formId: string;
	isOpen: boolean;
	isReadonly?: boolean;
	isSaving: boolean;
	onBeforeSaveConfirm?: () => boolean;
	onClose: () => void;
	savingLabel?: string;
	submitLabel?: string;
	title: string;
};

export function MaintenanceFormDrawer({
	children,
	description,
	eyebrow,
	formId,
	isOpen,
	isReadonly = false,
	isSaving,
	onBeforeSaveConfirm,
	onClose,
	savingLabel = MaintenanceSavingLabel,
	submitLabel = "Save",
	title,
}: MaintenanceFormDrawerProps) {
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const {
		closeDialog: closeSaveDialog,
		isConfirmSubmitPending,
		submitFromDialog,
	} = useAppDialogFormSubmit({
		formId,
		isContainerOpen: isOpen,
		isDialogOpen: isSaveDialogOpen,
		isSubmitting: isSaving,
		onDialogOpenChange: setIsSaveDialogOpen,
	});
	const handleClose = () => {
		if (!isSaving) onClose();
	};
	const handleSaveRequest = () => {
		if (isSaving) {
			return;
		}

		if (onBeforeSaveConfirm && !onBeforeSaveConfirm()) {
			return;
		}

		setIsSaveDialogOpen(true);
	};
	return (
		<>
			<ModuleDrawer
				isOpen={isOpen}
				title={title}
				description={description}
				eyebrow={eyebrow}
				maxWidthClassName="max-w-4xl"
				onClose={handleClose}
				spotlightId="maintenance-add-drawer"
				footer={
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={handleClose}
							disabled={isSaving}
							className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-60`}
						>
							{isReadonly ? "Close" : "Cancel"}
						</button>
						{isReadonly ? null : (
							<button
								type="button"
								onClick={handleSaveRequest}
								data-spotlight-id="maintenance-add-drawer-save"
								disabled={isSaving}
								className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								{isSaving ? (
									<LoaderCircle
										className="h-4 w-4 animate-spin"
										aria-hidden="true"
									/>
								) : (
									<Save className="h-4 w-4" aria-hidden="true" />
								)}
								{isSaving ? (
									<AnimatedPendingLabel label={savingLabel} />
								) : (
									submitLabel
								)}
							</button>
						)}
					</div>
				}
			>
				<div data-spotlight-id="maintenance-add-drawer-fields">
					{children}
				</div>
			</ModuleDrawer>
			<AppDialog
				confirmLabel="Confirm"
				description="This will save the details entered in this maintenance form."
				iconTone="question"
				isOpen={isSaveDialogOpen}
				isPending={isConfirmSubmitPending}
				pendingLabel={savingLabel}
				title={`${submitLabel}?`}
				tone="success"
				onCancel={closeSaveDialog}
				onConfirm={submitFromDialog}
			/>
		</>
	);
}
