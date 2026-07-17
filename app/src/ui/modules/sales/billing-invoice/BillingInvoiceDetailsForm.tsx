import type { BillingInvoiceFormValues } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { BillingInvoiceAmountPartnerFields } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceAmountPartnerFields";
import { BillingInvoiceCustomerFields } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceCustomerFields";
import { BillingInvoiceReferenceProjectFields } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceReferenceProjectFields";
import type { BillingInvoiceFieldUpdater } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceFieldControls";

export type BillingInvoiceDetailsSection =
	| "amounts"
	| "customer"
	| "references";

type BillingInvoiceDetailsFormProps = {
	isReadonly: boolean;
	section: BillingInvoiceDetailsSection;
	values: BillingInvoiceFormValues;
	onUpdateField: BillingInvoiceFieldUpdater<BillingInvoiceFormValues>;
};

export function BillingInvoiceDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: BillingInvoiceDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "customer" ? (
				<BillingInvoiceCustomerFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "amounts" ? (
				<BillingInvoiceAmountPartnerFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<BillingInvoiceReferenceProjectFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}

