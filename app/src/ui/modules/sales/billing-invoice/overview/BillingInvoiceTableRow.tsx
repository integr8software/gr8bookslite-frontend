import {
	formatBillingInvoiceCurrency,
	formatBillingInvoiceDate,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type {
	BillingInvoiceRecord,
	BillingInvoiceStatus,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { BillingInvoiceRecordActions } from "@/app/src/ui/modules/sales/billing-invoice/overview/BillingInvoiceRecordActions";
import { BillingInvoiceStatusBadge } from "@/app/src/ui/modules/sales/billing-invoice/overview/BillingInvoiceStatusBadge";

export function BillingInvoiceTableRow({
	record,
	rowId,
	onUpdateStatus,
}: {
	record: BillingInvoiceRecord;
	rowId: string;
	onUpdateStatus: (
		record: BillingInvoiceRecord,
		status: BillingInvoiceStatus,
	) => void;
}) {
	return (
		<tr
			key={rowId}
			className="module-table-row border-b border-darknavy/8 last:border-b-0"
		>
			<td className="px-4 py-4 font-semibold text-skyblue">
				{record.transactionNo}
			</td>
			<td className="px-4 py-4">
				{formatBillingInvoiceDate(record.documentDate)}
			</td>
			<td className="px-4 py-4">{record.customerName}</td>
			<td className="px-4 py-4">{record.invoiceNo}</td>
			<td className="px-4 py-4">{record.referenceNo}</td>
			<td className="px-4 py-4 font-semibold text-darknavy">
				{formatBillingInvoiceCurrency(record.amount)}
			</td>
			<td className="px-4 py-4">
				<BillingInvoiceStatusBadge status={record.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<BillingInvoiceRecordActions
					record={record}
					onUpdateStatus={onUpdateStatus}
				/>
			</td>
		</tr>
	);
}
