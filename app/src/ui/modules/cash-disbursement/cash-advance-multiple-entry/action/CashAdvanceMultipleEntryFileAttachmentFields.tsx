import type { CashAdvanceMultipleEntryFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function CashAdvanceMultipleEntryFileAttachmentFields({
  attachments,
  isReadonly,
  onAttachmentsChange,
}: {
  attachments: CashAdvanceMultipleEntryFormValues["attachments"];
  isReadonly: boolean;
  onAttachmentsChange: (
    attachments: CashAdvanceMultipleEntryFormValues["attachments"],
  ) => void;
}) {
  return (
    <TransactionFileAttachmentFields
      attachments={attachments}
      inputId="cash-advance-multiple-entry-file-attachments"
      inputName="cashAdvanceMultipleEntryAttachments"
      isReadonly={isReadonly}
      uploadTitle="Attach Cash Advance Multiple Entry Files"
      onAttachmentsChange={onAttachmentsChange}
    />
  );
}
