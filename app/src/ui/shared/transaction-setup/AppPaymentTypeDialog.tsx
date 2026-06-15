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
  PaymentTypeInitialFormValues,
  PaymentTypeOptions,
} from "@/app/src/data/modules/maintenance/financial-management/payment-type/PaymentTypeData";
import {
  applyPaymentTypeListParams,
  type PaymentTypeSortKey,
} from "@/app/src/services/modules/maintenance/financial-management/payment-type/PaymentTypeService";
import type {
  PaymentTypeClassification,
  PaymentTypeFormValues,
  PaymentTypeRecord,
  PaymentTypeStatus,
} from "@/app/src/types/modules/maintenance/financial-management/payment-type/PaymentTypeTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

type PaymentTypeDialogMode = "list" | "add" | "edit" | "view";
export type AppPaymentTypeRecord = PaymentTypeRecord;
type PaymentTypeDraft = PaymentTypeFormValues;
type PaymentTypeFilterStatus = "" | PaymentTypeStatus;
type PaymentTypeFilterType = "" | PaymentTypeClassification;
type PaymentTypeSortDirection = "asc" | "desc";
type PaymentTypeActionValue = "view" | "edit" | "toggle";

type AppPaymentTypeDialogProps = {
  isOpen: boolean;
  isLoading?: boolean;
  isMutating?: boolean;
  records: PaymentTypeRecord[];
  onClose: () => void;
  onCreateRecord: (record: PaymentTypeRecord) => void;
  onSelect: (value: DisbursementPaymentMethod) => void;
  onUpdateRecord: (record: PaymentTypeRecord) => void;
};

const EmptyDraft: PaymentTypeDraft = PaymentTypeInitialFormValues;

const fieldClassName =
  "h-11 w-full rounded-lg border border-darknavy/12 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20 disabled:bg-darknavy/5";

