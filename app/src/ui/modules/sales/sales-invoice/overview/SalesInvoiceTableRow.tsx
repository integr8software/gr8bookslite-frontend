import {
	formatSalesInvoiceCurrency,
	formatSalesInvoiceDate,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceFormatters";
import type {
	SalesInvoiceRecord,
	SalesInvoiceStatus,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { SalesInvoiceRecordActions } from "@/app/src/ui/modules/sales/sales-invoice/overview/SalesInvoiceRecordActions";
import { SalesInvoiceStatusBadge } from "@/app/src/ui/modules/sales/sales-invoice/overview/SalesInvoiceStatusBadge";

export function SalesInvoiceTableRow({
	onUpdateStatus,
	record,
	rowId,
}: {
	onUpdateStatus: (record: SalesInvoiceRecord, status: SalesInvoiceStatus) => void;
	record: SalesInvoiceRecord;
	rowId: string;
}) {
	return (
		<tr
			key={rowId}
			className="module-table-row border-b border-darknavy/8 last:border-b-0"
		>
			<td className="px-4 py-4 font-semibold text-skyblue">
				{record.invoiceNo}
			</td>
			<td className="px-4 py-4">
				{formatSalesInvoiceDate(record.invoiceDate)}
			</td>
			<td className="px-4 py-4">{record.customerName}</td>
			<td className="px-4 py-4">{record.referenceNo}</td>
			<td className="px-4 py-4">{formatSalesInvoiceDate(record.dueDate)}</td>
			<td className="px-4 py-4 font-semibold text-darknavy">
				{formatSalesInvoiceCurrency(record.amount)}
			</td>
			<td className="px-4 py-4">
				<SalesInvoiceStatusBadge status={record.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<SalesInvoiceRecordActions
					record={record}
					onUpdateStatus={onUpdateStatus}
				/>
			</td>
		</tr>
	);
}
