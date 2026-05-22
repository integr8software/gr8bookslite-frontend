"use client";

import { AppDialog } from "@/app/src/ui/shared/system/AppDialog";

type WorkspaceBillingImpactConfirmDialogProps = {
	description?: string;
	isOpen: boolean;
	isPending?: boolean;
	resourceName?: string;
	title?: string;
	onCancel: () => void;
	onConfirm: () => void;
};

export function WorkspaceBillingImpactConfirmDialog({
	description,
	isOpen,
	isPending = false,
	resourceName = "this item",
	title = "Confirm billing impact",
	onCancel,
	onConfirm,
}: WorkspaceBillingImpactConfirmDialogProps) {
	return (
		<AppDialog
			isOpen={isOpen}
			isPending={isPending}
			title={title}
			description={
				description ??
				`Adding ${resourceName} may affect workspace billing, including costs, payments, or deductions. Please confirm before continuing.`
			}
			confirmLabel="Confirm Add"
			cancelLabel="Cancel"
			tone="default"
			onCancel={onCancel}
			onConfirm={onConfirm}
		/>
	);
}

