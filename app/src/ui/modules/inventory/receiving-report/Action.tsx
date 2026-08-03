"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Boxes, Gift, Save } from "lucide-react";
import {
  calculateReceivingReportTotals,
  createReceivingReportFormValues,
  createReceivingReportFormValuesFromRecord,
  createReceivingReportLine,
  createNextReceivingReportNo,
  createReceivingReportRecordFromForm,
  getInitialReceivingReports,
  upsertReceivingReportRecord,
  type ReceivingReportFormValues,
  type ReceivingReportLine,
  type ReceivingReportRecord,
  type ReceivingReportTotals,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import {
  getPurchaseOrderItemGrossAmount,
  getPurchaseOrderItemNetAmount,
  getPurchaseOrderTotals,
  loadPurchaseOrders,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
  MoneyNumberField,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import {
  AppCopyFromDropdown,
  type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { openReceivingReportPdf } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportPdf";
import { ReceivingReportReportPreview } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportReportPreview";

const ReceivingReportHref = "/inventory/receiving-report";

type ReceivingReportActionMode = "add" | "edit" | "view";
type ReceivingReportLineField = keyof ReceivingReportLine;
type ReceivingReportColumnKind = "amount" | "date" | "dropdown" | "text";

type ReceivingReportColumnConfig = {
  header: string;
  id: ReceivingReportLineField;
  kind: ReceivingReportColumnKind;
  options?: AppAdvancedDropdownOption[];
  width: number;
  widthClassName: string;
};

type ReceivingReportEntryUpdater = (
  rowId: string,
  field: ReceivingReportLineField,
  value: string,
) => void;
type ReceivingReportFormField = Exclude<keyof ReceivingReportFormValues, "lines">;
type ReceivingReportFormErrors = Partial<Record<ReceivingReportFormField | "lines", string>>;

export function ReceivingReportAction() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode = getActionMode(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const initialRecord =
    mode === "add"
      ? null
      : (getInitialReceivingReports().find((record) => record.id === recordId) ?? null);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [loadedRecord, setLoadedRecord] = useState<ReceivingReportRecord | null>(initialRecord);
  const [values, setValues] = useState<ReceivingReportFormValues>(() =>
    initialRecord
      ? createReceivingReportFormValuesFromRecord(initialRecord)
      : {
          ...createReceivingReportFormValues(),
          transNo: createNextReceivingReportNo(getInitialReceivingReports()),
        },
  );
  const [errors, setErrors] = useState<ReceivingReportFormErrors>({});
  const totals = useMemo(() => calculateReceivingReportTotals(values.lines), [values.lines]);
  const purchaseOrderCopyRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      loadPurchaseOrders()
        .filter((order) => order.status !== "Cancelled" && order.status !== "Closed")
        .map((order) => ({
          amount: String(getPurchaseOrderTotals(order).netAmount),
          documentDate: order.documentDate,
          id: order.id,
          partyName: order.vceName,
          remarks: order.prNo || order.remarks,
          source: "Purchase Order",
          sourceNo: order.transNo,
        })),
    [],
  );

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[name as ReceivingReportFormField];
      return nextErrors;
    });
  }

  function updateLine(rowId: string, field: ReceivingReportLineField, value: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === rowId ? { ...line, [field]: value } : line)),
    }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.lines;
      return nextErrors;
    });
  }

  function updateLines(lines: ReceivingReportLine[]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, lines }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.lines;
      return nextErrors;
    });
  }

  function copyFromPurchaseOrders(recordIds: string[]) {
    if (isReadonly) {
      return;
    }

    const selectedOrders = loadPurchaseOrders().filter((order) => recordIds.includes(order.id));

    if (selectedOrders.length === 0) {
      return;
    }

    const firstOrder = selectedOrders[0];
    const purchaseOrderNos = selectedOrders.map((order) => order.transNo);
    const purchaseRequestNos = selectedOrders.map((order) => order.prNo).filter(Boolean);
    const copiedLines = selectedOrders.flatMap((order) =>
      order.items
        .filter((item) => item.itemCode.trim() || item.itemName.trim() || Number(item.quantity) > 0)
        .map((item) => {
          const grossAmount = getPurchaseOrderItemGrossAmount(item);
          const netAmount = getPurchaseOrderItemNetAmount(item);

          return createReceivingReportLine({
            itemCode: item.itemCode,
            barcode: item.barcode,
            description: item.itemName,
            itemCategory: item.itemCategory,
            warehouse: values.warehouse || "Laguna",
            poQty: formatQuantity(item.quantity),
            rrQty: formatQuantity(item.quantity),
            uom: item.uom,
            expiryDate: item.expiryDate,
            freightCost: formatMoney(item.freightCost),
            cost: formatMoney(item.cost),
            grossAmount: formatMoney(grossAmount),
            vatAmount: formatMoney(item.vatAmount),
            discountAmount: formatMoney(item.discountAmount),
            netAmount: formatMoney(netAmount),
            vatable: item.vatable,
            vatInclusive: item.vatInclusive,
            responsibilityCenter: item.responsibilityCenter,
          });
        }),
    );

    setValues((current) => ({
      ...current,
      vceCode: firstOrder.vceCode || current.vceCode,
      vceName: firstOrder.vceName || current.vceName,
      currency: firstOrder.currency || current.currency,
      exchangeRate: String(firstOrder.exchangeRate || current.exchangeRate),
      address: firstOrder.address || current.address,
      contactNo: firstOrder.contactNo || current.contactNo,
      deliveryDate: firstOrder.deliveryDate || current.deliveryDate,
      remarks: firstOrder.remarks || current.remarks,
      poNo: joinUniqueValues(purchaseOrderNos) || current.poNo,
      prNo: joinUniqueValues(purchaseRequestNos) || current.prNo,
      importationRefNo: firstOrder.importationNo || current.importationRefNo,
      projectRef: firstOrder.projectRef || current.projectRef,
      projectName: firstOrder.projectName || current.projectName,
      lines: copiedLines.length > 0 ? copiedLines : current.lines,
    }));
    setErrors((current) => {
      const nextErrors = { ...current };
      [
        "vceCode",
        "vceName",
        "currency",
        "exchangeRate",
        "address",
        "contactNo",
        "deliveryDate",
        "poNo",
        "lines",
      ].forEach((field) => {
        delete nextErrors[field as ReceivingReportFormField | "lines"];
      });
      return nextErrors;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateReceivingReport(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const nextRecord = createReceivingReportRecordFromForm(
      values,
      mode === "edit" ? (loadedRecord ?? undefined) : undefined,
    );
    upsertReceivingReportRecord(nextRecord);
    setLoadedRecord(nextRecord);
    router.push(ReceivingReportHref);
  }

  return (
    <>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <ReceivingReportHeader
          mode={mode}
          isReadonly={isReadonly}
          copyFromRecords={purchaseOrderCopyRecords}
          onCopyFromPurchaseOrder={copyFromPurchaseOrders}
          onPreview={() => setIsReportPreviewOpen(true)}
        />
        <section className="grid gap-2 rounded-md border border-darknavy/10 bg-white p-2 shadow-sm shadow-darknavy/5 sm:p-3">
          <ReceivingReportVendorSection
            errors={errors}
            isReadonly={isReadonly}
            totals={totals}
            values={values}
            onChange={handleInputChange}
          />
        </section>
        <ReceivingReportEntries
          error={errors.lines}
          isReadonly={isReadonly}
          rows={values.lines}
          totals={totals}
          onRowsChange={updateLines}
          onUpdateLine={updateLine}
        />
      </form>
      <ReceivingReportReportPreview
        isOpen={isReportPreviewOpen}
        values={values}
        totals={totals}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openReceivingReportPdf(values)}
      />
    </>
  );
}

function ReceivingReportHeader({
  copyFromRecords,
  isReadonly,
  mode,
  onCopyFromPurchaseOrder,
  onPreview,
}: {
  copyFromRecords: AppCopyFromRecord[];
  isReadonly: boolean;
  mode: ReceivingReportActionMode;
  onCopyFromPurchaseOrder: (recordIds: string[]) => void;
  onPreview: () => void;
}) {
  const copy = ReceivingReportActionCopy[mode];

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={copy.title}
      description={copy.description}
      eyebrow={
        <>
          <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
          Inventory transaction
        </>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href={ReceivingReportHref} className={moduleHeaderActionClassNames.secondary}>
            Back
          </Link>
          <ReportPreviewAction label="Preview" onPreview={onPreview} />
          {!isReadonly ? (
            <>
              <AppCopyFromDropdown
                records={copyFromRecords}
                sources={["Purchase Order"]}
                onApply={onCopyFromPurchaseOrder}
              />
              <button type="submit" className={moduleHeaderActionClassNames.primary}>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            </>
          ) : null}
        </div>
      }
    />
  );
}

