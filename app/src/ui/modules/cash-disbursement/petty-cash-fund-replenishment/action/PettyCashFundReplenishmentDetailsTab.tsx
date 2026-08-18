import type { PettyCashFundReplenishmentActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentActionPage";
import { PettyCashFundReplenishmentDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/action/PettyCashFundReplenishmentDetailsFields";
import { PettyCashFundReplenishmentEntrySection } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentEntrySection";

export function PettyCashFundReplenishmentDetailsTab({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  page: PettyCashFundReplenishmentActionPageState;
}) {
  return (
    <>
      <PettyCashFundReplenishmentDetailsFields
        page={page}
        onOpenPartyDrawer={onOpenPartyDrawer}
        onOpenProjectDrawer={onOpenProjectDrawer}
        onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer}
      />
      <PettyCashFundReplenishmentEntrySection page={page} />
    </>
  );
}
