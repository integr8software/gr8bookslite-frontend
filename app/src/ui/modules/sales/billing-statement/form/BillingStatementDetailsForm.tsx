import type {
  BillingStatementFieldUpdater,
  BillingStatementFormErrors,
  BillingStatementFormValues,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { BillingStatementCustomerFields } from "@/app/src/ui/modules/sales/billing-statement/form/BillingStatementCustomerFields";
import { BillingStatementFileAttachmentFields } from "@/app/src/ui/modules/sales/billing-statement/form/BillingStatementFileAttachmentFields";

export type BillingStatementDetailsSection = "customer" | "attachment";

type BillingStatementDetailsFormProps = {
  customerPartyOptions: AppAdvancedDropdownOption[];
  errors: BillingStatementFormErrors;
  isReadonly: boolean;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  section: BillingStatementDetailsSection;
  termOptions: AppAdvancedDropdownOption[];
  values: BillingStatementFormValues;
  onUpdateField: BillingStatementFieldUpdater<BillingStatementFormValues>;
};

export function BillingStatementDetailsForm({
  customerPartyOptions,
  errors,
  isReadonly,
  onUpdateField,
  responsibilityCenterOptions,
  section,
  termOptions,
  values,
}: BillingStatementDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      {section === "customer" ? (
        <BillingStatementCustomerFields
          customerPartyOptions={customerPartyOptions}
          errors={errors}
          isReadonly={isReadonly}
          responsibilityCenterOptions={responsibilityCenterOptions}
          termOptions={termOptions}
          values={values}
          onUpdateField={onUpdateField}
        />
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