function ReceivingReportVendorSection({
  errors,
  isReadonly,
  onChange,
  totals,
  values,
}: ReceivingReportSectionProps & { totals: ReceivingReportTotals }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-x-10 gap-y-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1.2fr)_minmax(0,0.95fr)]">
        <div className="grid content-start gap-2">
          <TextField
            label="Party Name"
            name="vceName"
            value={values.vceName}
            disabled={isReadonly}
            required
            error={errors.vceName}
            onChange={onChange}
          />
          <TextField
            label="Address"
            name="address"
            value={values.address}
            disabled={isReadonly}
            required
            error={errors.address}
            onChange={onChange}
          />
          <TextField
            label="Contact No."
            name="contactNo"
            value={values.contactNo}
            disabled={isReadonly}
            required
            error={errors.contactNo}
            onChange={onChange}
          />
          <TextField
            label="Proj. Ref No"
            name="projectRef"
            value={values.projectRef}
            disabled={isReadonly}
            onChange={onChange}
          />
          <TextField
            label="Project Name"
            name="projectName"
            value={values.projectName}
            disabled={isReadonly}
            onChange={onChange}
          />
          <TextAreaField
            label="Remarks"
            name="remarks"
            value={values.remarks}
            disabled={isReadonly}
            onChange={onChange}
          />
        </div>
        <div className="grid content-start gap-2">
          <TextField
            label="Party Code"
            name="vceCode"
            value={values.vceCode}
            disabled
            required
            error={errors.vceCode}
            onChange={onChange}
          />
          <SelectField
            label="Warehouse"
            name="warehouse"
            value={values.warehouse}
            disabled={isReadonly}
            required
            error={errors.warehouse}
            options={WarehouseOptions}
            onChange={onChange}
          />
          <SelectField
            label="Default Account"
            name="defaultAccount"
            value={values.defaultAccount}
            disabled={isReadonly}
            required
            error={errors.defaultAccount}
            options={DefaultAccountOptions}
            onChange={onChange}
          />
          <TextField
            label="Delivery Date"
            name="deliveryDate"
            type="date"
            value={values.deliveryDate}
            disabled={isReadonly}
            required
            error={errors.deliveryDate}
            onChange={onChange}
          />
          <SelectField
            label="Currency"
            name="currency"
            value={values.currency}
            disabled={isReadonly}
            required
            error={errors.currency}
            options={CurrencyOptions}
            onChange={onChange}
          />
          <TextField
            label="ER"
            name="exchangeRate"
            value={values.exchangeRate}
            disabled={isReadonly}
            required
            error={errors.exchangeRate}
            onChange={onChange}
          />
        </div>
        <div className="grid content-start gap-2">
          <TextField
            label="RR No."
            name="transNo"
            value={values.transNo}
            disabled
            required
            error={errors.transNo}
            onChange={onChange}
          />
          <TextField
            label="RR Date"
            name="documentDate"
            type="date"
            value={values.documentDate}
            disabled={isReadonly}
            required
            error={errors.documentDate}
            onChange={onChange}
          />
          <TextField
            label="PO No."
            name="poNo"
            value={values.poNo}
            disabled={isReadonly}
            required
            error={errors.poNo}
            onChange={onChange}
          />
          <TextField
            label="DR No."
            name="drNo"
            value={values.drNo}
            disabled={isReadonly}
            onChange={onChange}
          />
          <TextField
            label="SI No."
            name="siNo"
            value={values.siNo}
            disabled={isReadonly}
            onChange={onChange}
          />
          <TextField
            label="IMP No."
            name="importationRefNo"
            value={values.importationRefNo}
            disabled={isReadonly}
            onChange={onChange}
          />
          <SelectField
            label="Status"
            name="status"
            value={values.status}
            disabled={isReadonly}
            required
            error={errors.status}
            options={StatusOptions}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="grid gap-2 border-t border-darknavy/10 pt-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReadOnlyField label="Gross Amount" value={formatAmount(totals.grossAmount)} />
        <ReadOnlyField label="Net Amount" value={formatAmount(totals.netAmount)} />
        <ReadOnlyField label="VAT Amount" value={formatAmount(totals.vatAmount)} />
        <ReadOnlyField label="Discount" value={formatAmount(totals.discountAmount)} />
      </div>
    </div>
  );
}

