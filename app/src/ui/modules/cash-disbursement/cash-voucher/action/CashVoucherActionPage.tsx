"use client";

import { Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import {
  CashVoucherActionTabs,
  CashVoucherStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import {
  CashVoucherCopyFromRecords,
  CashVoucherCopySources,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { createProjectResponsibilityCenterInitialValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { useCashVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucherActionPage";
import type { CashVoucherActionMode, CashVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { DefaultAccountDrawer } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountDrawer";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { CashVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherActionHeader";
import { CashVoucherEntrySection } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntrySection";
import { CashVoucherDetailsFields } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherDetailsFields";
import { CashVoucherFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherFileAttachmentFields";
import { CashVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherNotFound";
import { openCashVoucherPdf } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/reports/CashVoucherPdf";
import { CashVoucherReportPreview } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/reports/CashVoucherReportPreview";
import { AppSkeleton, AppSkeletonCard } from "@/app/src/ui/shared/app/AppSkeleton";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function CashVoucherActionPage({ mode }: { mode: CashVoucherActionMode }) {
  return (
    <Suspense fallback={<CashVoucherActionSkeleton />}>
      <CashVoucherActionInner mode={mode} />
    </Suspense>
  );
}

function CashVoucherActionInner({ mode }: { mode: CashVoucherActionMode }) {
  const voucherAction = useCashVoucherActionPage(mode);

  if (voucherAction.isRecordMissing) {
    return <CashVoucherNotFound />;
  }

  return (
    <>
      <CashVoucherActionShell voucherAction={voucherAction}>
        <CashVoucherActionContent voucherAction={voucherAction} />
      </CashVoucherActionShell>
      <CashVoucherActionDialogs voucherAction={voucherAction} />
    </>
  );
}

function CashVoucherActionShell({
  children,
  voucherAction,
}: {
  children: ReactNode;
  voucherAction: CashVoucherActionPageState;
}) {
  if (voucherAction.isReadonly) {
    return <section className="grid min-w-0 gap-5">{children}</section>;
  }

  return (
    <form className="grid min-w-0 gap-5" onSubmit={voucherAction.handleSubmit}>
      {children}
    </form>
  );
}

function CashVoucherActionContent({ voucherAction }: { voucherAction: CashVoucherActionPageState }) {
  return (
    <>
      <CashVoucherActionHeader
        copyFromRecords={CashVoucherCopyFromRecords}
        copyFromSources={CashVoucherCopySources}
        hasDiscardableChanges={voucherAction.hasDiscardableChanges}
        mode={voucherAction.isReadonly ? "view" : voucherAction.mode}
        isSubmitting={voucherAction.isSubmitting}
        pendingSubmitStatus={voucherAction.pendingSubmitStatus}
        returnLink={voucherAction.returnLink}
        transaction={voucherAction.selectedTransaction}
        voucher={voucherAction.existingVoucher}
        onBack={voucherAction.saveDraft}
        onDiscard={voucherAction.discardDraft}
        onCancelSubmit={voucherAction.cancelCashVoucherSubmit}
        onConfirmSubmit={voucherAction.confirmCashVoucherSubmit}
        onCopyFrom={voucherAction.handleCopyFrom}
        onPreview={() => voucherAction.setIsReportPreviewOpen(true)}
        onSaveDraft={() => voucherAction.requestCashVoucherSubmit(CashVoucherStatuses.draft)}
        onSubmit={() => voucherAction.requestCashVoucherSubmit(CashVoucherStatuses.forApproval)}
        onUpdateStatus={voucherAction.handleUpdateStatus}
      />
      <ModuleTabs
        activeTab={voucherAction.activeTab}
        ariaLabel="Cash voucher sections"
        tabs={CashVoucherActionTabs}
        onTabChange={voucherAction.setActiveTab}
      />
      {voucherAction.activeTab === "details" ? (
        <CashVoucherDetailsSection voucherAction={voucherAction} />
      ) : (
        <CashVoucherFileAttachmentFields
          attachments={voucherAction.values.attachments}
          isReadonly={voucherAction.isReadonly}
          onAttachmentsChange={(attachments) => voucherAction.updateField("attachments", attachments)}
        />
      )}
    </>
  );
}

function CashVoucherDetailsSection({ voucherAction }: { voucherAction: CashVoucherActionPageState }) {
  const values = voucherAction.values;

  return (
    <>
      <CashVoucherDetailsFields
        canAddPartyName={voucherAction.partyStore.permissions.canCreate}
        canAddProjectName
        currencyOptions={voucherAction.currencyOptions}
        errors={voucherAction.errors}
        isExchangeRateLoading={voucherAction.isExchangeRateLoading}
        isReadonly={voucherAction.isReadonly}
        values={values}
        onOpenPartyNameDrawer={() => voucherAction.setIsPartyNameDrawerOpen(true)}
        onOpenProjectNameDrawer={() => voucherAction.setIsProjectNameDrawerOpen(true)}
        onCurrencyChange={voucherAction.handleCurrencyChange}
        onPartyChange={voucherAction.handlePartyChange}
        onUpdateField={voucherAction.updateField}
      />
      <CashVoucherEntrySection
        canAddExpenseType={voucherAction.defaultAccountStore.permissions.canCreate}
        canAddPartyName={voucherAction.partyStore.permissions.canCreate}
        canAddResponsibilityCenter={voucherAction.responsibilityCenterStore.permissions.canCreate}
        defaultAccounts={voucherAction.defaultAccounts}
        entries={values.lineEntries}
        errors={voucherAction.errors}
        isReadonly={voucherAction.isReadonly}
        partyCode={values.partyCode}
        partyName={values.partyName}
        totalCredit={voucherAction.totalCredit}
        totalDebit={voucherAction.totalDebit}
        onAddEntries={voucherAction.handleAddEntries}
        onAddExpenseType={() => voucherAction.setIsDefaultAccountDrawerOpen(true)}
        onAddPartyName={() => voucherAction.setIsPartyNameDrawerOpen(true)}
        onAddResponsibilityCenter={voucherAction.handleOpenResponsibilityCenterDrawer}
        onClearEntries={voucherAction.handleClearEntries}
        onDuplicateEntry={voucherAction.handleDuplicateEntry}
        onInsertEntry={voucherAction.handleInsertEntry}
        onMoveEntry={voucherAction.handleMoveEntry}
        onRemoveEntry={voucherAction.handleRemoveEntry}
        onReplaceEntries={voucherAction.handleReplaceLineEntries}
        onUpdateEntry={voucherAction.handleUpdateEntry}
        onUpdateEntryFields={voucherAction.handleUpdateEntryFields}
      />
    </>
  );
}

function CashVoucherActionDialogs({ voucherAction }: { voucherAction: CashVoucherActionPageState }) {
  const projectInitialValues = useMemo(
    () =>
      createProjectResponsibilityCenterInitialValues(
        voucherAction.responsibilityCenterStore.classifications,
        voucherAction.responsibilityCenterStore.types,
      ),
    [voucherAction.responsibilityCenterStore.classifications, voucherAction.responsibilityCenterStore.types],
  );

  return (
    <>
      <CashVoucherReportPreview
        isOpen={voucherAction.isReportPreviewOpen}
        values={voucherAction.values}
        onClose={() => voucherAction.setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openCashVoucherPdf(voucherAction.values)}
      />
      <PartyManagementDrawer
        isOpen={!voucherAction.isReadonly && voucherAction.isPartyNameDrawerOpen}
        isPending={voucherAction.partyStore.isMutating}
        records={voucherAction.partyStore.records}
        title="Add Party Name"
        onAddRecord={voucherAction.partyStore.addRecord}
        onClose={() => voucherAction.setIsPartyNameDrawerOpen(false)}
        onCreateParty={voucherAction.handleCreateParty}
      />
      <ResponsibilityCenterDrawer
        initialValues={projectInitialValues}
        isOpen={!voucherAction.isReadonly && voucherAction.isProjectNameDrawerOpen}
        mode="add"
        onClose={() => voucherAction.setIsProjectNameDrawerOpen(false)}
        onSaved={voucherAction.handleCreateProject}
      />
      <ResponsibilityCenterDrawer
        isOpen={!voucherAction.isReadonly && voucherAction.isResponsibilityCenterDrawerOpen}
        mode="add"
        onClose={voucherAction.handleCloseResponsibilityCenterDrawer}
        onSaved={voucherAction.handleCreateResponsibilityCenter}
      />
      <DefaultAccountDrawer
        isOpen={!voucherAction.isReadonly && voucherAction.isDefaultAccountDrawerOpen}
        mode="add"
        permissions={voucherAction.defaultAccountStore.permissions}
        onClose={() => voucherAction.setIsDefaultAccountDrawerOpen(false)}
      />
    </>
  );
}

function CashVoucherActionSkeleton() {
  return (
    <section className="grid gap-5 p-6">
      <AppSkeletonCard className="grid gap-3 rounded-lg p-5">
        <AppSkeleton className="h-4 w-40" />
        <AppSkeleton className="h-7 w-80 max-w-full" />
        <AppSkeleton className="h-4 w-full max-w-2xl" />
      </AppSkeletonCard>
      <AppSkeletonCard className="grid gap-4 rounded-lg p-5">
        <AppSkeleton className="h-10 w-full" />
        <AppSkeleton className="h-80 w-full rounded-lg" />
      </AppSkeletonCard>
    </section>
  );
}


