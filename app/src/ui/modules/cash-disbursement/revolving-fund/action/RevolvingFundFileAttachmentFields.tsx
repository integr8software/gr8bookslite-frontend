import type { RevolvingFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundActionPage";
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