function ReceivingReportEntries({
  error,
  isReadonly,
  onRowsChange,
  onUpdateLine,
  rows,
  totals,
}: {
  error?: string;
  isReadonly: boolean;
  onRowsChange: (rows: ReceivingReportLine[]) => void;
  onUpdateLine: ReceivingReportEntryUpdater;
  rows: ReceivingReportLine[];
  totals: ReceivingReportTotals;
}) {
  const updateEntry = useCallback(
    (rowId: string, field: ReceivingReportLineField, value: string) => {
      onUpdateLine(rowId, field, value);
    },
    [onUpdateLine],
  );
  const columns = useMemo<ModuleDataEntryColumn<ReceivingReportLine>[]>(
    () => createReceivingReportColumns(ReceivingReportItemColumnConfigs, isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !["itemCode", "description", "rrQty"].includes(column.id),
        isVisible: true,
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns],
  );

  function addRows(count: number) {
    onRowsChange([...rows, ...Array.from({ length: count }, () => createReceivingReportLine())]);
  }

  function addFreebies() {
    onRowsChange([
      ...rows,
      createReceivingReportLine({
        description: "Freebie item",
        itemCategory: "Freebies",
        cost: "0.00",
        grossAmount: "0.0000",
        netAmount: "0.0000",
        rrQty: "1.00",
      }),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createReceivingReportLine()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearReceivingReportEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportLine()]);
  }

  function duplicateRow(rowId: string) {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];

    if (!row) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(rowIndex + 1, 0, {
      ...row,
      id: createReceivingReportLine().id,
    });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(position === "above" ? rowIndex : rowIndex + 1, 0, createReceivingReportLine());
    onRowsChange(nextRows);
  }

  function moveRow(fromRowId: string, toRowId: string) {
    const fromIndex = rows.findIndex((row) => row.id === fromRowId);
    const toIndex = rows.findIndex((row) => row.id === toRowId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const nextRows = [...rows];
    const [movedRow] = nextRows.splice(fromIndex, 1);

    if (!movedRow) {
      return;
    }

    nextRows.splice(toIndex, 0, movedRow);
    onRowsChange(nextRows);
  }

  function removeRow(rowId: string) {
    const nextRows = rows.filter((row) => row.id !== rowId);
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportLine()]);
  }

  return (
    <div className="grid gap-2">
      {error ? <ErrorText message={error} /> : null}
      <ModuleDataEntry
        addMenuActions={[
          {
            disabled: isReadonly,
            icon: Gift,
            id: "add-freebies",
            label: "Add Freebies",
            onSelect: addFreebies,
          },
        ]}
        columns={columns}
        columnOptions={columnOptions}
        description="Record received inventory quantities, costs, taxes, and warehouse details."
        emptyRowLabel="received item"
        exportOptions={[
          { id: "csv", label: "CSV", onSelect: () => undefined },
          { id: "excel", label: "Excel", onSelect: () => undefined },
          { id: "pdf", label: "PDF", onSelect: () => undefined },
        ]}
        footerDetails={
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
            <span>Gross: {formatAmount(totals.grossAmount)}</span>
            <span>VAT: {formatAmount(totals.vatAmount)}</span>
            <span>Net: {formatAmount(totals.netAmount)}</span>
          </div>
        }
        isDraggable
        isReadonly={isReadonly}
        rows={rows}
        summaryCells={{
          discountAmount: formatAmount(totals.discountAmount),
          ewtAmount: formatAmount(totals.ewtAmount),
          grossAmount: formatAmount(totals.grossAmount),
          netAmount: formatAmount(totals.netAmount),
          vatAmount: formatAmount(totals.vatAmount),
        }}
        title={null}
        onAddRows={addRows}
        onAutoColumnWidth={() => undefined}
        onClearRows={clearRows}
        onDuplicateRow={duplicateRow}
        onFitColumnWidth={() => undefined}
        onImport={() => undefined}
        onInsertRow={insertRow}
        onMoveRow={moveRow}
        onRemoveRow={removeRow}
        onToggleColumnVisibility={() => undefined}
        onUpdateColumnHeader={() => undefined}
        onUpdateColumnWidth={() => undefined}
      />
    </div>
  );
}

