"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Banknote, CircleDollarSign } from "lucide-react";
import toast from "react-hot-toast";
import {
  PettyCashFundRecordStatuses,
  PettyCashFundStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import {
  calculatePettyCashFundTotals,
  createBlankPettyCashFundItem,
  createPettyCashFundFormValues,
  createPettyCashFundRecord,
  formatPettyCashFundAmount,
  getPettyCashFundRecords,
  upsertPettyCashFundRecord,
  writePettyCashFundRecords,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type {
  PettyCashFundActionMode,
  PettyCashFundBoolean,
  PettyCashFundFormErrors,
  PettyCashFundFormValues,
  PettyCashFundItem,
  PettyCashFundRecord,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { validatePettyCashFundForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-fund/PettyCashFundValidation";
import { parseAmount } from "@/app/src/utils/number.util";

const columnHelper = createColumnHelper<PettyCashFundRecord>();
const emptyDateRange: DateRangeValue = { from: "", to: "" };
const emptyAmountRange: AmountRangeValue = { from: "", to: "" };

export function usePettyCashFundActionPage(options: { onSaved?: () => void } = {}) {
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode: PettyCashFundActionMode = pathname.includes("/view/") ? "view" : pathname.includes("/edit/") ? "edit" : "add";
  const initialRecord = mode === "add" ? undefined : getPettyCashFundRecords().find((record) => record.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<PettyCashFundFormValues>(() => createPettyCashFundFormValues(initialRecord));
  const [errors, setErrors] = useState<PettyCashFundFormErrors>({});
  const isReadonly = mode === "view";
  const totals = useMemo(() => calculatePettyCashFundTotals(values.items), [values.items]);

  function updateField<TKey extends keyof PettyCashFundFormValues>(field: TKey, value: PettyCashFundFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }
  function updateItem(rowId: string, updates: Partial<PettyCashFundItem>) {
    if (isReadonly) return;
    updateField(
      "items",
      values.items.map((item) => (item.id === rowId ? calculateItem({ ...item, ...updates }) : item)),
    );
  }
  function updateItems(items: PettyCashFundItem[]) {
    updateField("items", items);
  }
  function addItems(count: number) {
    updateItems([...values.items, ...Array.from({ length: count }, createBlankPettyCashFundItem)]);
  }
  function removeItem(rowId: string) {
    if (values.items.length > 1) updateItems(values.items.filter((item) => item.id !== rowId));
  }
  function duplicateItem(rowId: string) {
    const item = values.items.find((row) => row.id === rowId);
    if (item) updateItems([...values.items, { ...item, id: createBlankPettyCashFundItem().id }]);
  }
  function copyFrom() {
    if (isReadonly) return;
    const source = getPettyCashFundRecords().find((item) => item.id !== record?.id);
    if (!source) {
      toast.error("No petty cash fund is available to copy.");
      return;
    }
    const copied = createPettyCashFundFormValues(source);
    setValues((current) => ({
      ...copied,
      attachments: current.attachments,
      documentDate: current.documentDate,
      status: current.status,
      transactionNo: current.transactionNo,
    }));
    setErrors({});
    toast.success(`Copied details from ${source.transactionNo}.`);
  }

  function save(status: PettyCashFundStatus) {
    const nextErrors = status === PettyCashFundStatuses.draft ? {} : validatePettyCashFundForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted petty cash fund fields.");
      return false;
    }
    const nextRecord = createPettyCashFundRecord(values, status, mode === "edit" ? record : undefined);
    writePettyCashFundRecords(upsertPettyCashFundRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createPettyCashFundFormValues(nextRecord));
    toast.success(status === PettyCashFundStatuses.draft ? "Petty cash fund saved as draft." : "Petty cash fund submitted for approval.");
    options.onSaved?.();
    return true;
  }
  function updateStatus(status: PettyCashFundStatus) {
    if (!record) return false;
    const nextRecord = createPettyCashFundRecord(values, status, record);
    writePettyCashFundRecords(upsertPettyCashFundRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createPettyCashFundFormValues(nextRecord));
    toast.success(`Petty cash fund marked as ${status}.`);
    return true;
  }

  return {
    addItems,
    copyFrom,
    duplicateItem,
    errors,
    isReadonly,
    isRecordMissing: mode !== "add" && !initialRecord,
    mode,
    record,
    removeItem,
    save,
    totals,
    updateField,
    updateItem,
    updateItems,
    updateStatus,
    values,
  };
}

export function usePettyCashFundOverviewPage() {
  const [records, setRecords] = useState(getPettyCashFundRecords);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>(emptyDateRange);
  const [amountRange, setAmountRange] = useState<AmountRangeValue>(emptyAmountRange);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    partyCode: false,
    accountCode: false,
    remarks: false,
    createdBy: false,
    createdAt: false,
    updatedBy: false,
    updatedAt: false,
  });
  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const needle = query.trim().toLowerCase();
        return (
          (!needle ||
            [record.transactionNo, record.partyCode, record.partyName, record.accountCode, record.accountTitle, record.remarks]
              .join(" ")
              .toLowerCase()
              .includes(needle)) &&
          (statusFilter === "All" || record.status === statusFilter) &&
          (!dateRange.from || record.documentDate >= dateRange.from) &&
          (!dateRange.to || record.documentDate <= dateRange.to) &&
          (!amountRange.from || record.amount >= Number(amountRange.from)) &&
          (!amountRange.to || record.amount <= Number(amountRange.to))
        );
      }),
    [amountRange, dateRange, query, records, statusFilter],
  );
  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", { header: "Petty Cash Fund No.", meta: { label: "Petty Cash Fund No." } }),
      columnHelper.accessor("documentDate", { header: "Document Date", meta: { label: "Document Date" } }),
      columnHelper.accessor("partyCode", { header: "Custodian Code", meta: { label: "Custodian Code" } }),
      columnHelper.accessor("partyName", { header: "Custodian Name", meta: { label: "Custodian Name" } }),
      columnHelper.accessor("accountCode", { header: "Default Account Code", meta: { label: "Default Account Code" } }),
      columnHelper.accessor("accountTitle", { header: "Default Account Title", meta: { label: "Default Account Title" } }),
      columnHelper.accessor("amount", { header: "Fund Amount", meta: { label: "Fund Amount" } }),
      columnHelper.accessor("remarks", { header: "Remarks", meta: { label: "Remarks" } }),
      columnHelper.accessor("createdBy", { header: "Created By", meta: { label: "Created By" } }),
      columnHelper.accessor("createdAt", { header: "Date Created", meta: { label: "Date Created" } }),
      columnHelper.accessor("updatedBy", { header: "Updated By", meta: { label: "Updated By" } }),
      columnHelper.accessor("updatedAt", { header: "Date Modified", meta: { label: "Date Modified" } }),
      columnHelper.accessor("status", { header: "Status", meta: { className: "text-center", label: "Status" } }),
      columnHelper.display({ id: "actions", header: "Action", meta: { className: "text-center", label: "Action" } }),
    ],
    [],
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns its state handlers.
  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnVisibility, pagination, sorting },
  });
  const statisticCards = useMemo<ModuleStatisticCardItem[]>(
    () => [
      {
        icon: Banknote,
        label: "Total Funds",
        value: records.length,
        summary: "All records",
        tone: "violet",
        onClick: () => setStatusFilter("All"),
        isActive: statusFilter === "All",
      },
      {
        icon: CircleDollarSign,
        label: "Total Amount",
        value: formatPettyCashFundAmount(records.reduce((sum, record) => sum + record.amount, 0)),
        summary: "Across all funds",
        tone: "cyan",
      },
      ...PettyCashFundRecordStatuses.map((status) => ({
        icon: CircleDollarSign,
        label: status,
        value: records.filter((record) => record.status === status).length,
        tone:
          status === "Posted"
            ? ("emerald" as const)
            : status === "For Approval"
              ? ("amber" as const)
              : status === "Cancelled"
                ? ("slate" as const)
                : status === "Disapproved"
                  ? ("red" as const)
                  : ("blue" as const),
        onClick: () => setStatusFilter(status),
        isActive: statusFilter === status,
      })),
    ],
    [records, statusFilter],
  );
  function updateStatus(record: PettyCashFundRecord, status: PettyCashFundStatus) {
    const next = records.map((item) =>
      item.id === record.id ? { ...item, status, updatedAt: new Date().toISOString(), updatedBy: "Current User" } : item,
    );
    setRecords(next);
    writePettyCashFundRecords(next);
    toast.success(`Petty cash fund marked as ${status}.`);
  }
  function resetFilters() {
    setQuery("");
    setStatusFilter("All");
    setDateRange(emptyDateRange);
    setAmountRange(emptyAmountRange);
    table.setPageIndex(0);
  }
  return {
    amountRange,
    dateRange,
    isLoading: false,
    lastSyncedAt: Date.now(),
    query,
    resetFilters,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statisticCards,
    statusFilter,
    table,
    updateStatus,
  };
}

function calculateItem(item: PettyCashFundItem): PettyCashFundItem {
  const amount = parseAmount(item.amount) ?? 0;
  const rate = item.vatable === "True" ? 0.12 : 0;
  const vat = rate ? (item.vatInclusive === "True" ? amount - amount / (1 + rate) : amount * rate) : 0;
  const net = item.vatInclusive === "True" ? amount - vat : amount;
  const gross = item.vatInclusive === "True" ? amount : amount + vat;
  return {
    ...item,
    netAmount: formatPettyCashFundAmount(net),
    vatAmount: formatPettyCashFundAmount(vat),
    grossAmount: formatPettyCashFundAmount(gross),
    vatable: item.vatable as PettyCashFundBoolean,
  };
}

export type PettyCashFundActionPageState = ReturnType<typeof usePettyCashFundActionPage>;
export type PettyCashFundOverviewPageState = ReturnType<typeof usePettyCashFundOverviewPage>;
