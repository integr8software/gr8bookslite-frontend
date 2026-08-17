import type { RevolvingFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundActionPage";
import { RevolvingFundDetailsFields } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundDetailsFields";
import { RevolvingFundEntrySection } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundEntrySection";

export function RevolvingFundDetailsTab({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  page: RevolvingFundActionPageState;
}) {
  return (
    <>
      <RevolvingFundDetailsFields
        page={page}
        onOpenPartyDrawer={onOpenPartyDrawer}
        onOpenProjectDrawer={onOpenProjectDrawer}
      />
      <RevolvingFundEntrySection page={page} />
    </>
  );
}

