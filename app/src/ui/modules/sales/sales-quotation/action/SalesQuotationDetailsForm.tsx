import type { SalesQuotationFormValues } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import type { SalesQuotationFieldUpdater } from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationFormControls";
import { SalesQuotationPartyFields } from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationPartyFields";

type SalesQuotationDetailsFormProps = {
	isReadonly: boolean;
	values: SalesQuotationFormValues;
	onUpdateField: SalesQuotationFieldUpdater<SalesQuotationFormValues>;
};

export function SalesQuotationDetailsForm({
	isReadonly,
	onUpdateField,
	values,
}: SalesQuotationDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<SalesQuotationPartyFields
				isReadonly={isReadonly}
				values={values}
				onUpdateField={onUpdateField}
			/>
		</section>
	);
}
