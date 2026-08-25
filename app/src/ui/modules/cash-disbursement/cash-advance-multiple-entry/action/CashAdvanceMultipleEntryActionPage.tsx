"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CashAdvanceMultipleEntryDetailsTabs,
  CashAdvanceMultipleEntryLink,
  CashAdvanceMultipleEntryStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  createCashAdvanceMultipleEntryProjectInitialValues,
  createCashAdvanceMultipleEntryProjectOptions,
  createCashAdvanceMultipleEntryResponsibilityCenterDropdownOptions,
  createCashAdvanceMultipleEntryResponsibilityCenterInitialValues,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import {
  replaceCashAdvanceMultipleEntryRow,
  useCashAdvanceMultipleEntryActionForm,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type {
  CashAdvanceMultipleEntryActionMode,
  CashAdvanceMultipleEntryDetailsTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { CashAdvanceMultipleEntryNotFound } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryNotFound";
import { CashAdvanceMultipleEntryDetailsFields } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryDetailsFields";
import { CashAdvanceMultipleEntryActionHeader } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryActionHeader";
import { CashAdvanceMultipleEntryEntrySection } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/entries/CashAdvanceMultipleEntryEntrySection";
import { CashAdvanceMultipleEntryReportPreview } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/reports/CashAdvanceMultipleEntryReportPreview";
import { openCashAdvanceMultipleEntryPdf } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/reports/CashAdvanceMultipleEntryPdf";
import { CashAdvanceMultipleEntryFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryFileAttachmentFields";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function CashAdvanceMultipleEntryActionPage({ mode }: { mode: CashAdvanceMultipleEntryActionMode }) {
  const params = useParams<{ recordId?: string }>();
  const router = useRouter();
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [activeDetailsTab, setActiveDetailsTab] = useState<CashAdvanceMultipleEntryDetailsTab>("details");
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingAccountingPartyRowId, setPendingAccountingPartyRowId] = useState<string | null>(null);
  const [pendingAccountingResponsibilityCenterRowId, setPendingAccountingResponsibilityCenterRowId] = useState<string | null>(null);
  const [pendingItemResponsibilityCenterRowId, setPendingItemResponsibilityCenterRowId] = useState<string | null>(null);
  const [pendingItemPartyRowId, setPendingItemPartyRowId] = useState<string | null>(null);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const form = useCashAdvanceMultipleEntryActionForm(mode, recordId, () => {
    router.push(CashAdvanceMultipleEntryLink);
  });
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const partyStore = usePartyManagementStore();
  const projectOptions = useMemo(
    () =>
      createCashAdvanceMultipleEntryProjectOptions({
        centers: responsibilityCenterStore.centers,
        currentProjectCode: form.values.projectCode,
        currentProjectName: form.values.projectRef,
      }),
    [form.values.projectCode, form.values.projectRef, responsibilityCenterStore.centers],
  );
  const projectInitialValues = useMemo(
    () => createCashAdvanceMultipleEntryProjectInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );
  const responsibilityCenterOptions = useMemo(
    () =>
      createCashAdvanceMultipleEntryResponsibilityCenterDropdownOptions({
        centers: responsibilityCenterStore.centers,
      }),
    [responsibilityCenterStore.centers],
  );
  const responsibilityCenterInitialValues = useMemo(
    () =>
      createCashAdvanceMultipleEntryResponsibilityCenterInitialValues(
        responsibilityCenterStore.classifications,
        responsibilityCenterStore.types,
      ),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );

  if (form.isRecordMissing) {
    return <CashAdvanceMultipleEntryNotFound />;
  }

  const isReadonly = mode === "view";

  return (
    <>
      <section className="grid gap-5">
        <CashAdvanceMultipleEntryActionHeader
          mode={mode}
          hasDiscardableChanges={form.hasDiscardableChanges}
          isSubmitting={form.isSubmitting}
          onBack={form.saveDraft}
          onDiscard={form.discardDraft}
          record={form.record}
          onPreview={() => setIsReportPreviewOpen(true)}
          onSaveDraft={() => form.submitEntry(CashAdvanceMultipleEntryStatuses.draft)}
          onSubmit={() => form.submitEntry(CashAdvanceMultipleEntryStatuses.forApproval)}
          onUpdateStatus={form.updateEntryStatus}
        />
        <ModuleTabs
          activeTab={activeDetailsTab}
          ariaLabel="Cash advance multiple entry details"
          tabs={CashAdvanceMultipleEntryDetailsTabs}
          onTabChange={setActiveDetailsTab}
        />
        {activeDetailsTab === "details" ? (
          <CashAdvanceMultipleEntryDetailsFields
            currencyOptions={form.currencyOptions}
            isExchangeRateLoading={form.isExchangeRateLoading}
            isReadonly={isReadonly}
            projectOptions={projectOptions}
            values={form.values}
            onOpenPartyDrawer={() => {
              setPendingItemPartyRowId(null);
              setIsPartyDrawerOpen(true);
            }}
            onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
            onUpdateCurrency={form.updateCurrency}
            onUpdateField={form.updateField}
          />
        ) : (
          <CashAdvanceMultipleEntryFileAttachmentFields
            attachments={form.values.attachments}
            isReadonly={isReadonly}
            onAttachmentsChange={(attachments) => form.updateField("attachments", attachments)}
          />
        )}
        {activeDetailsTab === "details" ? (
          <CashAdvanceMultipleEntryEntrySection
            accountingRows={form.values.accountingEntries}
            isReadonly={isReadonly}
            rows={form.values.items}
            onAddAccountingRows={form.addAccountingEntries}
            onAddRows={form.addItems}
            onAccountingRowsChange={form.updateAccountingEntries}
            onOpenAccountingPartyDrawer={(rowId) => {
              setPendingAccountingPartyRowId(rowId);
              setIsPartyDrawerOpen(true);
            }}
            onOpenAccountingResponsibilityCenterDrawer={(rowId) => {
              setPendingAccountingResponsibilityCenterRowId(rowId);
              setPendingItemResponsibilityCenterRowId(null);
              setIsResponsibilityCenterDrawerOpen(true);
            }}
            onOpenItemResponsibilityCenterDrawer={(rowId) => {
              setPendingAccountingResponsibilityCenterRowId(null);
              setPendingItemResponsibilityCenterRowId(rowId);
              setIsResponsibilityCenterDrawerOpen(true);
            }}
            onOpenItemPartyDrawer={(rowId) => {
              setPendingItemPartyRowId(rowId);
              setIsPartyDrawerOpen(true);
            }}
            responsibilityCenterOptions={responsibilityCenterOptions}
            onRowsChange={form.updateItems}
          />
        ) : null}
      </section>
      {!isReadonly && isPartyDrawerOpen ? (
        <PartyManagementDrawer
          isOpen
          isPending={partyStore.isMutating}
          records={partyStore.records}
          suggestedPartyType="Employee"
          title="Add Employee"
          onAddRecord={partyStore.addRecord}
          onClose={() => {
            setPendingAccountingPartyRowId(null);
            setPendingItemPartyRowId(null);
            setIsPartyDrawerOpen(false);
          }}
          onCreateParty={(record: PartyInformationRecord) => {
            const partyName = getPartyDisplayName(record);

            if (pendingAccountingPartyRowId) {
              form.updateAccountingEntries(
                replaceCashAdvanceMultipleEntryRow(form.values.accountingEntries, pendingAccountingPartyRowId, {
                  partyCode: record.partyCodeNo,
                  partyName,
                }),
              );
            } else if (pendingItemPartyRowId) {
              form.updateItems(
                replaceCashAdvanceMultipleEntryRow(form.values.items, pendingItemPartyRowId, {
                  partyCode: record.partyCodeNo,
                  partyName,
                  cashAdvanceBalance: record.cashAdvanceLimit ?? "",
                }),
              );
            } else {
              form.updateField("partyCode", record.partyCodeNo);
              form.updateField("partyName", partyName);
            }

            setPendingAccountingPartyRowId(null);
            setPendingItemPartyRowId(null);
            setIsPartyDrawerOpen(false);
          }}
        />
      ) : null}
      <ResponsibilityCenterDrawer
        initialValues={projectInitialValues}
        isOpen={!isReadonly && isProjectDrawerOpen}
        mode="add"
        onClose={() => setIsProjectDrawerOpen(false)}
        onSaved={(center) => {
          form.updateField("projectCode", center.code);
          form.updateField("projectRef", center.name);
          setIsProjectDrawerOpen(false);
        }}
      />
      <ResponsibilityCenterDrawer
        initialValues={responsibilityCenterInitialValues}
        isOpen={!isReadonly && isResponsibilityCenterDrawerOpen}
        mode="add"
        onClose={() => {
          setPendingAccountingResponsibilityCenterRowId(null);
          setPendingItemResponsibilityCenterRowId(null);
          setIsResponsibilityCenterDrawerOpen(false);
        }}
        onSaved={(center) => {
          if (pendingAccountingResponsibilityCenterRowId) {
            form.updateAccountingEntries(
              replaceCashAdvanceMultipleEntryRow(form.values.accountingEntries, pendingAccountingResponsibilityCenterRowId, {
                responsibilityCenter: center.name,
              }),
            );
          } else if (pendingItemResponsibilityCenterRowId) {
            form.updateItems(
              replaceCashAdvanceMultipleEntryRow(form.values.items, pendingItemResponsibilityCenterRowId, {
                responsibilityCenter: center.name,
              }),
            );
          }

          setPendingAccountingResponsibilityCenterRowId(null);
          setPendingItemResponsibilityCenterRowId(null);
          setIsResponsibilityCenterDrawerOpen(false);
        }}
      />
      <CashAdvanceMultipleEntryReportPreview
        isOpen={isReportPreviewOpen}
        responsibilityCenterOptions={responsibilityCenterOptions}
        values={form.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openCashAdvanceMultipleEntryPdf(form.values, responsibilityCenterOptions)}
      />
    </>
  );
}
