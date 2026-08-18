import type { CashAdvanceFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function CashAdvanceFileAttachmentFields({
  attachments,
  isReadonly,
  onAttachmentsChange,
}: {
  attachments: CashAdvanceFormValues["attachments"];
  isReadonly: boolean;
  onAttachmentsChange: (attachments: CashAdvanceFormValues["attachments"]) => void;
}) {
  return (
    <TransactionFileAttachmentFields
      attachments={attachments}
      inputId="cash-advance-file-attachments"
      inputName="cashAdvanceAttachments"
      isReadonly={isReadonly}
      uploadTitle="Attach Cash Advance Files"
      onAttachmentsChange={onAttachmentsChange}
    />
  );
}
