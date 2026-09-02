"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import type { DisbursementPaymentMethod } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { PaymentTypeOptions } from "@/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData";
import type {
  PaymentTypeClassification,
  PaymentTypeClassificationFilter,
  PaymentTypeRecord,
  PaymentTypeSortDirection,
  PaymentTypeSortKey,
  PaymentTypeStatus,
  PaymentTypeStatusFilter,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import {
  PaymentTypeDialogPageSizeOptions,
  paymentTypeAccentPrimaryButtonClassName,
  paymentTypeFieldClassName,
} from "@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialog.constants";

type PaymentTypeActionValue = "view" | "edit" | "toggle";

export function PaymentTypeListView({
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
  statusFilter: PaymentTypeStatusFilter;
  totalPages: number;
  typeFilter: PaymentTypeClassificationFilter;
  onAdd: () => void;
  onClose: () => void;
  onEdit: (record: PaymentTypeRecord) => void;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (value: string) => void;
  onSortChange: (sortBy: PaymentTypeSortKey) => void;
  onStatusFilterChange: (value: PaymentTypeStatusFilter) => void;
  onToggleStatus: (record: PaymentTypeRecord) => void;
  onTypeFilterChange: (value: PaymentTypeClassificationFilter) => void;
  onUse: (value: DisbursementPaymentMethod) => void;
  onView: (record: PaymentTypeRecord) => void;
}) {
  const searchInputId = "payment-type-dialog-search";
  const typeFilterId = "payment-type-dialog-type-filter";
  const statusFilterId = "payment-type-dialog-status-filter";
  const pageSizeId = "payment-type-dialog-page-size";
  const firstRecord = filteredRecords.length === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRecord = filteredRecords.length === 0 ? 0 : Math.min(firstRecord + paginatedRecords.length - 1, filteredRecords.length);

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end">
        <div className="grid gap-1.5">
          <label htmlFor={searchInputId} className="text-xs font-semibold uppercase text-darknavy/45">
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
          <label htmlFor={typeFilterId} className="text-xs font-semibold uppercase text-darknavy/45">
            Category
          </label>
          <select
            id={typeFilterId}
            value={typeFilter}
            onChange={(event) => onTypeFilterChange(event.target.value as PaymentTypeClassificationFilter)}
            className={paymentTypeFieldClassName}
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
          <label htmlFor={statusFilterId} className="text-xs font-semibold uppercase text-darknavy/45">
            Status
          </label>
          <select
            id={statusFilterId}
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as PaymentTypeStatusFilter)}
            className={paymentTypeFieldClassName}
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button type="button" onClick={onAdd} className={`${paymentTypeAccentPrimaryButtonClassName} h-11`}>
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
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-darknavy/55">
                    Loading payment types...
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr key={record.id} className="h-16 border-t border-darknavy/8 transition hover:bg-skyblue/5">
                    <td className="px-4 py-3 align-middle text-sm font-semibold text-darknavy/65">{record.sortOrder}</td>
                    <td className="px-4 py-3 align-middle text-sm font-semibold text-darknavy">{record.paymentType}</td>
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
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-darknavy/55">
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
              {PaymentTypeDialogPageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <span className="text-darknavy/40">{records.length} total</span>
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
      {isActive ? <span className="sr-only">Sorted {direction === "asc" ? "ascending" : "descending"}</span> : null}
    </button>
  );
}

function PaymentTypeBadge({ type }: { type: PaymentTypeClassification }) {
  return <span className="inline-flex rounded-md bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy">{type}</span>;
}

function StatusBadge({ status }: { status: PaymentTypeStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
        status === "Active" ? "bg-citron/30 text-darknavy" : "bg-coralpink/12 text-coralpink"
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
  const statusActionLabel = record.status === "Active" ? "Set As Inactive" : "Set As Active";

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

        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
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
          <PaymentTypeActionMenuButton onClick={() => handleAction("view")}>View</PaymentTypeActionMenuButton>
          <PaymentTypeActionMenuButton onClick={() => handleAction("edit")}>Edit</PaymentTypeActionMenuButton>
          <PaymentTypeActionMenuButton onClick={() => handleAction("toggle")}>{statusActionLabel}</PaymentTypeActionMenuButton>
        </div>
      ) : null}
    </div>
  );
}

function PaymentTypeActionMenuButton({ children, onClick }: { children: string; onClick: () => void }) {
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
