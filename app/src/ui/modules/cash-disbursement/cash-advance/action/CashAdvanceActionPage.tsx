"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CashAdvanceDetailsTabs,
  CashAdvanceLink,
  CashAdvanceStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import {
  createCashAdvanceProjectInitialValues,
  createCashAdvanceProjectOptions,
  createCashAdvanceResponsibilityCenterDropdownOptions,
  createCashAdvanceResponsibilityCenterInitialValues,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { replaceCashAdvanceRow, useCashAdvanceActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { CashAdvanceActionMode, CashAdvanceDetailsTab } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { CashAdvanceNotFound } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceNotFound";
import { CashAdvanceDetailsFields } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceDetailsFields";
import { CashAdvanceActionHeader } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceActionHeader";
import { CashAdvanceEntrySection } from "@/app/src/ui/modules/cash-disbursement/cash-advance/entries/CashAdvanceEntrySection";
import { CashAdvanceReportPreview } from "@/app/src/ui/modules/cash-disbursement/cash-advance/reports/CashAdvanceReportPreview";
import { openCashAdvancePdf } from "@/app/src/ui/modules/cash-disbursement/cash-advance/reports/CashAdvancePdf";
import { CashAdvanceFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceFileAttachmentFields";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/dialogs/PartyManagementDrawer";
import { AppSkeleton, AppSkeletonCard } from "@/app/src/ui/shared/app/AppSkeleton";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function CashAdvanceActionPage({ mode }: { mode: CashAdvanceActionMode }) {
  return (
    <Suspense fallback={<CashAdvanceActionSkeleton />}>
      <CashAdvanceActionInner mode={mode} />
    </Suspense>
  );
}

function CashAdvanceActionInner({ mode }: { mode: CashAdvanceActionMode }) {
  const params = useParams<{ recordId?: string }>();
  const router = useRouter();
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [activeDetailsTab, setActiveDetailsTab] = useState<CashAdvanceDetailsTab>("details");
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingAccountingPartyRowId, setPendingAccountingPartyRowId] = useState<string | null>(null);
  const [pendingAccountingResponsibilityCenterRowId, setPendingAccountingResponsibilityCenterRowId] = useState<string | null>(null);
  const [pendingItemResponsibilityCenterRowId, setPendingItemResponsibilityCenterRowId] = useState<string | null>(null);
  const [pendingItemPartyRowId, setPendingItemPartyRowId] = useState<string | null>(null);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const form = useCashAdvanceActionForm(mode, recordId, () => {
    router.push(CashAdvanceLink);
  });
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const partyStore = usePartyManagementStore();
  const projectOptions = useMemo(
    () =>
      createCashAdvanceProjectOptions({
        centers: responsibilityCenterStore.centers,
        currentProjectCode: form.values.projectCode,
        currentProjectName: form.values.projectName,
      }),
    [form.values.projectCode, form.values.projectName, responsibilityCenterStore.centers],
  );
  const projectInitialValues = useMemo(
    () => createCashAdvanceProjectInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );
  const responsibilityCenterOptions = useMemo(
    () =>
      createCashAdvanceResponsibilityCenterDropdownOptions({
        centers: responsibilityCenterStore.centers,
      }),
    [responsibilityCenterStore.centers],
  );
  const responsibilityCenterInitialValues = useMemo(
    () => createCashAdvanceResponsibilityCenterInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );

  if (form.isLoading) {
    return <CashAdvanceActionSkeleton />;
  }

  if (form.isRecordMissing) {
    return <CashAdvanceNotFound />;
  }

  const isReadonly = mode === "view";

  return (
    <>
      <section className="grid gap-5">
        <CashAdvanceActionHeader
          availabilityWarning={form.availabilityWarning}
          mode={mode}
          hasDiscardableChanges={form.hasDiscardableChanges}
          isSubmitting={form.isSubmitting}
          onBack={form.saveDraft}
          onDiscard={form.discardDraft}
          record={form.record}
          onPreview={() => setIsReportPreviewOpen(true)}
          onSaveDraft={() => {
            void form.submitEntry(CashAdvanceStatuses.Draft);
          }}
          onSubmit={() => {
            void form.submitEntry(CashAdvanceStatuses.ForApproval);
          }}
          onUpdateStatus={form.updateEntryStatus}
          onValidate={form.validateEntry}
        />
        <ModuleTabs
          activeTab={activeDetailsTab}
          ariaLabel="Cash advance details"
          tabs={CashAdvanceDetailsTabs}
          onTabChange={setActiveDetailsTab}
        />
        {activeDetailsTab === "details" ? (
          <CashAdvanceDetailsFields
            currencyOptions={form.currencyOptions}
            errors={form.errors}
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
          <CashAdvanceFileAttachmentFields
            attachments={form.values.attachments}
            isReadonly={isReadonly}
            onAttachmentsChange={(attachments) => form.updateField("attachments", attachments)}
          />
        )}
        {activeDetailsTab === "details" ? (
          <CashAdvanceEntrySection
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
                replaceCashAdvanceRow(form.values.accountingEntries, pendingAccountingPartyRowId, {
                  partyCode: record.partyCodeNo,
                  partyName,
                }),
              );
            } else if (pendingItemPartyRowId) {
              form.updateItems(
                replaceCashAdvanceRow(form.values.items, pendingItemPartyRowId, {
                  partyCode: record.partyCodeNo,
                  partyName,
                  cashAdvanceBalance: record.cashAdvanceLimit ?? "",
                  cashAdvanceLimit: record.cashAdvanceLimit ?? "",
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
          form.updateField("projectName", center.name);
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
              replaceCashAdvanceRow(form.values.accountingEntries, pendingAccountingResponsibilityCenterRowId, {
                responsibilityCenter: center.name,
              }),
            );
          } else if (pendingItemResponsibilityCenterRowId) {
            form.updateItems(
              replaceCashAdvanceRow(form.values.items, pendingItemResponsibilityCenterRowId, {
                responsibilityCenter: center.name,
              }),
            );
          }

          setPendingAccountingResponsibilityCenterRowId(null);
          setPendingItemResponsibilityCenterRowId(null);
          setIsResponsibilityCenterDrawerOpen(false);
        }}
      />
      <CashAdvanceReportPreview
        isOpen={isReportPreviewOpen}
        responsibilityCenterOptions={responsibilityCenterOptions}
        values={form.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openCashAdvancePdf(form.values, responsibilityCenterOptions)}
      />
    </>
  );
}

function CashAdvanceActionSkeleton() {
  return (
    <section className="grid gap-5 p-6">
      <AppSkeletonCard className="grid gap-3 rounded-lg p-5">
        <AppSkeleton className="h-4 w-40" />
        <AppSkeleton className="h-7 w-80 max-w-full" />
        <AppSkeleton className="h-4 w-full max-w-2xl" />
      </AppSkeletonCard>
      <AppSkeletonCard className="grid gap-4 rounded-lg p-5">
        <div className="grid gap-5 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="grid gap-4">
              <AppSkeleton className="h-10 w-full" />
              <AppSkeleton className="h-10 w-full" />
              <AppSkeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </AppSkeletonCard>
      <AppSkeletonCard className="grid gap-4 rounded-lg p-5">
        <AppSkeleton className="h-10 w-full" />
        <AppSkeleton className="h-80 w-full rounded-lg" />
      </AppSkeletonCard>
    </section>
  );
}
