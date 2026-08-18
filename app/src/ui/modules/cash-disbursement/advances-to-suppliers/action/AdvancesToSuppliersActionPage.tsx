"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdvancesToSuppliersActionTabs,
  AdvancesToSuppliersHref,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useAdvancesToSuppliersActionPage } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { AdvancesToSuppliersActionHeader } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersActionHeader";
import { AdvancesToSuppliersAttachmentsTab } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersAttachmentsTab";
import { AdvancesToSuppliersDetailsTab } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersDetailsTab";
import { AdvancesToSuppliersNotFound } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersNotFound";
import { AdvancesToSuppliersReportPreview } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/reports/AdvancesToSuppliersReportPreview";
import { openAdvancesToSuppliersPdf } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/reports/AdvancesToSuppliersPdf";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function AdvancesToSuppliersActionPage() {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const partyStore = usePartyManagementStore();
  const page = useAdvancesToSuppliersActionPage({
    onSaved: () => router.push(AdvancesToSuppliersHref),
  });
  if (page.isRecordMissing) return <AdvancesToSuppliersNotFound />;
  function handleCreateParty(record: PartyInformationRecord) {
    page.updateField("partyCode", record.partyCodeNo);
    page.updateField("partyName", getPartyDisplayName(record));
    setIsPartyDrawerOpen(false);
  }
  return (
    <>
      <section className="grid gap-5">
        <AdvancesToSuppliersActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Advances to Suppliers sections"
          tabs={AdvancesToSuppliersActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <AdvancesToSuppliersDetailsTab
            page={page}
            onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
            onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
            onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
          />
        ) : (
          <AdvancesToSuppliersAttachmentsTab page={page} />
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
      <AdvancesToSuppliersReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openAdvancesToSuppliersPdf(page.values)}
        page={page}
      />
    </>
  );
}
