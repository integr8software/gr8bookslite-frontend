import type {
	PurchaseRequestFieldUpdater,
	PurchaseRequestFormValues,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import { PurchaseRequestSupplierFields } from "@/app/src/ui/modules/purchasing/purchase-request/action/PurchaseRequestSupplierFields";

type PurchaseRequestDetailsFormProps = {
	isReadonly: boolean;
	values: PurchaseRequestFormValues;
	onUpdateField: PurchaseRequestFieldUpdater<PurchaseRequestFormValues>;
};

export function PurchaseRequestDetailsForm({
	isReadonly,
	onUpdateField,
	values,
}: PurchaseRequestDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<PurchaseRequestSupplierFields
				isReadonly={isReadonly}
				values={values}
				onUpdateField={onUpdateField}
			/>
		</section>
	);
}
