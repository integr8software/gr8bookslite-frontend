import type { Row } from "@tanstack/react-table";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type TermManagementTableRowProps = {
	row: Row<TermManagement>;
	onEditTerm: (term: TermManagement) => void;
	onToggleStatus: (term: TermManagement) => void;
	onViewTerm: (term: TermManagement) => void;
};

export function TermManagementTableRow({
	row,
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
	onEditTerm,
	onToggleStatus,
	onViewTerm,
}: {
	columnId: string;
	term: TermManagement;
	onEditTerm: (term: TermManagement) => void;
	onToggleStatus: (term: TermManagement) => void;
	onViewTerm: (term: TermManagement) => void;
}) {
	const nextStatus = term.status === "Active" ? "Inactive" : "Active";

	switch (columnId) {
		case "name":
			return <span className="font-medium text-darknavy">{term.name}</span>;
		case "description":
			return <span className="text-darknavy/75">{term.description}</span>;
		case "datemode":
			return <span>{term.datemode}</span>;
		case "period":
			return <span>{term.period}</span>;
		case "status":
			return <StatusBadge status={term.status} />;
		case "actions":
			return (
				<ModuleTableActions className="w-full !justify-center">
					<ModuleTableActionButton
						variant="view"
						onClick={() => onViewTerm(term)}
						label={`View ${term.name}`}
					/>
					<ModuleTableActionButton
						variant="edit"
						onClick={() => onEditTerm(term)}
						label={`Edit ${term.name}`}
					/>
					<ModuleTableActionButton
						variant={nextStatus === "Inactive" ? "inactive" : "active"}
						onClick={() => onToggleStatus(term)}
						label={`Set ${term.name} as ${nextStatus.toLowerCase()}`}
					/>
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
