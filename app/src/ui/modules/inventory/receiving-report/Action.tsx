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
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { MoneyNumberField, parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { openReceivingReportPdf } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportPdf";
import { ReceivingReportReportPreview } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportReportPreview";

const ReceivingReportHref = "/inventory/receiving-report";

type ReceivingReportActionMode = "add" | "edit" | "view";
type ReceivingReportEntrySection = "details" | "items";
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

type ReceivingReportEntryUpdater = (rowId: string, field: ReceivingReportLineField, value: string) => void;
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
      : getInitialReceivingReports().find((record) => record.id === recordId) ?? null;
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

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateReceivingReport(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const nextRecord = createReceivingReportRecordFromForm(
      values,
      mode === "edit" ? loadedRecord ?? undefined : undefined,
    );
    upsertReceivingReportRecord(nextRecord);
    setLoadedRecord(nextRecord);
    router.push(ReceivingReportHref);
  }

  return (
    <>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <ReceivingReportHeader mode={mode} isReadonly={isReadonly} onPreview={() => setIsReportPreviewOpen(true)} />
        <section className="grid gap-2 rounded-md border border-darknavy/10 bg-white p-2 shadow-sm shadow-darknavy/5 sm:p-3">
          <ReceivingReportVendorSection errors={errors} isReadonly={isReadonly} totals={totals} values={values} onChange={handleInputChange} />
        </section>
        <ReceivingReportEntries error={errors.lines} isReadonly={isReadonly} rows={values.lines} totals={totals} onRowsChange={updateLines} onUpdateLine={updateLine} />
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

function ReceivingReportHeader({ isReadonly, mode, onPreview }: { isReadonly: boolean; mode: ReceivingReportActionMode; onPreview: () => void }) {
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
            <button type="submit" className={moduleHeaderActionClassNames.primary}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
          ) : null}
        </div>
      }
    />
  );
}

