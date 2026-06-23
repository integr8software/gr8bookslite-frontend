"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Banknote,
  Building2,
  CirclePause,
  Landmark,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ApiClient,
  ApiClientError,
} from "@/app/src/services/shared/api/ApiClient";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type BankStatus = "ACTIVE" | "INACTIVE";

type BankMasterfileRecord = {
  id: string;
  accountCode: string;
  bankName: string;
  branch: string | null;
  accountNumber: string;
  accountName: string;
  accountType: string | null;
  currencyCode: string | null;
  currencyExchangeRate?: string | null;
  isDefault?: boolean;
  seriesStart?: string | null;
  seriesEnd?: string | null;
  seriesDigits?: number | null;
  status: BankStatus;
};

type BankMasterfileResponse = {
  bankAccounts: BankMasterfileRecord[];
  statistics?: {
    totalBanks?: number;
    activeBanks?: number;
    inactiveBanks?: number;
  };
};

type NextAccountCodeResponse = {
  accountCode: string;
  parentAccountCode: string;
  parentAccountTitle: string;
};

type BankFormValues = {
  bankName: string;
  branch: string;
  accountNumber: string;
  accountType: string;
  currencyCode: string;
  currencyExchangeRate: string;
  seriesStart: string;
  seriesEnd: string;
  seriesDigits: string;
  isDefault: boolean;
  status: BankStatus;
};

const EmptyBanks: BankMasterfileRecord[] = [];

const EmptyBankFormValues: BankFormValues = {
  bankName: "",
  branch: "",
  accountNumber: "",
  accountType: "Checking",
  currencyCode: "PHP",
  currencyExchangeRate: "",
  seriesStart: "",
  seriesEnd: "",
  seriesDigits: "",
  isDefault: false,
  status: "ACTIVE",
};

const StatusOptions = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
] as const;

const formId = "bank-masterfile-drawer-form";

