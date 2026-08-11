"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DisbursementVoucherProjectOptions } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  CashAdvanceMultipleEntryAccountOptions,
  CashAdvanceMultipleEntryHref,
  CashAdvanceMultipleEntryStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  CashAdvanceMultipleEntryPartyOptions,
  CashAdvanceMultipleEntryResponsibilityCenterOptions,
  calculateCashAdvanceMultipleEntryTotal,
  formatCashAdvanceMultipleEntryAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { ResponsibilityCenterInitialFormValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import {
  removeCashAdvanceMultipleEntryRow,
  replaceCashAdvanceMultipleEntryRow,
  useCashAdvanceMultipleEntryActionForm,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import type {
  CashAdvanceMultipleEntryAccountingEntry,
  CashAdvanceMultipleEntryActionMode,
  CashAdvanceMultipleEntryDetailsTab,
  CashAdvanceMultipleEntryFormValues,
  CashAdvanceMultipleEntryItem,
  CashAdvanceMultipleEntryRecord,
  CashAdvanceMultipleEntryTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type {
  ResponsibilityCenter,
  ResponsibilityCenterClassification,
  ResponsibilityCenterFormValues,
  ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  CashAdvanceHistoryButton,
  CashAdvanceViewActions,
} from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceViewActions";
import { DisbursementVoucherFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherFileAttachmentFields";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleFieldsVisibilityDialog } from "@/app/src/ui/shared/module/ModuleFieldsVisibilityDialog";
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import {
  AppPartyDialog,
  mapPartyRecordToPartyValue,
} from "@/app/src/ui/shared/transaction-setup/AppPartyDialog";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function CashAdvanceMultipleEntryActionPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getActionMode(pathname);
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [activeDetailsTab, setActiveDetailsTab] = useState<CashAdvanceMultipleEntryDetailsTab>("details");
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingAccountingPartyRowId, setPendingAccountingPartyRowId] = useState<string | null>(null);
  const [pendingAccountingResponsibilityCenterRowId, setPendingAccountingResponsibilityCenterRowId] = useState<string | null>(null);
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
      createProjectInitialValues(
        responsibilityCenterStore.classifications,
        responsibilityCenterStore.types,
      ),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );
  const responsibilityCenterOptions = useMemo(
    () =>
      createCashAdvanceMultipleEntryResponsibilityCenterOptions({
        centers: responsibilityCenterStore.centers,
      }),
    [responsibilityCenterStore.centers],
  );
  const responsibilityCenterInitialValues = useMemo(
    () =>
      createResponsibilityCenterInitialValues(
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
        tabs={DetailsTabs}
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
            replaceCashAdvanceMultipleEntryRow(form.values.accountingEntries, pendingAccountingPartyRowId, {
              partyCode: partyValue.partyCode,
              partyName: partyValue.partyName,
            }),
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
        }

        setPendingAccountingResponsibilityCenterRowId(null);
        setIsResponsibilityCenterDrawerOpen(false);
      }}
    />
    </>
  );
}

const DetailsTabs = [
  { id: "details", label: "Cash Advance Details" },
  { id: "attachment", label: "File Attachments" },
] satisfies ModuleTabItem<CashAdvanceMultipleEntryDetailsTab>[];

type CashAdvanceMultipleEntryVisibleCode =
  | "accountCode"
  | "partyCode"
  | "projectCode";

type CashAdvanceMultipleEntryVisibleCodeState = Record<
  CashAdvanceMultipleEntryVisibleCode,
  boolean
>;

