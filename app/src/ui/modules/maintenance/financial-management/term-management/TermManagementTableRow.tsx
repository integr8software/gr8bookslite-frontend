import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type TermManagementTableRowProps = {
	term: TermManagement;
	onEditTerm: (term: TermManagement) => void;
	onToggleStatus: (term: TermManagement) => void;
};

export function TermManagementTableRow({
	term,
	onEditTerm,
	onToggleStatus,
}: TermManagementTableRowProps) {
	const nextStatus = term.status === "Active" ? "Inactive" : "Active";

	return (
		<tr className="module-table-row">
			<td className="px-4 py-4 font-medium text-darknavy">
				{term.name}
			</td>
			<td className="px-4 py-4 text-darknavy">{term.datemode}</td>
			<td className="px-4 py-4 text-darknavy">{term.period}</td>
			<td className="px-4 py-4">
				<StatusBadge status={term.status} />
			</td>
			<td className="px-4 py-4">
				<ModuleTableActions className="justify-center">
					<ModuleTableActionLink
						variant="view"
						href={`${TermManagementHref}/view/${term.id}`}
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
			</td>
		</tr>
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
