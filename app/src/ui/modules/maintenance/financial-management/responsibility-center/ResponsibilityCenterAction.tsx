"use client";

import { useResponsibilityCenterAction } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenterAction";
import { ResponsibilityCenterActionHeader } from "./ResponsibilityCenterActionHeader";
import { ResponsibilityCenterDeleteDialog } from "./ResponsibilityCenterDeleteDialog";
import { ResponsibilityCenterDetailsFields } from "./ResponsibilityCenterDetailsFields";
import { ResponsibilityCenterNotFound } from "./ResponsibilityCenterNotFound";

export function ResponsibilityCenterAction() {
	const action = useResponsibilityCenterAction();
	const needsRecord = action.mode === "edit" || action.mode === "view";

	if (needsRecord && !action.center) {
		return <ResponsibilityCenterNotFound />;
	}

	return (
		<>
			<form onSubmit={action.onSubmit} className="grid gap-5">
				<ResponsibilityCenterActionHeader
					center={action.center}
					isReadonly={action.isReadonly}
					mode={action.mode}
					onDeleteCenter={() => action.setIsDeleteOpen(true)}
				/>
				<ResponsibilityCenterDetailsFields
					errors={action.errors}
					isReadonly={action.isReadonly}
					parentOptions={action.parentOptions}
					values={action.values}
					onInputChange={action.onInputChange}
				/>
			</form>
			<ResponsibilityCenterDeleteDialog
				center={action.center}
				isOpen={action.isDeleteOpen}
				isPending={action.isMutating}
				onCancel={() => action.setIsDeleteOpen(false)}
				onConfirm={action.onConfirmDelete}
			/>
		</>
	);
}
