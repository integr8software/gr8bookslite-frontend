import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	DateField,
	TextField,
	type DeliveryReceiptFieldUpdater,
} from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptFieldControls";

type DeliveryReceiptReferenceFieldsProps = {
	isReadonly: boolean;
	values: DeliveryReceiptFormValues;
	onUpdateField: DeliveryReceiptFieldUpdater<DeliveryReceiptFormValues>;
};

export function DeliveryReceiptReferenceFields({
	isReadonly,
	onUpdateField,
	values,
}: DeliveryReceiptReferenceFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<TextField
					id="delivery-receipt-transaction-no"
					label="Trans No."
					isRequired
					readOnly={isReadonly}
					value={values.transactionNo}
					onChange={(value) => onUpdateField("transactionNo", value)}
				/>
				<TextField
					id="delivery-receipt-so-no"
					label="SO No."
					readOnly={isReadonly}
					value={values.soNo}
					onChange={(value) => onUpdateField("soNo", value)}
				/>
				<DateField
					id="delivery-receipt-so-date"
					label="SO Date"
					readOnly={isReadonly}
					value={values.soDate}
					onChange={(value) => onUpdateField("soDate", value)}
				/>
				<TextField
					id="delivery-receipt-po-no"
					label="PO No."
					readOnly={isReadonly}
					value={values.poNo}
					onChange={(value) => onUpdateField("poNo", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<DateField
					id="delivery-receipt-document-date"
					label="Document Date"
					isRequired
					readOnly={isReadonly}
					value={values.documentDate}
					onChange={(value) => onUpdateField("documentDate", value)}
				/>
				<TextField
					id="delivery-receipt-status"
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					onChange={(value) => onUpdateField("status", value)}
				/>
				<TextField
					id="delivery-receipt-project-ref"
					label="ProjectRef"
					readOnly={isReadonly}
					value={values.projectRef}
					onChange={(value) => onUpdateField("projectRef", value)}
				/>
			</div>
		</div>
	);
}
