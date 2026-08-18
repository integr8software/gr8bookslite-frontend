import type { DisbursementVoucherFileAttachmentFieldsProps } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function DisbursementVoucherFileAttachmentFields({
  attachments,
  inputName = "disbursementVoucherAttachments",
  isReadonly,
  uploadTitle = "Attach Disbursement Voucher Files",
  onAttachmentsChange,
}: DisbursementVoucherFileAttachmentFieldsProps) {
  return (
    <TransactionFileAttachmentFields
      attachments={attachments}
      inputId="disbursement-voucher-file-attachments"
      inputName={inputName}
      isReadonly={isReadonly}
      uploadTitle={uploadTitle}
      onAttachmentsChange={onAttachmentsChange}
    />
  );
}
