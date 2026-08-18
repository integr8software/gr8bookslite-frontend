import type { PettyCashVoucherActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function PettyCashVoucherFileAttachmentFields({ page }: { page: PettyCashVoucherActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      attachments={page.values.attachments}
      inputId="petty-cash-voucher-file-attachments"
      inputName="pettyCashVoucherAttachments"
      isReadonly={page.isReadonly}
      uploadTitle="Attach Petty Cash Voucher Files"
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
