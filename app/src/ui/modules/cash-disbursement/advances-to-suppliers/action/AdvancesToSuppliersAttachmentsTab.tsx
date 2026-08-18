import type { AdvancesToSuppliersActionPageState } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersActionPage";
import { AdvancesToSuppliersFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersFileAttachmentFields";

export function AdvancesToSuppliersAttachmentsTab({ page }: { page: AdvancesToSuppliersActionPageState }) {
  return <AdvancesToSuppliersFileAttachmentFields page={page} />;
}
