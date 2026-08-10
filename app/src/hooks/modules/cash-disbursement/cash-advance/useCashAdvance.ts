"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
  createCashAdvanceFormValues,
  createCashAdvanceFormValuesFromRecord,
  createCashAdvanceRecordFromForm,
  getInitialCashAdvances,
  writeStoredCashAdvances,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import { syncTaxDetailsAmount } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { CashAdvanceStatusFilters } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceActionMode,
  CashAdvanceFormValues,
  CashAdvanceRecord,
  CashAdvanceReferenceField,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { validateCashAdvanceForm } from "@/app/src/validations/modules/cash-disbursement/cash-advance/CashAdvanceValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { AppTaxRateDialogValue } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";

type CashAdvanceStoreState = {
  advances: CashAdvanceRecord[];
  isLoading: boolean;
  lastSyncedAt: number;
};

export function useCashAdvanceStore<TSelected = CashAdvanceStoreState>(
  selector?: (state: CashAdvanceStoreState) => TSelected,
) {
  const [advances] = useState(getInitialCashAdvances);
  const [lastSyncedAt] = useState(() => Date.now());
  const state = useMemo<CashAdvanceStoreState>(
    () => ({
      advances,
      isLoading: false,
      lastSyncedAt,
    }),
    [advances, lastSyncedAt],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useCashAdvanceActionForm(
  mode: CashAdvanceActionMode,
  recordId?: string,
  onSaved?: (record: CashAdvanceRecord) => void,
) {
  const initialRecord =
    mode === "add"
      ? null
      : getInitialCashAdvances().find((advance) => advance.id === recordId) ?? null;
  const [loadedRecord, setLoadedRecord] = useState<CashAdvanceRecord | null>(
    initialRecord,
  );
  const [values, setValues] = useState<CashAdvanceFormValues>(() =>
    initialRecord
      ? createCashAdvanceFormValuesFromRecord(initialRecord)
      : createCashAdvanceFormValues(),
  );
  const [visibleReferenceFields, setVisibleReferenceFields] = useState({
    containerNo: true,
    refNo: true,
    projectRef: true,
    importationRefNo: true,
  });

  function updateField<Key extends keyof CashAdvanceFormValues>(
    key: Key,
    value: CashAdvanceFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateAmount(amount: string) {
    setValues((current) => ({
      ...current,
      amount,
      taxValue: {
        ...current.taxValue,
        taxDetails: syncTaxDetailsAmount(
          current.taxValue.taxDetails,
          Number(amount || 0),
          current.taxValue.taxRate,
        ),
      },
    }));
  }

  function updateReferenceField(field: CashAdvanceReferenceField, value: string) {
    setValues((current) => ({
      ...current,
      referenceFields: {
        ...current.referenceFields,
        [field]: value,
      },
    }));
  }

  function updateReferenceFieldVisibility(
    field: CashAdvanceReferenceField,
    isVisible: boolean,
  ) {
    setVisibleReferenceFields((current) => ({
      ...current,
      [field]: isVisible,
    }));
  }

  function updateTaxValue(taxValue: AppTaxRateDialogValue) {
    setValues((current) => ({
      ...current,
      amount: String(taxValue.taxDetails.grossAmount || ""),
      taxValue,
    }));
  }

  function submitAdvance() {
    const validation = validateCashAdvanceForm(values);

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the cash advance details.");
      return;
    }

    const nextRecord = createCashAdvanceRecordFromForm(
      values,
      mode === "edit" ? loadedRecord ?? undefined : undefined,
    );
    const nextAdvances = upsertCashAdvanceRecord(nextRecord);

    writeStoredCashAdvances(nextAdvances);
    setLoadedRecord(nextRecord);
    toast.success(mode === "edit" ? "Cash advance updated." : "Cash advance saved.");
    onSaved?.(nextRecord);
  }

  return {
    isRecordMissing: mode !== "add" && !initialRecord,
    submitAdvance,
    updateAmount,
    updateField,
    updateReferenceField,
    updateReferenceFieldVisibility,
    updateTaxValue,
    values,
    visibleReferenceFields,
  };
}

export function useCashAdvanceTable(advances: CashAdvanceRecord[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [query, setQueryState] = useState("");
  const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({
    from: "",
    to: "",
  });
  const [dateRange, setDateRangeState] = useState<DateRangeValue>({
    from: "",
    to: "",
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [statusFilter, setStatusFilterState] = useState<
    (typeof CashAdvanceStatusFilters)[number]
  >("all");
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return advances.filter((record) => {
      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;
      const matchesDateRange =
        (!dateRange.from || record.documentDate >= dateRange.from) &&
        (!dateRange.to || record.documentDate <= dateRange.to);
      const matchesAmountRange =
        (!amountRange.from || record.amount >= Number(amountRange.from)) &&
        (!amountRange.to || record.amount <= Number(amountRange.to));
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          record.transNo,
          record.partyCode,
          record.partyName,
          record.accountCode,
          record.costCenter,
          record.remarks,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesDateRange && matchesAmountRange && matchesQuery;
    });
  }, [advances, amountRange, dateRange, query, statusFilter]);
  const columns = useMemo<ColumnDef<CashAdvanceRecord>[]>(
    () => [
      {
        accessorKey: "transNo",
        id: "transNo",
        header: "Advance No.",
        meta: { className: "w-[10rem]", label: "Advance No." },
      },
      {
        accessorKey: "documentDate",
        id: "documentDate",
        header: "Document Date",
        meta: { className: "w-[9rem]", label: "Document Date" },
      },
      {
        accessorKey: "partyName",
        id: "partyName",
        header: "Party Name",
        meta: { className: "w-[16rem]", label: "Party Name" },
      },
      {
        accessorKey: "accountCode",
        id: "accountCode",
        header: "Account",
        meta: { className: "w-[12rem]", label: "Account" },
      },
      {
        accessorKey: "amount",
        id: "amount",
        header: "Amount",
        meta: { className: "w-[9rem]", label: "Amount" },
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        meta: { className: "w-[9rem]", label: "Status" },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: "Actions",
        meta: {
          className: "w-[5.5rem] px-3 text-center last:pr-3",
          label: "Actions",
        },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    columns,
    data: filteredRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnVisibility, pagination, sorting },
  });

  function setAmountRange(value: AmountRangeValue) {
    setAmountRangeState(value);
    table.setPageIndex(0);
  }

  function setDateRange(value: DateRangeValue) {
    setDateRangeState(value);
    table.setPageIndex(0);
  }

  function setQuery(value: string) {
    setQueryState(value);
    table.setPageIndex(0);
  }

  function setStatusFilter(value: (typeof CashAdvanceStatusFilters)[number]) {
    setStatusFilterState(value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setAmountRangeState({ from: "", to: "" });
    setDateRangeState({ from: "", to: "" });
    setQueryState("");
    setStatusFilterState("all");
    table.setPageIndex(0);
  }

  return {
    amountRange,
    dateRange,
    query,
    resetFilters,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statusFilter,
    table,
  };
}

function upsertCashAdvanceRecord(record: CashAdvanceRecord) {
  const currentAdvances = getInitialCashAdvances();
  const existingIndex = currentAdvances.findIndex(
    (advance) => advance.id === record.id,
  );

  if (existingIndex === -1) {
    return [record, ...currentAdvances];
  }

  return currentAdvances.map((advance) =>
    advance.id === record.id ? record : advance,
  );
}
