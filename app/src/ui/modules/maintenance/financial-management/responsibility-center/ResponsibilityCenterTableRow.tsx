import { Building2 } from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ResponsibilityCenterTableRowProps = {
	center: ResponsibilityCenter;
	parentName?: string;
	onStatusChangeCenter: (center: ResponsibilityCenter) => void;
};

export function ResponsibilityCenterTableRow({
	center,
	parentName,
	onStatusChangeCenter,
}: ResponsibilityCenterTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4 font-medium text-darknavy">
				{center.code}
			</td>
			<td className="px-4 py-4">
				<CenterIdentity center={center} parentName={parentName} />
			</td>
			<td className="px-4 py-4 text-darknavy">{center.type}</td>
			<td className="px-4 py-4 text-darknavy">{center.manager || "-"}</td>
			<td className="px-4 py-4">
				<StatusBadge status={center.status} />
			</td>
			<td className="px-4 py-4">
				<RowActions
					center={center}
					onStatusChangeCenter={onStatusChangeCenter}
				/>
			</td>
		</tr>
	);
}
function CenterIdentity({
	center,
	parentName,
}: {
	center: ResponsibilityCenter;
	parentName?: string;
}) {
	return (
		<div className="flex min-w-0 items-start gap-3">
			<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
				<Building2 className="h-5 w-5" aria-hidden="true" />
			</span>
			<div className="min-w-0">
				<h3 className="truncate text-sm font-semibold text-darknavy">
					{center.name}
				</h3>
				<p className="mt-1 truncate text-xs text-darknavy/50">
					{parentName
						? `Reports to ${parentName}`
						: "Top-level center"}
				</p>
			</div>
		</div>
	);
}
function RowActions({
	center,
	onStatusChangeCenter,
}: {
	center: ResponsibilityCenter;
	onStatusChangeCenter: (center: ResponsibilityCenter) => void;
}) {
	const nextStatus = center.status === "Active" ? "Inactive" : "Active";

	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${ResponsibilityCenterHref}/view/${center.id}`}
				label={`View ${center.name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${ResponsibilityCenterHref}/edit/${center.id}`}
				label={`Edit ${center.name}`}
			/>
			<ModuleTableActionButton
				variant={nextStatus === "Inactive" ? "inactive" : "active"}
				onClick={() => onStatusChangeCenter(center)}
				label={`Set ${center.name} as ${nextStatus.toLowerCase()}`}
			/>
		</ModuleTableActions>
	);
}

function StatusBadge({ status }: { status: ResponsibilityCenter["status"] }) {
	const statusClass =
		status === "Active"
			? "bg-citron/25 text-darknavy"
			: "bg-darknavy/8 text-darknavy/55";

	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
		>
			{status}
		</span>
	);
}
