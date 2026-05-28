"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import type { DisbursementPaymentMethod } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

type PaymentTypeStatus = "Active" | "Inactive";
type PaymentTypeDialogMode = "list" | "add" | "edit" | "view";

type PaymentTypeRecord = {
  id: string;
  paymentType: DisbursementPaymentMethod;
  status: PaymentTypeStatus;
  withBank: boolean;
  accountCode: string;
  accountTitle: string;
};
export type AppPaymentTypeRecord = PaymentTypeRecord;

type PaymentTypeDraft = {
  paymentType: string;
  withBank: "Yes" | "No" | "";
  accountCode: string;
  accountTitle: string;
};

type AppPaymentTypeDialogProps = {
  isOpen: boolean;
  records: PaymentTypeRecord[];
  onClose: () => void;
  onRecordsChange: (records: PaymentTypeRecord[]) => void;
  onSelect: (value: DisbursementPaymentMethod) => void;
};

export const InitialAppPaymentTypeRecords: PaymentTypeRecord[] = [
  {
    id: "payment-type-1",
    paymentType: "Check",
    withBank: true,
    status: "Active",
    accountCode: "",
    accountTitle: "",
  },
  {
    id: "payment-type-2",
    paymentType: "Cash",
    withBank: false,
    status: "Active",
    accountCode: "1001111",
    accountTitle: "Cash on Hand",
  },
  {
    id: "payment-type-3",
    paymentType: "Manager's Check",
    withBank: true,
    status: "Active",
    accountCode: "",
    accountTitle: "",
  },
  {
    id: "payment-type-4",
    paymentType: "Bank Transfer",
    withBank: true,
    status: "Active",
    accountCode: "",
    accountTitle: "",
  },
  {
    id: "payment-type-5",
    paymentType: "Debit Memo",
    withBank: true,
    status: "Active",
    accountCode: "",
    accountTitle: "",
  },
  {
    id: "payment-type-6",
    paymentType: "G-Cash",
    withBank: false,
    status: "Active",
    accountCode: "1001120",
    accountTitle: "Electronic Wallet Clearing",
  },
  {
    id: "payment-type-7",
    paymentType: "Petty Cash",
    withBank: false,
    status: "Active",
    accountCode: "1001130",
    accountTitle: "Petty Cash Fund",
  },
  {
    id: "payment-type-8",
    paymentType: "Transfer",
    withBank: true,
    status: "Active",
    accountCode: "",
    accountTitle: "",
  },
  {
    id: "payment-type-9",
    paymentType: "Wire-Transfer",
    withBank: true,
    status: "Active",
    accountCode: "",
    accountTitle: "",
  },
  {
    id: "payment-type-10",
    paymentType: "Online Payment",
    withBank: false,
    status: "Active",
    accountCode: "1001145",
    accountTitle: "Online Payment Clearing",
  },
];

const fieldClassName =
  "h-11 w-full rounded-xl border border-darknavy/12 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20";

const accentPrimaryButtonClassName =
  "theme-accent-contrast-text inline-flex items-center justify-center gap-2 rounded-xl bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85";

