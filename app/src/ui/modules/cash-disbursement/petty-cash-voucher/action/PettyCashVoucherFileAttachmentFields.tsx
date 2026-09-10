import type { PettyCashVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function PettyCashVoucherFileAttachmentFields({ page }: { page: PettyCashVoucherActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      inputId="petty-cash-voucher-attachments"
      inputName="pettyCashVoucherAttachments"
      uploadTitle="Upload Petty Cash Voucher Documents"
      attachments={page.values.attachments}
      isReadonly={page.isReadonly}
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
