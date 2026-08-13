"use client";

import { useCallback, useMemo, useState } from "react";
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
import {
  formatMoneyNumberDisplayValue,
  parseMoneyNumberInput,
} from "@/app/src/data/shared/money/MoneyNumberData";
import { syncTaxDetailsAmount } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  CashAdvanceDefaultColumnVisibility,
  CashAdvanceStatusFilters,
  CashAdvanceStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceActionMode,
  CashAdvanceFormValues,
  CashAdvanceRecord,
  CashAdvanceReferenceField,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { validateCashAdvanceForm } from "@/app/src/validations/modules/cash-disbursement/cash-advance/CashAdvanceValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { AppTaxRateDialogValue } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";

type CashAdvanceStoreState = {
  advances: CashAdvanceRecord[];
  isLoading: boolean;
  lastSyncedAt: number;
  updateAdvanceStatus: (record: CashAdvanceRecord, status: CashAdvanceStatus) => void;
};

export function useCashAdvanceStore<TSelected = CashAdvanceStoreState>(
  selector?: (state: CashAdvanceStoreState) => TSelected,
) {
  const [advances, setAdvances] = useState(getInitialCashAdvances);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const updateAdvanceStatus = useCallback((record: CashAdvanceRecord, status: CashAdvanceStatus) => {
    const updatedAt = new Date().toISOString();
    setAdvances((currentAdvances) => {
      const nextAdvances = currentAdvances.map((currentRecord) =>
        currentRecord.id === record.id
          ? {
              ...currentRecord,
              formValues: currentRecord.formValues
                ? { ...currentRecord.formValues, status }
                : currentRecord.formValues,
              status,
              updatedAt,
              updatedBy: "Current User",
            }
          : currentRecord,
      );

      writeStoredCashAdvances(nextAdvances);
      return nextAdvances;
    });
    setLastSyncedAt(Date.now());
    toast.success(`Cash advance marked as ${status}.`);
  }, []);

  const state = useMemo<CashAdvanceStoreState>(
    () => ({
      advances,
      isLoading: false,
      lastSyncedAt,
      updateAdvanceStatus,
    }),
    [advances, lastSyncedAt, updateAdvanceStatus],
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
          parseMoneyNumberInput(amount),
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

  function updateTaxValue(taxValue: AppTaxRateDialogValue) {
    setValues((current) => ({
      ...current,
      amount: formatMoneyNumberDisplayValue(taxValue.taxDetails.grossAmount || ""),
      taxValue,
    }));
  }

  function submitAdvance(status: CashAdvanceStatus = CashAdvanceStatuses.forApproval) {
    const nextValues = { ...values, status };
    const shouldValidate = status !== CashAdvanceStatuses.draft;
    const validation = shouldValidate
      ? validateCashAdvanceForm(nextValues)
      : { isValid: true, message: null };

    if (!validation.isValid) {
      toast.error(validation.message ?? "Review the cash advance details.");
      return;
    }

    const nextRecord = createCashAdvanceRecordFromForm(
      nextValues,
      mode === "edit" ? loadedRecord ?? undefined : undefined,
    );
    const nextAdvances = upsertCashAdvanceRecord(nextRecord);

    writeStoredCashAdvances(nextAdvances);
    setLoadedRecord(nextRecord);
    setValues(nextValues);
    toast.success(mode === "edit" ? "Cash advance updated." : "Cash advance saved.");
    onSaved?.(nextRecord);
  }

  function updateAdvanceStatus(status: CashAdvanceStatus) {
    if (!loadedRecord) {
      return;
    }

    const updatedAt = new Date().toISOString();
    const nextValues = { ...values, status };
    const nextRecord: CashAdvanceRecord = {
      ...loadedRecord,
      formValues: {
        ...nextValues,
        attachments: nextValues.attachments.map((attachment) => ({ ...attachment })),
        taxValue: {
          ...nextValues.taxValue,
          taxDetails: { ...nextValues.taxValue.taxDetails },
        },
      },
      status,
      updatedAt,
      updatedBy: "Current User",
    };
    const nextAdvances = upsertCashAdvanceRecord(nextRecord);

    writeStoredCashAdvances(nextAdvances);
    setLoadedRecord(nextRecord);
    setValues(nextValues);
    toast.success(`Cash advance marked as ${status}.`);
  }

  return {
    isRecordMissing: mode !== "add" && !initialRecord,
    record: loadedRecord,
    submitAdvance,
    updateAdvanceStatus,
    updateAmount,
    updateField,
    updateReferenceField,
    updateTaxValue,
    values,
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    CashAdvanceDefaultColumnVisibility,
  );
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
          record.formValues?.currency,
          record.remarks,
          record.createdBy,
          record.updatedBy,
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
        header: "Cash Advance No.",
        meta: { className: "w-[12rem]", label: "Cash Advance No." },
      },
      {
        accessorKey: "documentDate",
        id: "documentDate",
        header: "Document Date",
        meta: { className: "w-[9rem]", label: "Document Date" },
      },
      {
        accessorKey: "partyCode",
        id: "partyCode",
        header: "Party Code",
        meta: { className: "w-[10rem]", label: "Party Code" },
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
        header: "Account Code",
        meta: { className: "w-[10rem]", label: "Account Code" },
      },
      {
        accessorFn: (record) => record.accountCode,
        id: "accountTitle",
        header: "Account Title",
        meta: { className: "w-[14rem]", label: "Account Title" },
      },
      {
        accessorFn: (record) => record.formValues?.currency ?? "PHP",
        id: "currency",
        header: "Currency",
        meta: { className: "w-[8rem]", label: "Currency" },
      },
      {
        accessorKey: "amount",
        id: "amount",
        header: "Total Amount",
        meta: { className: "w-[9rem]", label: "Total Amount" },
      },
      {
        accessorKey: "remarks",
        id: "remarks",
        header: "Remarks",
        meta: { className: "w-[18rem]", label: "Remarks" },
      },
      {
        accessorKey: "createdBy",
        id: "createdBy",
        header: "Created By",
        meta: { className: "w-[14rem]", label: "Created By" },
      },
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: "Date Created",
        sortingFn: "datetime",
        meta: { className: "w-[16rem]", label: "Date Created" },
      },
      {
        accessorKey: "updatedBy",
        id: "updatedBy",
        header: "Updated By",
        meta: { className: "w-[14rem]", label: "Updated By" },
      },
      {
        accessorKey: "updatedAt",
        id: "updatedAt",
        header: "Date Modified",
        sortingFn: "datetime",
        meta: { className: "w-[16rem]", label: "Date Modified" },
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        meta: {
          className: "w-[9rem] text-center",
          label: "Status",
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: "Action",
        meta: {
          className: "w-[5.5rem] px-3 text-center last:pr-3",
          label: "Action",
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
    initialState: {
      columnVisibility: CashAdvanceDefaultColumnVisibility,
    },
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