function createReceivingReportColumns(
  columnConfigs: ReceivingReportColumnConfig[],
  isReadonly: boolean,
  onUpdateEntry: ReceivingReportEntryUpdater,
): ModuleDataEntryColumn<ReceivingReportLine>[] {
  return columnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row) => (
      <ReceivingReportEntryCell
        column={column}
        isReadonly={isReadonly}
        row={row}
        onUpdateEntry={onUpdateEntry}
      />
    ),
  }));
}

function ReceivingReportEntryCell({
  column,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: ReceivingReportColumnConfig;
  isReadonly: boolean;
  onUpdateEntry: ReceivingReportEntryUpdater;
  row: ReceivingReportLine;
}) {
  const value = row[column.id];

  if (column.kind === "dropdown") {
    return (
      <EntryDropdown
        options={column.options ?? []}
        readOnly={isReadonly}
        value={value}
        onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
      />
    );
  }

  if (column.kind === "amount") {
    return (
      <EntryAmountInput
        value={value}
        readOnly={isReadonly}
        onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
      />
    );
  }

  return (
    <EntryInput
      type={column.kind === "date" ? "date" : "text"}
      value={value}
      readOnly={isReadonly}
      onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
    />
  );
}

function EntryDropdown({
  onChange,
  options,
  readOnly,
  value,
}: {
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      className={EntryDropdownClassName}
      value={value}
      options={options}
      placeholder=""
      readOnly={readOnly}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

function EntryInput({
  onChange,
  readOnly,
  type,
  value,
}: {
  onChange: (value: string) => void;
  readOnly: boolean;
  type: "date" | "text";
  value: string;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className={entryCellControlClassName()}
    />
  );
}

function EntryAmountInput({
  onValueChange,
  readOnly,
  value,
}: {
  onValueChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <MoneyNumberField
      value={value}
      readOnly={readOnly}
      onValueChange={onValueChange}
      className={entryCellControlClassName("text-right tabular-nums")}
    />
  );
}

type ReceivingReportSectionProps = {
  errors: ReceivingReportFormErrors;
  isReadonly: boolean;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  values: ReceivingReportFormValues;
};

type FieldProps = {
  disabled: boolean;
  error?: string;
  label: string;
  name: string;
  onChange: ReceivingReportSectionProps["onChange"];
  required?: boolean;
  value: string;
  type?: string;
};

function TextField({
  disabled,
  error,
  label,
  name,
  onChange,
  required,
  type = "text",
  value,
}: FieldProps) {
  return (
    <label className={fieldShellClassName}>
      <FieldLabel label={label} required={required} controlName={name} />
      <span className="min-w-0">
        <input
          className={getFieldClassName(error)}
          disabled={disabled}
          name={name}
          onChange={onChange}
          type={type}
          value={value}
          aria-invalid={Boolean(error)}
        />
        {error ? <ErrorText message={error} /> : null}
      </span>
    </label>
  );
}

function TextAreaField({ disabled, error, label, name, onChange, required, value }: FieldProps) {
  return (
    <label className={fieldShellClassName}>
      <FieldLabel label={label} required={required} controlName={name} />
      <span className="min-w-0">
        <textarea
          className={`${getFieldClassName(error)} min-h-24 py-3`}
          disabled={disabled}
          name={name}
          onChange={onChange}
          value={value}
          aria-invalid={Boolean(error)}
        />
        {error ? <ErrorText message={error} /> : null}
        <span className="mt-2 block text-xs font-medium text-darknavy/45">
          Characters remaining: {Math.max(250 - value.length, 0)}
        </span>
      </span>
    </label>
  );
}

function SelectField({
  disabled,
  error,
  label,
  name,
  onChange,
  options,
  required,
  value,
}: FieldProps & { options: readonly string[] }) {
  return (
    <label className={fieldShellClassName}>
      <FieldLabel label={label} required={required} controlName={name} />
      <span className="min-w-0">
        <select
          className={getFieldClassName(error)}
          disabled={disabled}
          name={name}
          onChange={onChange}
          value={value}
          aria-invalid={Boolean(error)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error ? <ErrorText message={error} /> : null}
      </span>
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-darknavy">{label}</span>
      <input
        className={`${fieldClassName} bg-offwhite text-right tabular-nums text-darknavy/70`}
        readOnly
        value={value}
      />
    </label>
  );
}

function FieldLabel({
  controlName,
  label,
  required,
}: {
  controlName: string;
  label: string;
  required?: boolean;
}) {
  return (
    <span className="pt-2 text-sm font-semibold text-darknavy" id={`${controlName}-label`}>
      {label}
      {required ? <span className="ml-1 text-coralpink">*</span> : null}
    </span>
  );
}

function ErrorText({ message }: { message: string }) {
  return <span className="mt-1 block text-xs font-semibold text-red-600">{message}</span>;
}

function validateReceivingReport(values: ReceivingReportFormValues): ReceivingReportFormErrors {
  const errors: ReceivingReportFormErrors = {};

  RequiredReceivingReportFields.forEach(({ field, message }) => {
    const value = values[field];

    if (typeof value !== "string" || value.trim().length === 0) {
      errors[field] = message;
    }
  });

  if (values.defaultAccount === "--Select Credit Account--") {
    errors.defaultAccount = "Select a default account.";
  }

  if (!values.lines.some(receivingReportEntryIsComplete)) {
    errors.lines = "Add at least one received item with item name and RR quantity.";
  }

  return errors;
}

function receivingReportColumn(
  header: string,
  id: ReceivingReportLineField,
  kind: ReceivingReportColumnKind,
  width: number,
  widthClassName: string,
  options?: AppAdvancedDropdownOption[],
): ReceivingReportColumnConfig {
  return {
    header,
    id,
    kind,
    options,
    width,
    widthClassName,
  };
}

function dropdownOptions(options: readonly string[]): AppAdvancedDropdownOption[] {
  return options.map((option) => ({
    label: option,
    name: option,
    value: option,
  }));
}

function receivingReportEntryHasData(entry: ReceivingReportLine) {
  return Object.entries(entry).some(([key, value]) => {
    if (key === "id") {
      return false;
    }

    return String(value).trim().length > 0 && !DefaultEmptyValues.has(String(value));
  });
}

function receivingReportEntryIsComplete(entry: ReceivingReportLine) {
  return entry.description.trim().length > 0 && parseMoneyNumberInput(entry.rrQty) > 0;
}

function shouldClearReceivingReportEntry(
  entry: ReceivingReportLine,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return receivingReportEntryHasData(entry);
  }

  if (action === "incomplete") {
    return receivingReportEntryHasData(entry) && !receivingReportEntryIsComplete(entry);
  }

  return !receivingReportEntryHasData(entry);
}

function entryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatMoney(value: number) {
  return value.toFixed(2);
}

function formatQuantity(value: number) {
  return value.toFixed(2);
}

function joinUniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(", ");
}

