import { formatDateTime } from "@/app/src/utils/date.util";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterPermissions,
	ResponsibilityCenterTableRowProps,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

export function ResponsibilityCenterTableRow({
	allCenters,
	permissions,
	row,
	onEditCenter,
	onToggleStatus,
	onViewCenter,
}: ResponsibilityCenterTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<ResponsibilityCenterTableCell
					key={cell.id}
					className={getColumnMetaClassName(cell.column.columnDef.meta)}
				>
					<ResponsibilityCenterCellContent
						allCenters={allCenters}
						center={row.original}
						columnId={cell.column.id}
						permissions={permissions}
						onEditCenter={onEditCenter}
						onToggleStatus={onToggleStatus}
						onViewCenter={onViewCenter}
					/>
				</ResponsibilityCenterTableCell>
			))}
		</tr>
	);
}

function ResponsibilityCenterCellContent({
	allCenters,
	center,
	columnId,
	permissions,
	onEditCenter,
	onToggleStatus,
	onViewCenter,
}: {
	allCenters: ResponsibilityCenter[];
	center: ResponsibilityCenter;
	columnId: string;
	permissions: ResponsibilityCenterPermissions;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onToggleStatus: (center: ResponsibilityCenter) => void;
	onViewCenter: (center: ResponsibilityCenter) => void;
}) {
	const parentName = center.parentId
		? allCenters.find((parentCenter) => parentCenter.id === center.parentId)?.name
		: "";
	const nextStatus = center.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel =
		center.status === "Active" ? "Deactivate" : "Activate";

	switch (columnId) {
		case "name":
			return <span className="font-medium text-darknavy">{center.name}</span>;
		case "code":
			return <span className="font-mono text-xs font-semibold">{center.code}</span>;
		case "description":
			return (
				<span className="block truncate text-darknavy/75" title={center.description}>
					{center.description ?? ""}
				</span>
			);
		case "category":
			return <CategoryBadge category={center.category} />;
		case "parentId":
			return parentName ? (
				<span>{parentName}</span>
			) : (
				<span className="text-darknavy/35">-</span>
			);
		case "financialType":
			return <FinancialTypeBadge financialType={center.financialType} />;
		case "manager":
			return <span>{center.manager || ""}</span>;
		case "status":
			return <StatusBadge status={center.status} />;
		case "createdBy":
			return <span>{center.createdBy ?? ""}</span>;
		case "createdAt":
			return (
				<span>
					{formatDateTime(center.createdAt, {
						emptyValue: "",
						invalidValue: "",
						locale: "en-US",
					})}
				</span>
			);
		case "updatedBy":
			return <span>{center.updatedBy ?? ""}</span>;
		case "updatedAt":
			return (
				<span>
					{formatDateTime(center.updatedAt, {
						emptyValue: "",
						invalidValue: "",
						locale: "en-US",
					})}
				</span>
			);
		case "actions":
			return (
				<ModuleTableActions
					data-spotlight-id="maintenance-record-actions"
					className="w-full !justify-center"
				>
					{permissions.canView ? (
						<ModuleTableActionButton
							variant="view"
							onClick={() => onViewCenter(center)}
							data-spotlight-id="maintenance-record-view"
							label={`View ${center.name}`}
						/>
					) : null}
					{permissions.canUpdate ? (
						<>
							<ModuleTableActionButton
								variant="edit"
								onClick={() => onEditCenter(center)}
								data-spotlight-id="maintenance-record-edit"
								label={`Edit ${center.name}`}
							/>
							<ModuleTableActionButton
								variant={nextStatus === "Inactive" ? "inactive" : "active"}
								onClick={() => onToggleStatus(center)}
								data-spotlight-id="maintenance-record-status"
								label={`${statusActionLabel} ${center.name}`}
							/>
						</>
					) : null}
				</ModuleTableActions>
			);
		default:
			return null;
	}
}

function ResponsibilityCenterTableCell({
	className = "text-left",
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<td
			className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}
		>
			{children}
		</td>
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

export function StatusBadge({ status }: { status: ResponsibilityCenter["status"] }) {
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
