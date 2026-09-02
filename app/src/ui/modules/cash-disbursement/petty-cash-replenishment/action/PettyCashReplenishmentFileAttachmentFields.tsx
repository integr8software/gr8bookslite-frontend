import type { PettyCashReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function PettyCashReplenishmentFileAttachmentFields({ page }: { page: PettyCashReplenishmentActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      inputId="petty-cash-replenishment-attachments"
      inputName="pettyCashFundReplenishmentAttachments"
      uploadTitle="Upload Petty Cash Replenishment Documents"
      attachments={page.values.attachments}
      isReadonly={page.isReadonly}
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
