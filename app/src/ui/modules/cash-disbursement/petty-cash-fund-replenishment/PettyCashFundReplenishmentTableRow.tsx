import { PettyCashFundReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import type { PettyCashFundReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

const tableCellClassName = "px-4 py-3 text-sm text-darknavy/70";

type PettyCashFundReplenishmentTableRowProps = {
	onDelete: (row: PettyCashFundReplenishmentRecord) => void;
	onEdit: (row: PettyCashFundReplenishmentRecord) => void;
	row: PettyCashFundReplenishmentRecord;
};

export function PettyCashFundReplenishmentTableRow({
	onDelete,
	onEdit,
	row,
}: PettyCashFundReplenishmentTableRowProps) {
	return (
		<tr className="module-table-row text-darknavy">
			<td className="px-4 py-3 text-sm font-semibold text-darknavy/80">
				{row.replenishmentNo}
			</td>
			<td className={tableCellClassName}>{row.vceCode}</td>
			<td className={tableCellClassName}>{row.vceName}</td>
			<td className={tableCellClassName}>{row.documentDate}</td>
			<td className={tableCellClassName}>{row.totalAmount}</td>
			<td className={tableCellClassName}>
				<PettyCashFundReplenishmentStatusBadge status={row.status} />
			</td>
			<td className="px-4 py-3 text-right">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${PettyCashFundReplenishmentHref}/view/${row.id}`}
						label={`View ${row.replenishmentNo}`}
					/>
					<ModuleTableActionButton
						variant="edit"
						onClick={() => onEdit(row)}
						label={`Edit ${row.replenishmentNo}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDelete(row)}
						label={`Delete ${row.replenishmentNo}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}

function PettyCashFundReplenishmentStatusBadge({
	status,
}: Pick<PettyCashFundReplenishmentRecord, "status">) {
	const toneClassName =
		status === "Active"
			? "bg-skyblue/10 text-skyblue"
			: status === "Pending"
				? "bg-amber-100 text-amber-700"
				: "bg-slate-100 text-slate-700";

	return (
		<span
			className={[
				"inline-flex rounded-full px-2 py-1 text-xs font-semibold",
				toneClassName,
			].join(" ")}
		>
			{status}
		</span>
	);
}
