import type {
	TermManagement,
	TermManagementPermissions,
	TermManagementTableRowProps,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function TermManagementTableRow({
	row,
	permissions,
	onEditTerm,
	onToggleStatus,
	onViewTerm,
}: TermManagementTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<TermManagementTableCell
					key={cell.id}
					align={isCenteredColumn(cell.column.id) ? "center" : "left"}
				>
					<TermManagementCellContent
						columnId={cell.column.id}
						term={row.original}
						permissions={permissions}
						onEditTerm={onEditTerm}
						onToggleStatus={onToggleStatus}
						onViewTerm={onViewTerm}
					/>
				</TermManagementTableCell>
			))}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return ["actions", "datemode", "period", "status"].includes(columnId);
}

function TermManagementCellContent({
	columnId,
	term,
	permissions,
	onEditTerm,
	onToggleStatus,
	onViewTerm,
}: {
	columnId: string;
	term: TermManagement;
	permissions: TermManagementPermissions;
	onEditTerm: (term: TermManagement) => void;
	onToggleStatus: (term: TermManagement) => void;
	onViewTerm: (term: TermManagement) => void;
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
			return <StatusBadge status={term.status} />;
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

function TermManagementTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: React.ReactNode;
}) {
	return (
		<td
			className={`px-4 py-4 align-middle text-sm text-darknavy ${align === "center" ? "text-center" : "text-left"}`}
		>
			{children}
		</td>
	);
}

function StatusBadge({ status }: { status: TermManagement["status"] }) {
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
import { formatDateTime } from "@/app/src/utils/date.util";
