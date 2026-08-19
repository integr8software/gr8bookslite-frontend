"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RevolvingFundActionTabs,
  RevolvingFundLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useRevolvingFundActionPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { RevolvingFundActionMode } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { RevolvingFundActionHeader } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundActionHeader";
import { RevolvingFundDetailsTab } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundDetailsTab";
import { RevolvingFundAttachmentsTab } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundAttachmentsTab";
import { RevolvingFundNotFound } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundNotFound";
import { RevolvingFundReportPreview } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/reports/RevolvingFundReportPreview";
import { openRevolvingFundPdf } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/reports/RevolvingFundPdf";

export function RevolvingFundActionPage({ mode }: { mode: RevolvingFundActionMode }) {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const partyStore = usePartyManagementStore();
  const page = useRevolvingFundActionPage({ mode, onSaved: () => router.push(RevolvingFundLink) });
  if (page.isRecordMissing) return <RevolvingFundNotFound />;
  function handleCreateParty(record: PartyInformationRecord) {
    page.updateField("partyCode", record.partyCodeNo);
    page.updateField("partyName", getPartyDisplayName(record));
    setIsPartyDrawerOpen(false);
  }
  return (
    <>
      <section className="grid gap-5">
        <RevolvingFundActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Revolving fund sections"
          tabs={RevolvingFundActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <RevolvingFundDetailsTab
            page={page}
            onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
            onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
          />
        ) : (
          <RevolvingFundAttachmentsTab page={page} />
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
      <RevolvingFundReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openRevolvingFundPdf(page.values)}
        page={page}
      />
    </>
  );
}
