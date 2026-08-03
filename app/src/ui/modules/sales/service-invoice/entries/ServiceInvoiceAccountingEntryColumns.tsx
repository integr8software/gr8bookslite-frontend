import type { ServiceInvoiceAccountingEntry } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	ServiceInvoiceEntryAmountInput,
	ServiceInvoiceEntryTextInput,
} from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceEntryCellControls";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

type ServiceInvoiceAccountingEntryUpdater = (
	rowId: string,
	updates: Partial<Omit<ServiceInvoiceAccountingEntry, "id">>,
) => void;

export function createServiceInvoiceAccountingEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: ServiceInvoiceAccountingEntryUpdater,
): ModuleDataEntryColumn<ServiceInvoiceAccountingEntry>[] {
	return [
		{
			header: "Acct Code",
			id: "accountCode",
			width: 180,
			widthClassName: "w-[11rem]",
			widthMode: "fixed",
			renderCell: (entry, _index, context) => (
				<ServiceInvoiceEntryTextInput
					id={context.fieldId}
					name={context.fieldName}
					value={entry.accountCode}
					readOnly={isReadonly}
					onChange={(value) => onUpdateEntry(entry.id, { accountCode: value })}
				/>
			),
		},
		{
			header: "Acct Title",
			id: "accountTitle",
			width: 420,
			widthClassName: "w-[26rem]",
			widthMode: "fixed",
			renderCell: (entry, _index, context) => (
				<ServiceInvoiceEntryTextInput
					id={context.fieldId}
					name={context.fieldName}
					value={entry.accountTitle}
					readOnly={isReadonly}
					onChange={(value) => onUpdateEntry(entry.id, { accountTitle: value })}
				/>
			),
		},
		{
			header: "Debit",
			id: "debit",
			width: 180,
			widthClassName: "w-[11rem]",
			widthMode: "fixed",
			renderCell: (entry, _index, context) => (
				<ServiceInvoiceEntryAmountInput
					id={context.fieldId}
					name={context.fieldName}
					value={entry.debit > 0 ? String(entry.debit) : ""}
					readOnly={isReadonly}
					onValueChange={(value) => {
						const debit = parseMoneyNumberInput(value);

						onUpdateEntry(entry.id, {
							credit: debit > 0 ? 0 : entry.credit,
							debit,
						});
					}}
				/>
			),
		},
		{
			header: "Credit",
			id: "credit",
			width: 180,
			widthClassName: "w-[11rem]",
			widthMode: "fixed",
			renderCell: (entry, _index, context) => (
				<ServiceInvoiceEntryAmountInput
					id={context.fieldId}
					name={context.fieldName}
					value={entry.credit > 0 ? String(entry.credit) : ""}
					readOnly={isReadonly}
					onValueChange={(value) => {
						const credit = parseMoneyNumberInput(value);

						onUpdateEntry(entry.id, {
							credit,
							debit: credit > 0 ? 0 : entry.debit,
						});
					}}
				/>
			),
		},
	];
}
