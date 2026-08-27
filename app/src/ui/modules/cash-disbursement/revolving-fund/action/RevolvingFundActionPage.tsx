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
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { RevolvingFundActionHeader } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundActionHeader";
import { RevolvingFundDetailsFields } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundDetailsFields";
import { RevolvingFundFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundFileAttachmentFields";
import { RevolvingFundEntrySection } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundEntrySection";
import { RevolvingFundNotFound } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundNotFound";
import { RevolvingFundReportPreview } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/reports/RevolvingFundReportPreview";
import { openRevolvingFundPdf } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/reports/RevolvingFundPdf";

export function RevolvingFundActionPage({ mode }: { mode: RevolvingFundActionMode }) {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isEntryResponsibilityCenterDrawerOpen, setIsEntryResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingResponsibilityCenterItemId, setPendingResponsibilityCenterItemId] = useState<string | null>(null);
  const partyStore = usePartyManagementStore();
  const page = useRevolvingFundActionPage({ mode, onSaved: () => router.push(RevolvingFundLink) });
  if (page.isRecordMissing) return <RevolvingFundNotFound />;
  function handleCreateParty(record: PartyInformationRecord) {
    page.updateField("partyCode", record.partyCodeNo);
    page.updateField("partyName", getPartyDisplayName(record));
    setIsPartyDrawerOpen(false);
  }
  function handleOpenEntryResponsibilityCenterDrawer(rowId: string) {
    setPendingResponsibilityCenterItemId(rowId);
    setIsEntryResponsibilityCenterDrawerOpen(true);
  }

  function handleCreateEntryResponsibilityCenter(center: ResponsibilityCenter) {
    if (pendingResponsibilityCenterItemId) {
      page.updateItem(pendingResponsibilityCenterItemId, {
        responsibilityCenterCode: center.code,
        responsibilityCenterName: center.name,
      });
    }
    setPendingResponsibilityCenterItemId(null);
    setIsEntryResponsibilityCenterDrawerOpen(false);
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
          <>
            <RevolvingFundDetailsFields
              page={page}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
              onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
            />
            <RevolvingFundEntrySection
              page={page}
              onOpenResponsibilityCenterDrawer={handleOpenEntryResponsibilityCenterDrawer}
            />
          </>
        ) : (
          <RevolvingFundFileAttachmentFields page={page} />
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
        isOpen={!page.isReadonly && isEntryResponsibilityCenterDrawerOpen}
        mode="add"
        onClose={() => {
          setPendingResponsibilityCenterItemId(null);
          setIsEntryResponsibilityCenterDrawerOpen(false);
        }}
        onSaved={handleCreateEntryResponsibilityCenter}
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
