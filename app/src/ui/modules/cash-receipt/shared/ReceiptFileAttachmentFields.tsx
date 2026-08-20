import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export type ReceiptAttachment = TransactionAttachment;

type ReceiptFileAttachmentFieldsProps = {
  attachments?: ReceiptAttachment[];
  inputId?: string;
  inputName?: string;
  isReadonly: boolean;
  onAttachmentsChange: (attachments: ReceiptAttachment[]) => void;
  uploadTitle?: string;
};

export function ReceiptFileAttachmentFields({
  attachments = [],
  inputId = "receipt-file-attachments",
  inputName = "receiptAttachments",
  isReadonly,
  onAttachmentsChange,
  uploadTitle = "Upload Receipt Documents",
}: ReceiptFileAttachmentFieldsProps) {
  return (
    <TransactionFileAttachmentFields
      attachments={attachments}
      inputId={inputId}
      inputName={inputName}
      isReadonly={isReadonly}
      uploadTitle={uploadTitle}
      onAttachmentsChange={onAttachmentsChange}
    />
  );
}
