import type { PettyCashFundEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { PettyCashFundDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundDetailEntryTable";

export function PettyCashFundEntrySection({ onOpenResponsibilityCenterDrawer, page }: PettyCashFundEntrySectionProps) {
  return <PettyCashFundDetailEntryTable page={page} onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer} />;
}
