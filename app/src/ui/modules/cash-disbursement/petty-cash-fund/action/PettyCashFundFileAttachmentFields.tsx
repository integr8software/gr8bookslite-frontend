import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFund";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function PettyCashFundFileAttachmentFields({ page }: { page: PettyCashFundActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      inputId="petty-cash-fund-attachments"
      inputName="pettyCashFundAttachments"
      uploadTitle="Upload Petty Cash Fund Documents"
      attachments={page.values.attachments}
      isReadonly={page.isReadonly}
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