export function BankMasterfileListPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankMasterfileRecord | null>(
    null,
  );
  const [values, setValues] = useState<BankFormValues>(EmptyBankFormValues);
  const banksQuery = useQuery({
    queryKey: ["bankMasterfile", "list"],
    queryFn: loadBanks,
  });
  const nextAccountCodeQuery = useQuery({
    queryKey: ["bankMasterfile", "nextAccountCode"],
    queryFn: loadNextAccountCode,
    enabled: isDrawerOpen && !editingBank,
  });
  const banks = banksQuery.data ?? EmptyBanks;
  const displayedAccountName = buildAccountName(values);
  const displayedAccountCode = editingBank
    ? editingBank.accountCode
    : nextAccountCodeQuery.data?.accountCode ?? "Auto series";

  const createBankMutation = useMutation({
    mutationFn: createBank,
    onSuccess: async () => {
      toast.success("Bank account created.");
      closeDrawer();
      await banksQuery.refetch();
    },
    onError: (error) => {
      toast.error(formatLoadError(error));
    },
  });
  const updateBankMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: BankFormValues }) =>
      updateBank(id, values),
    onSuccess: async () => {
      toast.success("Bank account updated.");
      closeDrawer();
      await banksQuery.refetch();
    },
    onError: (error) => {
      toast.error(formatLoadError(error));
    },
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BankStatus }) =>
      updateBankStatus(id, status),
    onSuccess: async (_response, variables) => {
      toast.success(
        variables.status === "ACTIVE"
          ? "Bank account activated."
          : "Bank account inactivated.",
      );
      await banksQuery.refetch();
    },
    onError: (error) => {
      toast.error(formatLoadError(error));
    },
  });
  const isSaving = createBankMutation.isPending || updateBankMutation.isPending;

  const filteredBanks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return banks.filter((bank) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          bank.accountCode,
          bank.bankName,
          bank.branch ?? "",
          bank.accountNumber,
          bank.accountName,
          bank.currencyCode ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus = !statusFilter || bank.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [banks, query, statusFilter]);

  function openAddDrawer() {
    setEditingBank(null);
    setValues(EmptyBankFormValues);
    setIsDrawerOpen(true);
    void nextAccountCodeQuery.refetch();
  }

  function openEditDrawer(bank: BankMasterfileRecord) {
    setEditingBank(bank);
    setValues({
      bankName: bank.bankName,
      branch: bank.branch ?? "",
      accountNumber: bank.accountNumber,
      accountType: bank.accountType ?? "Checking",
      currencyCode: bank.currencyCode ?? "PHP",
      currencyExchangeRate: bank.currencyExchangeRate ?? "",
      seriesStart: bank.seriesStart ?? "",
      seriesEnd: bank.seriesEnd ?? "",
      seriesDigits: bank.seriesDigits ? String(bank.seriesDigits) : "",
      isDefault: bank.isDefault ?? false,
      status: bank.status,
    });
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
    setEditingBank(null);
    setValues(EmptyBankFormValues);
  }

  function updateField(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, type, value } = event.target;
    const nextValue =
      type === "checkbox" && event.target instanceof HTMLInputElement
        ? event.target.checked
        : value;

    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.bankName.trim() || !values.accountNumber.trim()) {
      toast.error("Bank and account number are required.");
      return;
    }

    if (editingBank) {
      updateBankMutation.mutate({ id: editingBank.id, values });
      return;
    }

    createBankMutation.mutate(values);
  }

  function toggleBankStatus(bank: BankMasterfileRecord) {
    updateStatusMutation.mutate({
      id: bank.id,
      status: bank.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Bank Masterfile"
        description="Maintain company bank accounts and their linked Cash in Bank chart accounts."
        actions={
          <>
            <button
              type="button"
              className={moduleHeaderActionClassNames.secondary}
              onClick={() => void banksQuery.refetch()}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
            <button
              type="button"
              className={moduleHeaderActionClassNames.primary}
              onClick={openAddDrawer}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Bank
            </button>
          </>
        }
      />

      <ModuleMetrics
        metrics={[
          {
            helper: "All bank records",
            icon: Landmark,
            label: "Total Banks",
            value: banks.length,
          },
          {
            helper: "Available for transactions",
            icon: Banknote,
            label: "Active Banks",
            tone: "emerald",
            value: banks.filter((bank) => bank.status === "ACTIVE").length,
          },
          {
            helper: "Hidden from new transactions",
            icon: CirclePause,
            label: "Inactive Banks",
            tone: "amber",
            value: banks.filter((bank) => bank.status === "INACTIVE").length,
          },
          {
            helper: "With branch details",
            icon: Building2,
            label: "Branches",
            tone: "violet",
            value: banks.filter((bank) => Boolean(bank.branch)).length,
          },
        ]}
      />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
        <ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(13rem,1fr)_minmax(11rem,1fr)]">
          <ModuleTableSearch
            label="Search banks"
            value={query}
            onChange={setQuery}
            placeholder="Search by bank, account number, account code, or currency"
          />
          <ModuleTableFilterSelect
            label="Status"
            value={statusFilter}
            options={StatusOptions}
            onChange={setStatusFilter}
          />
          <ModuleTableResetButton
            onClick={() => {
              setQuery("");
              setStatusFilter("");
            }}
          />
        </ModuleTableToolbar>

        <div className="overflow-x-auto border-t border-darknavy/10">
          <table className="min-w-full divide-y divide-darknavy/10 text-left text-sm">
            <thead className="bg-darknavy/[0.03] text-xs uppercase tracking-wide text-darknavy/55">
              <tr>
                <th className="px-5 py-3 font-semibold">Bank</th>
                <th className="px-5 py-3 font-semibold">Branch</th>
                <th className="px-5 py-3 font-semibold">Account Number</th>
                <th className="px-5 py-3 font-semibold">Account Name</th>
                <th className="px-5 py-3 font-semibold">COA Code</th>
                <th className="px-5 py-3 font-semibold">Currency</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darknavy/10 bg-white">
              {banksQuery.isLoading ? (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-darknavy/60"
                    colSpan={8}
                  >
                    Loading bank records...
                  </td>
                </tr>
              ) : banksQuery.error ? (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-red-600"
                    colSpan={8}
                  >
                    {formatLoadError(banksQuery.error)}
                  </td>
                </tr>
              ) : filteredBanks.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-darknavy/60"
                    colSpan={8}
                  >
                    No bank records found.
                  </td>
                </tr>
              ) : (
                filteredBanks.map((bank) => (
                  <tr
                    key={bank.id}
                    className="text-darknavy transition hover:bg-darknavy/[0.025]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-semibold">
                      {bank.bankName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-darknavy/70">
                      {bank.branch ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-darknavy/80">
                      {bank.accountNumber}
                    </td>
                    <td className="min-w-64 px-5 py-4 text-darknavy/80">
                      {bank.accountName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-darknavy/80">
                      {bank.accountCode}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-darknavy/70">
                      {bank.currencyCode ?? "PHP"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={joinClasses(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                          bank.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                        )}
                      >
                        {bank.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className={iconButtonClassName}
                          onClick={() => openEditDrawer(bank)}
                          title="Edit bank"
                          aria-label={`Edit ${bank.bankName}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={joinClasses(
                            iconButtonClassName,
                            bank.status === "ACTIVE"
                              ? "text-amber-700 hover:border-amber-300 hover:bg-amber-50"
                              : "text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50",
                          )}
                          onClick={() => toggleBankStatus(bank)}
                          disabled={updateStatusMutation.isPending}
                          title={
                            bank.status === "ACTIVE"
                              ? "Inactivate bank"
                              : "Activate bank"
                          }
                          aria-label={
                            bank.status === "ACTIVE"
                              ? `Inactivate ${bank.bankName}`
                              : `Activate ${bank.bankName}`
                          }
                        >
                          {bank.status === "ACTIVE" ? (
                            <PowerOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Power className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MaintenanceFormDrawer
        description="Create or update a bank account and keep its Cash in Bank chart account synchronized."
        eyebrow="Accounting master data"
        formId={formId}
        isOpen={isDrawerOpen}
        isSaving={isSaving}
        onClose={closeDrawer}
        title={editingBank ? "Edit Bank" : "Add Bank"}
      >
        <form id={formId} onSubmit={handleSubmit} className="px-6 py-5">
          <BankMasterfileFields
            accountCode={displayedAccountCode}
            accountName={displayedAccountName}
            isCodeLoading={nextAccountCodeQuery.isFetching && !editingBank}
            values={values}
            isSaving={isSaving}
            onChange={updateField}
          />
        </form>
      </MaintenanceFormDrawer>
    </section>
  );
}

function BankMasterfileFields({
  accountCode,
  accountName,
  isCodeLoading,
  isSaving,
  values,
  onChange,
}: {
  accountCode: string;
  accountName: string;
  isCodeLoading: boolean;
  isSaving: boolean;
  values: BankFormValues;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label="Bank" required>
            <input
              name="bankName"
              value={values.bankName}
              onChange={onChange}
              disabled={isSaving}
              className={fieldClassName}
              placeholder="BDO"
            />
          </FormField>
          <FormField label="Branch">
            <input
              name="branch"
              value={values.branch}
              onChange={onChange}
              disabled={isSaving}
              className={fieldClassName}
              placeholder="Makati Branch"
            />
          </FormField>
          <FormField label="Account Number" required>
            <input
              name="accountNumber"
              value={values.accountNumber}
              onChange={onChange}
              disabled={isSaving}
              className={fieldClassName}
              placeholder="1234567890"
            />
          </FormField>
          <FormField label="Account Type">
            <select
              name="accountType"
              value={values.accountType}
              onChange={onChange}
              disabled={isSaving}
              className={selectClassName}
            >
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
            </select>
          </FormField>
          <FormField label="Account Name">
            <input
              value={accountName}
              readOnly
              disabled={isSaving}
              className={readOnlyFieldClassName}
            />
          </FormField>
          <FormField label="Account Code">
            <input
              value={isCodeLoading ? "Loading..." : accountCode}
              readOnly
              disabled={isSaving}
              className={readOnlyFieldClassName}
            />
          </FormField>
          <FormField label="Currency">
            <input
              name="currencyCode"
              value={values.currencyCode}
              onChange={onChange}
              disabled={isSaving}
              className={fieldClassName}
              placeholder="PHP"
              maxLength={10}
            />
          </FormField>
          <FormField label="Exchange Rate">
            <input
              name="currencyExchangeRate"
              type="number"
              min="0"
              step="any"
              value={values.currencyExchangeRate}
              onChange={onChange}
              disabled={isSaving}
              className={fieldClassName}
              placeholder="Required for non-PHP"
            />
          </FormField>
          <FormField label="Status">
            <select
              name="status"
              value={values.status}
              onChange={onChange}
              disabled={isSaving}
              className={selectClassName}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </FormField>
          <label className="flex min-h-11 items-center justify-between rounded-md border border-darknavy/15 px-3 text-sm font-semibold text-darknavy">
            Default Bank
            <input
              name="isDefault"
              type="checkbox"
              checked={values.isDefault}
              onChange={onChange}
              disabled={isSaving}
              className="h-5 w-5 rounded border-darknavy/20 text-skyblue focus:ring-2 focus:ring-skyblue/20"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <FormField label="Series Start">
            <input
              name="seriesStart"
              value={values.seriesStart}
              onChange={onChange}
              disabled={isSaving}
              className={fieldClassName}
              placeholder="000001"
            />
          </FormField>
          <FormField label="Series End">
            <input
              name="seriesEnd"
              value={values.seriesEnd}
              onChange={onChange}
              disabled={isSaving}
              className={fieldClassName}
              placeholder="999999"
            />
          </FormField>
          <FormField label="Series Digits">
            <input
              name="seriesDigits"
              type="number"
              min="1"
              value={values.seriesDigits}
              onChange={onChange}
              disabled={isSaving}
              className={fieldClassName}
              placeholder="6"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

function FormField({
  children,
  label,
  required,
}: {
  children: ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        {required ? <span className="text-coralpink"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

async function loadBanks() {
  const response = await ApiClient.get<BankMasterfileResponse>(
    "/maintenance/financial-management/bank-masterfile",
  );

  return response.data.bankAccounts;
}

async function loadNextAccountCode() {
  const response = await ApiClient.get<NextAccountCodeResponse>(
    "/maintenance/financial-management/bank-masterfile/next-account-code",
  );

  return response.data;
}

async function createBank(values: BankFormValues) {
  await ApiClient.post(
    "/maintenance/financial-management/bank-masterfile",
    toBankPayload(values),
  );
}

async function updateBank(id: string, values: BankFormValues) {
  await ApiClient.patch(
    `/maintenance/financial-management/bank-masterfile/${id}`,
    toBankPayload(values),
  );
}

async function updateBankStatus(id: string, status: BankStatus) {
  await ApiClient.patch(
    `/maintenance/financial-management/bank-masterfile/${id}/status`,
    { status },
  );
}

function toBankPayload(values: BankFormValues) {
  return {
    bankName: values.bankName.trim(),
    branch: cleanOptional(values.branch),
    accountNumber: values.accountNumber.trim(),
    accountType: cleanOptional(values.accountType),
    currencyCode: cleanOptional(values.currencyCode),
    currencyExchangeRate: toOptionalNumber(values.currencyExchangeRate),
    seriesStart: cleanOptional(values.seriesStart),
    seriesEnd: cleanOptional(values.seriesEnd),
    seriesDigits: toOptionalNumber(values.seriesDigits),
    isDefault: values.isDefault,
    status: values.status,
  };
}

function buildAccountName(values: BankFormValues) {
  return [
    "Cash in Bank",
    values.bankName.trim(),
    values.branch.trim(),
    values.accountNumber.trim(),
  ]
    .filter(Boolean)
    .join(" - ");
}

function cleanOptional(value: string) {
  return value.trim() || undefined;
}

function toOptionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function formatLoadError(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load bank masterfile records.";
}

const fieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5";

const readOnlyFieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/10 bg-darknavy/[0.03] px-3 text-sm font-semibold text-darknavy/80 outline-none";

const iconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/70 transition hover:border-skyblue/40 hover:bg-skyblue/10 hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-60";

const selectClassName = `app-select-control ${fieldClassName}`;