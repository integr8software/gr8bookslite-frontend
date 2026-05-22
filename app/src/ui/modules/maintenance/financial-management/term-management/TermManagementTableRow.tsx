import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

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
				<div className="flex items-center justify-end gap-1">
					<Link
						href={`${TermManagementHref}/view/${term.id}`}
						aria-label={`View ${term.description}`}
						className={tableActionClassName}
					>
						<Eye className="h-4 w-4" aria-hidden="true" />
					</Link>
					<Link
						href={`${TermManagementHref}/edit/${term.id}`}
						aria-label={`Edit ${term.description}`}
						className={tableActionClassName}
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
					</Link>
					<button
						type="button"
						onClick={() => onDeleteTerm(term)}
						aria-label={`Delete ${term.description}`}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</td>
		</tr>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
