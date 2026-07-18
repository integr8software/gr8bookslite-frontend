import { PurchaseOrderStatusOptions } from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import type {
	PurchaseOrderFormValues,
	PurchaseOrderStatus,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import {
	DateField,
	SelectField,
	TextField,
	type PurchaseOrderFieldUpdater,
} from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderFieldControls";

type PurchaseOrderReferenceFieldsProps = {
	isReadonly: boolean;
	values: PurchaseOrderFormValues;
	onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderReferenceFields({
	isReadonly,
	onUpdateField,
	values,
}: PurchaseOrderReferenceFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<TextField
					id="purchase-order-trans-no"
					label="Trans No."
					readOnly={isReadonly}
					value={values.transNo}
					onChange={(value) => onUpdateField("transNo", value)}
				/>
				<DateField
					id="purchase-order-document-date"
					label="Document Date"
					readOnly={isReadonly}
					value={values.documentDate}
					onChange={(value) => onUpdateField("documentDate", value)}
				/>
				<TextField
					id="purchase-order-pr-no"
					label="PR No."
					readOnly={isReadonly}
					value={values.prNo}
					onChange={(value) => onUpdateField("prNo", value)}
				/>
				<SelectField
					id="purchase-order-status"
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					options={PurchaseOrderStatusOptions}
					onChange={(value) =>
						onUpdateField("status", value as PurchaseOrderStatus)
					}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<TextField
					id="purchase-order-project-ref"
					label="ProjectRef"
					readOnly={isReadonly}
					value={values.projectRef}
					onChange={(value) => onUpdateField("projectRef", value)}
				/>
				<TextField
					id="purchase-order-project-name"
					label="Project Name"
					readOnly={isReadonly}
					value={values.projectName}
					onChange={(value) => onUpdateField("projectName", value)}
				/>
				<TextField
					id="purchase-order-importation-no"
					label="Importation No."
					readOnly={isReadonly}
					value={values.importationNo}
					onChange={(value) => onUpdateField("importationNo", value)}
				/>
			</div>
		</div>
	);
}
