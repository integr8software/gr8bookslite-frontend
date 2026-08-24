import {
	formatMasterInvoiceCurrency,
	formatMasterInvoiceDate,
} from "@/app/src/data/master/invoices/MasterInvoiceData";
import type { MasterInvoiceRecord } from "@/app/src/types/master/invoices/MasterInvoiceTypes";
import {
	MasterInvoicePaymentMethodBadge,
	MasterInvoiceStatusBadge,
	MasterInvoiceTransactionTypeBadge,
} from "@/app/src/ui/master/invoices/MasterInvoiceBadges";

type MasterInvoiceTableRowProps = {
	record: MasterInvoiceRecord;
};

export function MasterInvoiceTableRow({ record }: MasterInvoiceTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{record.invoiceNo}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{record.referenceNo}
				</p>
			</td>
			<td className="px-4 py-4">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-darknavy">
						{record.subscriberName}
					</p>
					<p className="mt-1 truncate text-sm text-darknavy/50">
						{record.ownerName}
					</p>
				</div>
			</td>
			<td className="px-4 py-4">
				<MasterInvoiceTransactionTypeBadge
					transactionType={record.transactionType}
				/>
			</td>
			<td className="px-4 py-4">
				<p className="line-clamp-2 text-sm font-semibold text-darknavy">
					{record.availedItem}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{record.planName} - {record.billingPeriod}
				</p>
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{formatMasterInvoiceDate(record.transactionDate)}
			</td>
			<td className="px-4 py-4">
				<MasterInvoicePaymentMethodBadge
					paymentMethod={record.paymentMethod}
				/>
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{formatMasterInvoiceCurrency(record.amount)}
			</td>
			<td className="px-4 py-4">
				<MasterInvoiceStatusBadge status={record.status} />
			</td>
		</tr>
	);
}

