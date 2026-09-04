"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RequestForPaymentActionTabs,
  RequestForPaymentLink,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useRequestForPaymentActionPage } from "@/app/src/hooks/modules/cash-disbursement/request-for-payment/useRequestForPaymentActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { RequestForPaymentActionMode } from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { RequestForPaymentActionHeader } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/action/RequestForPaymentActionHeader";
import { RequestForPaymentDetailsFields } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/action/RequestForPaymentDetailsFields";
import { RequestForPaymentFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/action/RequestForPaymentFileAttachmentFields";
import { RequestForPaymentEntrySection } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/entries/RequestForPaymentEntrySection";
import { RequestForPaymentNotFound } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/action/RequestForPaymentNotFound";
import { RequestForPaymentReportPreview } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/reports/RequestForPaymentReportPreview";
import { openRequestForPaymentPdf } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/reports/RequestForPaymentPdf";

export function RequestForPaymentActionPage({ mode }: { mode: RequestForPaymentActionMode }) {
  const router = useRouter();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isEntryResponsibilityCenterDrawerOpen, setIsEntryResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingResponsibilityCenterItemId, setPendingResponsibilityCenterItemId] = useState<string | null>(null);
  const partyStore = usePartyManagementStore();
  const page = useRequestForPaymentActionPage({ mode, onSaved: () => router.push(RequestForPaymentLink) });

  if (page.isRecordMissing) return <RequestForPaymentNotFound />;

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
        <RequestForPaymentActionHeader page={page} onPreview={() => page.setIsPreviewOpen(true)} />
        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Request for payment sections"
          tabs={RequestForPaymentActionTabs}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <>
            <RequestForPaymentDetailsFields
              page={page}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenProjectDrawer={() => undefined}
              onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
            />
            <RequestForPaymentEntrySection
              page={page}
              onOpenResponsibilityCenterDrawer={handleOpenEntryResponsibilityCenterDrawer}
            />
          </>
        ) : (
          <RequestForPaymentFileAttachmentFields page={page} />
        )}
      </section>

      <PartyManagementDrawer
        isOpen={!page.isReadonly && isPartyDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        suggestedPartyType="Vendor"
        title="Add Payee"
        onAddRecord={partyStore.addRecord}
        onClose={() => setIsPartyDrawerOpen(false)}
        onCreateParty={handleCreateParty}
      />

      <ResponsibilityCenterDrawer
        isOpen={!page.isReadonly && (isResponsibilityCenterDrawerOpen || isEntryResponsibilityCenterDrawerOpen)}
        mode="add"
        onClose={() => {
          setIsResponsibilityCenterDrawerOpen(false);
          setIsEntryResponsibilityCenterDrawerOpen(false);
          setPendingResponsibilityCenterItemId(null);
        }}
        onSaved={(center: ResponsibilityCenter) => {
          if (isEntryResponsibilityCenterDrawerOpen) {
            handleCreateEntryResponsibilityCenter(center);
          } else {
            page.updateField("responsibilityCenterCode", center.code);
            page.updateField("responsibilityCenter", center.name);
            setIsResponsibilityCenterDrawerOpen(false);
          }
        }}
      />

      <RequestForPaymentReportPreview
        isOpen={page.isPreviewOpen}
        onClose={() => page.setIsPreviewOpen(false)}
        onGeneratePdf={() => openRequestForPaymentPdf(page.values)}
        page={page}
      />
    </>
  );
}