function CashAdvanceMultipleEntryHeader({
  mode,
  onSubmit,
  onUpdateStatus,
  record,
  visibilityAction,
}: {
  mode: CashAdvanceMultipleEntryActionMode;
  onSubmit: () => void;
  onUpdateStatus: ReturnType<typeof useCashAdvanceMultipleEntryActionForm>["updateEntryStatus"];
  record: CashAdvanceMultipleEntryRecord | null;
  visibilityAction: ReactNode;
}) {
  const title =
    mode === "view"
      ? "View Cash Advances Multiple Entry"
      : mode === "edit"
        ? "Edit Cash Advances Multiple Entry"
        : "Add Cash Advances Multiple Entry";
  const approvalRecord = createApprovalRecord(record);

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description="Record party-level cash advances with multiple entry lines, accounting entries, approvals, and file attachments."
      actionsClassName="items-center justify-end gap-2"
      actions={
        <>
          <Link href={CashAdvanceMultipleEntryHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {mode !== "add" ? <CashAdvanceHistoryButton record={approvalRecord} /> : null}
          {mode !== "add" ? (
            <CashAdvanceViewActions record={approvalRecord} onUpdateStatus={onUpdateStatus} />
          ) : null}
          {visibilityAction}
          {mode === "view" ? null : (
            <ModuleSaveButton onSave={onSubmit} />
          )}
        </>
      }
    />
  );
}

