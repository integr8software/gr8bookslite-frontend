import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	DateField,
	TextField,
	type DeliveryReceiptFieldUpdater,
} from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptFieldControls";

type DeliveryReceiptDeliveryFieldsProps = {
	isReadonly: boolean;
	values: DeliveryReceiptFormValues;
	onUpdateField: DeliveryReceiptFieldUpdater<DeliveryReceiptFormValues>;
};

export function DeliveryReceiptDeliveryFields({
	isReadonly,
	onUpdateField,
	values,
}: DeliveryReceiptDeliveryFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 content-start gap-4">
				<DateField
					id="delivery-receipt-delivery-date"
					label="Delivery Date"
					isRequired
					readOnly={isReadonly}
					value={values.deliveryDate}
					onChange={(value) => onUpdateField("deliveryDate", value)}
				/>
				<TextField
					id="delivery-receipt-driver-name"
					label="Driver Name"
					readOnly={isReadonly}
					value={values.driverName}
					onChange={(value) => onUpdateField("driverName", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<TextField
					id="delivery-receipt-plate-no"
					label="Plate No."
					readOnly={isReadonly}
					value={values.plateNo}
					onChange={(value) => onUpdateField("plateNo", value)}
				/>
			</div>
		</div>
	);
}
