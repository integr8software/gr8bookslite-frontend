import type { PurchaseRequestFormValues } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import type { PurchaseRequestFieldUpdater } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormControls";
import { PurchaseRequestReferenceFields } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestReferenceFields";
import { PurchaseRequestSupplierFields } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestSupplierFields";

export type PurchaseRequestDetailsSection = "references" | "supplier";

type PurchaseRequestDetailsFormProps = {
	isReadonly: boolean;
	section: PurchaseRequestDetailsSection;
	values: PurchaseRequestFormValues;
	onUpdateField: PurchaseRequestFieldUpdater<PurchaseRequestFormValues>;
};

export function PurchaseRequestDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: PurchaseRequestDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "supplier" ? (
				<PurchaseRequestSupplierFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<PurchaseRequestReferenceFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}
