"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePlus2,
  Plus,
  Save,
  Search,
} from "lucide-react";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  AppPartyDialog,
  mapPartyRecordToPartyValue,
} from "@/app/src/ui/shared/transaction-setup/AppPartyDialog";
import {
  AppTaxRateDialog,
  type AppTaxRateDialogValue,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const CashAdvanceHref = "/cash-disbursement/cash-advance";

type CashAdvanceActionMode = "add" | "edit" | "view";

export function CashAdvanceAction() {
  const pathname = usePathname();
  const router = useRouter();
  const mode = getActionMode(pathname);
  const title =
    mode === "view"
      ? "Cash Advance Preview"
      : mode === "edit"
        ? "Edit Cash Advance"
        : "New Cash Advance";

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
        <ModuleHeader
          title={title}
          description="Record the payee, account, amount, and supporting details for a cash advance."
          actionsClassName="items-center"
          actions={
            <>
              <Link
                href={CashAdvanceHref}
                className={moduleHeaderActionClassNames.secondary}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Table
              </Link>
              <button
                type="button"
                className={moduleHeaderActionClassNames.secondary}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <Link
                href={`${CashAdvanceHref}/add`}
                className={moduleHeaderActionClassNames.secondary}
              >
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                New
              </Link>
              <button
                type="button"
                className={moduleHeaderActionClassNames.primary}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            </>
          }
        />

        <CashAdvanceFormPanel
          mode={mode}
          onCancel={() => router.push(CashAdvanceHref)}
        />
      </main>
    </section>
  );
}

