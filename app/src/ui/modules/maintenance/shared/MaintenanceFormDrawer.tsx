"use client";

import type { ReactNode } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type MaintenanceFormDrawerProps = {
	children: ReactNode;
	description: string;
	eyebrow: string;
	formId: string;
	isOpen: boolean;
	isReadonly?: boolean;
	isSaving: boolean;
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
	onClose,
	savingLabel = "Saving...",
	submitLabel = "Save",
	title,
}: MaintenanceFormDrawerProps) {
	const handleClose = () => {
		if (!isSaving) onClose();
	};

	return (
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
							type="submit"
							form={formId}
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
							{isSaving ? savingLabel : submitLabel}
						</button>
					)}
				</div>
			}
		>
			<div data-spotlight-id="maintenance-add-drawer-fields">
				{children}
			</div>
		</ModuleDrawer>
	);
}
