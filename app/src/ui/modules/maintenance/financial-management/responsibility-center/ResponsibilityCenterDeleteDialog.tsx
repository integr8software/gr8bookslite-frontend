import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

type ResponsibilityCenterDeleteDialogProps = {
	center: ResponsibilityCenter | null | undefined;
	isPending: boolean;
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

export function ResponsibilityCenterDeleteDialog({
	center,
	isOpen,
	isPending,
	onCancel,
	onConfirm,
}: ResponsibilityCenterDeleteDialogProps) {
	return (
		<AppConfirmDialog
			isOpen={isOpen}
			isPending={isPending}
			title="Delete responsibility center?"
			description={`This will remove ${
				center?.name ?? "the selected center"
			} and clear it from any child center hierarchy.`}
			confirmLabel="Delete Center"
			tone="danger"
			onCancel={onCancel}
			onConfirm={onConfirm}
		/>
	);
}