function CashAdvanceMultipleEntryDetails({
  isReadonly,
  onOpenPartyDialog,
  onOpenProjectDrawer,
  onUpdateField,
  projectOptions,
  values,
  visibleCodes,
}: {
  isReadonly: boolean;
  onOpenPartyDialog: () => void;
  onOpenProjectDrawer: () => void;
  values: CashAdvanceMultipleEntryFormValues;
  projectOptions: AppAdvancedDropdownOption[];
  visibleCodes: CashAdvanceMultipleEntryVisibleCodeState;
  onUpdateField: ReturnType<typeof useCashAdvanceMultipleEntryActionForm>["updateField"];
}) {
  const partyOptions = useMemo(() => createPartyOptions(values.partyCode, values.partyName), [values.partyCode, values.partyName]);
  const accountOptions = useMemo(() => createSelectOptions(CashAdvanceMultipleEntryAccountOptions), []);

  return (
    <form className="grid min-w-0 gap-5 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5 xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="came-party-name" label="Party Name" isRequired>
            <AppAdvancedDropdown
              id="came-party-name"
              addAction={
                !isReadonly
                  ? {
                      label: "Add Party Name",
                      onClick: onOpenPartyDialog,
                    }
                  : undefined
              }
              menuMinWidth={340}
              options={partyOptions}
              placeholder="Select Party Name"
              readOnly={isReadonly}
              searchPlaceholder="Search Party Name"
              value={values.partyCode}
              onChange={(value) => {
                const partyCode = String(value);
                const party = partyOptions.find((option) => option.value === partyCode);

                onUpdateField("partyCode", partyCode);
                onUpdateField("partyName", party?.name ?? "");
              }}
            />
          </FieldShell>
          <FieldShell controlId="came-project-name" label="Project Name">
            <AppAdvancedDropdown
              id="came-project-name"
              addAction={
                !isReadonly
                  ? {
                      label: "Add Project",
                      onClick: onOpenProjectDrawer,
                    }
                  : undefined
              }
              menuMinWidth={320}
              options={projectOptions}
              placeholder="Select Project Name"
              readOnly={isReadonly}
              searchPlaceholder="Search project name"
              value={values.projectRef}
              onChange={(value) => {
                const projectName = String(value);
                const project = projectOptions.find((option) => option.value === projectName);

                onUpdateField("projectRef", projectName);
                onUpdateField(
                  "projectCode",
                  project?.label === projectName ? "" : project?.label ?? "",
                );
              }}
            />
          </FieldShell>
          <FieldShell controlId="came-account" label="Default Account" isRequired>
            <AppAdvancedDropdown
              id="came-account"
              menuMinWidth={320}
              options={accountOptions}
              placeholder="Select Default Account"
              readOnly={isReadonly}
              value={values.accountCode}
              onChange={(value) => {
                const accountCode = String(value);
                const account = accountOptions.find((option) => option.value === accountCode);

                onUpdateField("accountCode", accountCode);
                onUpdateField("accountTitle", account?.name ?? "");
              }}
            />
          </FieldShell>
          <FieldShell controlId="came-remarks" label="Remarks">
            <AppLimitedTextarea
              id="came-remarks"
              className={`${FieldClassName} min-h-24 py-3`}
              counterMode="used"
              readOnly={isReadonly}
              value={values.remarks}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
            />
          </FieldShell>
      </div>
      <div className="grid min-w-0 content-start gap-4">
        {visibleCodes.partyCode ? (
          <FieldShell controlId="came-party-code" label="Party Code">
            <input
              id="came-party-code"
              readOnly
              value={values.partyCode}
              className={ReadOnlyFieldClassName}
            />
          </FieldShell>
        ) : null}
        {visibleCodes.projectCode ? (
          <FieldShell controlId="came-project-code" label="Project Code">
            <input
              id="came-project-code"
              readOnly
              value={values.projectCode}
              className={ReadOnlyFieldClassName}
            />
          </FieldShell>
        ) : null}
        {visibleCodes.accountCode ? (
          <FieldShell controlId="came-account-code" label="Default Account Code">
            <input
              id="came-account-code"
              readOnly
              value={values.accountCode}
              className={ReadOnlyFieldClassName}
            />
          </FieldShell>
        ) : null}
      </div>
      <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="came-trans-no" label="CAME No." isRequired>
            <input
              id="came-trans-no"
              readOnly={isReadonly}
              value={values.transNo}
              className={isReadonly ? ReadOnlyFieldClassName : FieldClassName}
              onChange={(event) => onUpdateField("transNo", event.target.value)}
            />
          </FieldShell>
          <FieldShell controlId="came-document-date" label="Document Date">
            <input
              id="came-document-date"
              type="date"
              readOnly={isReadonly}
              value={values.documentDate}
              className={FieldClassName}
              onChange={(event) => onUpdateField("documentDate", event.target.value)}
            />
          </FieldShell>
          <FieldShell controlId="came-status" label="Status">
            <input id="came-status" readOnly value={values.status} className={ReadOnlyFieldClassName} />
          </FieldShell>
      </div>
    </form>
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

function CashAdvanceMultipleEntryEntrySection({
  accountingRows,
  isReadonly,
  onAccountingRowsChange,
  onAddAccountingRows,
  onAddRows,
  onOpenAccountingPartyDialog,
  onOpenAccountingResponsibilityCenterDrawer,
  onOpenItemPartyDialog,
  responsibilityCenterOptions,
  onRowsChange,
  rows,
}: {
  accountingRows: CashAdvanceMultipleEntryAccountingEntry[];
  isReadonly: boolean;
  rows: CashAdvanceMultipleEntryItem[];
  onAccountingRowsChange: (rows: CashAdvanceMultipleEntryAccountingEntry[]) => void;
  onAddAccountingRows: (count: number) => void;
  onAddRows: (count: number) => void;
  onOpenAccountingPartyDialog: (rowId: string) => void;
  onOpenAccountingResponsibilityCenterDrawer: (rowId: string) => void;
  onOpenItemPartyDialog: (rowId: string) => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  onRowsChange: (rows: CashAdvanceMultipleEntryItem[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<CashAdvanceMultipleEntryTab>("items");
  const [visibleItemColumnIds, setVisibleItemColumnIds] = useState<string[]>([
    "partyCode",
    "partyName",
    "amount",
    "responsibilityCenter",
    "particulars",
  ]);
  const [itemColumnWidths, setItemColumnWidths] = useState<Record<string, number>>({});
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<string[]>([
    "accountTitle",
    "credit",
    "debit",
    "partyName",
  ]);
  const [accountingColumnWidths, setAccountingColumnWidths] = useState<Record<string, number>>({});
  const totalAmount = useMemo(() => calculateCashAdvanceMultipleEntryTotal(rows), [rows]);
  const itemColumns = useMemo<ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>[]>(
    () =>
      createItemColumns(
        isReadonly,
        (rowId, updates) => onRowsChange(replaceCashAdvanceMultipleEntryRow(rows, rowId, updates)),
        onOpenItemPartyDialog,
      ),
    [isReadonly, onOpenItemPartyDialog, onRowsChange, rows],
  );
  const accountingColumns = useMemo<ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>[]>(
    () =>
      createAccountingColumns(
        isReadonly,
        (rowId, updates) =>
          onAccountingRowsChange(replaceCashAdvanceMultipleEntryRow(accountingRows, rowId, updates)),
        onOpenAccountingPartyDialog,
        onOpenAccountingResponsibilityCenterDrawer,
        responsibilityCenterOptions,
      ),
    [
      accountingRows,
      isReadonly,
      onAccountingRowsChange,
      onOpenAccountingPartyDialog,
      onOpenAccountingResponsibilityCenterDrawer,
      responsibilityCenterOptions,
    ],
  );
  const visibleItemColumns = useMemo(
    () =>
      createVisibleColumns(itemColumns, visibleItemColumnIds)
        .map((column) => applyColumnWidth(column, itemColumnWidths)),
    [itemColumnWidths, itemColumns, visibleItemColumnIds],
  );
  const visibleAccountingColumns = useMemo(
    () =>
      createVisibleColumns(accountingColumns, visibleAccountingColumnIds)
        .map((column) => applyColumnWidth(column, accountingColumnWidths)),
    [accountingColumnWidths, accountingColumns, visibleAccountingColumnIds],
  );
  if (activeTab === "accounting") {
    return (
      <ModuleDataEntry
        columns={visibleAccountingColumns}
        columnOptions={createColumnOptions(accountingColumns, visibleAccountingColumnIds)}
        description=""
        emptyRowLabel="accounting entry"
        footerDetails={
          <span className="text-sm font-semibold text-darknavy">
            Total Amount: {formatCashAdvanceMultipleEntryAmount(totalAmount)}
          </span>
        }
        isReadonly={isReadonly}
        rows={accountingRows}
        title={<CashAdvanceMultipleEntryEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />}
        onAddRows={onAddAccountingRows}
        onClearRows={() => onAccountingRowsChange(accountingRows.slice(0, 1))}
        onDuplicateRow={(rowId) => {
          const row = accountingRows.find((currentRow) => currentRow.id === rowId);

          if (row) {
            onAccountingRowsChange([...accountingRows, { ...row, id: `came-accounting-${Date.now()}` }]);
          }
        }}
        onInsertRow={() => undefined}
        onMoveRow={() => undefined}
        onRemoveRow={(rowId) => onAccountingRowsChange(removeCashAdvanceMultipleEntryRow(accountingRows, rowId))}
        onMoveColumn={(fromColumnId, toColumnId) =>
          setVisibleAccountingColumnIds((current) => moveColumnId(current, fromColumnId, toColumnId))
        }
        onToggleColumnVisibility={(columnId, isVisible) =>
          setVisibleAccountingColumnIds((current) =>
            updateVisibleColumnIds(current, accountingColumns, columnId, isVisible),
          )
        }
        onUpdateColumnHeader={() => undefined}
        onUpdateColumnWidth={(columnId, width) =>
          setAccountingColumnWidths((current) => ({ ...current, [columnId]: width }))
        }
      />
    );
  }

  return (
    <ModuleDataEntry
      columns={visibleItemColumns}
      columnOptions={createColumnOptions(itemColumns, visibleItemColumnIds)}
      description=""
      emptyRowLabel="item"
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatCashAdvanceMultipleEntryAmount(totalAmount)}
        </span>
      }
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{ amount: formatCashAdvanceMultipleEntryAmount(totalAmount) }}
      summaryRowHeader="Totals"
      title={<CashAdvanceMultipleEntryEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />}
      onAddRows={onAddRows}
      onClearRows={() => onRowsChange(rows.slice(0, 1))}
      onDuplicateRow={(rowId) => {
        const row = rows.find((currentRow) => currentRow.id === rowId);

        if (row) {
          onRowsChange([...rows, { ...row, id: `came-item-${Date.now()}` }]);
        }
      }}
      onInsertRow={() => undefined}
      onMoveRow={() => undefined}
      onRemoveRow={(rowId) => onRowsChange(removeCashAdvanceMultipleEntryRow(rows, rowId))}
      onMoveColumn={(fromColumnId, toColumnId) =>
        setVisibleItemColumnIds((current) => moveColumnId(current, fromColumnId, toColumnId))
      }
      onToggleColumnVisibility={(columnId, isVisible) =>
        setVisibleItemColumnIds((current) =>
          updateVisibleColumnIds(current, itemColumns, columnId, isVisible),
        )
      }
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={(columnId, width) =>
        setItemColumnWidths((current) => ({ ...current, [columnId]: width }))
      }
    />
  );
}

function CashAdvanceMultipleEntryEntryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: CashAdvanceMultipleEntryTab;
  onTabChange: (tab: CashAdvanceMultipleEntryTab) => void;
}) {
  return (
    <div role="tablist" aria-label="Cash advances multiple entry lines" className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
      {EntryTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
            activeTab === tab.id
              ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
              : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

const EntryTabs = [
  { id: "items", label: "Items" },
  { id: "accounting", label: "Accounting Entries" },
] satisfies ModuleTabItem<CashAdvanceMultipleEntryTab>[];

function createItemColumns(
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceMultipleEntryItem>) => void,
  onOpenItemPartyDialog: (rowId: string) => void,
): ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>[] {
  return [
    {
      header: "Party Code",
      id: "partyCode",
      width: 140,
      widthClassName: "w-[8.75rem]",
      renderCell: (row, _index, context) => (
        <EntryPartyDropdown
          id={context.fieldId}
          name={context.fieldName}
          optionDisplay="code"
          readOnly={isReadonly}
          value={row.partyCode}
          onAddParty={() => onOpenItemPartyDialog(row.id)}
          onChange={(partyCode, partyName) => onUpdateEntry(row.id, { partyCode, partyName })}
        />
      ),
    },
    {
      header: "Party Name",
      id: "partyName",
      width: 260,
      widthClassName: "w-[16rem]",
      renderCell: (row, _index, context) => (
        <EntryPartyDropdown
          id={context.fieldId}
          name={context.fieldName}
          optionDisplay="name"
          readOnly={isReadonly}
          value={row.partyCode}
          onAddParty={() => onOpenItemPartyDialog(row.id)}
          onChange={(partyCode, partyName) => onUpdateEntry(row.id, { partyCode, partyName })}
        />
      ),
    },
    {
      header: "Amount",
      id: "amount",
      width: 160,
      widthClassName: "w-[10rem]",
      renderCell: (row, _index, context) => (
        <EntryNumberInput
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.amount}
          onChange={(value) => onUpdateEntry(row.id, { amount: value })}
        />
      ),
    },
    {
      header: "Responsibility Center",
      id: "responsibilityCenter",
      width: 190,
      widthClassName: "w-[12rem]",
      renderCell: (row, _index, context) => (
        <EntryDropdown
          id={context.fieldId}
          name={context.fieldName}
          options={CashAdvanceMultipleEntryResponsibilityCenterOptions}
          readOnly={isReadonly}
          value={row.responsibilityCenter}
          onChange={(value) => onUpdateEntry(row.id, { responsibilityCenter: value })}
        />
      ),
    },
    {
      header: "Remarks",
      id: "particulars",
      width: 300,
      widthClassName: "w-[18.75rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.particulars}
          onChange={(value) => onUpdateEntry(row.id, { particulars: value })}
        />
      ),
    },
  ];
}

function createAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceMultipleEntryAccountingEntry>) => void,
  onOpenAccountingPartyDialog: (rowId: string) => void,
  onOpenAccountingResponsibilityCenterDrawer: (rowId: string) => void,
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
): ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>[] {
  return [
    {
      header: "Account Title",
      id: "accountTitle",
      width: 260,
      widthClassName: "w-[16.25rem]",
      renderCell: (row, _index, context) => (
        <EntryAccountDropdown
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.accountCode}
          onChange={(accountCode, accountTitle) => onUpdateEntry(row.id, { accountCode, accountTitle })}
        />
      ),
    },
    numberColumn("Credit", "credit", 140, isReadonly, onUpdateEntry),
    numberColumn("Debit", "debit", 140, isReadonly, onUpdateEntry),
    {
      header: "Party Name",
      id: "partyName",
      width: 240,
      widthClassName: "w-[15rem]",
      renderCell: (row, _index, context) => (
        <EntryPartyDropdown
          id={context.fieldId}
          name={context.fieldName}
          optionDisplay="name"
          readOnly={isReadonly}
          value={row.partyCode}
          onAddParty={() => onOpenAccountingPartyDialog(row.id)}
          onChange={(partyCode, partyName) => onUpdateEntry(row.id, { partyCode, partyName })}
        />
      ),
    },
    {
      header: "Responsibility Center",
      id: "responsibilityCenter",
      width: 210,
      widthClassName: "w-[13.125rem]",
      renderCell: (row, _index, context) => (
        <EntryDropdown
          id={context.fieldId}
          name={context.fieldName}
          addActionLabel="Add Responsibility Center"
          onAddAction={() => onOpenAccountingResponsibilityCenterDrawer(row.id)}
          options={responsibilityCenterOptions}
          readOnly={isReadonly}
          value={row.responsibilityCenter}
          onChange={(value) => onUpdateEntry(row.id, { responsibilityCenter: value })}
        />
      ),
    },
    textColumn("Remarks", "particulars", 260, isReadonly, onUpdateEntry),
  ];
}

