import { TransactionTypeHref } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import type { TransactionType } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type TransactionTypeTableRowProps = {
	transactionType: TransactionType;
	onDelete: (transactionType: TransactionType) => void;
	onEdit: (transactionType: TransactionType) => void;
};

export function TransactionTypeTableRow({
	transactionType,
	onDelete,
	onEdit,
}: TransactionTypeTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4 font-semibold text-darknavy">
				{transactionType.type}
			</td>
			<td className="px-4 py-4 text-darknavy">
				{transactionType.description}
			</td>
			<td className="px-4 py-4 text-darknavy">
				{transactionType.accountCode}
			</td>
			<td className="px-4 py-4 text-darknavy">
				{transactionType.accountTitle}
			</td>
			<td className="px-4 py-4 text-darknavy">
				{transactionType.status}
			</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${TransactionTypeHref}/view/${transactionType.id}`}
						label={`View ${transactionType.description}`}
					/>
					<ModuleTableActionButton
						variant="edit"
						onClick={() => onEdit(transactionType)}
						label={`Edit ${transactionType.description}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDelete(transactionType)}
						label={`Delete ${transactionType.description}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
