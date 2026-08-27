import type { RevolvingFundEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { RevolvingFundDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundDetailEntryTable";

export function RevolvingFundEntrySection({ onOpenResponsibilityCenterDrawer, page }: RevolvingFundEntrySectionProps) {
  return <RevolvingFundDetailEntryTable page={page} onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer} />;
}
