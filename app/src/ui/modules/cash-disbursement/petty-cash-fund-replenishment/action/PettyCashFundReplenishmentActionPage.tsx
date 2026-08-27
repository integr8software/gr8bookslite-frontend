"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PettyCashFundReplenishmentActionTabs,
  PettyCashFundReplenishmentLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePettyCashFundReplenishmentActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { PettyCashFundReplenishmentActionMode } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PettyCashFundReplenishmentActionHeader } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/action/PettyCashFundReplenishmentActionHeader";
import { PettyCashFundReplenishmentFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/action/PettyCashFundReplenishmentFileAttachmentFields";
import { PettyCashFundReplenishmentDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/action/PettyCashFundReplenishmentDetailsFields";
import { PettyCashFundReplenishmentEntrySection } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentEntrySection";
import { PettyCashFundReplenishmentNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/action/PettyCashFundReplenishmentNotFound";
import { PettyCashFundReplenishmentReportPreview } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/reports/PettyCashFundReplenishmentReportPreview";
import { openPettyCashFundReplenishmentPdf } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/reports/PettyCashFundReplenishmentPdf";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function PettyCashFundReplenishmentActionPage({ mode }: { mode: PettyCashFundReplenishmentActionMode }) {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);
  const [pendingSupplierEntryId, setPendingSupplierEntryId] = useState<string | null>(null);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const partyStore = usePartyManagementStore();
  const page = usePettyCashFundReplenishmentActionPage({
    mode,
    onSaved: () => router.push(PettyCashFundReplenishmentLink),
  });
  if (page.isRecordMissing) return <PettyCashFundReplenishmentNotFound />;
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
        <PettyCashFundReplenishmentActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Petty cash fund replenishment sections"
          tabs={PettyCashFundReplenishmentActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <>
            <PettyCashFundReplenishmentDetailsFields
              page={page}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
              onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
            />
            <PettyCashFundReplenishmentEntrySection
              page={page}
              onOpenSupplierDrawer={handleOpenSupplierDrawer}
            />
          </>
        ) : (
          <PettyCashFundReplenishmentFileAttachmentFields page={page} />
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
      <PettyCashFundReplenishmentReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openPettyCashFundReplenishmentPdf(page.values)}
        page={page}
      />
    </>
  );
}
