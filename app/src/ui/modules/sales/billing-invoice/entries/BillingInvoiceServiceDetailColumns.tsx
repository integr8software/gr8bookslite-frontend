import type { BillingInvoiceLineEntry } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createServiceInvoiceServiceDetailColumns } from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceServiceDetailColumns";

type BillingInvoiceLineEntryUpdater = (
	rowId: string,
	updates: Partial<BillingInvoiceLineEntry>,
) => void;

export function createBillingInvoiceServiceDetailColumns(
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceLineEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceLineEntry>[] {
	return createServiceInvoiceServiceDetailColumns(
		isReadonly,
		(rowId, updates) =>
			onUpdateEntry(
				rowId,
				updates as unknown as Partial<BillingInvoiceLineEntry>,
			),
	) as unknown as ModuleDataEntryColumn<BillingInvoiceLineEntry>[];
}
