import { SalesInvoiceHref } from "@/app/src/constants/modules/sales/sales-invoice/SalesInvoiceConstants";
import type {
	SalesInvoiceRecord,
	SalesInvoiceStatus,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function SalesInvoiceRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (record: SalesInvoiceRecord, status: SalesInvoiceStatus) => void;
	record: SalesInvoiceRecord;
}) {
	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				href={`${SalesInvoiceHref}/view/${record.id}`}
				label={`View ${record.invoiceNo}`}
				variant="view"
			/>
			<ModuleTableActionLink
				href={`${SalesInvoiceHref}/edit/${record.id}`}
				label={`Edit ${record.invoiceNo}`}
				variant="edit"
			/>
			<ModuleTableActionButton
				label={
					record.status === "Cancelled"
						? `Reactivate ${record.invoiceNo}`
						: `Cancel ${record.invoiceNo}`
				}
				onClick={() =>
					onUpdateStatus(
						record,
						record.status === "Cancelled" ? "Active" : "Cancelled",
					)
				}
				variant={record.status === "Cancelled" ? "active" : "inactive"}
			/>
		</ModuleTableActions>
	);
}
