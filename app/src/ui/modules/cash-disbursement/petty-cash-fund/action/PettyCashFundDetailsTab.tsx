import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFundActionPage";
import { PettyCashFundDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundDetailsFields";
import { PettyCashFundEntrySection } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundEntrySection";

export function PettyCashFundDetailsTab({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  page: PettyCashFundActionPageState;
}) {
  return (
    <>
      <PettyCashFundDetailsFields
        page={page}
        onOpenPartyDrawer={onOpenPartyDrawer}
        onOpenProjectDrawer={onOpenProjectDrawer}
      />
      <PettyCashFundEntrySection page={page} />
    </>
  );
}
