import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { TransactionTypeHref } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import type { TransactionType } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

type TransactionTypeTableRowProps = {
	transactionType: TransactionType;
	onDelete: (transactionType: TransactionType) => void;
};

export function TransactionTypeTableRow({
	transactionType,
	onDelete,
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
				<div className="flex items-center justify-end gap-1">
					<Link
						href={`${TransactionTypeHref}/view/${transactionType.id}`}
						aria-label={`View ${transactionType.description}`}
						className={tableActionClassName}
					>
						<Eye className="h-4 w-4" aria-hidden="true" />
					</Link>
					<Link
						href={`${TransactionTypeHref}/edit/${transactionType.id}`}
						aria-label={`Edit ${transactionType.description}`}
						className={tableActionClassName}
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
					</Link>
					<button
						type="button"
						onClick={() => onDelete(transactionType)}
						aria-label={`Delete ${transactionType.description}`}
						className="flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</td>
		</tr>
	);
}

const tableActionClassName =
	"flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
