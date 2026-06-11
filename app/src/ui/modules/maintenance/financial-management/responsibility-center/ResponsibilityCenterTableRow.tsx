import { Building2, CheckCircle2, CircleOff, Edit3, Eye } from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ResponsibilityCenterTableRowProps = {
	center: ResponsibilityCenter;
	parentName?: string;
	onStatusChangeCenter: (center: ResponsibilityCenter) => void;
	onEditCenter: (center: ResponsibilityCenter) => void;
};

export function ResponsibilityCenterTableRow({
	center,
	parentName,
	onStatusChangeCenter,
	onEditCenter,
}: ResponsibilityCenterTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<CenterIdentity center={center} parentName={parentName} />
			</td>
			<td className="px-4 py-4">
				<CategoryBadge category={center.category} />
			</td>
			<td className="px-4 py-4 text-darknavy">
				{parentName || <span className="text-darknavy/35">-</span>}
			</td>
			<td className="px-4 py-4">
				<FinancialTypeBadge financialType={center.financialType} />
			</td>
			<td className="px-4 py-4 text-darknavy">{center.manager || "-"}</td>
			<td className="px-4 py-4">
				<StatusBadge status={center.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<RowActions
					center={center}
					onStatusChangeCenter={onStatusChangeCenter}
					onEditCenter={() => onEditCenter(center)}
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
	onEditCenter,
}: {
	center: ResponsibilityCenter;
	onStatusChangeCenter: (center: ResponsibilityCenter) => void;
	onEditCenter: () => void;
}) {
	const nextStatus = center.status === "Active" ? "Inactive" : "Active";
	const items: ModuleActionMenuItem[] = [
		{
			href: `${ResponsibilityCenterHref}/view/${center.id}`,
			icon: Eye,
			label: "View",
			type: "link",
		},
		{
			icon: Edit3,
			label: "Edit",
			onSelect: onEditCenter,
			type: "button",
		},
		{
			icon: nextStatus === "Active" ? CheckCircle2 : CircleOff,
			label: `Set as ${nextStatus}`,
			onSelect: () => onStatusChangeCenter(center),
			tone: nextStatus === "Inactive" ? "danger" : "default",
			type: "button",
		},
	];

	return (
		<ModuleTableActions className="justify-center">
			<ModuleActionMenu
				items={items}
				label={`Actions for ${center.name}`}
			/>
		</ModuleTableActions>
	);
}

export function CategoryBadge({
	category,
}: {
	category: ResponsibilityCenter["category"];
}) {
	return (
		<span className="inline-flex rounded-full bg-skyblue/12 px-2.5 py-1 text-xs font-semibold text-darknavy">
			{category}
		</span>
	);
}

export function FinancialTypeBadge({
	financialType,
}: {
	financialType: ResponsibilityCenter["financialType"];
}) {
	return (
		<span className="inline-flex rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-darknavy">
			{financialType}
		</span>
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
