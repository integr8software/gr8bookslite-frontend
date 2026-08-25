"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  X,
} from "lucide-react";
import type { DisbursementPaymentMethod } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  createPaymentTypeFromForm,
  PaymentTypeInitialFormValues,
  PaymentTypeOptions,
  updatePaymentTypeFromForm,
} from "@/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData";
import {
  applyPaymentTypeListParams,
} from "@/app/src/services/modules/financial-maintenance/payment-type/PaymentTypeApi";
import type {
  PaymentTypeClassification,
  PaymentTypeFormErrors,
  PaymentTypeFormValues,
  PaymentTypeRecord,
  PaymentTypeSortKey,
  PaymentTypeStatus,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { validatePaymentTypeForm } from "@/app/src/validations/modules/financial-maintenance/payment-type/PaymentTypeValidation";

type PaymentTypeDialogMode = "list" | "add" | "edit" | "view";
export type AppPaymentTypeRecord = PaymentTypeRecord;
type PaymentTypeDraft = PaymentTypeFormValues;
type PaymentTypeFilterStatus = "" | PaymentTypeStatus;
type PaymentTypeFilterType = "" | PaymentTypeClassification;
type PaymentTypeSortDirection = "asc" | "desc";
type PaymentTypeActionValue = "view" | "edit" | "toggle";
type MaybePromise<T> = T | Promise<T>;

type AppPaymentTypeDialogProps = {
  isOpen: boolean;
  isLoading?: boolean;
  isMutating?: boolean;
  records: PaymentTypeRecord[];
  onClose: () => void;
  onCreateRecord: (
    record: PaymentTypeRecord,
    values: PaymentTypeFormValues,
  ) => MaybePromise<PaymentTypeRecord | void>;
  onSelect: (value: DisbursementPaymentMethod) => void;
  onUpdateRecord: (
    record: PaymentTypeRecord,
    values: PaymentTypeFormValues,
  ) => MaybePromise<PaymentTypeRecord | void>;
};

const EmptyDraft: PaymentTypeDraft = PaymentTypeInitialFormValues;

const fieldClassName =
  "h-11 w-full rounded-lg border border-darknavy/12 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20 disabled:bg-darknavy/5";

const accentPrimaryButtonClassName =
  "theme-accent-contrast-text inline-flex items-center justify-center gap-2 rounded-lg bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85";

function createEmptyDraft(records: PaymentTypeRecord[]): PaymentTypeDraft {
  return {
    ...EmptyDraft,
    sortOrder: String(getNextPaymentTypeSortOrder(records)),
  };
}

function getNextPaymentTypeSortOrder(records: PaymentTypeRecord[]) {
  return Math.max(0, ...records.map((record) => record.sortOrder)) + 10;
}

export function AppPaymentTypeDialog({
  isOpen,
  isLoading = false,
  isMutating = false,
  records,
  onClose,
  onCreateRecord,
  onSelect,
  onUpdateRecord,
}: AppPaymentTypeDialogProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<PaymentTypeFilterType>("");
  const [statusFilter, setStatusFilter] =
    useState<PaymentTypeFilterStatus>("Active");
  const [sortBy, setSortBy] = useState<PaymentTypeSortKey>("sortOrder");
  const [sortDirection, setSortDirection] =
    useState<PaymentTypeSortDirection>("asc");
  const [mode, setMode] = useState<PaymentTypeDialogMode>("list");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PaymentTypeDraft>(() =>
    createEmptyDraft(records),
  );
  const [formErrors, setFormErrors] = useState<PaymentTypeFormErrors>({});
  const [formSubmitError, setFormSubmitError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(DefaultPageSizeOptions[0]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect -- reset transient dialog state whenever this modal opens. */
    setQuery("");
    setTypeFilter("");
    setStatusFilter("Active");
    setSortBy("sortOrder");
    setSortDirection("asc");
    setMode("list");
    setActiveRecordId(null);
    setDraft(createEmptyDraft(records));
    setFormErrors({});
    setFormSubmitError("");
    setPageIndex(0);
    setPageSize(DefaultPageSizeOptions[0]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (mode === "list") {
        onClose();
        return;
      }

      setMode("list");
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, mode, onClose]);

  const filteredRecords = useMemo(() => {
    return applyPaymentTypeListParams(records, {
      search: query,
      sortBy,
      sortDirection,
      status: statusFilter,
      type: typeFilter,
    });
  }, [query, records, sortBy, sortDirection, statusFilter, typeFilter]);

  const activeRecord = useMemo(
    () => records.find((record) => record.id === activeRecordId) ?? null,
    [activeRecordId, records],
  );
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const paginatedRecords = filteredRecords.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize,
  );

  function openRecord(record: PaymentTypeRecord, nextMode: "edit" | "view") {
    setDraft({
      description: record.description,
      paymentType: record.paymentType,
      sortOrder: String(record.sortOrder),
      type: record.type,
      status: record.status,
    });
    setActiveRecordId(record.id);
    setFormErrors({});
    setFormSubmitError("");
    setMode(nextMode);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPageIndex(0);
  }

  function handleTypeFilterChange(value: PaymentTypeFilterType) {
    setTypeFilter(value);
    setPageIndex(0);
  }

  function handleStatusFilterChange(value: PaymentTypeFilterStatus) {
    setStatusFilter(value);
    setPageIndex(0);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPageIndex(0);
  }

  function updateDraftField<TKey extends keyof PaymentTypeDraft>(
    field: TKey,
    value: PaymentTypeDraft[TKey],
  ) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setFormSubmitError("");
  }

  async function handleSave() {
    const nextErrors = validatePaymentTypeForm(draft);

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setFormSubmitError("");
      return;
    }

    try {
      if (mode === "edit" && activeRecord) {
        await onUpdateRecord(updatePaymentTypeFromForm(activeRecord, draft), draft);
      } else {
        await onCreateRecord(createPaymentTypeFromForm(draft), draft);
      }
    } catch {
      setFormSubmitError("Could not save payment type. Please try again.");
      return;
    }

    setMode("list");
    setDraft(createEmptyDraft(records));
    setActiveRecordId(null);
    setFormErrors({});
    setFormSubmitError("");
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-type-dialog-title"
        className="flex h-[min(42rem,calc(100dvh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div>
            <h2
              id="payment-type-dialog-title"
              className="text-lg font-semibold text-darknavy"
            >
              Payment Type Maintenance
            </h2>
            <p className="mt-1 text-sm text-darknavy/55">
              Maintain payment type name, category, and status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {mode === "list" ? (
          <PaymentTypeListView
            filteredRecords={filteredRecords}
            isLoading={isLoading}
            pageIndex={safePageIndex}
            pageSize={pageSize}
            paginatedRecords={paginatedRecords}
            query={query}
            records={records}
            sortBy={sortBy}
            sortDirection={sortDirection}
            statusFilter={statusFilter}
            totalPages={totalPages}
            typeFilter={typeFilter}
            onAdd={() => {
              setDraft(createEmptyDraft(records));
              setActiveRecordId(null);
              setFormErrors({});
              setFormSubmitError("");
              setMode("add");
            }}
            onClose={onClose}
            onEdit={(record) => openRecord(record, "edit")}
            onQueryChange={handleQueryChange}
            onPageChange={setPageIndex}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={(nextSortBy) => {
              if (sortBy === nextSortBy) {
                setSortDirection((currentDirection) =>
                  currentDirection === "asc" ? "desc" : "asc",
                );
                return;
              }

              setSortBy(nextSortBy);
              setSortDirection("asc");
            }}
            onStatusFilterChange={handleStatusFilterChange}
            onToggleStatus={(record) => {
              const nextStatus =
                record.status === "Active" ? "Inactive" : "Active";

              onUpdateRecord({
                ...record,
                status: nextStatus,
              }, {
                description: record.description,
                paymentType: record.paymentType,
                sortOrder: String(record.sortOrder),
                status: nextStatus,
                type: record.type,
              });
            }}
            onTypeFilterChange={handleTypeFilterChange}
            onUse={onSelect}
            onView={(record) => openRecord(record, "view")}
          />
        ) : (
          <PaymentTypeFormView
            draft={draft}
            errors={formErrors}
            formError={formSubmitError}
            isMutating={isMutating}
            mode={mode}
            onBack={() => {
              setFormErrors({});
              setFormSubmitError("");
              setMode("list");
            }}
            onDraftFieldChange={updateDraftField}
            onSave={handleSave}
          />
        )}
      </section>
    </div>
  );
}