export function CashAdvanceFormPanel({
  mode = "add",
  showToolbar = true,
}: {
  mode?: CashAdvanceActionMode;
  onCancel?: () => void;
  showToolbar?: boolean;
}) {
  const isReadonly = mode === "view";
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [partyCode, setPartyCode] = useState("");
  const [partyName, setPartyName] = useState("");
  const [amount, setAmount] = useState("");
  const [taxValue, setTaxValue] = useState<AppTaxRateDialogValue>(() => ({
    taxDetails: createTaxDetails(0, "0%"),
    taxRate: "0%",
  }));
  const taxSummary =
    taxValue.taxRate === "0%" && !taxValue.taxDetails.ewtCode
      ? "No VAT"
      : `${taxValue.taxRate}${taxValue.taxDetails.ewtCode ? ` / ${taxValue.taxDetails.ewtCode}` : ""}`;

  function handleAmountChange(value: string) {
    setAmount(value);
    setTaxValue((current) => ({
      ...current,
      taxDetails: syncTaxDetailsAmount(
        current.taxDetails,
        Number(value || 0),
        current.taxRate,
      ),
    }));
  }

  return (
    <>
      <section className="overflow-hidden">
      {showToolbar ? (
        <div className="flex flex-col gap-3 border-b border-darknavy/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={moduleHeaderActionClassNames.secondary}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Prev
              </button>
              <button
                type="button"
                className={moduleHeaderActionClassNames.secondary}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={moduleHeaderActionClassNames.secondary}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Preview
              </button>
            </div>
        </div>
      ) : null}

      <div className="border-b border-darknavy/10 px-6 pt-4">
        <div className="flex items-end gap-1">
          <DrawerTabButton isActive label="Cash Advance" />
          <DrawerTabButton label="File Attachment" />
        </div>
      </div>

      <form className="grid gap-6 px-6 py-6 xl:grid-cols-[1fr_0.72fr]">
        <div className="grid content-start gap-4">
          <FieldShell label="Party Code : *">
            <input value={partyCode} className={ReadOnlyFieldClassName} readOnly />
          </FieldShell>
          <FieldShell label="Party Name : *">
            <ActionField
              actionLabel="Add"
              onAction={() => setIsPartyDialogOpen(true)}
              control={
                <input
                  value={partyName}
                  onChange={(event) => setPartyName(event.target.value)}
                  readOnly={isReadonly}
                  className={FieldClassName}
                />
              }
            />
          </FieldShell>
          <FieldShell label="Account Code : *">
            <ActionField
              actionLabel="Add"
              control={
                <select
                  disabled={isReadonly}
                  className={`${FieldClassName} app-select-control`}
                >
                  <option value="">--Select Account--</option>
                  <option value="cash-advance">Cash Advance</option>
                  <option value="employee-advance">Employee Advance</option>
                  <option value="officer-advance">Officer Advance</option>
                </select>
              }
            />
          </FieldShell>
          <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr]">
            <FieldShell label="Cost Center :">
              <select
                disabled={isReadonly}
                className={`${FieldClassName} app-select-control`}
              >
                <option value="">--Select Cost Center--</option>
                <option value="operations">Operations</option>
                <option value="admin">Admin</option>
                <option value="sales">Sales</option>
              </select>
            </FieldShell>
            <FieldShell label="Container No. :">
              <input readOnly={isReadonly} className={FieldClassName} />
            </FieldShell>
          </div>
          <FieldShell label="Amount :">
            <ActionField
              actionLabel="Tax"
              onAction={() => setIsTaxDialogOpen(true)}
              control={
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  readOnly={isReadonly}
                  className={`${FieldClassName} text-right`}
                />
              }
            />
          </FieldShell>
          <p className="-mt-2 text-xs font-medium text-darknavy/55">
            {taxSummary}
          </p>
          <FieldShell label="Remarks :">
            <textarea
              readOnly={isReadonly}
              rows={4}
              className={`${FieldClassName} min-h-24 py-3`}
            />
          </FieldShell>
        </div>

        <div className="grid content-start gap-4">
          <FieldShell label="Trans No. : *">
            <input
              readOnly
              value={mode === "add" ? "Auto-generated on save" : "CA-000001"}
              className={ReadOnlyFieldClassName}
            />
          </FieldShell>
          <FieldShell label="Document Date :">
            <input
              type="date"
              readOnly={isReadonly}
              defaultValue="2026-06-11"
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell label="Ref No. :">
            <input readOnly={isReadonly} className={FieldClassName} />
          </FieldShell>
          <FieldShell label="Status :">
            <input
              readOnly
              value={mode === "add" ? "Draft" : "Pending Review"}
              className={ReadOnlyFieldClassName}
            />
          </FieldShell>
          <FieldShell label="ProjectRef :">
            <input readOnly={isReadonly} className={FieldClassName} />
          </FieldShell>
          <FieldShell label="Importation Ref No :">
            <input readOnly={isReadonly} className={FieldClassName} />
          </FieldShell>
        </div>
      </form>
      </section>
      <AppPartyDialog
        isOpen={isPartyDialogOpen}
        suggestedPartyType="Employee"
        onClose={() => setIsPartyDialogOpen(false)}
        onSelect={(record) => {
          const partyValue = mapPartyRecordToPartyValue(record);

          setPartyCode(partyValue.partyCode);
          setPartyName(partyValue.partyName);
          setIsPartyDialogOpen(false);
        }}
      />
      <AppTaxRateDialog
        isOpen={isTaxDialogOpen}
        title="Cash Advance Tax"
        value={{
          taxRate: taxValue.taxRate,
          taxDetails: syncTaxDetailsAmount(
            taxValue.taxDetails,
            Number(amount || 0),
            taxValue.taxRate,
          ),
        }}
        onClose={() => setIsTaxDialogOpen(false)}
        onSave={(nextValue) => {
          setTaxValue(nextValue);
          setAmount(String(nextValue.taxDetails.grossAmount || ""));
          setIsTaxDialogOpen(false);
        }}
      />
    </>
  );
}

function getActionMode(pathname: string): CashAdvanceActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function FieldShell({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-darknavy/68">{label}</span>
      {children}
    </label>
  );
}

function ActionField({
  actionLabel,
  control,
  onAction,
}: {
  actionLabel: string;
  control: ReactNode;
  onAction?: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
      {control}
      <button
        type="button"
        onClick={onAction}
        className="theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {actionLabel}
      </button>
    </div>
  );
}

function DrawerTabButton({
  isActive = false,
  label,
}: {
  isActive?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      className={joinClasses(
        "inline-flex h-11 items-center rounded-t-md border px-4 text-sm font-semibold transition",
        isActive
          ? "border-darknavy/10 border-b-white bg-white text-darknavy"
          : "border-transparent text-skyblue hover:bg-skyblue/8",
      )}
    >
      {label}
    </button>
  );
}

const FieldClassName =
  "app-data-entry-field app-theme-field h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/10";

const ReadOnlyFieldClassName =
  "app-data-entry-field app-theme-field-readonly h-10 w-full rounded-md border px-3 text-sm outline-none";
