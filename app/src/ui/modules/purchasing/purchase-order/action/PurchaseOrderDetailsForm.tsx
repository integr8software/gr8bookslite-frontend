import type {
	PurchaseOrderFieldUpdater,
	PurchaseOrderFormValues,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import { PurchaseOrderSupplierFields } from "@/app/src/ui/modules/purchasing/purchase-order/action/PurchaseOrderSupplierFields";

type PurchaseOrderDetailsFormProps = {
	isReadonly: boolean;
	values: PurchaseOrderFormValues;
	onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderDetailsForm({
	isReadonly,
	onUpdateField,
	values,
}: PurchaseOrderDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<PurchaseOrderSupplierFields
				isReadonly={isReadonly}
				values={values}
				onUpdateField={onUpdateField}
			/>
		</section>
	);
}
