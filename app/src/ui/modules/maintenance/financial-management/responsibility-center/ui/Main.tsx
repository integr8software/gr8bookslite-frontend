"use client";

import { useState } from "react";
import { AppConfirmDialog } from "@/app/src/ui/shared/AppConfirmDialog";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenter";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import { ResponsibilityCenterHeader } from "./ResponsibilityCenterHeader";
import { ResponsibilityCenterTable } from "./ResponsibilityCenterTable";

export function ResponsibilityCenterMain() {
	const centers = useResponsibilityCenterStore((state) => state.centers);
	const deleteCenter = useResponsibilityCenterStore(
		(state) => state.deleteCenter,
	);
	const isMutating = useResponsibilityCenterStore((state) => state.isMutating);
	const [pendingDeleteCenter, setPendingDeleteCenter] =
		useState<ResponsibilityCenter | null>(null);

	function handleConfirmDelete() {
		if (!pendingDeleteCenter) {
			return;
		}

		deleteCenter(pendingDeleteCenter.id);
		setPendingDeleteCenter(null);
	}

	return (
		<section className="grid gap-5">
			<ResponsibilityCenterHeader />
			<ResponsibilityCenterTable
				centers={centers}
				onDeleteCenter={setPendingDeleteCenter}
			/>
			<AppConfirmDialog
				isOpen={Boolean(pendingDeleteCenter)}
				isPending={isMutating}
				title="Delete responsibility center?"
				description={`This will remove ${pendingDeleteCenter?.name ?? "the selected center"} and clear it from any child center hierarchy.`}
				confirmLabel="Delete Center"
				tone="danger"
				onCancel={() => setPendingDeleteCenter(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
