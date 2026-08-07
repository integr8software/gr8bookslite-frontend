"use client";

import type { ReactNode } from "react";
import { ModuleResizableDialog } from "@/app/src/ui/shared/module/ModuleResizableDialog";

type ModuleImportDialogProps = {
	actions?: ReactNode;
	children: ReactNode;
	description: ReactNode;
	footer: ReactNode;
	isBusy?: boolean;
	isOpen: boolean;
	progress?: ReactNode;
	title: string;
	titleId: string;
	onClose: () => void;
};

export function ModuleImportDialog({
	actions,
	children,
	description,
	footer,
	isBusy = false,
	isOpen,
	progress,
	title,
	titleId,
	onClose,
}: ModuleImportDialogProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<ModuleResizableDialog
			actions={actions}
			closeLabel={`Close ${title.toLowerCase()}`}
			description={description}
			footer={footer}
			isBusy={isBusy}
			isOpen={isOpen}
			progress={progress}
			title={title}
			titleId={titleId}
			className="module-import-dialog"
			onClose={onClose}
		>
			{children}
		</ModuleResizableDialog>
	);
}
