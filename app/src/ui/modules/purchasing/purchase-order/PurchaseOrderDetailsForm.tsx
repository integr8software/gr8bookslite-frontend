import type { PurchaseOrderFormValues } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import type { PurchaseOrderFieldUpdater } from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderFieldControls";
import { PurchaseOrderReferenceFields } from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderReferenceFields";
import { PurchaseOrderSupplierFields } from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderSupplierFields";

export type PurchaseOrderDetailsSection = "references" | "supplier";

type PurchaseOrderDetailsFormProps = {
	isReadonly: boolean;
	section: PurchaseOrderDetailsSection;
	values: PurchaseOrderFormValues;
	onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: PurchaseOrderDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "supplier" ? (
				<PurchaseOrderSupplierFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<PurchaseOrderReferenceFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}
