"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Search, X } from "lucide-react";
import type { DisbursementType } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

type DisbursementTypeStatus = "Active" | "Inactive";
type DisbursementTypeDialogMode = "list" | "add" | "edit" | "view";

type DisbursementTypeRecord = {
  id: string;
  description: DisbursementType;
  accountCode: string;
  accountTitle: string;
  amount: string;
  module: string;
  status: DisbursementTypeStatus;
};

export type AppDisbursementTypeRecord = DisbursementTypeRecord;

type DisbursementTypeDraft = {
  description: string;
  accountCode: string;
  accountTitle: string;
  amount: string;
  module: string;
};

type AppDisbursementTypeDialogProps = {
  isOpen: boolean;
  records: DisbursementTypeRecord[];
  onClose: () => void;
  onRecordsChange: (records: DisbursementTypeRecord[]) => void;
  onSelect: (value: DisbursementType) => void;
};

export const InitialAppDisbursementTypeRecords: DisbursementTypeRecord[] = [
  {
    id: "disbursement-type-1",
    description: "Vendor Payment",
    accountCode: "2010-003",
    accountTitle: "Accounts Payable",
    amount: "0.00",
    module: "Cash Disbursement",
    status: "Active",
  },
  {
    id: "disbursement-type-2",
    description: "Operating Expense",
    accountCode: "6050-010",
    accountTitle: "Operating Expense",
    amount: "50000.00",
    module: "All",
    status: "Active",
  },
  {
    id: "disbursement-type-3",
    description: "Reimbursement",
    accountCode: "6150-017",
    accountTitle: "Travel and Transportation",
    amount: "0.00",
    module: "Cash Voucher",
    status: "Active",
  },
  {
    id: "disbursement-type-4",
    description: "Capital Expenditure",
    accountCode: "1505-020",
    accountTitle: "Capital Expenditure in Progress",
    amount: "0.00",
    module: "All",
    status: "Active",
  },
];

const fieldClassName =
  "h-11 w-full rounded-xl border border-darknavy/12 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20";

const accentPrimaryButtonClassName =
  "theme-accent-contrast-text inline-flex items-center justify-center gap-2 rounded-xl bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85";

const DisbursementTypeTablePaginationStorageKey =
  "cash-disbursement-disbursement-type-dialog";

export function AppDisbursementTypeDialog({
  isOpen,
  records,
  onClose,
  onRecordsChange,
  onSelect,
}: AppDisbursementTypeDialogProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | DisbursementTypeStatus
  >("Active");
  const [mode, setMode] = useState<DisbursementTypeDialogMode>("list");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DisbursementTypeDraft>({
    description: "",
    accountCode: "",
    accountTitle: "",
    amount: "0.00",
    module: "All",
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
      description: "",
      accountCode: "",
      accountTitle: "",
      amount: "0.00",
      module: "All",
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
        [
          record.description,
          record.accountCode,
          record.accountTitle,
          record.module,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
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
        aria-labelledby="disbursement-type-dialog-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[88rem] flex-col overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              Cash Disbursement Setup
            </p>
            <h2
              id="disbursement-type-dialog-title"
              className="mt-1 text-xl font-semibold text-darknavy"
            >
              {mode === "list"
                ? "Disbursement Type Studio"
                : "Disbursement Type Management"}
            </h2>
            <p className="mt-1 text-sm text-darknavy/55">
              {mode === "list"
                ? "Browse active setups, inspect their posting defaults, and choose the one that fits the voucher."
                : "Maintain the disbursement type details using the same shared setup experience as the rest of the project."}
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
          <DisbursementTypeListView
            filteredRecords={filteredRecords}
            query={query}
            statusFilter={statusFilter}
            onAdd={() => {
              setDraft({
                description: "",
                accountCode: "",
                accountTitle: "",
                amount: "0.00",
                module: "All",
              });
              setActiveRecordId(null);
              setMode("add");
            }}
            onClose={onClose}
            onEdit={(record) => {
              setDraft({
                description: record.description,
                accountCode: record.accountCode,
                accountTitle: record.accountTitle,
                amount: record.amount,
                module: record.module,
              });
              setActiveRecordId(record.id);
              setMode("edit");
            }}
            onQueryChange={setQuery}
            onSelect={onSelect}
            onSetStatusFilter={setStatusFilter}
            onToggleStatus={(record) => {
              onRecordsChange(
                records.map((currentRecord) =>
                  currentRecord.id === record.id
                    ? {
                        ...currentRecord,
                        status:
                          currentRecord.status === "Active"
                            ? "Inactive"
                            : "Active",
                      }
                    : currentRecord,
                ),
              );
            }}
            onView={(record) => {
              setActiveRecordId(record.id);
              setMode("view");
            }}
          />
        ) : (
          <DisbursementTypeRecordView
            draft={draft}
            mode={mode}
            record={activeRecord}
            onBack={() => setMode("list")}
            onChangeDraft={setDraft}
            onSave={() => {
              if (!draft.description.trim()) {
                return;
              }

              if (mode === "edit" && activeRecord) {
                onRecordsChange(
                  records.map((record) =>
                    record.id === activeRecord.id
                      ? {
                          ...record,
                          description:
                            draft.description.trim() as DisbursementType,
                          accountCode: draft.accountCode.trim(),
                          accountTitle: draft.accountTitle.trim(),
                          amount: draft.amount.trim() || "0.00",
                          module: draft.module.trim() || "All",
                        }
                      : record,
                  ),
                );
              } else {
                onRecordsChange([
                  {
                    id: `disbursement-type-${Date.now()}`,
                    description: draft.description.trim() as DisbursementType,
                    accountCode: draft.accountCode.trim(),
                    accountTitle: draft.accountTitle.trim(),
                    amount: draft.amount.trim() || "0.00",
                    module: draft.module.trim() || "All",
                    status: "Active",
                  },
                  ...records,
                ]);
              }

              setMode("list");
            }}
          />
        )}
      </section>
    </div>
  );
}