function textColumn<TRow extends { id: string }>(
  header: string,
  id: keyof TRow & string,
  width: number,
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<TRow>) => void,
): ModuleDataEntryColumn<TRow> {
  return {
    header,
    id,
    width,
    widthClassName: `w-[${width / 16}rem]`,
    renderCell: (row, _index, context) => (
      <EntryTextInput
        id={context.fieldId}
        name={context.fieldName}
        readOnly={isReadonly}
        value={String(row[id] ?? "")}
        onChange={(value) => onUpdateEntry(row.id, { [id]: value } as Partial<TRow>)}
      />
    ),
  };
}

function numberColumn<TRow extends { id: string }>(
  header: string,
  id: keyof TRow & string,
  width: number,
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<TRow>) => void,
): ModuleDataEntryColumn<TRow> {
  return {
    ...textColumn(header, id, width, isReadonly, onUpdateEntry),
    renderCell: (row, _index, context) => (
      <EntryNumberInput
        id={context.fieldId}
        name={context.fieldName}
        readOnly={isReadonly}
        value={String(row[id] ?? "")}
        onChange={(value) => onUpdateEntry(row.id, { [id]: value } as Partial<TRow>)}
      />
    ),
  };
}

function EntryAccountDropdown({
  id,
  name,
  onChange,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onChange: (accountCode: string, accountTitle: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      className={EntryDropdownClassName}
      options={createSelectOptions(CashAdvanceMultipleEntryAccountOptions)}
      placeholder=""
      readOnly={readOnly}
      value={value}
      onChange={(nextValue) => {
        const accountCode = String(nextValue);
        const account = CashAdvanceMultipleEntryAccountOptions.find((option) => option.value === accountCode);

        onChange(accountCode, account?.label ?? "");
      }}
    />
  );
}

function EntryPartyDropdown({
  id,
  name,
  onAddParty,
  onChange,
  optionDisplay = "name",
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onAddParty: () => void;
  onChange: (partyCode: string, partyName: string) => void;
  optionDisplay?: "code" | "name";
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      addAction={
        !readOnly
          ? {
              label: "Add Party Name",
              onClick: onAddParty,
            }
          : undefined
      }
      className={EntryDropdownClassName}
      options={createEntryPartyOptions(optionDisplay)}
      placeholder=""
      readOnly={readOnly}
      value={value}
      onChange={(nextValue) => {
        const partyCode = String(nextValue);
        const party = CashAdvanceMultipleEntryPartyOptions.find((option) => option.value === partyCode);

        onChange(partyCode, party?.name ?? "");
      }}
    />
  );
}

function createEntryPartyOptions(optionDisplay: "code" | "name"): AppAdvancedDropdownOption[] {
  return CashAdvanceMultipleEntryPartyOptions.map((option) => ({
    description: optionDisplay === "code" ? option.name : undefined,
    label: optionDisplay === "code" ? option.name : option.label,
    name: optionDisplay === "code" ? option.label : option.name,
    value: option.value,
  }));
}

function EntryDropdown({
  addActionLabel,
  id,
  name,
  onAddAction,
  onChange,
  options,
  readOnly,
  value,
}: {
  addActionLabel?: string;
  id: string;
  name: string;
  onAddAction?: () => void;
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      addAction={
        addActionLabel && onAddAction && !readOnly
          ? {
              label: addActionLabel,
              onClick: onAddAction,
            }
          : undefined
      }
      className={EntryDropdownClassName}
      options={options}
      placeholder=""
      readOnly={readOnly}
      value={value}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

function EntryTextInput({
  id,
  name,
  onChange,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <input
      id={id}
      name={name}
      className={EntryInputClassName}
      readOnly={readOnly}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function EntryNumberInput(props: Parameters<typeof EntryTextInput>[0]) {
  return <EntryTextInput {...props} />;
}

function FieldShell({
  children,
  controlId,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  controlId?: string;
  isRequired?: boolean;
  label: string;
}) {
  const labelContent = (
    <>
      {label}
      {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
    </>
  );

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
          {labelContent}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">{labelContent}</span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function createPartyOptions(currentPartyCode: string, currentPartyName: string): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...CashAdvanceMultipleEntryPartyOptions];

  if (currentPartyCode.trim() || currentPartyName.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current Cash Advances Multiple Entry value",
      label: currentPartyCode || "Current party",
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode || currentPartyName,
    });
  }

  return options;
}

function createSelectOptions(options: readonly { label: string; value: string }[]): AppAdvancedDropdownOption[] {
  return options
    .filter((option) => option.value)
    .map((option) => ({
      label: option.value,
      name: option.label,
      value: option.value,
    }));
}

function createCashAdvanceMultipleEntryProjectOptions({
  centers,
  currentProjectCode,
  currentProjectName,
}: {
  centers: ResponsibilityCenter[];
  currentProjectCode: string;
  currentProjectName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherProjectOptions];

  centers
    .filter((center) => center.status === "Active" && center.category === "Project")
    .forEach((center) => {
      addUniqueDropdownOption(options, {
        description: center.financialType,
        label: center.code,
        name: center.name,
        value: center.name,
      });
    });

  if (currentProjectName.trim() || currentProjectCode.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current Cash Advances Multiple Entry value",
      label: currentProjectCode || currentProjectName,
      name: currentProjectName || currentProjectCode,
      value: currentProjectName || currentProjectCode,
    });
  }

  return options;
}

function createCashAdvanceMultipleEntryResponsibilityCenterOptions({
  centers,
}: {
  centers: ResponsibilityCenter[];
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...CashAdvanceMultipleEntryResponsibilityCenterOptions];

  centers
    .filter((center) => center.status === "Active")
    .forEach((center) => {
      addUniqueDropdownOption(options, {
        description: center.financialType,
        label: center.code,
        name: center.name,
        value: center.name,
      });
    });

  return options;
}

function createProjectInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  const projectType = types.find((type) => type.name === "Project");
  const projectClassification = classifications.find(
    (classification) => classification.id === projectType?.classificationId,
  );
  const costCenterClassification = classifications.find(
    (classification) => classification.name === "Cost Center",
  );
  const classification = projectClassification ?? costCenterClassification;

  return {
    ...ResponsibilityCenterInitialFormValues,
    category: "Project",
    classificationId: classification?.id ?? "",
    financialType: classification?.name ?? "Cost Center",
    typeId: projectType?.id ?? "",
  };
}

function createResponsibilityCenterInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  const responsibilityCenterClassification =
    classifications.find((classification) => classification.name === "Cost Center") ??
    classifications[0];
  const responsibilityCenterType = types.find(
    (type) => type.classificationId === responsibilityCenterClassification?.id,
  );

  return {
    ...ResponsibilityCenterInitialFormValues,
    classificationId: responsibilityCenterClassification?.id ?? "",
    financialType: responsibilityCenterClassification?.name ?? "",
    typeId: responsibilityCenterType?.id ?? "",
  };
}

