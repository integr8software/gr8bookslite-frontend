"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PettyCashReplenishmentActionTabs,
  PettyCashReplenishmentLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePettyCashReplenishmentActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { PettyCashReplenishmentActionMode } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PettyCashReplenishmentActionHeader } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/action/PettyCashReplenishmentActionHeader";
import { PettyCashReplenishmentFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/action/PettyCashReplenishmentFileAttachmentFields";
import { PettyCashReplenishmentDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/action/PettyCashReplenishmentDetailsFields";
import { PettyCashReplenishmentEntrySection } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/entries/PettyCashReplenishmentEntrySection";
import { PettyCashReplenishmentNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/action/PettyCashReplenishmentNotFound";
import { PettyCashReplenishmentReportPreview } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/reports/PettyCashReplenishmentReportPreview";
import { openPettyCashReplenishmentPdf } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/reports/PettyCashReplenishmentPdf";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function PettyCashReplenishmentActionPage({ mode }: { mode: PettyCashReplenishmentActionMode }) {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);
  const [pendingSupplierEntryId, setPendingSupplierEntryId] = useState<string | null>(null);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const partyStore = usePartyManagementStore();
  const page = usePettyCashReplenishmentActionPage({
    mode,
    onSaved: () => router.push(PettyCashReplenishmentLink),
  });
  if (page.isRecordMissing) return <PettyCashReplenishmentNotFound />;
  function handleCreateParty(record: PartyInformationRecord) {
    page.updateField("partyCode", record.partyCodeNo);
    page.updateField("partyName", getPartyDisplayName(record));
    setIsPartyDrawerOpen(false);
  }
  function handleOpenSupplierDrawer(rowId: string) {
    setPendingSupplierEntryId(rowId);
    setIsSupplierDrawerOpen(true);
  }
  function handleCreateSupplier(record: PartyInformationRecord) {
    if (pendingSupplierEntryId) {
      page.updateEntry(pendingSupplierEntryId, {
        supplierCode: record.partyCodeNo,
        supplierName: getPartyDisplayName(record),
      });
    }
    setPendingSupplierEntryId(null);
    setIsSupplierDrawerOpen(false);
  }
  return (
    <>
      <section className="grid gap-5">
        <PettyCashReplenishmentActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Petty cash replenishment sections"
          tabs={PettyCashReplenishmentActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <>
            <PettyCashReplenishmentDetailsFields
              page={page}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
              onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
            />
            <PettyCashReplenishmentEntrySection
              page={page}
              onOpenSupplierDrawer={handleOpenSupplierDrawer}
            />
          </>
        ) : (
          <PettyCashReplenishmentFileAttachmentFields page={page} />
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
      <PartyManagementDrawer
        isOpen={!page.isReadonly && isSupplierDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        suggestedPartyType="Vendor"
        title="Add Vendor"
        onAddRecord={partyStore.addRecord}
        onClose={() => {
          setPendingSupplierEntryId(null);
          setIsSupplierDrawerOpen(false);
        }}
        onCreateParty={handleCreateSupplier}
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
      <PettyCashReplenishmentReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openPettyCashReplenishmentPdf(page.values)}
        page={page}
      />
    </>
  );
}