export function AppPaymentTypeDialog({
  isOpen,
  records,
  onClose,
  onRecordsChange,
  onSelect,
}: AppPaymentTypeDialogProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PaymentTypeStatus>(
    "Active",
  );
  const [mode, setMode] = useState<PaymentTypeDialogMode>("list");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PaymentTypeDraft>({
    paymentType: "",
    withBank: "",
    accountCode: "",
    accountTitle: "",
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect -- reset transient dialog state whenever this modal opens. */
    setQuery("");
    setStatusFilter("Active");
    setMode("list");
    setActiveRecordId(null);
    setDraft({
      paymentType: "",
      withBank: "",
      accountCode: "",
      accountTitle: "",
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (mode === "list") {
          onClose();
          return;
        }

        setMode("list");
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, mode, onClose]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        record.paymentType.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, records, statusFilter]);

  const activeRecord = useMemo(
    () => records.find((record) => record.id === activeRecordId) ?? null,
    [activeRecordId, records],
  );

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
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              Cash Disbursement Setup
            </p>
            <h2
              id="payment-type-dialog-title"
              className="mt-1 text-xl font-semibold text-darknavy"
            >
              {mode === "list"
                ? "Payment Type List"
                : "Payment Type Management"}
            </h2>
            <p className="mt-1 text-sm text-darknavy/55">
              {mode === "list"
                ? "Search, review, and select the payment type to use for this voucher."
                : "Maintain the payment type details using the same setup flow as the rest of the module."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {mode === "list" ? (
          <PaymentTypeListView
            filteredRecords={filteredRecords}
            query={query}
            records={records}
            statusFilter={statusFilter}
            onAdd={() => {
              setDraft({
                paymentType: "",
                withBank: "",
                accountCode: "",
                accountTitle: "",
              });
              setActiveRecordId(null);
              setMode("add");
            }}
            onClose={onClose}
            onEdit={(record) => {
              setDraft({
                paymentType: record.paymentType,
                withBank: record.withBank ? "Yes" : "No",
                accountCode: record.accountCode,
                accountTitle: record.accountTitle,
              });
              setActiveRecordId(record.id);
              setMode("edit");
            }}
            onQueryChange={setQuery}
            onStatusFilterChange={setStatusFilter}
            onToggleStatus={(recordId) => {
              onRecordsChange(
                records.map((record) =>
                  record.id === recordId
                    ? {
                        ...record,
                        status:
                          record.status === "Active" ? "Inactive" : "Active",
                      }
                    : record,
                ),
              );
            }}
            onUse={onSelect}
            onView={(record) => {
              setDraft({
                paymentType: record.paymentType,
                withBank: record.withBank ? "Yes" : "No",
                accountCode: record.accountCode,
                accountTitle: record.accountTitle,
              });
              setActiveRecordId(record.id);
              setMode("view");
            }}
          />
        ) : (
          <PaymentTypeFormView
            draft={draft}
            mode={mode}
            onBack={() => setMode("list")}
            onDraftChange={setDraft}
            onSave={() => {
              if (!draft.paymentType.trim() || !draft.withBank) {
                return;
              }

              if (mode === "edit" && activeRecord) {
                onRecordsChange(
                  records.map((record) =>
                    record.id === activeRecord.id
                      ? {
                          ...record,
                          paymentType: draft.paymentType.trim(),
                          withBank: draft.withBank === "Yes",
                          accountCode:
                            draft.withBank === "No"
                              ? draft.accountCode.trim()
                              : "",
                          accountTitle:
                            draft.withBank === "No"
                              ? draft.accountTitle.trim()
                              : "",
                        }
                      : record,
                  ),
                );
              } else {
                const nextRecord: PaymentTypeRecord = {
                  id: `payment-type-${Date.now()}`,
                  paymentType: draft.paymentType.trim(),
                  withBank: draft.withBank === "Yes",
                  status: "Active",
                  accountCode:
                    draft.withBank === "No" ? draft.accountCode.trim() : "",
                  accountTitle:
                    draft.withBank === "No" ? draft.accountTitle.trim() : "",
                };

                onRecordsChange([nextRecord, ...records]);
              }

              setMode("list");
              setDraft({
                paymentType: "",
                withBank: "",
                accountCode: "",
                accountTitle: "",
              });
              setActiveRecordId(null);
            }}
          />
        )}
      </section>
    </div>
  );
}

function PaymentTypeListView({
  filteredRecords,
  query,
  records,
  statusFilter,
  onAdd,
  onClose,
  onEdit,
  onQueryChange,
  onStatusFilterChange,
  onToggleStatus,
  onUse,
  onView,
}: {
  filteredRecords: PaymentTypeRecord[];
  query: string;
  records: PaymentTypeRecord[];
  statusFilter: "All" | PaymentTypeStatus;
  onAdd: () => void;
  onClose: () => void;
  onEdit: (record: PaymentTypeRecord) => void;
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: "All" | PaymentTypeStatus) => void;
  onToggleStatus: (recordId: string) => void;
  onUse: (value: DisbursementPaymentMethod) => void;
  onView: (record: PaymentTypeRecord) => void;
}) {
  return (
    <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
      <div className="rounded-[24px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.08)]">
        <div className="border-b border-darknavy/8 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
                Payment Type Directory
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-darknavy">
                Search and select from configured payment types
              </h3>
              <p className="mt-2 text-sm leading-6 text-darknavy/58">
                Keep the list aligned with your accounting setup, then apply the
                selected payment type directly to the voucher.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={onAdd}
                className={`${accentPrimaryButtonClassName} h-11 w-full sm:w-auto`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Payment Type
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_15rem_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35" />
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search payment type..."
                className="h-12 w-full rounded-full border border-darknavy/12 bg-offwhite/60 pl-11 pr-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                onStatusFilterChange(
                  event.target.value as "All" | PaymentTypeStatus,
                )
              }
              className="h-12 rounded-full border border-darknavy/12 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="inline-flex h-12 items-center justify-center rounded-full bg-offwhite/70 px-4 text-sm font-medium text-darknavy/62 lg:justify-start">
              {filteredRecords.length} of {records.length} records
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-4 md:hidden">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                return (
                  <div
                    key={record.id}
                    className="rounded-[20px] border border-darknavy/10 bg-white p-4 transition hover:border-skyblue/30 hover:bg-skyblue/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                          Payment Type
                        </p>
                        <p className="mt-2 text-base font-semibold text-darknavy">
                          {record.paymentType}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-offwhite/60 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                          With Bank
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            record.withBank
                              ? "bg-skyblue/12 text-darknavy"
                              : "bg-darknavy/8 text-darknavy/65"
                          }`}
                        >
                          {record.withBank ? "Yes" : "No"}
                        </span>
                      </div>

                      <div className="rounded-2xl bg-offwhite/60 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                          Status
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            record.status === "Active"
                              ? "bg-citron/30 text-darknavy"
                              : "bg-coralpink/12 text-coralpink"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onUse(record.paymentType)}
                        className="theme-accent-contrast-text col-span-2 inline-flex h-10 items-center justify-center rounded-lg bg-skyblue px-3 text-xs font-semibold transition hover:bg-skyblue/85"
                      >
                        Use Payment Type
                      </button>
                      <button
                        type="button"
                        onClick={() => onView(record)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/12 bg-white px-3 text-xs font-semibold text-darknavy transition hover:border-skyblue/40 hover:bg-skyblue/6"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/12 bg-white px-3 text-xs font-semibold text-darknavy transition hover:border-skyblue/40 hover:bg-skyblue/6"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(record.id)}
                        className={`col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                          record.status === "Active"
                            ? "bg-coralpink/12 text-coralpink hover:bg-coralpink/18"
                            : "bg-citron/25 text-darknavy hover:bg-citron/35"
                        }`}
                      >
                        {record.status === "Active" ? (
                          <ToggleRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <ToggleLeft
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}
                        {record.status === "Active"
                          ? "Set Inactive"
                          : "Set Active"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[20px] border border-dashed border-darknavy/12 bg-offwhite/60 px-4 py-12 text-center text-sm text-darknavy/55">
                No payment types matched the current search and status filter.
              </div>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-[20px] border border-darknavy/10 md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/45">
                  <tr>
                    <th className="px-4 py-3">Payment Type</th>
                    <th className="px-4 py-3">With Bank</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                      return (
                        <tr
                          key={record.id}
                          className="border-t border-darknavy/8 transition hover:bg-skyblue/5"
                        >
                          <td className="px-4 py-4 text-sm font-semibold text-darknavy">
                            {record.paymentType}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                record.withBank
                                  ? "bg-skyblue/12 text-darknavy"
                                  : "bg-darknavy/8 text-darknavy/65"
                              }`}
                            >
                              {record.withBank ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                record.status === "Active"
                                  ? "bg-citron/30 text-darknavy"
                                  : "bg-coralpink/12 text-coralpink"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => onUse(record.paymentType)}
                                className="theme-accent-contrast-text inline-flex h-9 items-center justify-center rounded-lg bg-skyblue px-3 text-xs font-semibold transition hover:bg-skyblue/85"
                              >
                                Use
                              </button>
                              <button
                                type="button"
                                onClick={() => onView(record)}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/12 bg-white px-3 text-xs font-semibold text-darknavy transition hover:border-skyblue/40 hover:bg-skyblue/6"
                              >
                                <Eye
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => onEdit(record)}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/12 bg-white px-3 text-xs font-semibold text-darknavy transition hover:border-skyblue/40 hover:bg-skyblue/6"
                              >
                                <Pencil
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => onToggleStatus(record.id)}
                                className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                                  record.status === "Active"
                                    ? "bg-coralpink/12 text-coralpink hover:bg-coralpink/18"
                                    : "bg-citron/25 text-darknavy hover:bg-citron/35"
                                }`}
                              >
                                {record.status === "Active" ? (
                                  <ToggleRight
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <ToggleLeft
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                )}
                                {record.status === "Active"
                                  ? "Set Inactive"
                                  : "Set Active"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-12 text-center text-sm text-darknavy/55"
                      >
                        No payment types matched the current search and status
                        filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentTypeFormView({
  draft,
  mode,
  onBack,
  onDraftChange,
  onSave,
}: {
  draft: PaymentTypeDraft;
  mode: Exclude<PaymentTypeDialogMode, "list">;
  onBack: () => void;
  onDraftChange: (value: PaymentTypeDraft) => void;
  onSave: () => void;
}) {
  const isReadonly = mode === "view";

  return (
    <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
      <div className="rounded-[24px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.08)]">
        <div className="border-b border-darknavy/8 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
            Payment Type Details
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-darknavy">
            {mode === "add"
              ? "Create a new payment type"
              : mode === "edit"
                ? "Edit payment type"
                : "View payment type"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-darknavy/58">
            Configure the payment type label and whether it requires bank
            handling.
          </p>
        </div>

        <div className="grid gap-5 p-5 lg:p-6">
          <label className="grid gap-2">
            <span className="text-sm text-darknavy/82">Payment Type</span>
            <input
              value={draft.paymentType}
              readOnly={isReadonly}
              onChange={(event) =>
                onDraftChange({
                  ...draft,
                  paymentType: event.target.value,
                })
              }
              className={fieldClassName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-darknavy/82">With Bank</span>
            <select
              value={draft.withBank}
              disabled={isReadonly}
              onChange={(event) =>
                onDraftChange({
                  ...draft,
                  withBank: event.target.value as PaymentTypeDraft["withBank"],
                })
              }
              className={fieldClassName}
            >
              <option value="">--Select Options--</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>

          {draft.withBank === "No" ? (
            <>
              <label className="grid gap-2">
                <span className="text-sm text-darknavy/82">Account code</span>
                <input
                  value={draft.accountCode}
                  readOnly={isReadonly}
                  onChange={(event) =>
                    onDraftChange({
                      ...draft,
                      accountCode: event.target.value,
                    })
                  }
                  className={fieldClassName}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-darknavy/82">Account title</span>
                <input
                  value={draft.accountTitle}
                  readOnly={isReadonly}
                  onChange={(event) =>
                    onDraftChange({
                      ...draft,
                      accountTitle: event.target.value,
                    })
                  }
                  className={fieldClassName}
                />
              </label>
            </>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-darknavy/10 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:px-6">
          {isReadonly ? (
            <button
              type="button"
              onClick={onBack}
              className={`${accentPrimaryButtonClassName} h-11 w-full sm:w-auto`}
            >
              Back to List
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onSave}
                className={`${accentPrimaryButtonClassName} h-11 w-full sm:w-auto`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 sm:w-auto"
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
