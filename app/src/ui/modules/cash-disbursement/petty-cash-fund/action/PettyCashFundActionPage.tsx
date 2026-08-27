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
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { PettyCashFundActionHeader } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundActionHeader";
import { PettyCashFundDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundDetailsFields";
import { PettyCashFundFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundFileAttachmentFields";
import { PettyCashFundEntrySection } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundEntrySection";
import { PettyCashFundNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundNotFound";
import { PettyCashFundReportPreview } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/reports/PettyCashFundReportPreview";
import { openPettyCashFundPdf } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/reports/PettyCashFundPdf";

export function PettyCashFundActionPage({ mode }: { mode: PettyCashFundActionMode }) {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isEntryResponsibilityCenterDrawerOpen, setIsEntryResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingResponsibilityCenterItemId, setPendingResponsibilityCenterItemId] = useState<string | null>(null);
  const partyStore = usePartyManagementStore();
  const page = usePettyCashFundActionPage({ mode, onSaved: () => router.push(PettyCashFundLink) });
  if (page.isRecordMissing) return <PettyCashFundNotFound />;
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
        <PettyCashFundActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Petty cash fund sections"
          tabs={PettyCashFundActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <>
            <PettyCashFundDetailsFields
              page={page}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
              onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
            />
            <PettyCashFundEntrySection
              page={page}
              onOpenResponsibilityCenterDrawer={handleOpenEntryResponsibilityCenterDrawer}
            />
          </>
        ) : (
          <PettyCashFundFileAttachmentFields page={page} />
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
      <PettyCashFundReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openPettyCashFundPdf(page.values)}
        page={page}
      />
    </>
  );
}
