import {
	formatWorkspaceBillingTransactionAmount,
	formatWorkspaceBillingTransactionCategory,
	formatWorkspaceBillingTransactionDate,
} from "@/app/src/data/workspace/billing-and-transactions/WorkspaceBillingTransactionsData";
import type { WorkspaceBillingTransactionRecord } from "@/app/src/types/workspace/billing-and-transactions/WorkspaceBillingTransactionsTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type WorkspaceBillingTransactionsTableRowProps = {
	onSelect: () => void;
	record: WorkspaceBillingTransactionRecord;
};

export function WorkspaceBillingTransactionsTableRow({
	onSelect,
	record,
}: WorkspaceBillingTransactionsTableRowProps) {
	return (
		<tr
			className="module-table-row cursor-pointer"
			onClick={onSelect}
			tabIndex={0}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect();
				}
			}}
		>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{record.invoiceNo}
			</td>
			<td className="px-4 py-4 text-xs font-semibold text-darknavy/58">
				{formatWorkspaceBillingTransactionDate(record.date)}
			</td>
			<td className="px-4 py-4">
				<p className="line-clamp-2 text-sm leading-5 text-darknavy/72">
					{record.description}
				</p>
				<p className="mt-1 text-xs text-darknavy/45">{record.companyName}</p>
			</td>
			<td className="px-4 py-4 text-sm font-medium text-darknavy/72">
				{formatWorkspaceBillingTransactionCategory(record.category)}
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy">
					{record.billingMode}
				</span>
			</td>
			<td className="px-4 py-4">
				<ModuleStatusBadge status={record.status} />
			</td>
			<td
				className={joinClasses(
					"px-4 py-4 text-right text-sm font-semibold",
					record.amount < 0 ? "text-emerald-700" : "text-darknavy",
				)}
			>
				{formatWorkspaceBillingTransactionAmount(
					record.amount,
					record.currencyCode,
				)}
			</td>
		</tr>
	);
}
