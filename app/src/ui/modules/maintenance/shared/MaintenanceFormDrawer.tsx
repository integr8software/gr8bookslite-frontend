"use client";

import type { ReactNode } from "react";
import { Save } from "lucide-react";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type MaintenanceFormDrawerProps = {
	children: ReactNode;
	description: string;
	eyebrow: string;
	formId: string;
	isOpen: boolean;
	isSaving: boolean;
	onClose: () => void;
	title: string;
};

export function MaintenanceFormDrawer({
	children,
	description,
	eyebrow,
	formId,
	isOpen,
	isSaving,
	onClose,
	title,
}: MaintenanceFormDrawerProps) {
	return (
		<ModuleDrawer
			isOpen={isOpen}
			title={title}
			description={description}
			eyebrow={eyebrow}
			maxWidthClassName="max-w-4xl"
			onClose={onClose}
			spotlightId="maintenance-add-drawer"
			footer={
				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onClose}
						disabled={isSaving}
						className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-60`}
					>
						Cancel
					</button>
					<button
						type="submit"
						form={formId}
						data-spotlight-id="maintenance-add-drawer-save"
						disabled={isSaving}
						className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						{isSaving ? "Saving..." : "Save"}
					</button>
				</div>
			}
		>
			<div data-spotlight-id="maintenance-add-drawer-fields">
				{children}
			</div>
		</ModuleDrawer>
	);
}
