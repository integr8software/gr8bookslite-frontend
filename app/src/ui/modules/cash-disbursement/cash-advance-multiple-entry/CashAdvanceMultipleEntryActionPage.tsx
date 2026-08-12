"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  CashAdvanceMultipleEntryDetailsTabs,
  CashAdvanceMultipleEntryHref,
  CashAdvanceMultipleEntryStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  createCashAdvanceMultipleEntryProjectInitialValues,
  createCashAdvanceMultipleEntryProjectOptions,
  createCashAdvanceMultipleEntryResponsibilityCenterDropdownOptions,
  createCashAdvanceMultipleEntryResponsibilityCenterInitialValues,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import {
  replaceCashAdvanceMultipleEntryRow,
  useCashAdvanceMultipleEntryActionForm,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import type {
  CashAdvanceMultipleEntryActionMode,
  CashAdvanceMultipleEntryDetailsTab,
  CashAdvanceMultipleEntryVisibleCode,
  CashAdvanceMultipleEntryVisibleCodeState,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { CashAdvanceMultipleEntryDetails } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryDetails";
import { CashAdvanceMultipleEntryEntrySection } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryEntrySection";
import { CashAdvanceMultipleEntryHeader } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryHeader";
import { DisbursementVoucherFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherFileAttachmentFields";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import {
  AppPartyDialog,
  mapPartyRecordToPartyValue,
} from "@/app/src/ui/shared/transaction-setup/AppPartyDialog";
import { ModuleFieldsVisibilityDialog } from "@/app/src/ui/shared/module/ModuleFieldsVisibilityDialog";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function CashAdvanceMultipleEntryActionPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getActionMode(pathname);
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [activeDetailsTab, setActiveDetailsTab] =
    useState<CashAdvanceMultipleEntryDetailsTab>("details");
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingAccountingPartyRowId, setPendingAccountingPartyRowId] = useState<string | null>(null);
  const [pendingAccountingResponsibilityCenterRowId, setPendingAccountingResponsibilityCenterRowId] =
    useState<string | null>(null);
  const [pendingItemResponsibilityCenterRowId, setPendingItemResponsibilityCenterRowId] =
    useState<string | null>(null);
  const [pendingItemPartyRowId, setPendingItemPartyRowId] = useState<string | null>(null);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [visibleCodes, setVisibleCodes] = useState<CashAdvanceMultipleEntryVisibleCodeState>({
    accountCode: true,
    partyCode: true,
    projectCode: true,
  });
  const form = useCashAdvanceMultipleEntryActionForm(mode, recordId, () => {
    router.push(CashAdvanceMultipleEntryHref);
  });
  const responsibilityCenterStore = useResponsibilityCenterStore();
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
    () =>
      createCashAdvanceMultipleEntryProjectInitialValues(
        responsibilityCenterStore.classifications,
        responsibilityCenterStore.types,
      ),
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
    return (
      <section className="grid gap-4 rounded-lg border border-darknavy/10 bg-white p-5">
        <h1 className="text-xl font-semibold text-darknavy">Cash advances multiple entry not found</h1>
        <Link href={CashAdvanceMultipleEntryHref} className={moduleHeaderActionClassNames.secondary}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>
      </section>
    );
  }

  const isReadonly = mode === "view";

  return (
    <>
      <section className="grid gap-5">
        <CashAdvanceMultipleEntryHeader
          mode={mode}
          record={form.record}
          onSubmit={() => form.submitEntry(CashAdvanceMultipleEntryStatuses.forApproval)}
          onUpdateStatus={form.updateEntryStatus}
          visibilityAction={
            <CashAdvanceMultipleEntryFieldVisibilityButton
              visibleCodes={visibleCodes}
              onVisibleCodeChange={(field, isVisible) =>
                setVisibleCodes((current) => ({ ...current, [field]: isVisible }))
              }
            />
          }
        />
        <ModuleTabs
          activeTab={activeDetailsTab}
          ariaLabel="Cash advances multiple entry details"
          tabs={CashAdvanceMultipleEntryDetailsTabs}
          onTabChange={setActiveDetailsTab}
        />
        {activeDetailsTab === "details" ? (
          <CashAdvanceMultipleEntryDetails
            isReadonly={isReadonly}
            projectOptions={projectOptions}
            values={form.values}
            visibleCodes={visibleCodes}
            onOpenPartyDialog={() => {
              setPendingItemPartyRowId(null);
              setIsPartyDialogOpen(true);
            }}
            onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
            onUpdateField={form.updateField}
          />
        ) : (
          <DisbursementVoucherFileAttachmentFields
            attachments={form.values.attachments}
            inputName="cashAdvanceMultipleEntryAttachments"
            isReadonly={isReadonly}
            uploadTitle="Attach Cash Advances Multiple Entry Files"
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
            onOpenAccountingPartyDialog={(rowId) => {
              setPendingAccountingPartyRowId(rowId);
              setIsPartyDialogOpen(true);
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
            onOpenItemPartyDialog={(rowId) => {
              setPendingItemPartyRowId(rowId);
              setIsPartyDialogOpen(true);
            }}
            responsibilityCenterOptions={responsibilityCenterOptions}
            onRowsChange={form.updateItems}
          />
        ) : null}
      </section>
      <AppPartyDialog
        isOpen={!isReadonly && isPartyDialogOpen}
        onClose={() => {
          setPendingAccountingPartyRowId(null);
          setPendingItemPartyRowId(null);
          setIsPartyDialogOpen(false);
        }}
        onSelect={(record) => {
          const partyValue = mapPartyRecordToPartyValue(record);

          if (pendingAccountingPartyRowId) {
            form.updateAccountingEntries(
              replaceCashAdvanceMultipleEntryRow(
                form.values.accountingEntries,
                pendingAccountingPartyRowId,
                {
                  partyCode: partyValue.partyCode,
                  partyName: partyValue.partyName,
                },
              ),
            );
          } else if (pendingItemPartyRowId) {
            form.updateItems(
              replaceCashAdvanceMultipleEntryRow(form.values.items, pendingItemPartyRowId, {
                partyCode: partyValue.partyCode,
                partyName: partyValue.partyName,
              }),
            );
          } else {
            form.updateField("partyCode", partyValue.partyCode);
            form.updateField("partyName", partyValue.partyName);
          }

          setPendingAccountingPartyRowId(null);
          setPendingItemPartyRowId(null);
          setIsPartyDialogOpen(false);
        }}
      />
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
              replaceCashAdvanceMultipleEntryRow(
                form.values.accountingEntries,
                pendingAccountingResponsibilityCenterRowId,
                { responsibilityCenter: center.name },
              ),
            );
          } else if (pendingItemResponsibilityCenterRowId) {
            form.updateItems(
              replaceCashAdvanceMultipleEntryRow(
                form.values.items,
                pendingItemResponsibilityCenterRowId,
                { responsibilityCenter: center.name },
              ),
            );
          }

          setPendingAccountingResponsibilityCenterRowId(null);
          setPendingItemResponsibilityCenterRowId(null);
          setIsResponsibilityCenterDrawerOpen(false);
        }}
      />
    </>
  );
}

