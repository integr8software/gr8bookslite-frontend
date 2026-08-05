"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Boxes, Paperclip, Save, Upload, X } from "lucide-react";
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
  type ReceivingReportAttachment,
  type ReceivingReportAccountingEntry,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import {
  getPurchaseOrderItemGrossAmount,
  getPurchaseOrderItemNetAmount,
  getPurchaseOrderTotals,
  loadPurchaseOrders,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import {
  AppCopyFromDropdown,
  type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { openReceivingReportPdf } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportPdf";
import { ReceivingReportReportPreview } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportReportPreview";
import { ReceivingReportEntries } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportEntries";
import {
  CurrencyOptions,
  ReceivingReportFormCopy,
  ReceivingReportHref,
  ResponsibilityCenterOptions,
  TermsOfPaymentOptions,
  WarehouseOptions,
  receivingReportFieldClassName,
  receivingReportFieldShellClassName,
} from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportFormConstants";
import type {
  ReceivingReportFormErrors,
  ReceivingReportFormField,
  ReceivingReportFormMode,
  ReceivingReportFormTab,
} from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportFormTypes";
import { validateReceivingReport } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportValidation";

export function ReceivingReportFormPage() {
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
  const [activeTab, setActiveTab] = useState<ReceivingReportFormTab>("details");
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

  function updateLine(rowId: string, field: keyof ReceivingReportLine, value: string) {
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

  function updateAccountingEntry(
    rowId: string,
    field: keyof ReceivingReportAccountingEntry,
    value: string,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      accountingEntries: current.accountingEntries.map((entry) =>
        entry.id === rowId ? { ...entry, [field]: value } : entry,
      ),
    }));
  }

  function updateAccountingEntries(accountingEntries: ReceivingReportAccountingEntry[]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, accountingEntries }));
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
      dueDate: firstOrder.deliveryDate || current.dueDate,
      termsOfPayment: firstOrder.termsOfPayment || current.termsOfPayment,
      remarks: firstOrder.remarks || current.remarks,
      poNo: joinUniqueValues(purchaseOrderNos) || current.poNo,
      prNo: joinUniqueValues(purchaseRequestNos) || current.prNo,
      importationRefNo: firstOrder.importationNo || current.importationRefNo,
      projectRef: firstOrder.projectRef || current.projectRef,
      projectCode: firstOrder.projectRef || current.projectCode,
      projectName: firstOrder.projectName || current.projectName,
      responsibilityCenter:
        firstOrder.items.find((item) => item.responsibilityCenter.trim().length > 0)
          ?.responsibilityCenter || current.responsibilityCenter,
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
        "dueDate",
        "termsOfPayment",
        "deliveryDate",
        "poNo",
        "responsibilityCenter",
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

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setValues((current) => ({
      ...current,
      attachments: [
        ...current.attachments,
        ...files.map((file) => ({
          id: `rr-attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
        })),
      ],
    }));
    event.target.value = "";
  }

  function removeAttachment(attachmentId: string) {
    setValues((current) => ({
      ...current,
      attachments: current.attachments.filter((attachment) => attachment.id !== attachmentId),
    }));
  }

  return (
    <>
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <ReceivingReportHeader
          mode={mode}
          isReadonly={isReadonly}
          copyFromRecords={purchaseOrderCopyRecords}
          onCopyFromPurchaseOrder={copyFromPurchaseOrders}
          onPreview={() => setIsReportPreviewOpen(true)}
        />
        <ReceivingReportTabs
          activeTab={activeTab}
          attachmentCount={values.attachments.length}
          onTabChange={setActiveTab}
        />
        {activeTab === "details" ? (
          <>
            <section className="grid gap-5 rounded-sm border border-darknavy/10 bg-white px-2 py-2 shadow-sm shadow-darknavy/5 sm:px-2.5">
              <ReceivingReportVendorSection
                errors={errors}
                isReadonly={isReadonly}
                values={values}
                onChange={handleInputChange}
              />
            </section>
            <ReceivingReportEntries
              accountingEntries={values.accountingEntries}
              error={errors.lines}
              isReadonly={isReadonly}
              rows={values.lines}
              totals={totals}
              onAccountingRowsChange={updateAccountingEntries}
              onUpdateAccountingEntry={updateAccountingEntry}
              onRowsChange={updateLines}
              onUpdateLine={updateLine}
            />
          </>
        ) : (
          <ReceivingReportAttachments
            attachments={values.attachments}
            isReadonly={isReadonly}
            onAddAttachments={handleAttachmentChange}
            onRemoveAttachment={removeAttachment}
          />
        )}
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
  mode: ReceivingReportFormMode;
  onCopyFromPurchaseOrder: (recordIds: string[]) => void;
  onPreview: () => void;
}) {
  const copy = ReceivingReportFormCopy[mode];

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={copy.title}
      description={copy.description}
      className="gap-2"
      descriptionClassName="mt-1 text-xs leading-5"
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

function ReceivingReportTabs({
  activeTab,
  attachmentCount,
  onTabChange,
}: {
  activeTab: ReceivingReportFormTab;
  attachmentCount: number;
  onTabChange: (tab: ReceivingReportFormTab) => void;
}) {
  const tabs = useMemo<ModuleTabItem<ReceivingReportFormTab>[]>(
    () => [
      { id: "details", label: "Details" },
      { badge: attachmentCount, id: "attachments", label: "Attachments" },
    ],
    [attachmentCount],
  );

  return (
    <ModuleTabs
      activeTab={activeTab}
      ariaLabel="Receiving report sections"
      tabs={tabs}
      onTabChange={onTabChange}
    />
  );
}

function ReceivingReportAttachments({
  attachments,
  isReadonly,
  onAddAttachments,
  onRemoveAttachment,
}: {
  attachments: ReceivingReportAttachment[];
  isReadonly: boolean;
  onAddAttachments: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}) {
  return (
    <section className="grid gap-3 rounded-sm border border-darknavy/10 bg-white p-3 shadow-sm shadow-darknavy/5">
      {!isReadonly ? (
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-darknavy/20 bg-offwhite/50 px-4 py-6 text-center transition hover:border-skyblue/45 hover:bg-skyblue/5">
          <Upload className="h-5 w-5 text-skyblue" aria-hidden="true" />
          <span className="text-sm font-semibold text-darknavy">Upload attachment</span>
          <span className="text-xs font-medium text-darknavy/55">
            Select files related to this receiving report.
          </span>
          <input className="sr-only" type="file" multiple onChange={onAddAttachments} />
        </label>
      ) : null}
      <div className="grid gap-5">
        {attachments.length > 0 ? (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-3 rounded-md border border-darknavy/10 bg-white px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="h-4 w-4 shrink-0 text-darknavy/55" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-darknavy">{attachment.name}</p>
                  <p className="text-xs font-medium text-darknavy/50">
                    {formatAttachmentSize(attachment.size)}
                  </p>
                </div>
              </div>
              {!isReadonly ? (
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-coralpink/10 hover:text-coralpink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25"
                  onClick={() => onRemoveAttachment(attachment.id)}
                  aria-label={`Remove ${attachment.name}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-md border border-darknavy/10 bg-offwhite/45 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-darknavy">No attachments yet</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ReceivingReportVendorSection({
  errors,
  isReadonly,
  onChange,
  values,
}: ReceivingReportSectionProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-x-4 gap-y-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1.2fr)_minmax(0,0.95fr)]">
        <div className="grid content-start gap-4">
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
            label="Contact Person"
            name="contactPerson"
            value={values.contactPerson}
            disabled={isReadonly}
            onChange={onChange}
          />
          <TextField
            label="Contact No"
            name="contactNo"
            value={values.contactNo}
            disabled={isReadonly}
            required
            error={errors.contactNo}
            onChange={onChange}
          />
          <TextField
            label="Project Code"
            name="projectCode"
            value={values.projectCode}
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
        <div className="grid content-start gap-4">
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
            label="Terms of Payment"
            name="termsOfPayment"
            value={values.termsOfPayment}
            disabled={isReadonly}
            error={errors.termsOfPayment}
            options={TermsOfPaymentOptions}
            onChange={onChange}
          />
          <TextField
            label="Due Date"
            name="dueDate"
            type="date"
            value={values.dueDate}
            disabled={isReadonly}
            error={errors.dueDate}
            onChange={onChange}
          />
          <CurrencyExchangeRateField
            currencyValue={values.currency}
            exchangeRateValue={values.exchangeRate}
            disabled={isReadonly}
            currencyError={errors.currency}
            exchangeRateError={errors.exchangeRate}
            onChange={onChange}
          />
          <SelectField
            label="Responsibility Center"
            name="responsibilityCenter"
            value={values.responsibilityCenter}
            disabled={isReadonly}
            required
            error={errors.responsibilityCenter}
            options={ResponsibilityCenterOptions}
            onChange={onChange}
          />
        </div>
        <div className="grid content-start gap-4">
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
          <TextField
            label="Status"
            name="status"
            value={values.status}
            disabled
            required
            error={errors.status}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
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
    <label className={receivingReportFieldShellClassName}>
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
    <label className={receivingReportFieldShellClassName}>
      <FieldLabel label={label} required={required} controlName={name} />
      <span className="min-w-0">
        <textarea
          className={`${getFieldClassName(error)} min-h-20 py-2`}
          disabled={disabled}
          name={name}
          onChange={onChange}
          value={value}
          aria-invalid={Boolean(error)}
        />
        {error ? <ErrorText message={error} /> : null}
        <span className="mt-1 block text-xs font-medium text-darknavy/45">
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
    <label className={receivingReportFieldShellClassName}>
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

function CurrencyExchangeRateField({
  currencyError,
  currencyValue,
  disabled,
  exchangeRateError,
  exchangeRateValue,
  onChange,
}: {
  currencyError?: string;
  currencyValue: string;
  disabled: boolean;
  exchangeRateError?: string;
  exchangeRateValue: string;
  onChange: ReceivingReportSectionProps["onChange"];
}) {
  const hasError = Boolean(currencyError || exchangeRateError);

  return (
    <div className="grid min-w-0 gap-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)_max-content_6.5rem] sm:items-start">
      <FieldLabel label="Currency" required controlName="currency" />
      <span className="min-w-0">
        <select
          className={getFieldClassName(currencyError)}
          disabled={disabled}
          name="currency"
          onChange={onChange}
          value={currencyValue}
          aria-invalid={Boolean(currencyError)}
          aria-label="Currency"
        >
          {CurrencyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
      <FieldLabel label="Exchange Rate" required controlName="exchangeRate" />
      <span className="min-w-0">
        <input
          className={`${getFieldClassName(exchangeRateError)} text-right tabular-nums`}
          disabled={disabled}
          name="exchangeRate"
          onChange={onChange}
          value={exchangeRateValue}
          aria-invalid={Boolean(exchangeRateError)}
          aria-label="Exchange Rate"
        />
      </span>
      {hasError ? (
        <span className="sm:col-span-4">
          {currencyError ? <ErrorText message={currencyError} /> : null}
          {exchangeRateError ? <ErrorText message={exchangeRateError} /> : null}
        </span>
      ) : null}
    </div>
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

function formatMoney(value: number) {
  return value.toFixed(2);
}

function formatQuantity(value: number) {
  return value.toFixed(2);
}

function formatAttachmentSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function joinUniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(", ");
}

function getFieldClassName(error?: string) {
  return joinClasses(
    receivingReportFieldClassName,
    error
      ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : undefined,
  );
}

function getActionMode(pathname: string): ReceivingReportFormMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