function DisbursementTypeListView({
  filteredRecords,
  query,
  statusFilter,
  onAdd,
  onClose,
  onEdit,
  onQueryChange,
  onSelect,
  onSetStatusFilter,
  onToggleStatus,
  onView,
}: {
  filteredRecords: DisbursementTypeRecord[];
  query: string;
  statusFilter: "All" | DisbursementTypeStatus;
  onAdd: () => void;
  onClose: () => void;
  onEdit: (record: DisbursementTypeRecord) => void;
  onQueryChange: (value: string) => void;
  onSelect: (value: DisbursementType) => void;
  onSetStatusFilter: (value: "All" | DisbursementTypeStatus) => void;
  onToggleStatus: (record: DisbursementTypeRecord) => void;
  onView: (record: DisbursementTypeRecord) => void;
}) {
  const table = useDisbursementTypeTable(filteredRecords);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-b border-darknavy/8 bg-white px-6 py-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search description, account code, account title, or module"
                className="h-11 w-full rounded-xl border border-darknavy/12 bg-white pl-11 pr-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) =>
                onSetStatusFilter(
                  event.target.value as "All" | DisbursementTypeStatus,
                )
              }
              className="h-11 min-w-44 rounded-xl border border-darknavy/12 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="All">All</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onAdd}
              className={`${accentPrimaryButtonClassName} h-11`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Type
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto px-6 py-5">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try adjusting the search or filters, or add a new disbursement type."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No disbursement types found"
          isLoading={false}
          minWidthClassName="min-w-[72rem]"
          paginationLabel="types"
          paginationStorageKey={DisbursementTypeTablePaginationStorageKey}
          table={table}
          renderRow={({ id, original }) => (
            <DisbursementTypeTableRow
              key={id}
              record={original}
              onEdit={onEdit}
              onSelect={onSelect}
              onToggleStatus={onToggleStatus}
              onView={onView}
            />
          )}
        />
      </div>
    </div>
  );
}