function PaymentTypeListView({
  filteredRecords,
  isLoading,
  pageIndex,
  pageSize,
  paginatedRecords,
  query,
  records,
  sortBy,
  sortDirection,
  statusFilter,
  totalPages,
  typeFilter,
  onAdd,
  onClose,
  onEdit,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
  onSortChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onToggleStatus,
  onUse,
  onView,
}: {
  filteredRecords: PaymentTypeRecord[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  paginatedRecords: PaymentTypeRecord[];
  query: string;
  records: PaymentTypeRecord[];
  sortBy: PaymentTypeSortKey;
  sortDirection: PaymentTypeSortDirection;
  statusFilter: PaymentTypeFilterStatus;
  totalPages: number;
  typeFilter: PaymentTypeFilterType;
  onAdd: () => void;
  onClose: () => void;
  onEdit: (record: PaymentTypeRecord) => void;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (value: string) => void;
  onSortChange: (sortBy: PaymentTypeSortKey) => void;
  onStatusFilterChange: (value: PaymentTypeFilterStatus) => void;
  onToggleStatus: (record: PaymentTypeRecord) => void;
  onTypeFilterChange: (value: PaymentTypeFilterType) => void;
  onUse: (value: DisbursementPaymentMethod) => void;
  onView: (record: PaymentTypeRecord) => void;
}) {
  const searchInputId = "payment-type-dialog-search";
  const typeFilterId = "payment-type-dialog-type-filter";
  const statusFilterId = "payment-type-dialog-status-filter";
  const pageSizeId = "payment-type-dialog-page-size";
  const firstRecord =
    filteredRecords.length === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRecord =
    filteredRecords.length === 0
      ? 0
      : Math.min(
        firstRecord + paginatedRecords.length - 1,
        filteredRecords.length,
      );

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end">
        <div className="grid gap-1.5">
          <label
            htmlFor={searchInputId}
            className="text-xs font-semibold uppercase text-darknavy/45"
          >
            Search
          </label>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35" />
            <input
              id={searchInputId}
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search payment type or category..."
              className="h-11 w-full rounded-lg border border-darknavy/12 bg-offwhite/60 pl-10 pr-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white"
            />
          </span>
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor={typeFilterId}
            className="text-xs font-semibold uppercase text-darknavy/45"
          >
            Category
          </label>
          <select
            id={typeFilterId}
            value={typeFilter}
            onChange={(event) =>
              onTypeFilterChange(event.target.value as PaymentTypeFilterType)
            }
            className={fieldClassName}
          >
            <option value="">All</option>
            {PaymentTypeOptions.map((typeOption) => (
              <option key={typeOption} value={typeOption}>
                {typeOption}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor={statusFilterId}
            className="text-xs font-semibold uppercase text-darknavy/45"
          >
            Status
          </label>
          <select
            id={statusFilterId}
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as PaymentTypeFilterStatus)
            }
            className={fieldClassName}
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={`${accentPrimaryButtonClassName} h-11`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </div>

      <div className="mt-5 min-h-0 overflow-hidden rounded-lg border border-darknavy/10">
        <div className="h-full overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase text-darknavy/45">
              <tr>
                <th className="w-[12%] px-4 py-3">
                  <SortHeader
                    label="Order"
                    sortKey="sortOrder"
                    activeSortKey={sortBy}
                    direction={sortDirection}
                    onSortChange={onSortChange}
                  />
                </th>
                <th className="w-[30%] px-4 py-3">
                  <SortHeader
                    label="Name"
                    sortKey="paymentType"
                    activeSortKey={sortBy}
                    direction={sortDirection}
                    onSortChange={onSortChange}
                  />
                </th>
                <th className="w-[22%] px-4 py-3">
                  <SortHeader
                    label="Category"
                    sortKey="type"
                    activeSortKey={sortBy}
                    direction={sortDirection}
                    onSortChange={onSortChange}
                  />
                </th>
                <th className="w-[16%] px-4 py-3">
                  <SortHeader
                    label="Status"
                    sortKey="status"
                    activeSortKey={sortBy}
                    direction={sortDirection}
                    onSortChange={onSortChange}
                  />
                </th>
                <th className="w-[20%] px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-darknavy/55"
                  >
                    Loading payment types...
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="h-16 border-t border-darknavy/8 transition hover:bg-skyblue/5"
                  >
                    <td className="px-4 py-3 align-middle text-sm font-semibold text-darknavy/65">
                      {record.sortOrder}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm font-semibold text-darknavy">
                      {record.paymentType}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <PaymentTypeBadge type={record.type} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      <PaymentTypeActionSelect
                        record={record}
                        onEdit={onEdit}
                        onToggleStatus={onToggleStatus}
                        onUse={onUse}
                        onView={onView}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-darknavy/55"
                  >
                    No payment types matched the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-darknavy/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-darknavy/55">
          <span>
            Showing {firstRecord}-{lastRecord} of {filteredRecords.length} records
          </span>
          <label htmlFor={pageSizeId} className="inline-flex items-center gap-2">
            Rows
            <select
              id={pageSizeId}
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 w-[3.25rem] rounded-md border border-darknavy/12 bg-white px-2 text-center text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20"
            >
              {DefaultPageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <span className="text-darknavy/40">
            {records.length} total
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            disabled={pageIndex === 0}
            onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
            className="inline-flex h-9 items-center justify-center rounded-md border border-darknavy/12 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Previous
          </button>
          <span className="min-w-20 text-center text-sm font-semibold text-darknavy/60">
            {pageIndex + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={pageIndex >= totalPages - 1}
            onClick={() => onPageChange(Math.min(totalPages - 1, pageIndex + 1))}
            className="inline-flex h-9 items-center justify-center rounded-md border border-darknavy/12 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentTypeFormView({
  draft,
  errors,
  formError,
  isMutating,
  mode,
  onBack,
  onDraftFieldChange,
  onSave,
}: {
  draft: PaymentTypeDraft;
  errors: PaymentTypeFormErrors;
  formError: string;
  isMutating: boolean;
  mode: Exclude<PaymentTypeDialogMode, "list">;
  onBack: () => void;
  onDraftFieldChange: <TKey extends keyof PaymentTypeDraft>(
    field: TKey,
    value: PaymentTypeDraft[TKey],
  ) => void;
  onSave: () => void;
}) {
  const isReadonly = mode === "view";
  const nameInputId = "payment-type-dialog-name";
  const descriptionInputId = "payment-type-dialog-description";
  const sortOrderInputId = "payment-type-dialog-sort-order";
  const typeInputId = "payment-type-dialog-category";
  const statusInputId = "payment-type-dialog-status";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor={nameInputId} className="text-sm font-semibold text-darknavy">
              Name
              <span className="ml-1 text-coralpink">*</span>
            </label>
            <input
              id={nameInputId}
              value={draft.paymentType}
              readOnly={isReadonly}
              onChange={(event) =>
                onDraftFieldChange("paymentType", event.target.value)
              }
              aria-invalid={Boolean(errors.paymentType)}
              aria-describedby={
                errors.paymentType ? `${nameInputId}-error` : undefined
              }
              className={fieldClassName}
            />
            {errors.paymentType ? (
              <span
                id={`${nameInputId}-error`}
                className="text-xs font-semibold text-coralpink"
              >
                {errors.paymentType}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={sortOrderInputId}
              className="text-sm font-semibold text-darknavy"
            >
              Order
              <span className="ml-1 text-coralpink">*</span>
            </label>
            <input
              id={sortOrderInputId}
              type="number"
              min={0}
              step={1}
              value={draft.sortOrder}
              readOnly={isReadonly}
              onChange={(event) =>
                onDraftFieldChange("sortOrder", event.target.value)
              }
              aria-invalid={Boolean(errors.sortOrder)}
              aria-describedby={
                errors.sortOrder ? `${sortOrderInputId}-error` : undefined
              }
              className={fieldClassName}
            />
            {errors.sortOrder ? (
              <span
                id={`${sortOrderInputId}-error`}
                className="text-xs font-semibold text-coralpink"
              >
                {errors.sortOrder}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={descriptionInputId}
              className="text-sm font-semibold text-darknavy"
            >
              Description
            </label>
            <AppLimitedTextarea
              id={descriptionInputId}
              value={draft.description}
              readOnly={isReadonly}
              onChange={(event) =>
                onDraftFieldChange("description", event.target.value)
              }
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? `${descriptionInputId}-error` : undefined
              }
              className={`${fieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
            {errors.description ? (
              <span
                id={`${descriptionInputId}-error`}
                className="text-xs font-semibold text-coralpink"
              >
                {errors.description}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor={typeInputId} className="text-sm font-semibold text-darknavy">
              Category
              <span className="ml-1 text-coralpink">*</span>
            </label>
            <select
              id={typeInputId}
              value={draft.type}
              disabled={isReadonly}
              onChange={(event) =>
                onDraftFieldChange(
                  "type",
                  event.target.value as PaymentTypeDraft["type"],
                )
              }
              aria-invalid={Boolean(errors.type)}
              aria-describedby={
                errors.type ? `${typeInputId}-error` : undefined
              }
              className={fieldClassName}
            >
              <option value="">Select category</option>
              {PaymentTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type ? (
              <span
                id={`${typeInputId}-error`}
                className="text-xs font-semibold text-coralpink"
              >
                {errors.type}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor={statusInputId} className="text-sm font-semibold text-darknavy">
              Status
              <span className="ml-1 text-coralpink">*</span>
            </label>
            <select
              id={statusInputId}
              value={draft.status}
              disabled={isReadonly}
              onChange={(event) =>
                onDraftFieldChange(
                  "status",
                  event.target.value as PaymentTypeStatus,
                )
              }
              aria-invalid={Boolean(errors.status)}
              aria-describedby={
                errors.status ? `${statusInputId}-error` : undefined
              }
              className={fieldClassName}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.status ? (
              <span
                id={`${statusInputId}-error`}
                className="text-xs font-semibold text-coralpink"
              >
                {errors.status}
              </span>
            ) : null}
          </div>
          {formError ? (
            <p className="rounded-md bg-coralpink/10 px-3 py-2 text-sm font-semibold text-coralpink">
              {formError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-darknavy/10 px-5 py-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          {isReadonly ? (
            <button
              type="button"
              onClick={onBack}
              className={`${accentPrimaryButtonClassName} h-10 w-full sm:w-auto`}
            >
              Back
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isMutating}
                onClick={onSave}
                className={`${accentPrimaryButtonClassName} h-10 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 sm:w-auto"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SortHeader({
  activeSortKey,
  direction,
  label,
  sortKey,
  onSortChange,
}: {
  activeSortKey: PaymentTypeSortKey;
  direction: PaymentTypeSortDirection;
  label: string;
  sortKey: PaymentTypeSortKey;
  onSortChange: (sortKey: PaymentTypeSortKey) => void;
}) {
  const isActive = activeSortKey === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSortChange(sortKey)}
      className="inline-flex h-8 items-center gap-2 text-left text-xs font-semibold uppercase text-darknavy/45 transition hover:text-darknavy"
    >
      {label}
      {isActive ? (
        direction === "asc" ? (
          <ChevronUp className="h-3.5 w-3.5 text-skyblue" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-skyblue" aria-hidden="true" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 text-darknavy/30" aria-hidden="true" />
      )}
      {isActive ? (
        <span className="sr-only">
          Sorted {direction === "asc" ? "ascending" : "descending"}
        </span>
      ) : null}
    </button>
  );
}

function PaymentTypeBadge({ type }: { type: PaymentTypeClassification }) {
  return (
    <span className="inline-flex rounded-md bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy">
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: PaymentTypeStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${status === "Active"
        ? "bg-citron/30 text-darknavy"
        : "bg-coralpink/12 text-coralpink"
        }`}
    >
      {status}
    </span>
  );
}

function PaymentTypeActionSelect({
  record,
  onEdit,
  onToggleStatus,
  onUse,
  onView,
}: {
  record: PaymentTypeRecord;
  onEdit: (record: PaymentTypeRecord) => void;
  onToggleStatus: (record: PaymentTypeRecord) => void;
  onUse: (value: DisbursementPaymentMethod) => void;
  onView: (record: PaymentTypeRecord) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canChoose = record.status === "Active";
  const statusActionLabel =
    record.status === "Active" ? "Set As Inactive" : "Set As Active";

  function handleChoose() {
    if (canChoose) {
      onUse(record.paymentType);
    }
  }

  function handleAction(action: PaymentTypeActionValue) {
    setIsMenuOpen(false);

    if (action === "view") {
      onView(record);
      return;
    }

    if (action === "edit") {
      onEdit(record);
      return;
    }

    if (action === "toggle") {
      onToggleStatus(record);
    }
  }

  return (
    <div
      className="relative mx-auto inline-flex justify-center"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;

        if (
          !(nextTarget instanceof Node) ||
          !event.currentTarget.contains(nextTarget)
        ) {
          setIsMenuOpen(false);
        }
      }}
    >
      <div className="inline-flex h-10 overflow-hidden rounded-md shadow-sm shadow-darknavy/5">
        <button
          type="button"
          disabled={!canChoose}
          onClick={handleChoose}
          className="theme-accent-contrast-text inline-flex w-24 items-center justify-center bg-skyblue px-3 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:bg-darknavy/15 disabled:text-darknavy/45"
        >
          Choose
        </button>
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-label={`Open actions for ${record.paymentType}`}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          className="theme-accent-contrast-text inline-flex w-10 items-center justify-center border-l border-white/30 bg-skyblue text-sm font-semibold transition hover:bg-skyblue/85 focus:outline-none focus:ring-2 focus:ring-skyblue/25"
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {isMenuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-44 rounded-lg border border-darknavy/10 bg-white p-1 text-left shadow-xl shadow-darknavy/15"
        >
          <PaymentTypeActionMenuButton onClick={() => handleAction("view")}>
            View
          </PaymentTypeActionMenuButton>
          <PaymentTypeActionMenuButton onClick={() => handleAction("edit")}>
            Edit
          </PaymentTypeActionMenuButton>
          <PaymentTypeActionMenuButton onClick={() => handleAction("toggle")}>
            {statusActionLabel}
          </PaymentTypeActionMenuButton>
        </div>
      ) : null}
    </div>
  );
}

function PaymentTypeActionMenuButton({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-darknavy/78 transition hover:bg-skyblue/10 hover:text-darknavy"
    >
      {children}
    </button>
  );
}

const DefaultPageSizeOptions = [5, 10, 15, 20, 25, 50] as const;

