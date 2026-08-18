import type { PettyCashFundReplenishmentActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentActionPage";
import { PettyCashFundReplenishmentFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/action/PettyCashFundReplenishmentFileAttachmentFields";

export function PettyCashFundReplenishmentAttachmentsTab({ page }: { page: PettyCashFundReplenishmentActionPageState }) {
  return <PettyCashFundReplenishmentFileAttachmentFields page={page} />;
}