function ReceivingReportVendorSection({ errors, isReadonly, onChange, totals, values }: ReceivingReportSectionProps & { totals: ReceivingReportTotals }) {
  return (
    <div className="grid gap-x-4 gap-y-2 xl:grid-cols-[1.15fr_1fr_1.15fr]">
      <div className="grid content-start gap-2">
        <TextField label="Trans No." name="transNo" value={values.transNo} disabled required error={errors.transNo} onChange={onChange} />
        <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
          <TextField label="Party Code" name="vceCode" value={values.vceCode} disabled required error={errors.vceCode} onChange={onChange} />
          <TextField label="Party Name" name="vceName" value={values.vceName} disabled={isReadonly} required error={errors.vceName} onChange={onChange} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <TextField label="Document Date" name="documentDate" type="date" value={values.documentDate} disabled={isReadonly} required error={errors.documentDate} onChange={onChange} />
          <TextField label="Delivery Date" name="deliveryDate" type="date" value={values.deliveryDate} disabled={isReadonly} required error={errors.deliveryDate} onChange={onChange} />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <TextField label="PO No." name="poNo" value={values.poNo} disabled={isReadonly} required error={errors.poNo} onChange={onChange} />
          <TextField label="DR No." name="drNo" value={values.drNo} disabled={isReadonly} onChange={onChange} />
          <TextField label="PR No." name="prNo" value={values.prNo} disabled={isReadonly} onChange={onChange} />
        </div>
      </div>
      <div className="grid content-start gap-2">
        <TextField label="Address" name="address" value={values.address} disabled={isReadonly} required error={errors.address} onChange={onChange} />
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <TextField label="Contact No." name="contactNo" value={values.contactNo} disabled={isReadonly} required error={errors.contactNo} onChange={onChange} />
          <TextField label="Exchange Rate" name="exchangeRate" value={values.exchangeRate} disabled={isReadonly} required error={errors.exchangeRate} onChange={onChange} />
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SelectField label="Currency" name="currency" value={values.currency} disabled={isReadonly} required error={errors.currency} options={CurrencyOptions} onChange={onChange} />
          <SelectField label="Default Account" name="defaultAccount" value={values.defaultAccount} disabled={isReadonly} required error={errors.defaultAccount} options={DefaultAccountOptions} onChange={onChange} />
        </div>
        <TextAreaField label="Remarks" name="remarks" value={values.remarks} disabled={isReadonly} onChange={onChange} />
      </div>
      <div className="grid content-start gap-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <SelectField label="Warehouse" name="warehouse" value={values.warehouse} disabled={isReadonly} required error={errors.warehouse} options={WarehouseOptions} onChange={onChange} />
          <SelectField label="Status" name="status" value={values.status} disabled={isReadonly} required error={errors.status} options={StatusOptions} onChange={onChange} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <TextField label="SI No." name="siNo" value={values.siNo} disabled={isReadonly} onChange={onChange} />
          <TextField label="Importation Ref No." name="importationRefNo" value={values.importationRefNo} disabled={isReadonly} onChange={onChange} />
        </div>
        <div className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)_8rem]">
          <TextField label="ProjectRef." name="projectRef" value={values.projectRef} disabled={isReadonly} onChange={onChange} />
          <TextField label="Project Name" name="projectName" value={values.projectName} disabled={isReadonly} onChange={onChange} />
          <TextField label="PJ No." name="pjNo" value={values.pjNo} disabled={isReadonly} onChange={onChange} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <ReadOnlyField label="Gross Amount" value={formatAmount(totals.grossAmount)} />
          <ReadOnlyField label="Net Amount" value={formatAmount(totals.netAmount)} />
          <ReadOnlyField label="VAT Amount" value={formatAmount(totals.vatAmount)} />
          <ReadOnlyField label="Discount" value={formatAmount(totals.discountAmount)} />
        </div>
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
  const [activeEntryTab, setActiveEntryTab] = useState<ReceivingReportEntrySection>("items");
  const updateEntry = useCallback(
    (rowId: string, field: ReceivingReportLineField, value: string) => {
      onUpdateLine(rowId, field, value);
    },
    [onUpdateLine],
  );
  const activeColumns = activeEntryTab === "items" ? ReceivingReportItemColumnConfigs : ReceivingReportDetailColumnConfigs;
  const columns = useMemo<ModuleDataEntryColumn<ReceivingReportLine>[]>(
    () => createReceivingReportColumns(activeColumns, isReadonly, updateEntry),
    [activeColumns, isReadonly, updateEntry],
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
      title={<ReceivingReportEntryTabs activeTab={activeEntryTab} onTabChange={setActiveEntryTab} />}
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

function ReceivingReportEntryTabs({ activeTab, onTabChange }: { activeTab: ReceivingReportEntrySection; onTabChange: (tab: ReceivingReportEntrySection) => void }) {
  return (
    <div role="tablist" aria-label="Receiving report row entry sections" className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
      {ReceivingReportEntryTabsList.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={joinClasses(
              "h-7 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10" : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function createReceivingReportColumns(columnConfigs: ReceivingReportColumnConfig[], isReadonly: boolean, onUpdateEntry: ReceivingReportEntryUpdater): ModuleDataEntryColumn<ReceivingReportLine>[] {
  return columnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row) => <ReceivingReportEntryCell column={column} isReadonly={isReadonly} row={row} onUpdateEntry={onUpdateEntry} />,
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
      <EntryDropdown options={column.options ?? []} readOnly={isReadonly} value={value} onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)} />
    );
  }

  if (column.kind === "amount") {
    return <EntryAmountInput value={value} readOnly={isReadonly} onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)} />;
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

function EntryInput({ onChange, readOnly, type, value }: { onChange: (value: string) => void; readOnly: boolean; type: "date" | "text"; value: string }) {
  return <input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className={entryCellControlClassName()} />;
}

function EntryAmountInput({ onValueChange, readOnly, value }: { onValueChange: (value: string) => void; readOnly: boolean; value: string }) {
  return <MoneyNumberField value={value} readOnly={readOnly} onValueChange={onValueChange} className={entryCellControlClassName("text-right tabular-nums")} />;
}

type ReceivingReportSectionProps = {
  errors: ReceivingReportFormErrors;
  isReadonly: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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

function TextField({ disabled, error, label, name, onChange, required, type = "text", value }: FieldProps) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input className={getFieldClassName(error)} disabled={disabled} name={name} onChange={onChange} type={type} value={value} aria-invalid={Boolean(error)} />
      {error ? <ErrorText message={error} /> : null}
    </label>
  );
}

function TextAreaField({ disabled, error, label, name, onChange, required, value }: FieldProps) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <textarea className={`${getFieldClassName(error)} min-h-16 py-2`} disabled={disabled} name={name} onChange={onChange} value={value} aria-invalid={Boolean(error)} />
      {error ? <ErrorText message={error} /> : null}
      <span className="mt-1 block text-xs font-medium text-darknavy/45">Characters remaining: {Math.max(250 - value.length, 0)}</span>
    </label>
  );
}

