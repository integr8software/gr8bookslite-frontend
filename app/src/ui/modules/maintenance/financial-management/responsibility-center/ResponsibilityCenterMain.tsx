"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenter";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterStatus,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ResponsibilityCenterSetStatusDialog } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterSetStatusDialog";
import { ResponsibilityCenterTable } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTable";

export function ResponsibilityCenterMain() {
	const centers = useResponsibilityCenterStore((state) => state.centers);
	const updateCenter = useResponsibilityCenterStore(
		(state) => state.updateCenter,
	);
	const isMutating = useResponsibilityCenterStore((state) => state.isMutating);
	const [pendingStatusCenter, setPendingStatusCenter] =
		useState<ResponsibilityCenter | null>(null);

	function handleConfirmStatusChange() {
		if (!pendingStatusCenter) {
			return;
		}

		const nextStatus: ResponsibilityCenterStatus =
			pendingStatusCenter.status === "Active" ? "Inactive" : "Active";

		updateCenter({
			...pendingStatusCenter,
			status: nextStatus,
			updatedAt: new Date().toISOString(),
		});
		setPendingStatusCenter(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Responsibility Center"
				description="Maintain accountability centers for cost, revenue, profit, and investment reporting."
				eyebrow={
					<>
						<Home className="h-3.5 w-3.5" aria-hidden="true" />
						Accounting master data
					</>
				}
				actions={
					<Link
						href={`${ResponsibilityCenterHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Center
					</Link>
				}
			/>
			<ResponsibilityCenterTable
				centers={centers}
				onStatusChangeCenter={setPendingStatusCenter}
			/>
			<ResponsibilityCenterSetStatusDialog
				center={pendingStatusCenter}
				isOpen={Boolean(pendingStatusCenter)}
				isPending={isMutating}
				onCancel={() => setPendingStatusCenter(null)}
				onConfirm={handleConfirmStatusChange}
			/>
		</section>
	);
}
