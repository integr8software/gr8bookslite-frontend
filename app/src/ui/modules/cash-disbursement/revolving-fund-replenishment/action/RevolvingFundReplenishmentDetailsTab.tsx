import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund-replenishment/useRevolvingFundReplenishmentActionPage";
import { RevolvingFundReplenishmentDetailsFields } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentDetailsFields";
import { RevolvingFundReplenishmentEntrySection } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentEntrySection";

export function RevolvingFundReplenishmentDetailsTab({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  page: RevolvingFundReplenishmentActionPageState;
}) {
  return (
    <>
      <RevolvingFundReplenishmentDetailsFields
        page={page}
        onOpenPartyDrawer={onOpenPartyDrawer}
        onOpenProjectDrawer={onOpenProjectDrawer}
        onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer}
      />
      <RevolvingFundReplenishmentEntrySection page={page} />
    </>
  );
}
