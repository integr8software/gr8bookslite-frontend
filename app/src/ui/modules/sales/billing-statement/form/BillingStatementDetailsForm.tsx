import type {
  BillingStatementFieldUpdater,
  BillingStatementFormErrors,
  BillingStatementFormValues,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import { BillingStatementCustomerFields } from "@/app/src/ui/modules/sales/billing-statement/form/BillingStatementCustomerFields";
import { BillingStatementFileAttachmentFields } from "@/app/src/ui/modules/sales/billing-statement/form/BillingStatementFileAttachmentFields";

export type BillingStatementDetailsSection = "customer" | "attachment";

type BillingStatementDetailsFormProps = {
  errors: BillingStatementFormErrors;
  isReadonly: boolean;
  section: BillingStatementDetailsSection;
  values: BillingStatementFormValues;
  onUpdateField: BillingStatementFieldUpdater<BillingStatementFormValues>;
};

export function BillingStatementDetailsForm({ errors, isReadonly, onUpdateField, section, values }: BillingStatementDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      {section === "customer" ? (
        <BillingStatementCustomerFields errors={errors} isReadonly={isReadonly} values={values} onUpdateField={onUpdateField} />
      ) : null}
      {section === "attachment" ? (
        <BillingStatementFileAttachmentFields
          attachments={values.attachments}
          isReadonly={isReadonly}
          onAttachmentsChange={(attachments) => onUpdateField("attachments", attachments)}
        />
      ) : null}
    </section>
  );
}
