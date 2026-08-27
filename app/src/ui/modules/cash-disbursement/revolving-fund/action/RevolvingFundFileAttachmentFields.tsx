import type { RevolvingFundActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function RevolvingFundFileAttachmentFields({ page }: { page: RevolvingFundActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      inputId="revolving-fund-attachments"
      inputName="revolvingFundAttachments"
      uploadTitle="Upload Revolving Fund Documents"
      attachments={page.values.attachments}
      isReadonly={page.isReadonly}
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
