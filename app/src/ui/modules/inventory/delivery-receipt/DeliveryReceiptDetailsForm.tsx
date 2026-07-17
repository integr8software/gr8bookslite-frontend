import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import { DeliveryReceiptCustomerFields } from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptCustomerFields";
import { DeliveryReceiptDeliveryFields } from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptDeliveryFields";
import { DeliveryReceiptReferenceFields } from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptReferenceFields";
import type { DeliveryReceiptFieldUpdater } from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptFieldControls";

export type DeliveryReceiptDetailsSection =
	| "customer"
	| "delivery"
	| "references";

type DeliveryReceiptDetailsFormProps = {
	isReadonly: boolean;
	section: DeliveryReceiptDetailsSection;
	values: DeliveryReceiptFormValues;
	onUpdateField: DeliveryReceiptFieldUpdater<DeliveryReceiptFormValues>;
};

export function DeliveryReceiptDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: DeliveryReceiptDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "customer" ? (
				<DeliveryReceiptCustomerFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "delivery" ? (
				<DeliveryReceiptDeliveryFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<DeliveryReceiptReferenceFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}
