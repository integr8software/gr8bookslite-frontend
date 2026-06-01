import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type TermManagementTableRowProps = {
	term: TermManagement;
	onDeleteTerm: (term: TermManagement) => void;
};

export function TermManagementTableRow({
	term,
	onDeleteTerm,
}: TermManagementTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4 font-medium text-darknavy">
				{term.description}
			</td>
			<td className="px-4 py-4 text-darknavy">{term.datemode}</td>
			<td className="px-4 py-4 text-darknavy">{term.period}</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${TermManagementHref}/view/${term.id}`}
						label={`View ${term.description}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${TermManagementHref}/edit/${term.id}`}
						label={`Edit ${term.description}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDeleteTerm(term)}
						label={`Delete ${term.description}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
