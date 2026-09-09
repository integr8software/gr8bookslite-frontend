import type { RequestForPaymentActionPageState } from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function RequestForPaymentFileAttachmentFields({ page }: { page: RequestForPaymentActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      inputId="request-for-payment-attachments"
      inputName="requestForPaymentAttachments"
      uploadTitle="Upload Request for Payment Documents"
      attachments={page.values.attachments}
      isReadonly={page.isReadonly}
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
