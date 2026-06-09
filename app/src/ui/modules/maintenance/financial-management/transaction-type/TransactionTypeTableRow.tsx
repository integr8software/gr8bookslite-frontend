import { TransactionTypeHref } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import type {
	TransactionType,
	TransactionTypeTableRecord,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type TransactionTypeTableRowProps = {
	transactionType: TransactionTypeTableRecord;
	onEdit: (transactionType: TransactionType) => void;
	onToggleStatus: (transactionType: TransactionType) => void;
};

export function TransactionTypeTableRow({
	transactionType,
	onEdit,
	onToggleStatus,
}: TransactionTypeTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4 font-semibold text-darknavy">
				{transactionType.name}
			</td>
			<td className="px-4 py-4 text-darknavy">
				{transactionType.description}
			</td>
			<td className="px-4 py-4 text-darknavy">
				{transactionType.moduleLabel}
			</td>
			<td className="px-4 py-4 text-darknavy">
				{transactionType.accountLabel}
			</td>
			<td className="px-4 py-4 text-darknavy">
				{transactionType.status}
			</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${TransactionTypeHref}/view/${transactionType.id}`}
						label={`View ${transactionType.name}`}
					/>
					<ModuleTableActionButton
						variant="edit"
						onClick={() => onEdit(transactionType)}
						label={`Edit ${transactionType.name}`}
					/>
					<ModuleTableActionButton
						variant={transactionType.status === "Active" ? "inactive" : "active"}
						onClick={() => onToggleStatus(transactionType)}
						label={`${transactionType.status === "Active" ? "Deactivate" : "Activate"} ${transactionType.name}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
