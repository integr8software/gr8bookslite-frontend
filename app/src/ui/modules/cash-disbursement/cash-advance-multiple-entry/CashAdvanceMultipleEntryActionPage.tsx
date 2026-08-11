"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  CashAdvanceMultipleEntryAccountOptions,
  CashAdvanceMultipleEntryCostCenterOptions,
  CashAdvanceMultipleEntryHref,
  CashAdvanceMultipleEntryStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  CashAdvanceMultipleEntryPartyOptions,
  CashAdvanceMultipleEntryResponsibilityCenterOptions,
  calculateCashAdvanceMultipleEntryTotal,
  formatCashAdvanceMultipleEntryAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import {
  removeCashAdvanceMultipleEntryRow,
  replaceCashAdvanceMultipleEntryRow,
  useCashAdvanceMultipleEntryActionForm,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
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
  const [visibleFields, setVisibleFields] = useState<CashAdvanceMultipleEntryVisibleFieldState>({
    contractNo: true,
    costCenter: true,
    defaultAccount: true,
    documentDate: true,
    partyName: true,
    projectRef: true,
    remarks: true,
    status: true,
    totalAmount: true,
    transNo: true,
  });
  const form = useCashAdvanceMultipleEntryActionForm(mode, recordId, () => {
    router.push(CashAdvanceMultipleEntryHref);
  });

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
    <section className="grid gap-5">
      <CashAdvanceMultipleEntryHeader
        mode={mode}
        record={form.record}
        onSubmit={() => form.submitEntry(CashAdvanceMultipleEntryStatuses.forApproval)}
        onUpdateStatus={form.updateEntryStatus}
        visibilityAction={
          <CashAdvanceMultipleEntryFieldVisibilityButton
            visibleFields={visibleFields}
            onVisibleFieldChange={(field, isVisible) =>
              setVisibleFields((current) => ({ ...current, [field]: isVisible }))
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
          values={form.values}
          visibleFields={visibleFields}
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
      <CashAdvanceMultipleEntryEntrySection
        accountingRows={form.values.accountingEntries}
        isReadonly={isReadonly}
        rows={form.values.items}
        onAddAccountingRows={form.addAccountingEntries}
        onAddRows={form.addItems}
        onAccountingRowsChange={form.updateAccountingEntries}
        onRowsChange={form.updateItems}
      />
    </section>
  );
}

const DetailsTabs = [
  { id: "details", label: "Cash Advance Details" },
  { id: "attachment", label: "File Attachment" },
] satisfies ModuleTabItem<CashAdvanceMultipleEntryDetailsTab>[];

type CashAdvanceMultipleEntryVisibleField =
  | "contractNo"
  | "costCenter"
  | "defaultAccount"
  | "documentDate"
  | "partyName"
  | "projectRef"
  | "remarks"
  | "status"
  | "totalAmount"
  | "transNo";

type CashAdvanceMultipleEntryVisibleFieldState = Record<
  CashAdvanceMultipleEntryVisibleField,
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
  onUpdateField,
  values,
  visibleFields,
}: {
  isReadonly: boolean;
  values: CashAdvanceMultipleEntryFormValues;
  visibleFields: CashAdvanceMultipleEntryVisibleFieldState;
  onUpdateField: ReturnType<typeof useCashAdvanceMultipleEntryActionForm>["updateField"];
}) {
  const partyOptions = useMemo(() => createPartyOptions(values.partyCode, values.partyName), [values.partyCode, values.partyName]);
  const accountOptions = useMemo(() => createSelectOptions(CashAdvanceMultipleEntryAccountOptions), []);
  const costCenterOptions = useMemo(() => createSelectOptions(CashAdvanceMultipleEntryCostCenterOptions), []);

  return (
    <form className="grid min-w-0 gap-x-8 gap-y-5 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5 xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4">
        {visibleFields.partyName ? (
          <FieldShell controlId="came-party-name" label="Party Name" isRequired>
            <AppAdvancedDropdown
              id="came-party-name"
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
        ) : null}
        {visibleFields.costCenter ? (
          <FieldShell controlId="came-cost-center" label="Cost Center" isRequired>
            <AppAdvancedDropdown
              id="came-cost-center"
              menuMinWidth={280}
              options={costCenterOptions}
              placeholder="Select Cost Center"
              readOnly={isReadonly}
              value={values.costCenter}
              onChange={(value) => onUpdateField("costCenter", String(value))}
            />
          </FieldShell>
        ) : null}
        {visibleFields.defaultAccount ? (
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
        ) : null}
        {visibleFields.remarks ? (
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
        ) : null}
      </div>
      <div className="grid min-w-0 content-start gap-4">
        {visibleFields.totalAmount ? (
          <FieldShell controlId="came-total-amount" label="Total Amount">
            <input id="came-total-amount" readOnly value={values.totalAmount} className={`${ReadOnlyFieldClassName} text-right`} />
          </FieldShell>
        ) : null}
      </div>
      <div className="grid min-w-0 content-start gap-4">
        {visibleFields.transNo ? (
          <FieldShell controlId="came-trans-no" label="Trans No." isRequired>
            <input
              id="came-trans-no"
              readOnly={isReadonly}
              value={values.transNo}
              className={isReadonly ? ReadOnlyFieldClassName : FieldClassName}
              onChange={(event) => onUpdateField("transNo", event.target.value)}
            />
          </FieldShell>
        ) : null}
        {visibleFields.documentDate ? (
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
        ) : null}
        {visibleFields.status ? (
          <FieldShell controlId="came-status" label="Status">
            <input id="came-status" readOnly value={values.status} className={ReadOnlyFieldClassName} />
          </FieldShell>
        ) : null}
        {visibleFields.projectRef ? (
          <FieldShell controlId="came-project-ref" label="Project Ref">
            <input
              id="came-project-ref"
              readOnly={isReadonly}
              value={values.projectRef}
              className={FieldClassName}
              onChange={(event) => onUpdateField("projectRef", event.target.value)}
            />
          </FieldShell>
        ) : null}
        {visibleFields.contractNo ? (
          <FieldShell controlId="came-contract-no" label="Contract No.">
            <input
              id="came-contract-no"
              readOnly={isReadonly}
              value={values.contractNo}
              className={FieldClassName}
              onChange={(event) => onUpdateField("contractNo", event.target.value)}
            />
          </FieldShell>
        ) : null}
      </div>
    </form>
  );
}

