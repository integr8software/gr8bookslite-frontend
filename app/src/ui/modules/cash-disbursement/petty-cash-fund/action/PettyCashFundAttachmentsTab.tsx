import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFundActionPage";
import { PettyCashFundFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundFileAttachmentFields";

export function PettyCashFundAttachmentsTab({ page }: { page: PettyCashFundActionPageState }) {
  return <PettyCashFundFileAttachmentFields page={page} />;
}