function getFieldClassName(error?: string) {
  return joinClasses(
    fieldClassName,
    error
      ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : undefined,
  );
}

function getActionMode(pathname: string): ReceivingReportActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

const ReceivingReportActionCopy = {
  add: {
    title: "Add Receiving Report",
    description:
      "Complete vendor details, receiving references, warehouse amounts, and received item entries before saving.",
  },
  edit: {
    title: "Edit Receiving Report",
    description: "Update vendor details, warehouse amounts, references, and received item entries.",
  },
  view: {
    title: "View Receiving Report",
    description:
      "Review the receiving report details, references, warehouse totals, and item entries.",
  },
} satisfies Record<ReceivingReportActionMode, { description: string; title: string }>;

const CurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;
const WarehouseOptions = ["Laguna", "Manila", "Cebu", "Davao"] as const;
const StatusOptions = ["Draft", "Open", "Approved", "Closed", "Cancelled"] as const;
const DefaultAccountOptions = [
  "--Select Credit Account--",
  "Accounts Payable - Trade",
  "Goods Received Not Invoiced",
  "Inventory Clearing",
] as const;
const UomOptions = ["", "PCS", "BOX", "KG", "LTR"] as const;
const BooleanOptions = ["False", "True"] as const;
const AtcOptions = ["", "WI010", "WC158", "WC160"] as const;
const ResponsibilityCenterOptions = ["", "Warehouse", "Purchasing", "Operations"] as const;
const DefaultEmptyValues = new Set(["0.00", "0.0000", "False", "Laguna"]);

