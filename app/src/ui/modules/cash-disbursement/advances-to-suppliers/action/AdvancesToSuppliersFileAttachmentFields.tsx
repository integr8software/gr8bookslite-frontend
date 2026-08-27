import type { AdvancesToSuppliersActionPageState } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { TransactionFileAttachmentFields } from "@/app/src/ui/shared/transaction-setup/TransactionFileAttachmentFields";

export function AdvancesToSuppliersFileAttachmentFields({ page }: { page: AdvancesToSuppliersActionPageState }) {
  return (
    <TransactionFileAttachmentFields
      inputId="advances-to-suppliers-attachments"
      inputName="advancesToSuppliersAttachments"
      uploadTitle="Upload Advances to Suppliers Documents"
      attachments={page.values.attachments}
      isReadonly={page.isReadonly}
      onAttachmentsChange={(attachments) => page.updateField("attachments", attachments)}
    />
  );
}
