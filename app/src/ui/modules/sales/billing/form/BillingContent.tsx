import type { BillingFormValues } from "@/app/src/types/modules/sales/billing/BillingTypes";
import { BillingCustomerFields } from "@/app/src/ui/modules/sales/billing/form/BillingCustomerFields";
import type { BillingFieldUpdater } from "@/app/src/ui/modules/sales/billing/form/BillingFieldControls";
import { BillingFileAttachmentFields } from "@/app/src/ui/modules/sales/billing/form/BillingFileAttachmentFields";

export type BillingDetailsSection = "customer" | "attachment";

type BillingDetailsFormProps = {
	isReadonly: boolean;
	section: BillingDetailsSection;
	values: BillingFormValues;
	onUpdateField: BillingFieldUpdater<BillingFormValues>;
};

export function BillingDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: BillingDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "customer" ? (
				<BillingCustomerFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "attachment" ? (
				<BillingFileAttachmentFields
					attachments={values.attachments}
					isReadonly={isReadonly}
					onAttachmentsChange={(attachments) =>
						onUpdateField("attachments", attachments)
					}
				/>
			) : null}
		</section>
	);
}
