import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

type ResponsibilityCenterSetStatusDialogProps = {
	center: ResponsibilityCenter | null | undefined;
	isPending: boolean;
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

export function ResponsibilityCenterSetStatusDialog({
	center,
	isOpen,
	isPending,
	onCancel,
	onConfirm,
}: ResponsibilityCenterSetStatusDialogProps) {
	const nextStatus = center?.status === "Active" ? "Inactive" : "Active";
	const title =
		nextStatus === "Inactive"
			? "Set responsibility center as inactive?"
			: "Set responsibility center as active?";
	const confirmLabel =
		nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active";

	return (
		<AppConfirmDialog
			isOpen={isOpen}
			isPending={isPending}
			title={title}
			description={`This will mark ${
				center?.name ?? "the selected center"
			} as ${nextStatus.toLowerCase()} while keeping its record available for reference.`}
			confirmLabel={confirmLabel}
			tone="danger"
			onCancel={onCancel}
			onConfirm={onConfirm}
		/>
	);
}
