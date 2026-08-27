import type { PettyCashFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function PettyCashFundReplenishmentFileAttachmentFields({ page }: { page: PettyCashFundReplenishmentActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      inputId="petty-cash-fund-replenishment-attachments"
      inputName="pettyCashFundReplenishmentAttachments"
      uploadTitle="Upload Petty Cash Fund Replenishment Documents"
      attachments={page.values.attachments}
      isReadonly={page.isReadonly}
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