function SelectField({ disabled, error, label, name, onChange, options, required, value }: FieldProps & { options: readonly string[] }) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <select className={getFieldClassName(error)} disabled={disabled} name={name} onChange={onChange} value={value} aria-invalid={Boolean(error)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <ErrorText message={error} /> : null}
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">{label}</span>
      <input className={`${fieldClassName} bg-offwhite text-right tabular-nums text-darknavy/70`} readOnly value={value} />
    </label>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
      {label}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
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
    errors.lines = "Add at least one received item with item code, description, and RR quantity.";
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
  return entry.itemCode.trim().length > 0 && entry.description.trim().length > 0 && parseMoneyNumberInput(entry.rrQty) > 0;
}

function shouldClearReceivingReportEntry(entry: ReceivingReportLine, action: Exclude<ModuleDataEntryClearAction, "all">) {
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

function getFieldClassName(error?: string) {
  return joinClasses(fieldClassName, error ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200" : undefined);
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

const ReceivingReportEntryTabsList = [
  { id: "items", label: "Item Entry" },
  { id: "details", label: "Receiving Report Details" },
] satisfies Array<{ id: ReceivingReportEntrySection; label: string }>;

const ReceivingReportActionCopy = {
  add: {
    title: "Add Receiving Report",
    description: "Complete vendor details, receiving references, warehouse amounts, and received item entries before saving.",
  },
  edit: {
    title: "Edit Receiving Report",
    description: "Update vendor details, warehouse amounts, references, and received item entries.",
  },
  view: {
    title: "View Receiving Report",
    description: "Review the receiving report details, references, warehouse totals, and item entries.",
  },
} satisfies Record<ReceivingReportActionMode, { description: string; title: string }>;

const CurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;
const WarehouseOptions = ["Laguna", "Manila", "Cebu", "Davao"] as const;
const StatusOptions = ["Draft", "Open", "Approved", "Closed", "Cancelled"] as const;
const DefaultAccountOptions = ["--Select Credit Account--", "Accounts Payable - Trade", "Goods Received Not Invoiced", "Inventory Clearing"] as const;
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
  receivingReportColumn("Item Code", "itemCode", "text", 150, "w-[9.5rem]"),
  receivingReportColumn("Barcode", "barcode", "text", 150, "w-[9.5rem]"),
  receivingReportColumn("Description", "description", "text", 300, "w-[18.75rem]"),
  receivingReportColumn("Item Category", "itemCategory", "text", 190, "w-[12rem]"),
  receivingReportColumn("Serial No.", "serialNo", "text", 220, "w-[13.75rem]"),
  receivingReportColumn("Warehouse", "warehouse", "dropdown", 160, "w-[10rem]", dropdownOptions(WarehouseOptions)),
  receivingReportColumn("PO Qty", "poQty", "amount", 120, "w-[7.5rem]"),
  receivingReportColumn("RR Qty", "rrQty", "amount", 120, "w-[7.5rem]"),
  receivingReportColumn("UOM", "uom", "dropdown", 120, "w-[7.5rem]", dropdownOptions(UomOptions)),
  receivingReportColumn("Expiry Date", "expiryDate", "date", 150, "w-[9.5rem]"),
];

const ReceivingReportDetailColumnConfigs = [
  receivingReportColumn("Freight Cost", "freightCost", "amount", 140, "w-[8.75rem]"),
  receivingReportColumn("Cost", "cost", "amount", 130, "w-[8rem]"),
  receivingReportColumn("Gross Amount", "grossAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn("VAT Amount", "vatAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn("Discount Amount", "discountAmount", "amount", 160, "w-[10rem]"),
  receivingReportColumn("EWT Amount", "ewtAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn("ATC", "atc", "dropdown", 120, "w-[7.5rem]", dropdownOptions(AtcOptions)),
  receivingReportColumn("Net Amount", "netAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn("VATable", "vatable", "dropdown", 120, "w-[7.5rem]", dropdownOptions(BooleanOptions)),
  receivingReportColumn("VAT Inc.", "vatInclusive", "dropdown", 120, "w-[7.5rem]", dropdownOptions(BooleanOptions)),
  receivingReportColumn("With EWT", "withEwt", "dropdown", 120, "w-[7.5rem]", dropdownOptions(BooleanOptions)),
  receivingReportColumn("Res. Center", "responsibilityCenter", "dropdown", 180, "w-[11.25rem]", dropdownOptions(ResponsibilityCenterOptions)),
];

const fieldClassName =
  "app-theme-field h-9 w-full rounded-md border border-darknavy/10 bg-white px-2.5 text-sm text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite disabled:text-darknavy/55";

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