function CashAdvanceMultipleEntryFieldVisibilityButton({
  onVisibleFieldChange,
  visibleFields,
}: {
  onVisibleFieldChange: (field: CashAdvanceMultipleEntryVisibleField, isVisible: boolean) => void;
  visibleFields: CashAdvanceMultipleEntryVisibleFieldState;
}) {
  return (
    <ModuleFieldsVisibilityDialog
      buttonLabel="Field Visibility"
      title="Cash Advances Multiple Entry Fields"
      fields={[
        createVisibilityField("partyName", "Party Name", visibleFields, onVisibleFieldChange),
        createVisibilityField("costCenter", "Cost Center", visibleFields, onVisibleFieldChange),
        createVisibilityField("defaultAccount", "Default Account", visibleFields, onVisibleFieldChange),
        createVisibilityField("remarks", "Remarks", visibleFields, onVisibleFieldChange),
        createVisibilityField("totalAmount", "Total Amount", visibleFields, onVisibleFieldChange),
        createVisibilityField("transNo", "Trans No.", visibleFields, onVisibleFieldChange),
        createVisibilityField("documentDate", "Document Date", visibleFields, onVisibleFieldChange),
        createVisibilityField("status", "Status", visibleFields, onVisibleFieldChange),
        createVisibilityField("projectRef", "Project Ref", visibleFields, onVisibleFieldChange),
        createVisibilityField("contractNo", "Contract No.", visibleFields, onVisibleFieldChange),
      ]}
    />
  );
}

