import type { ReactNode } from "react";
import type {
	TransactionType,
	TransactionTypeTableRecord,
	TransactionTypeTableRowProps,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

export function TransactionTypeTableRow({
	row,
	onEdit,
	onToggleStatus,
	onView,
}: TransactionTypeTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<TransactionTypeTableCell
					key={cell.id}
					className={getColumnMetaClassName(cell.column.columnDef.meta)}
				>
					<TransactionTypeCellContent
						columnId={cell.column.id}
						transactionType={row.original}
						onEdit={onEdit}
						onToggleStatus={onToggleStatus}
						onView={onView}
					/>
				</TransactionTypeTableCell>
			))}
		</tr>
	);
}

function TransactionTypeCellContent({
	columnId,
	transactionType,
	onEdit,
	onToggleStatus,
	onView,
}: {
	columnId: string;
	transactionType: TransactionTypeTableRecord;
	onEdit: (transactionType: TransactionType) => void;
	onToggleStatus: (transactionType: TransactionType) => void;
	onView: (transactionType: TransactionType) => void;
}) {
	switch (columnId) {
		case "name":
			return <span className="font-semibold text-darknavy">{transactionType.name}</span>;
		case "description":
			return (
				<span className="block truncate text-darknavy" title={transactionType.description}>
					{transactionType.description}
				</span>
			);
		case "moduleLabel":
			return <span className="text-darknavy">{transactionType.moduleLabel}</span>;
		case "accountLabel":
			return <span className="text-darknavy">{transactionType.accountLabel}</span>;
		case "status":
			return <span className="text-darknavy">{transactionType.status}</span>;
		case "actions":
			return (
				<ModuleTableActions className="justify-center">
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
			);
		default:
			return null;
	}
}

function TransactionTypeTableCell({
	className = "text-left",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>
			{children}
		</td>
	);
}
