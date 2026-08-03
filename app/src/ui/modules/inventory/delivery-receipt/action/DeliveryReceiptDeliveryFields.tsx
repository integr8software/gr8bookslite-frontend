import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	TextField,
	type DeliveryReceiptFieldUpdater,
} from "@/app/src/ui/modules/inventory/delivery-receipt/action/DeliveryReceiptFieldControls";

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
		<div className="grid min-w-0 content-start gap-x-8 gap-y-3 xl:grid-cols-3">
			<TextField
				id="delivery-receipt-driver-name"
				label="Driver Name"
				readOnly={isReadonly}
				value={values.driverName}
				onChange={(value) => onUpdateField("driverName", value)}
			/>
			<TextField
				id="delivery-receipt-plate-no"
				label="Plate No"
				readOnly={isReadonly}
				value={values.plateNo}
				onChange={(value) => onUpdateField("plateNo", value)}
			/>
		</div>
	);
}
