import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function RevolvingFundReplenishmentFileAttachmentFields({ page }: { page: RevolvingFundReplenishmentActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      inputId="revolving-fund-replenishment-attachments"
      inputName="revolvingFundReplenishmentAttachments"
      uploadTitle="Upload Revolving Fund Replenishment Documents"
      attachments={page.values.attachments}
      isReadonly={page.isReadonly}
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