function createVisibilityField(
  field: CashAdvanceMultipleEntryVisibleField,
  label: string,
  visibleFields: CashAdvanceMultipleEntryVisibleFieldState,
  onVisibleFieldChange: (field: CashAdvanceMultipleEntryVisibleField, isVisible: boolean) => void,
) {
  return {
    id: field,
    isVisible: visibleFields[field],
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
  onRowsChange,
  rows,
}: {
  accountingRows: CashAdvanceMultipleEntryAccountingEntry[];
  isReadonly: boolean;
  rows: CashAdvanceMultipleEntryItem[];
  onAccountingRowsChange: (rows: CashAdvanceMultipleEntryAccountingEntry[]) => void;
  onAddAccountingRows: (count: number) => void;
  onAddRows: (count: number) => void;
  onRowsChange: (rows: CashAdvanceMultipleEntryItem[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<CashAdvanceMultipleEntryTab>("items");
  const [visibleItemColumnIds, setVisibleItemColumnIds] = useState<string[]>([
    "partyCode",
    "partyName",
    "particulars",
    "amount",
    "responsibilityCenter",
  ]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<string[]>([
    "accountCode",
    "accountTitle",
    "debit",
    "credit",
    "partyCode",
    "partyName",
    "particulars",
    "responsibilityCenter",
    "refNo",
  ]);
  const totalAmount = useMemo(() => calculateCashAdvanceMultipleEntryTotal(rows), [rows]);
  const itemColumns = useMemo<ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>[]>(
    () => createItemColumns(isReadonly, (rowId, updates) => onRowsChange(replaceCashAdvanceMultipleEntryRow(rows, rowId, updates))),
    [isReadonly, onRowsChange, rows],
  );
  const accountingColumns = useMemo<ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>[]>(
    () =>
      createAccountingColumns(isReadonly, (rowId, updates) =>
        onAccountingRowsChange(replaceCashAdvanceMultipleEntryRow(accountingRows, rowId, updates)),
      ),
    [accountingRows, isReadonly, onAccountingRowsChange],
  );
  const visibleItemColumns = useMemo(
    () => itemColumns.filter((column) => visibleItemColumnIds.includes(column.id)),
    [itemColumns, visibleItemColumnIds],
  );
  const visibleAccountingColumns = useMemo(
    () => accountingColumns.filter((column) => visibleAccountingColumnIds.includes(column.id)),
    [accountingColumns, visibleAccountingColumnIds],
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
        onToggleColumnVisibility={(columnId, isVisible) =>
          setVisibleAccountingColumnIds((current) =>
            updateVisibleColumnIds(current, accountingColumns, columnId, isVisible),
          )
        }
        onUpdateColumnHeader={() => undefined}
        onUpdateColumnWidth={() => undefined}
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
      onToggleColumnVisibility={(columnId, isVisible) =>
        setVisibleItemColumnIds((current) =>
          updateVisibleColumnIds(current, itemColumns, columnId, isVisible),
        )
      }
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
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
): ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>[] {
  return [
    {
      header: "Code",
      id: "partyCode",
      width: 140,
      widthClassName: "w-[8.75rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.partyCode}
          onChange={(value) => onUpdateEntry(row.id, { partyCode: value })}
        />
      ),
    },
    {
      header: "Payee",
      id: "partyName",
      width: 260,
      widthClassName: "w-[16rem]",
      renderCell: (row, _index, context) => (
        <EntryPartyDropdown
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.partyCode}
          onChange={(partyCode, partyName) => onUpdateEntry(row.id, { partyCode, partyName })}
        />
      ),
    },
    {
      header: "Particulars",
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
      header: "Res. Center",
      id: "responsibilityCenter",
      width: 170,
      widthClassName: "w-[10.5rem]",
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
  ];
}

function createAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceMultipleEntryAccountingEntry>) => void,
): ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>[] {
  return [
    textColumn("Account Code", "accountCode", 150, isReadonly, onUpdateEntry),
    textColumn("Account Title", "accountTitle", 240, isReadonly, onUpdateEntry),
    numberColumn("Debit", "debit", 140, isReadonly, onUpdateEntry),
    numberColumn("Credit", "credit", 140, isReadonly, onUpdateEntry),
    textColumn("Party Code", "partyCode", 140, isReadonly, onUpdateEntry),
    textColumn("Party Name", "partyName", 240, isReadonly, onUpdateEntry),
    textColumn("Particulars", "particulars", 260, isReadonly, onUpdateEntry),
    textColumn("Res. Center", "responsibilityCenter", 160, isReadonly, onUpdateEntry),
    textColumn("Ref No.", "refNo", 140, isReadonly, onUpdateEntry),
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

function EntryPartyDropdown({
  id,
  name,
  onChange,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onChange: (partyCode: string, partyName: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      className={EntryDropdownClassName}
      options={CashAdvanceMultipleEntryPartyOptions}
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

function EntryDropdown({
  id,
  name,
  onChange,
  options,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
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
      description: "Current cash advances multiple entry value",
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
