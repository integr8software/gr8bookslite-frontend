"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Boxes, Gift, Paperclip, Save, Upload, X } from "lucide-react";
import {
  calculateReceivingReportTotals,
  createReceivingReportAccountingEntry,
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
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
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
type ReceivingReportActionTab = "details" | "attachments";
type ReceivingReportEntryTab = "items" | "accounting";
type ReceivingReportLineField = keyof ReceivingReportLine;
type ReceivingReportAccountingEntryField = keyof ReceivingReportAccountingEntry;
type ReceivingReportColumnKind = "amount" | "date" | "dropdown" | "text";

type ReceivingReportColumnConfig = {
  header: string;
  id: ReceivingReportLineField;
  kind: ReceivingReportColumnKind;
  options?: AppAdvancedDropdownOption[];
  width: number;
  widthClassName: string;
};

type ReceivingReportAccountingColumnConfig = {
  header: string;
  id: ReceivingReportAccountingEntryField;
  kind: "amount" | "text";
  width: number;
  widthClassName: string;
};

type ReceivingReportEntryUpdater = (
  rowId: string,
  field: ReceivingReportLineField,
  value: string,
) => void;
type ReceivingReportAccountingEntryUpdater = (
  rowId: string,
  field: ReceivingReportAccountingEntryField,
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
  const [activeTab, setActiveTab] = useState<ReceivingReportActionTab>("details");
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

  function updateAccountingEntry(
    rowId: string,
    field: ReceivingReportAccountingEntryField,
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
  activeTab: ReceivingReportActionTab;
  attachmentCount: number;
  onTabChange: (tab: ReceivingReportActionTab) => void;
}) {
  const tabs = useMemo<ModuleTabItem<ReceivingReportActionTab>[]>(
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
          <SelectField
            label="Status"
            name="status"
            value={values.status}
            disabled
            required
            error={errors.status}
            options={StatusOptions}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

function ReceivingReportEntries({
  accountingEntries,
  error,
  isReadonly,
  onAccountingRowsChange,
  onRowsChange,
  onUpdateAccountingEntry,
  onUpdateLine,
  rows,
  totals,
}: {
  accountingEntries: ReceivingReportAccountingEntry[];
  error?: string;
  isReadonly: boolean;
  onAccountingRowsChange: (rows: ReceivingReportAccountingEntry[]) => void;
  onRowsChange: (rows: ReceivingReportLine[]) => void;
  onUpdateAccountingEntry: ReceivingReportAccountingEntryUpdater;
  onUpdateLine: ReceivingReportEntryUpdater;
  rows: ReceivingReportLine[];
  totals: ReceivingReportTotals;
}) {
  const [activeEntryTab, setActiveEntryTab] = useState<ReceivingReportEntryTab>("items");
  const tabs = (
    <ReceivingReportEntryTabs activeTab={activeEntryTab} onTabChange={setActiveEntryTab} />
  );

  if (activeEntryTab === "accounting") {
    return (
      <ReceivingReportAccountingEntries
        isReadonly={isReadonly}
        rows={accountingEntries}
        title={tabs}
        onRowsChange={onAccountingRowsChange}
        onUpdateEntry={onUpdateAccountingEntry}
      />
    );
  }

  return (
    <ReceivingReportItemEntries
      error={error}
      isReadonly={isReadonly}
      rows={rows}
      title={tabs}
      totals={totals}
      onRowsChange={onRowsChange}
      onUpdateLine={onUpdateLine}
    />
  );
}

function ReceivingReportEntryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ReceivingReportEntryTab;
  onTabChange: (tab: ReceivingReportEntryTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Receiving report row entry sections"
      className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
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
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
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

function ReceivingReportItemEntries({
  error,
  isReadonly,
  onRowsChange,
  onUpdateLine,
  rows,
  title,
  totals,
}: {
  error?: string;
  isReadonly: boolean;
  onRowsChange: (rows: ReceivingReportLine[]) => void;
  onUpdateLine: ReceivingReportEntryUpdater;
  rows: ReceivingReportLine[];
  title: ReactNode;
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
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(
    () =>
      new Set(
        columns
          .map((column) => column.id)
          .filter((columnId) => !DefaultHiddenReceivingReportItemColumns.has(columnId)),
      ),
  );
  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnIds.has(column.id)),
    [columns, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: DefaultHiddenReceivingReportItemColumns.has(column.id),
        isVisible: visibleColumnIds.has(column.id),
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns, visibleColumnIds],
  );

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    setVisibleColumnIds((current) => {
      if (!isVisible && !DefaultHiddenReceivingReportItemColumns.has(columnId)) {
        return current;
      }

      const next = new Set(current);

      if (isVisible) {
        next.add(columnId);
      } else {
        next.delete(columnId);
      }

      return next;
    });
  }

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
    <div className="grid gap-5">
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
        columns={visibleColumns}
        columnOptions={columnOptions}
        emptyRowLabel="received item"
        exportOptions={[
          { id: "csv", label: "CSV", onSelect: () => undefined },
          { id: "excel", label: "Excel", onSelect: () => undefined },
          { id: "pdf", label: "PDF", onSelect: () => undefined },
        ]}
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
        title={title}
        onAddRows={addRows}
        onAutoColumnWidth={() => undefined}
        onClearRows={clearRows}
        onDuplicateRow={duplicateRow}
        onFitColumnWidth={() => undefined}
        onImport={() => undefined}
        onInsertRow={insertRow}
        onMoveRow={moveRow}
        onRemoveRow={removeRow}
        onToggleColumnVisibility={toggleColumnVisibility}
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

function ReceivingReportAccountingEntries({
  isReadonly,
  onRowsChange,
  onUpdateEntry,
  rows,
  title,
}: {
  isReadonly: boolean;
  onRowsChange: (rows: ReceivingReportAccountingEntry[]) => void;
  onUpdateEntry: ReceivingReportAccountingEntryUpdater;
  rows: ReceivingReportAccountingEntry[];
  title: ReactNode;
}) {
  const updateEntry = useCallback(
    (rowId: string, field: ReceivingReportAccountingEntryField, value: string) => {
      onUpdateEntry(rowId, field, value);
    },
    [onUpdateEntry],
  );
  const columns = useMemo<ModuleDataEntryColumn<ReceivingReportAccountingEntry>[]>(
    () => createReceivingReportAccountingColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(
    () => new Set(DefaultVisibleReceivingReportAccountingColumns),
  );
  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnIds.has(column.id)),
    [columns, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !DefaultVisibleReceivingReportAccountingColumns.has(column.id),
        isVisible: visibleColumnIds.has(column.id),
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns, visibleColumnIds],
  );

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    setVisibleColumnIds((current) => {
      if (!isVisible && DefaultVisibleReceivingReportAccountingColumns.has(columnId)) {
        return current;
      }

      const next = new Set(current);

      if (isVisible) {
        next.add(columnId);
      } else {
        next.delete(columnId);
      }

      return next;
    });
  }

  function addRows(count: number) {
    onRowsChange([
      ...rows,
      ...Array.from({ length: count }, () => createReceivingReportAccountingEntry()),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createReceivingReportAccountingEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearAccountingEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportAccountingEntry()]);
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
      id: createReceivingReportAccountingEntry().id,
    });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(
      position === "above" ? rowIndex : rowIndex + 1,
      0,
      createReceivingReportAccountingEntry(),
    );
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportAccountingEntry()]);
  }

  return (
    <ModuleDataEntry
      columns={visibleColumns}
      columnOptions={columnOptions}
      emptyRowLabel="accounting entry"
      exportOptions={[
        { id: "csv", label: "CSV", onSelect: () => undefined },
        { id: "excel", label: "Excel", onSelect: () => undefined },
        { id: "pdf", label: "PDF", onSelect: () => undefined },
      ]}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      title={title}
      onAddRows={addRows}
      onAutoColumnWidth={() => undefined}
      onClearRows={clearRows}
      onDuplicateRow={duplicateRow}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={insertRow}
      onMoveRow={moveRow}
      onRemoveRow={removeRow}
      onToggleColumnVisibility={toggleColumnVisibility}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function createReceivingReportAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: ReceivingReportAccountingEntryUpdater,
): ModuleDataEntryColumn<ReceivingReportAccountingEntry>[] {
  return ReceivingReportAccountingColumnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row) => (
      <ReceivingReportAccountingEntryCell
        column={column}
        isReadonly={isReadonly}
        row={row}
        onUpdateEntry={onUpdateEntry}
      />
    ),
  }));
}

