"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { ResponsibilityCenterTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterTable } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenterTable";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ResponsibilityCenterTableRow } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTableRow";

type ResponsibilityCenterTableProps = {
	centers: ResponsibilityCenter[];
	toolbar?: ReactNode;
	onStatusChangeCenter: (center: ResponsibilityCenter) => void;
};

export function ResponsibilityCenterTable({
	centers,
	toolbar,
	onStatusChangeCenter,
}: ResponsibilityCenterTableProps) {
	const centerById = new Map(centers.map((center) => [center.id, center]));
	const table = useResponsibilityCenterTable(centers);

	return (
		<ModuleTable
			emptyDescription="Add a center to start grouping financial accountability."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No responsibility centers yet"
			minWidthClassName="min-w-[64rem]"
			paginationStorageKey={ResponsibilityCenterTablePaginationStorageKey}
			table={table}
			toolbar={toolbar}
			renderRow={({ id, original }) => (
				<ResponsibilityCenterTableRow
					key={id}
					center={original}
					parentName={
						original.parentId
							? centerById.get(original.parentId)?.name
							: undefined
					}
					onStatusChangeCenter={onStatusChangeCenter}
				/>
			)}
		/>
	);
}