const accentPrimaryButtonClassName =
  "theme-accent-contrast-text inline-flex items-center justify-center gap-2 rounded-lg bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85";

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
  const [sortBy, setSortBy] = useState<PaymentTypeSortKey>("paymentType");
  const [sortDirection, setSortDirection] =
    useState<PaymentTypeSortDirection>("asc");
  const [mode, setMode] = useState<PaymentTypeDialogMode>("list");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PaymentTypeDraft>(EmptyDraft);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect -- reset transient dialog state whenever this modal opens. */
    setQuery("");
    setTypeFilter("");
    setStatusFilter("Active");
    setSortBy("paymentType");
    setSortDirection("asc");
    setMode("list");
    setActiveRecordId(null);
    setDraft(EmptyDraft);
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

  function openRecord(record: PaymentTypeRecord, nextMode: "edit" | "view") {
    setDraft({
      description: record.description,
      paymentType: record.paymentType,
      type: record.type,
      status: record.status,
    });
    setActiveRecordId(record.id);
    setMode(nextMode);
  }

  function handleSave() {
    if (!draft.paymentType.trim() || !draft.type) {
      return;
    }

    if (mode === "edit" && activeRecord) {
      onUpdateRecord({
        ...activeRecord,
        description: draft.description.trim(),
        paymentType: draft.paymentType.trim(),
        type: draft.type,
        status: draft.status,
      });
    } else {
      onCreateRecord({
        description: draft.description.trim(),
        id: `payment-type-${Date.now()}`,
        paymentType: draft.paymentType.trim(),
        type: draft.type,
        status: draft.status,
      });
    }

    setMode("list");
    setDraft(EmptyDraft);
    setActiveRecordId(null);
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
              Maintain payment type name, classification type, and status.
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
            query={query}
            records={records}
            sortBy={sortBy}
            sortDirection={sortDirection}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onAdd={() => {
              setDraft(EmptyDraft);
              setActiveRecordId(null);
              setMode("add");
            }}
            onClose={onClose}
            onEdit={(record) => openRecord(record, "edit")}
            onQueryChange={setQuery}
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
            onStatusFilterChange={setStatusFilter}
            onToggleStatus={(record) => {
              onUpdateRecord({
                ...record,
                status: record.status === "Active" ? "Inactive" : "Active",
              });
            }}
            onTypeFilterChange={setTypeFilter}
            onUse={onSelect}
            onView={(record) => openRecord(record, "view")}
          />
        ) : (
          <PaymentTypeFormView
            draft={draft}
            isMutating={isMutating}
            mode={mode}
            onBack={() => setMode("list")}
            onDraftChange={setDraft}
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
  query,
  records,
  sortBy,
  sortDirection,
  statusFilter,
  typeFilter,
  onAdd,
  onClose,
  onEdit,
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
  query: string;
  records: PaymentTypeRecord[];
  sortBy: PaymentTypeSortKey;
  sortDirection: PaymentTypeSortDirection;
  statusFilter: PaymentTypeFilterStatus;
  typeFilter: PaymentTypeFilterType;
  onAdd: () => void;
  onClose: () => void;
  onEdit: (record: PaymentTypeRecord) => void;
  onQueryChange: (value: string) => void;
  onSortChange: (sortBy: PaymentTypeSortKey) => void;
  onStatusFilterChange: (value: PaymentTypeFilterStatus) => void;
  onToggleStatus: (record: PaymentTypeRecord) => void;
  onTypeFilterChange: (value: PaymentTypeFilterType) => void;
  onUse: (value: DisbursementPaymentMethod) => void;
  onView: (record: PaymentTypeRecord) => void;
}) {
  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-darknavy/45">
            Search
          </span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search payment type or type..."
              className="h-11 w-full rounded-lg border border-darknavy/12 bg-offwhite/60 pl-10 pr-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white"
            />
          </span>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-darknavy/45">
            Type
          </span>
          <select
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
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-darknavy/45">
            Status
          </span>
          <select
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
        </label>
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
                <th className="w-[36%] px-4 py-3">
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
                    label="Type"
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
                <th className="w-[26%] px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-darknavy/55"
                  >
                    Loading payment types...
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="h-16 border-t border-darknavy/8 transition hover:bg-skyblue/5"
                  >
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
                    colSpan={4}
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

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-sm text-darknavy/50">
          {filteredRecords.length} of {records.length} records
        </span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function PaymentTypeFormView({
  draft,
  isMutating,
  mode,
  onBack,
  onDraftChange,
  onSave,
}: {
  draft: PaymentTypeDraft;
  isMutating: boolean;
  mode: Exclude<PaymentTypeDialogMode, "list">;
  onBack: () => void;
  onDraftChange: (value: PaymentTypeDraft) => void;
  onSave: () => void;
}) {
  const isReadonly = mode === "view";

  return (
    <div className="min-h-0 overflow-y-auto p-5">
      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">Name</span>
          <input
            value={draft.paymentType}
            readOnly={isReadonly}
            onChange={(event) =>
              onDraftChange({ ...draft, paymentType: event.target.value })
            }
            className={fieldClassName}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">Description</span>
          <AppLimitedTextarea
            value={draft.description}
            readOnly={isReadonly}
            onChange={(event) =>
              onDraftChange({ ...draft, description: event.target.value })
            }
            className={`${fieldClassName} min-h-24 py-3`}
            counterMode="used"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">Type</span>
          <select
            value={draft.type}
            disabled={isReadonly}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                type: event.target.value as PaymentTypeDraft["type"],
              })
            }
            className={fieldClassName}
          >
            <option value="">Select type</option>
            {PaymentTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">Status</span>
          <select
            value={draft.status}
            disabled={isReadonly}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                status: event.target.value as PaymentTypeStatus,
              })
            }
            className={fieldClassName}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-darknavy/10 pt-4 sm:flex-row sm:items-center sm:justify-end">
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
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
        status === "Active"
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
