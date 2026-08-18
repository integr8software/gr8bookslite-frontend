import type { AdvancesToSuppliersActionPageState } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersActionPage";
import { AdvancesToSuppliersDetailsFields } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersDetailsFields";

export function AdvancesToSuppliersDetailsTab({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  page: AdvancesToSuppliersActionPageState;
}) {
  return (
    <AdvancesToSuppliersDetailsFields
      page={page}
      onOpenPartyDrawer={onOpenPartyDrawer}
      onOpenProjectDrawer={onOpenProjectDrawer}
      onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer}
    />
  );
}
