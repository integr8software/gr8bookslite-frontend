import type { CashVoucherFileAttachmentFieldsProps } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function CashVoucherFileAttachmentFields({
  attachments,
  inputName = "cashVoucherAttachments",
  isReadonly,
  uploadTitle = "Attach Cash Voucher Files",
  onAttachmentsChange,
}: CashVoucherFileAttachmentFieldsProps) {
  return (
    <TransactionFileAttachmentFields
      attachments={attachments}
      inputId="cash-voucher-file-attachments"
      inputName={inputName}
      isReadonly={isReadonly}
      uploadTitle={uploadTitle}
      onAttachmentsChange={onAttachmentsChange}
    />
  );
}


