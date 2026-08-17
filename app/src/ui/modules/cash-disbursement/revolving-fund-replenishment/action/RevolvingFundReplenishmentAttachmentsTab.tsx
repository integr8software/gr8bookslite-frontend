import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund-replenishment/useRevolvingFundReplenishmentActionPage";
import { RevolvingFundReplenishmentFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentFileAttachmentFields";

export function RevolvingFundReplenishmentAttachmentsTab({ page }: { page: RevolvingFundReplenishmentActionPageState }) {
  return <RevolvingFundReplenishmentFileAttachmentFields page={page} />;
}