function createColumnOptions<TRow extends { id: string }>(
  columns: ModuleDataEntryColumn<TRow>[],
  visibleColumnIds: string[],
): ModuleDataEntryColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    isHideable: !["partyName", "amount"].includes(column.id),
    isVisible: visibleColumnIds.includes(column.id),
    label: column.header,
    width: column.width,
    widthMode: column.widthMode,
  }));
}

function createVisibleColumns<TRow extends { id: string }>(
  columns: ModuleDataEntryColumn<TRow>[],
  visibleColumnIds: string[],
): ModuleDataEntryColumn<TRow>[] {
  const columnsById = new Map(columns.map((column) => [column.id, column]));

  return visibleColumnIds
    .map((columnId) => columnsById.get(columnId))
    .filter((column): column is ModuleDataEntryColumn<TRow> => Boolean(column));
}

function applyColumnWidth<TRow>(
  column: ModuleDataEntryColumn<TRow>,
  widths: Record<string, number>,
): ModuleDataEntryColumn<TRow> {
  return widths[column.id] ? { ...column, width: widths[column.id] } : column;
}

function moveColumnId(
  currentColumnIds: string[],
  fromColumnId: string,
  toColumnId: string,
) {
  if (fromColumnId === toColumnId) {
    return currentColumnIds;
  }

  const fromIndex = currentColumnIds.indexOf(fromColumnId);
  const toIndex = currentColumnIds.indexOf(toColumnId);

  if (fromIndex < 0 || toIndex < 0) {
    return currentColumnIds;
  }

  const nextColumnIds = [...currentColumnIds];
  const [movedColumnId] = nextColumnIds.splice(fromIndex, 1);

  nextColumnIds.splice(toIndex, 0, movedColumnId);

  return nextColumnIds;
}

