"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RevolvingFundReplenishmentActionTabs,
  RevolvingFundReplenishmentLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useRevolvingFundReplenishmentActionPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund-replenishment/useRevolvingFundReplenishmentActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { RevolvingFundReplenishmentActionMode } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { RevolvingFundReplenishmentActionHeader } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentActionHeader";
import { RevolvingFundReplenishmentAttachmentsTab } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentAttachmentsTab";
import { RevolvingFundReplenishmentDetailsTab } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentDetailsTab";
import { RevolvingFundReplenishmentNotFound } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentNotFound";
import { RevolvingFundReplenishmentReportPreview } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/reports/RevolvingFundReplenishmentReportPreview";
import { openRevolvingFundReplenishmentPdf } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/reports/RevolvingFundReplenishmentPdf";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function RevolvingFundReplenishmentActionPage({ mode }: { mode: RevolvingFundReplenishmentActionMode }) {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const partyStore = usePartyManagementStore();
  const page = useRevolvingFundReplenishmentActionPage({
    mode,
    onSaved: () => router.push(RevolvingFundReplenishmentLink),
  });
  if (page.isRecordMissing) return <RevolvingFundReplenishmentNotFound />;
  function handleCreateParty(record: PartyInformationRecord) {
    page.updateField("partyCode", record.partyCodeNo);
    page.updateField("partyName", getPartyDisplayName(record));
    setIsPartyDrawerOpen(false);
  }
  return (
    <>
      <section className="grid gap-5">
        <RevolvingFundReplenishmentActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Revolving fund replenishment sections"
          tabs={RevolvingFundReplenishmentActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <RevolvingFundReplenishmentDetailsTab
            page={page}
            onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
            onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
            onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
          />
        ) : (
          <RevolvingFundReplenishmentAttachmentsTab page={page} />
        )}
      </section>
      <PartyManagementDrawer
        isOpen={!page.isReadonly && isPartyDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        title="Add Party"
        onAddRecord={partyStore.addRecord}
        onClose={() => setIsPartyDrawerOpen(false)}
        onCreateParty={handleCreateParty}
      />
      <ResponsibilityCenterDrawer
        isOpen={!page.isReadonly && isResponsibilityCenterDrawerOpen}
        mode="add"
        onClose={() => setIsResponsibilityCenterDrawerOpen(false)}
        onSaved={(center) => {
          page.updateField("responsibilityCenterCode", center.code);
          page.updateField("responsibilityCenter", center.name);
          setIsResponsibilityCenterDrawerOpen(false);
        }}
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
      <RevolvingFundReplenishmentReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openRevolvingFundReplenishmentPdf(page.values)}
        page={page}
      />
    </>
  );
}
