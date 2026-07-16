import type { ServiceInvoiceFormValues } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import { ServiceInvoiceAmountPartnerFields } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceAmountPartnerFields";
import { ServiceInvoiceCustomerFields } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceCustomerFields";
import { ServiceInvoiceReferenceProjectFields } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceReferenceProjectFields";
import type { ServiceInvoiceFieldUpdater } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceFieldControls";

export type ServiceInvoiceDetailsSection =
	| "amounts"
	| "customer"
	| "references";

type ServiceInvoiceDetailsFormProps = {
	isReadonly: boolean;
	section: ServiceInvoiceDetailsSection;
	values: ServiceInvoiceFormValues;
	onUpdateField: ServiceInvoiceFieldUpdater<ServiceInvoiceFormValues>;
};

export function ServiceInvoiceDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: ServiceInvoiceDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "customer" ? (
				<ServiceInvoiceCustomerFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "amounts" ? (
				<ServiceInvoiceAmountPartnerFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<ServiceInvoiceReferenceProjectFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}
