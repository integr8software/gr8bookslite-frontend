import type {
	TermsMaintenance,
	TermsMaintenancePermissions,
	TermsMaintenanceTableRowProps,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

export function TermsMaintenanceTableRow({
	row,
	permissions,
	onEditTerm,
	onToggleStatus,
	onViewTerm,
}: TermsMaintenanceTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<TermsMaintenanceTableCell
					key={cell.id}
					className={getColumnMetaClassName(cell.column.columnDef.meta)}
				>
					<TermsMaintenanceCellContent
						columnId={cell.column.id}
						term={row.original}
						permissions={permissions}
						onEditTerm={onEditTerm}
						onToggleStatus={onToggleStatus}
						onViewTerm={onViewTerm}
					/>
				</TermsMaintenanceTableCell>
			))}
		</tr>
	);
}

function TermsMaintenanceCellContent({
	columnId,
	term,
	permissions,
	onEditTerm,
	onToggleStatus,
	onViewTerm,
}: {
	columnId: string;
	term: TermsMaintenance;
	permissions: TermsMaintenancePermissions;
	onEditTerm: (term: TermsMaintenance) => void;
	onToggleStatus: (term: TermsMaintenance) => void;
	onViewTerm: (term: TermsMaintenance) => void;
}) {
	const nextStatus = term.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel =
		term.status === "Active" ? "Deactivate" : "Activate";

	switch (columnId) {
		case "name":
			return <span className="font-medium text-darknavy">{term.name}</span>;
		case "description":
			return (
				<span className="block truncate text-darknavy/75" title={term.description}>
					{term.description || ""}
				</span>
			);
		case "datemode":
			return <span>{term.datemode}</span>;
		case "period":
			return <span>{term.period}</span>;
		case "status":
			return <ModuleStatusBadge status={term.status} />;
		case "createdBy":
			return <span>{term.createdBy ?? ""}</span>;
		case "createdAt":
			return <span>{formatDateTime(term.createdAt, { emptyValue: "", locale: "en-US" })}</span>;
		case "updatedBy":
			return <span>{term.updatedBy ?? ""}</span>;
		case "updatedAt":
			return <span>{formatDateTime(term.updatedAt, { emptyValue: "", locale: "en-US" })}</span>;
		case "actions":
			return (
				<ModuleTableActions
					data-spotlight-id="maintenance-record-actions"
					className="w-full !justify-center"
				>
					<ModuleTableActionButton
						variant="view"
						onClick={() => onViewTerm(term)}
						data-spotlight-id="maintenance-record-view"
						label={`View ${term.name}`}
					/>
					{permissions.canUpdate ? (
						<>
							<ModuleTableActionButton
								variant="edit"
								onClick={() => onEditTerm(term)}
								data-spotlight-id="maintenance-record-edit"
								label={`Edit ${term.name}`}
							/>
							<ModuleTableActionButton
								variant={nextStatus === "Inactive" ? "inactive" : "active"}
								onClick={() => onToggleStatus(term)}
								data-spotlight-id="maintenance-record-status"
								label={`${statusActionLabel} ${term.name}`}
							/>
						</>
					) : null}
				</ModuleTableActions>
			);
		default:
			return null;
	}
}

function TermsMaintenanceTableCell({
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

import { formatDateTime } from "@/app/src/utils/date.util";
