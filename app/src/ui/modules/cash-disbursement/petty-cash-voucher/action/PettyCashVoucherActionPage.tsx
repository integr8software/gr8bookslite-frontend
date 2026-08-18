"use client";

import { useRouter } from "next/navigation";
import {
  PettyCashVoucherActionTabs,
  PettyCashVoucherHref,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { PettyCashVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherActionHeader";
import { PettyCashVoucherDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherDetailsFields";
import { PettyCashVoucherFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherFileAttachmentFields";
import { PettyCashVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherNotFound";

export function PettyCashVoucherActionPage() {
  const router = useRouter();
  const closePage = () => router.push(PettyCashVoucherHref);
  const page = usePettyCashVoucherActionPage({ onSaved: closePage });

  if (page.needsRecord && !page.existingVoucher) {
    return <PettyCashVoucherNotFound />;
  }

  return (
    <section className="grid gap-5">
      <PettyCashVoucherActionHeader page={page} />

      <ModuleTabs
        activeTab={page.activeTab}
        ariaLabel="Petty cash voucher sections"
        tabs={PettyCashVoucherActionTabs}
        onTabChange={page.setActiveTab}
      />

      {page.activeTab === "details" ? (
        <PettyCashVoucherDetailsFields
          canAddParty={page.partyStore.permissions.canCreate}
          canAddResponsibilityCenter={page.responsibilityCenterStore.permissions.canCreate}
          page={page}
          onOpenPartyDrawer={page.openPartyDrawer}
          onOpenResponsibilityCenterDrawer={page.openResponsibilityCenterDrawer}
        />
      ) : (
        <PettyCashVoucherFileAttachmentFields page={page} />
      )}
      <PartyManagementDrawer
        isOpen={!page.isReadonly && page.isPartyDrawerOpen}
        isPending={page.partyStore.isMutating}
        records={page.partyStore.records}
        title="Add Party Name"
        onAddRecord={page.partyStore.addRecord}
        onClose={page.closePartyDrawer}
        onCreateParty={page.handleCreateParty}
      />
      <ResponsibilityCenterDrawer
        isOpen={!page.isReadonly && page.isResponsibilityCenterDrawerOpen}
        mode="add"
        onClose={page.closeResponsibilityCenterDrawer}
        onSaved={page.handleSaveResponsibilityCenter}
      />
    </section>
  );
}
