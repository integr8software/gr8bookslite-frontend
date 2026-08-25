"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { DisbursementPaymentMethod } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  createNextPaymentTypeFormValues,
  createPaymentTypeFormValues,
  createPaymentTypeFromForm,
  updatePaymentTypeFromForm,
} from "@/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData";
import { applyPaymentTypeListParams } from "@/app/src/services/modules/financial-maintenance/payment-type/PaymentTypeService";
import type {
  PaymentTypeClassificationFilter,
  PaymentTypeFormErrors,
  PaymentTypeFormValues,
  PaymentTypeRecord,
  PaymentTypeSortDirection,
  PaymentTypeSortKey,
  PaymentTypeStatusFilter,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { PaymentTypeDialogPageSizeOptions } from "@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialog.constants";
import { PaymentTypeFormView } from "@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialogFormView";
import { PaymentTypeListView } from "@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialogListView";
import { validatePaymentTypeForm } from "@/app/src/validations/modules/financial-maintenance/payment-type/PaymentTypeValidation";

type PaymentTypeDialogMode = "list" | "add" | "edit" | "view";
type PaymentTypeDraft = PaymentTypeFormValues;
type MaybePromise<T> = T | Promise<T>;

export type AppPaymentTypeRecord = PaymentTypeRecord;

type AppPaymentTypeDialogProps = {
  isOpen: boolean;
  isLoading?: boolean;
  isMutating?: boolean;
  records: PaymentTypeRecord[];
  onClose: () => void;
  onCreateRecord: (record: PaymentTypeRecord, values: PaymentTypeFormValues) => MaybePromise<PaymentTypeRecord | void>;
  onSelect: (value: DisbursementPaymentMethod) => void;
  onUpdateRecord: (record: PaymentTypeRecord, values: PaymentTypeFormValues) => MaybePromise<PaymentTypeRecord | void>;
};

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
  const [typeFilter, setTypeFilter] = useState<PaymentTypeClassificationFilter>("");
  const [statusFilter, setStatusFilter] = useState<PaymentTypeStatusFilter>("Active");
  const [sortBy, setSortBy] = useState<PaymentTypeSortKey>("sortOrder");
  const [sortDirection, setSortDirection] = useState<PaymentTypeSortDirection>("asc");
  const [mode, setMode] = useState<PaymentTypeDialogMode>("list");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PaymentTypeDraft>(() => createNextPaymentTypeFormValues(records));
  const [formErrors, setFormErrors] = useState<PaymentTypeFormErrors>({});
  const [formSubmitError, setFormSubmitError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(PaymentTypeDialogPageSizeOptions[0]);

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
    setDraft(createNextPaymentTypeFormValues(records));
    setFormErrors({});
    setFormSubmitError("");
    setPageIndex(0);
    setPageSize(PaymentTypeDialogPageSizeOptions[0]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, records]);

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

  const activeRecord = useMemo(() => records.find((record) => record.id === activeRecordId) ?? null, [activeRecordId, records]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const paginatedRecords = filteredRecords.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize);

  function resetFormState(nextDraft = createNextPaymentTypeFormValues(records)) {
    setDraft(nextDraft);
    setActiveRecordId(null);
    setFormErrors({});
    setFormSubmitError("");
  }

  function openRecord(record: PaymentTypeRecord, nextMode: "edit" | "view") {
    resetFormState(createPaymentTypeFormValues(record));
    setActiveRecordId(record.id);
    setMode(nextMode);
  }

  function handleFilterChange<TValue>(setter: (value: TValue) => void, value: TValue) {
    setter(value);
    setPageIndex(0);
  }

  function updateDraftField<TKey extends keyof PaymentTypeDraft>(field: TKey, value: PaymentTypeDraft[TKey]) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setFormSubmitError("");
  }

  function handleSortChange(nextSortBy: PaymentTypeSortKey) {
    if (sortBy === nextSortBy) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(nextSortBy);
    setSortDirection("asc");
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

    resetFormState();
    setMode("list");
  }

  function handleToggleStatus(record: PaymentTypeRecord) {
    const nextStatus = record.status === "Active" ? "Inactive" : "Active";

    onUpdateRecord(
      {
        ...record,
        status: nextStatus,
      },
      {
        ...createPaymentTypeFormValues(record),
        status: nextStatus,
      },
    );
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
            <h2 id="payment-type-dialog-title" className="text-lg font-semibold text-darknavy">
              Payment Type Maintenance
            </h2>
            <p className="mt-1 text-sm text-darknavy/55">Maintain payment type name, category, and status.</p>
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
              resetFormState();
              setMode("add");
            }}
            onClose={onClose}
            onEdit={(record) => openRecord(record, "edit")}
            onPageChange={setPageIndex}
            onPageSizeChange={(nextPageSize) => handleFilterChange(setPageSize, nextPageSize)}
            onQueryChange={(nextQuery) => handleFilterChange(setQuery, nextQuery)}
            onSortChange={handleSortChange}
            onStatusFilterChange={(nextStatusFilter) => handleFilterChange(setStatusFilter, nextStatusFilter)}
            onToggleStatus={handleToggleStatus}
            onTypeFilterChange={(nextTypeFilter) => handleFilterChange(setTypeFilter, nextTypeFilter)}
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