function CashAdvanceMultipleEntryFieldVisibilityButton({
  onVisibleCodeChange,
  visibleCodes,
}: {
  onVisibleCodeChange: (field: CashAdvanceMultipleEntryVisibleCode, isVisible: boolean) => void;
  visibleCodes: CashAdvanceMultipleEntryVisibleCodeState;
}) {
  return (
    <ModuleFieldsVisibilityDialog
      buttonLabel="Edit Layout"
      title="Cash Advances Multiple Entry Codes"
      fields={[
        createVisibilityField("partyCode", "Party Code", visibleCodes, onVisibleCodeChange),
        createVisibilityField("projectCode", "Project Code", visibleCodes, onVisibleCodeChange),
        createVisibilityField("accountCode", "Default Account Code", visibleCodes, onVisibleCodeChange),
      ]}
    />
  );
}

function createVisibilityField(
  field: CashAdvanceMultipleEntryVisibleCode,
  label: string,
  visibleCodes: CashAdvanceMultipleEntryVisibleCodeState,
  onVisibleFieldChange: (field: CashAdvanceMultipleEntryVisibleCode, isVisible: boolean) => void,
) {
  return {
    id: field,
    isVisible: visibleCodes[field],
    label,
    onVisibleChange: (isVisible: boolean) => onVisibleFieldChange(field, isVisible),
  };
}

function getActionMode(pathname: string): CashAdvanceMultipleEntryActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