function ReceivingReportAccountingEntryCell({
  column,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: ReceivingReportAccountingColumnConfig;
  isReadonly: boolean;
  onUpdateEntry: ReceivingReportAccountingEntryUpdater;
  row: ReceivingReportAccountingEntry;
}) {
  const value = row[column.id];

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
      type="text"
      value={value}
      readOnly={isReadonly}
      onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
    />
  );
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

function validateReceivingReport(values: ReceivingReportFormValues): ReceivingReportFormErrors {
  const errors: ReceivingReportFormErrors = {};

  RequiredReceivingReportFields.forEach(({ field, message }) => {
    const value = values[field];

    if (typeof value !== "string" || value.trim().length === 0) {
      errors[field] = message;
    }
  });

  if (!values.lines.some(receivingReportEntryIsComplete)) {
    errors.lines = "Add at least one received item with item code, item name, and RR quantity.";
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

function receivingReportAccountingColumn(
  header: string,
  id: ReceivingReportAccountingEntryField,
  kind: "amount" | "text",
  width: number,
  widthClassName: string,
): ReceivingReportAccountingColumnConfig {
  return {
    header,
    id,
    kind,
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
  return (
    entry.itemCode.trim().length > 0 &&
    entry.description.trim().length > 0 &&
    parseMoneyNumberInput(entry.rrQty) > 0
  );
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

function accountingEntryHasData(entry: ReceivingReportAccountingEntry) {
  return Object.entries(entry).some(([key, value]) => {
    if (key === "id") {
      return false;
    }

    return String(value).trim().length > 0 && !DefaultEmptyValues.has(String(value));
  });
}

function shouldClearAccountingEntry(
  entry: ReceivingReportAccountingEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return accountingEntryHasData(entry);
  }

  if (action === "incomplete") {
    return (
      accountingEntryHasData(entry) && (!entry.accountCode.trim() || !entry.accountTitle.trim())
    );
  }

  return !accountingEntryHasData(entry);
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

const ReceivingReportEntryTabsList = [
  { id: "items", label: "Item Entry" },
  { id: "accounting", label: "Accounting Entry" },
] satisfies Array<{ id: ReceivingReportEntryTab; label: string }>;

const CurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;
const WarehouseOptions = ["Laguna", "Manila", "Cebu", "Davao"] as const;
const StatusOptions = ["Draft", "Open", "Approved", "Closed", "Cancelled"] as const;
const TermsOfPaymentOptions = ["", "COD", "Net 15", "Net 30", "Net 45", "Net 60"] as const;
const UomOptions = ["", "PCS", "BOX", "KG", "LTR"] as const;
const ResponsibilityCenterOptions = ["", "Warehouse", "Purchasing", "Operations"] as const;
const DefaultEmptyValues = new Set(["0.00", "0.0000", "False", "Laguna"]);
const DefaultHiddenReceivingReportItemColumns = new Set<string>([
  "barcode",
  "expiryDate",
  "lotNo",
  "color",
  "brand",
  "size",
  "model",
]);
const DefaultVisibleReceivingReportAccountingColumns = new Set<string>([
  "accountTitle",
  "debit",
  "credit",
  "particulars",
]);

const RequiredReceivingReportFields = [
  { field: "vceCode", message: "Party code is required." },
  { field: "vceName", message: "Party name is required." },
  { field: "currency", message: "Currency is required." },
  { field: "exchangeRate", message: "Exchange rate is required." },
  { field: "address", message: "Address is required." },
  { field: "contactNo", message: "Contact number is required." },
  { field: "warehouse", message: "Warehouse is required." },
  { field: "responsibilityCenter", message: "Responsibility center is required." },
  { field: "status", message: "Status is required." },
  { field: "transNo", message: "Transaction number is required." },
  { field: "documentDate", message: "Document date is required." },
  { field: "poNo", message: "PO number is required." },
] satisfies Array<{ field: ReceivingReportFormField; message: string }>;

const ReceivingReportItemColumnConfigs = [
  receivingReportColumn("Item Code *", "itemCode", "text", 150, "w-[9.5rem]"),
  receivingReportColumn("Barcode", "barcode", "text", 130, "w-[8rem]"),
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

const ReceivingReportAccountingColumnConfigs = [
  receivingReportAccountingColumn("Account Code", "accountCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("Account Title", "accountTitle", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("Debit", "debit", "amount", 130, "w-[8rem]"),
  receivingReportAccountingColumn("Credit", "credit", "amount", 130, "w-[8rem]"),
  receivingReportAccountingColumn("Party Code", "partyCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("Party Name", "partyName", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("Particulars", "particulars", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("VAT Type", "vatType", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("EWT Code", "ewtCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn(
    "Responsibility Center",
    "responsibilityCenter",
    "text",
    190,
    "w-[12rem]",
  ),
  receivingReportAccountingColumn("Reference No.", "referenceNo", "text", 160, "w-[10rem]"),
];

const fieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

const fieldShellClassName =
  "grid min-w-0 gap-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start";

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