const RequiredReceivingReportFields = [
  { field: "vceCode", message: "Party code is required." },
  { field: "vceName", message: "Party name is required." },
  { field: "currency", message: "Currency is required." },
  { field: "exchangeRate", message: "Exchange rate is required." },
  { field: "address", message: "Address is required." },
  { field: "contactNo", message: "Contact number is required." },
  { field: "deliveryDate", message: "Delivery date is required." },
  { field: "defaultAccount", message: "Default account is required." },
  { field: "warehouse", message: "Warehouse is required." },
  { field: "status", message: "Status is required." },
  { field: "transNo", message: "Transaction number is required." },
  { field: "documentDate", message: "Document date is required." },
  { field: "poNo", message: "PO number is required." },
] satisfies Array<{ field: ReceivingReportFormField; message: string }>;

const ReceivingReportItemColumnConfigs = [
  receivingReportColumn("Item Name *", "description", "text", 220, "w-[13.75rem]"),
  receivingReportColumn("PO Qty", "poQty", "amount", 105, "w-[6.5rem]"),
  receivingReportColumn("RR Qty *", "rrQty", "amount", 110, "w-[7rem]"),
  receivingReportColumn("UOM *", "uom", "dropdown", 105, "w-[6.5rem]", dropdownOptions(UomOptions)),
  receivingReportColumn("Expiration Date", "expiryDate", "date", 125, "w-[7.75rem]"),
  receivingReportColumn("Lot No", "lotNo", "text", 105, "w-[6.5rem]"),
  receivingReportColumn("Color", "color", "text", 95, "w-[6rem]"),
  receivingReportColumn("Brand", "brand", "text", 95, "w-[6rem]"),
  receivingReportColumn("Size", "size", "text", 90, "w-[5.75rem]"),
  receivingReportColumn("Model", "model", "text", 110, "w-[7rem]"),
  receivingReportColumn("UC *", "cost", "amount", 110, "w-[7rem]"),
  receivingReportColumn("Total Cost (Net of VAT)", "grossAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn("VAT Amt", "vatAmount", "amount", 130, "w-[8rem]"),
  receivingReportColumn("Total Cost (Gross of VAT)", "netAmount", "amount", 160, "w-[10rem]"),
];

const ReceivingReportDetailColumnConfigs = [
  receivingReportColumn("Item Code", "itemCode", "text", 150, "w-[9.5rem]"),
  receivingReportColumn("Barcode", "barcode", "text", 150, "w-[9.5rem]"),
  receivingReportColumn("Item Category", "itemCategory", "text", 190, "w-[12rem]"),
  receivingReportColumn("Serial No.", "serialNo", "text", 220, "w-[13.75rem]"),
  receivingReportColumn(
    "Warehouse",
    "warehouse",
    "dropdown",
    160,
    "w-[10rem]",
    dropdownOptions(WarehouseOptions),
  ),
  receivingReportColumn("Freight Cost", "freightCost", "amount", 140, "w-[8.75rem]"),
  receivingReportColumn("Discount Amount", "discountAmount", "amount", 160, "w-[10rem]"),
  receivingReportColumn("EWT Amount", "ewtAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn("ATC", "atc", "dropdown", 120, "w-[7.5rem]", dropdownOptions(AtcOptions)),
  receivingReportColumn("Net Amount", "netAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn(
    "VATable",
    "vatable",
    "dropdown",
    120,
    "w-[7.5rem]",
    dropdownOptions(BooleanOptions),
  ),
  receivingReportColumn(
    "VAT Inc.",
    "vatInclusive",
    "dropdown",
    120,
    "w-[7.5rem]",
    dropdownOptions(BooleanOptions),
  ),
  receivingReportColumn(
    "With EWT",
    "withEwt",
    "dropdown",
    120,
    "w-[7.5rem]",
    dropdownOptions(BooleanOptions),
  ),
  receivingReportColumn(
    "Res. Center",
    "responsibilityCenter",
    "dropdown",
    180,
    "w-[11.25rem]",
    dropdownOptions(ResponsibilityCenterOptions),
  ),
];

const fieldClassName =
  "app-theme-field h-11 w-full min-w-0 rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:bg-offwhite/65 disabled:text-darknavy/65";

const fieldShellClassName = "grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start";

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
