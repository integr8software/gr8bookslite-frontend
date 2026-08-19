"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PettyCashFundActionTabs,
  PettyCashFundLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePettyCashFundActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFundActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { PettyCashFundActionMode } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { PettyCashFundActionHeader } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundActionHeader";
import { PettyCashFundDetailsTab } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundDetailsTab";
import { PettyCashFundAttachmentsTab } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundAttachmentsTab";
import { PettyCashFundNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundNotFound";
import { PettyCashFundReportPreview } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/reports/PettyCashFundReportPreview";
import { openPettyCashFundPdf } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/reports/PettyCashFundPdf";

export function PettyCashFundActionPage({ mode }: { mode: PettyCashFundActionMode }) {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const partyStore = usePartyManagementStore();
  const page = usePettyCashFundActionPage({ mode, onSaved: () => router.push(PettyCashFundLink) });
  if (page.isRecordMissing) return <PettyCashFundNotFound />;
  function handleCreateParty(record: PartyInformationRecord) {
    page.updateField("partyCode", record.partyCodeNo);
    page.updateField("partyName", getPartyDisplayName(record));
    setIsPartyDrawerOpen(false);
  }
  return (
    <>
      <section className="grid gap-5">
        <PettyCashFundActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Petty cash fund sections"
          tabs={PettyCashFundActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <PettyCashFundDetailsTab
            page={page}
            onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
            onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
          />
        ) : (
          <PettyCashFundAttachmentsTab page={page} />
        )}
      </section>
      <PartyManagementDrawer
        isOpen={!page.isReadonly && isPartyDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        title="Add Custodian"
        onAddRecord={partyStore.addRecord}
        onClose={() => setIsPartyDrawerOpen(false)}
        onCreateParty={handleCreateParty}
      />
      <ResponsibilityCenterDrawer
        isOpen={!page.isReadonly && isProjectDrawerOpen}
        mode="add"
        onClose={() => setIsProjectDrawerOpen(false)}
        onSaved={(center) => {
          page.updateField("projectCode", center.code);
          page.updateField("projectName", center.name);
          setIsProjectDrawerOpen(false);
        }}
      />
      <PettyCashFundReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openPettyCashFundPdf(page.values)}
        page={page}
      />
    </>
  );
}