function updateVisibleColumnIds<TRow extends { id: string }>(
  currentVisibleIds: string[],
  columns: ModuleDataEntryColumn<TRow>[],
  columnId: string,
  isVisible: boolean,
) {
  const column = columns.find((currentColumn) => currentColumn.id === columnId);

  if (!column) {
    return currentVisibleIds;
  }

  if (isVisible) {
    return currentVisibleIds.includes(columnId)
      ? currentVisibleIds
      : columns
          .map((currentColumn) => currentColumn.id)
          .filter((currentColumnId) => currentColumnId === columnId || currentVisibleIds.includes(currentColumnId));
  }

  if (["partyName", "amount"].includes(columnId)) {
    return currentVisibleIds;
  }

  return currentVisibleIds.filter((currentColumnId) => currentColumnId !== columnId);
}

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim() || options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}

function createApprovalRecord(record: CashAdvanceMultipleEntryRecord | null): CashAdvanceRecord | null {
  if (!record) {
    return null;
  }

  return {
    accountCode: record.accountCode,
    amount: record.amount,
    costCenter: record.costCenter,
    createdAt: record.createdAt,
    createdBy: record.createdBy,
    documentDate: record.documentDate,
    id: record.id,
    partyCode: record.partyCode,
    partyName: record.partyName,
    remarks: record.remarks,
    status: record.status,
    transNo: record.transNo,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
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

const FieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

const ReadOnlyFieldClassName = FieldClassName;

const EntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 read-only:text-darknavy focus:ring-2 focus:ring-inset focus:ring-skyblue/35";

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
