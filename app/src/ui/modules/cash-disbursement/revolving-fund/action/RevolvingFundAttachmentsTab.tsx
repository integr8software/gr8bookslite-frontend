import type { RevolvingFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundActionPage";
import { RevolvingFundFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundFileAttachmentFields";

export function RevolvingFundAttachmentsTab({ page }: { page: RevolvingFundActionPageState }) {
  return <RevolvingFundFileAttachmentFields page={page} />;
}