function DisbursementTypeRecordView({
  draft,
  mode,
  record,
  onBack,
  onChangeDraft,
  onSave,
}: {
  draft: DisbursementTypeDraft;
  mode: Exclude<DisbursementTypeDialogMode, "list">;
  record: DisbursementTypeRecord | null;
  onBack: () => void;
  onChangeDraft: (value: DisbursementTypeDraft) => void;
  onSave: () => void;
}) {
  const isReadonly = mode === "view";
  const source = record
    ? {
        description: record.description,
        accountCode: record.accountCode,
        accountTitle: record.accountTitle,
        amount: record.amount,
        module: record.module,
      }
    : draft;
  const currentValues = isReadonly ? source : draft;

  return (
    <div className="min-h-0 overflow-y-auto px-6 py-6">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-darknavy/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              {mode === "add"
                ? "New Setup"
                : mode === "edit"
                  ? "Edit Setup"
                  : "Preview Setup"}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-darknavy">
              {mode === "add"
                ? "Create disbursement type"
                : mode === "edit"
                  ? "Update disbursement type"
                  : currentValues.description || "Disbursement type details"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
          >
            Back to List
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <section className="rounded-[24px] border border-darknavy/10 bg-slate-50/70 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="Description">
                <input
                  value={currentValues.description}
                  readOnly={isReadonly}
                  onChange={(event) =>
                    onChangeDraft({ ...draft, description: event.target.value })
                  }
                  className={fieldClassName}
                  placeholder="Vendor Payment"
                />
              </FieldBlock>
              <FieldBlock label="Module">
                <input
                  value={currentValues.module}
                  readOnly={isReadonly}
                  onChange={(event) =>
                    onChangeDraft({ ...draft, module: event.target.value })
                  }
                  className={fieldClassName}
                  placeholder="All"
                />
              </FieldBlock>
              <FieldBlock label="Account Code">
                <input
                  value={currentValues.accountCode}
                  readOnly={isReadonly}
                  onChange={(event) =>
                    onChangeDraft({ ...draft, accountCode: event.target.value })
                  }
                  className={fieldClassName}
                  placeholder="2010-003"
                />
              </FieldBlock>
              <FieldBlock label="Amount">
                <input
                  value={currentValues.amount}
                  readOnly={isReadonly}
                  onChange={(event) =>
                    onChangeDraft({ ...draft, amount: event.target.value })
                  }
                  className={fieldClassName}
                  placeholder="0.00"
                />
              </FieldBlock>
            </div>

            <div className="mt-4">
              <FieldBlock label="Account Title">
                <input
                  value={currentValues.accountTitle}
                  readOnly={isReadonly}
                  onChange={(event) =>
                    onChangeDraft({
                      ...draft,
                      accountTitle: event.target.value,
                    })
                  }
                  className={fieldClassName}
                  placeholder="Accounts Payable"
                />
              </FieldBlock>
            </div>
          </section>
        </div>

        {!isReadonly ? (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onSave}
              className={`${accentPrimaryButtonClassName} h-11 px-5`}
            >
              {mode === "edit" ? "Save Changes" : "Create Type"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DisbursementTypeTableRow({
  record,
  onEdit,
  onSelect,
  onToggleStatus,
  onView,
}: {
  record: DisbursementTypeRecord;
  onEdit: (record: DisbursementTypeRecord) => void;
  onSelect: (value: DisbursementType) => void;
  onToggleStatus: (record: DisbursementTypeRecord) => void;
  onView: (record: DisbursementTypeRecord) => void;
}) {
  return (
    <tr className="module-table-row">
      <td className="px-4 py-4 font-semibold text-darknavy">
        {record.description}
      </td>
      <td className="px-4 py-4 text-darknavy">{record.accountCode || "-"}</td>
      <td className="px-4 py-4 text-darknavy">{record.accountTitle || "-"}</td>
      <td className="px-4 py-4 text-right text-darknavy">
        {record.amount || "0.00"}
      </td>
      <td className="px-4 py-4 text-darknavy">{record.module || "All"}</td>
      <td className="px-4 py-4 text-darknavy">{record.status}</td>
      <td className="px-4 py-4">
        <ModuleTableActions>
          <ModuleTableActionButton
            variant="active"
            onClick={() => onSelect(record.description)}
            label={`Use ${record.description}`}
          />
          <ModuleTableActionButton
            variant="view"
            onClick={() => onView(record)}
            label={`View ${record.description}`}
          />
          <ModuleTableActionButton
            variant="edit"
            onClick={() => onEdit(record)}
            label={`Edit ${record.description}`}
          />
          <ModuleTableActionButton
            variant={record.status === "Active" ? "inactive" : "active"}
            onClick={() => onToggleStatus(record)}
            label={`${record.status === "Active" ? "Deactivate" : "Activate"} ${record.description}`}
          />
        </ModuleTableActions>
      </td>
    </tr>
  );
}

function useDisbursementTypeTable(records: DisbursementTypeRecord[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "description", desc: false },
  ]);
  const deferredRecords = useDeferredValue(records);
  const columns = useMemo<ColumnDef<DisbursementTypeRecord>[]>(
    () => [
      createDisbursementTypeColumn("description", "Description", "w-[18rem]"),
      createDisbursementTypeColumn("accountCode", "Account Code", "w-[10rem]"),
      createDisbursementTypeColumn(
        "accountTitle",
        "Account Title",
        "w-[18rem]",
      ),
      createDisbursementTypeColumn("amount", "Amount", "w-[10rem] text-right"),
      createDisbursementTypeColumn("module", "Module", "w-[10rem]"),
      createDisbursementTypeColumn("status", "Status", "w-[8rem]"),
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { className: "w-[12rem] text-center" },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  return useReactTable({
    data: deferredRecords,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
}

function createDisbursementTypeColumn(
  key: keyof Pick<
    DisbursementTypeRecord,
    | "description"
    | "accountCode"
    | "accountTitle"
    | "amount"
    | "module"
    | "status"
  >,
  header: string,
  className: string,
): ColumnDef<DisbursementTypeRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: key === "amount" ? "alphanumeric" : "alphanumeric",
    meta: { className },
  };
}

function FieldBlock({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-darknavy/82">{label}</span>
      {children}
    </label>
  );
}
