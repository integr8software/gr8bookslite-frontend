import type {
	TransactionType,
	TransactionTypeTableRecord,
} from "@/app/src/types/modules/maintenance/inventory-transaction-type/TransactionTypeTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type TransactionTypeTableRowProps = {
	transactionType: TransactionTypeTableRecord;
	onEdit: (transactionType: TransactionType) => void;
	onToggleStatus: (transactionType: TransactionType) => void;
	onView: (transactionType: TransactionType) => void;
};

export function TransactionTypeTableRow({
	transactionType,
	onEdit,
	onToggleStatus,
	onView,
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
					<ModuleTableActionButton
						variant="view"
						onClick={() => onView(transactionType)}
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
