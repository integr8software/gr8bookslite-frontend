"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PettyCashVoucherActionTabs,
  PettyCashVoucherLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePettyCashVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useDisbursementTypeStore } from "@/app/src/hooks/modules/financial-maintenance/disbursement-type/useDisbursementType";
import type { PettyCashVoucherActionMode } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import type { DisbursementType } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { DisbursementTypeDrawer } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeDrawer";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/dialogs/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ProjectMaintenanceDrawer } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { PettyCashVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherActionHeader";
import { PettyCashVoucherDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherDetailsFields";
import { PettyCashVoucherFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherFileAttachmentFields";
import { PettyCashVoucherEntrySection } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/entries/PettyCashVoucherEntrySection";
import { PettyCashVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherNotFound";
import { PettyCashVoucherReportPreview } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/reports/PettyCashVoucherReportPreview";
import { openPettyCashVoucherPdf } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/reports/PettyCashVoucherPdf";

export function PettyCashVoucherActionPage({ mode }: { mode: PettyCashVoucherActionMode }) {
  const router = useRouter();
  const [isDisbursementTypeDrawerOpen, setIsDisbursementTypeDrawerOpen] = useState(false);
  const [pendingDisbursementTypeItemId, setPendingDisbursementTypeItemId] = useState<string | null>(null);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);
  const [pendingSupplierItemId, setPendingSupplierItemId] = useState<string | null>(null);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isEntryResponsibilityCenterDrawerOpen, setIsEntryResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingResponsibilityCenterItemId, setPendingResponsibilityCenterItemId] = useState<string | null>(null);
  const partyStore = usePartyManagementStore();
  const disbursementTypeStore = useDisbursementTypeStore(undefined, { kind: "disbursement" });
  const page = usePettyCashVoucherActionPage({ mode, onSaved: () => router.push(PettyCashVoucherLink) });
  if (page.isRecordMissing) return <PettyCashVoucherNotFound />;

  function handleOpenDisbursementTypeDrawer(rowId: string) {
    setPendingDisbursementTypeItemId(rowId);
    setIsDisbursementTypeDrawerOpen(true);
  }

  function handleCreateDisbursementType(record?: DisbursementType) {
    if (pendingDisbursementTypeItemId) {
      const name =
        record?.disbursementTypeName ||
        (record as unknown as { defaultAccountName?: string })?.defaultAccountName ||
        (record as unknown as { name?: string })?.name ||
        "";
      if (name) {
        page.updateItem(pendingDisbursementTypeItemId, {
          disbursementType: name,
          expenseType: name,
          type: name,
        });
      }
    }
    setPendingDisbursementTypeItemId(null);
    setIsDisbursementTypeDrawerOpen(false);
  }
  function handleCreateParty(record: PartyInformationRecord) {
    page.updateField("partyCode", record.partyCodeNo);
    page.updateField("partyName", getPartyDisplayName(record));
    setIsPartyDrawerOpen(false);
  }
  function handleOpenSupplierDrawer(rowId: string) {
    setPendingSupplierItemId(rowId);
    setIsSupplierDrawerOpen(true);
  }
  function handleCreateSupplier(record: PartyInformationRecord) {
    if (pendingSupplierItemId) {
      page.updateItem(pendingSupplierItemId, {
        supplierCode: record.partyCodeNo,
        supplierName: getPartyDisplayName(record),
      });
    }
    setPendingSupplierItemId(null);
    setIsSupplierDrawerOpen(false);
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
        <PettyCashVoucherActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Petty cash voucher sections"
          tabs={PettyCashVoucherActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <>
            <PettyCashVoucherDetailsFields
              page={page}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
              onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
            />
            <PettyCashVoucherEntrySection
              page={page}
              onOpenDisbursementTypeDrawer={handleOpenDisbursementTypeDrawer}
              onOpenResponsibilityCenterDrawer={handleOpenEntryResponsibilityCenterDrawer}
              onOpenSupplierDrawer={handleOpenSupplierDrawer}
            />
          </>
        ) : (
          <PettyCashVoucherFileAttachmentFields page={page} />
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
      <PartyManagementDrawer
        isOpen={!page.isReadonly && isSupplierDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        suggestedPartyType="Vendor"
        title="Add Vendor"
        onAddRecord={partyStore.addRecord}
        onClose={() => {
          setPendingSupplierItemId(null);
          setIsSupplierDrawerOpen(false);
        }}
        onCreateParty={handleCreateSupplier}
      />
      <ProjectMaintenanceDrawer
        isOpen={!page.isReadonly && isProjectDrawerOpen}
        mode="add"
        onClose={() => setIsProjectDrawerOpen(false)}
        onSaved={(project) => {
          page.updateField("projectCode", project.projectCode);
          page.updateField("projectName", project.projectName);
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
      <DisbursementTypeDrawer
        isOpen={!page.isReadonly && isDisbursementTypeDrawerOpen}
        kind="disbursement"
        mode="add"
        permissions={disbursementTypeStore.permissions}
        onClose={() => {
          setPendingDisbursementTypeItemId(null);
          setIsDisbursementTypeDrawerOpen(false);
        }}
        onSaved={handleCreateDisbursementType}
      />
      <PettyCashVoucherReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openPettyCashVoucherPdf(page.values)}
        page={page}
      />
    </>
  );
}
