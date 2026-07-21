"use client";

import { useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type { DisbursementTaxDetails } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export type AppTaxRateDialogValue = {
  taxDetails: DisbursementTaxDetails;
  taxRate: string;
};

type AppTaxRateDialogProps = {
  isOpen: boolean;
  title?: string;
  value: AppTaxRateDialogValue | null;
  onClose: () => void;
  onSave: (value: AppTaxRateDialogValue) => void;
};

export function AppTaxRateDialog({
  isOpen,
  title = "Tax",
  value,
  onClose,
  onSave,
}: AppTaxRateDialogProps) {
  if (!isOpen || !value) {
    return null;
  }

  return (
    <AppTaxRateDialogEditor
      key={JSON.stringify(value)}
      initialValue={value}
      title={title}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function AppTaxRateDialogEditor({
  initialValue,
  title,
  onClose,
  onSave,
}: {
  initialValue: AppTaxRateDialogValue;
  title: string;
  onClose: () => void;
  onSave: (value: AppTaxRateDialogValue) => void;
}) {
  const [draftValue, setDraftValue] = useState(initialValue);
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatRateOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);

  function updateVatCode(nextVatCode: string) {
    setDraftValue((current) => {
      const nextTaxRate = getVatRateFromCode(nextVatCode, taxCodes);
      const nextVatPercent = getVatPercentFromRate(nextTaxRate);
      const nextTaxDetails = syncTaxDetailsAmount(
        {
          ...current.taxDetails,
          vatCode: nextVatCode,
          vatPercent: nextVatPercent,
        },
        current.taxDetails.grossAmount,
        nextTaxRate,
      );

      return {
        taxRate: nextTaxRate,
        taxDetails: nextTaxDetails,
      };
    });
  }

  function updateEwtCode(nextEwtCode: string) {
    setDraftValue((current) => {
      const nextEwtPercent = getEwtPercentFromCode(nextEwtCode, taxCodes);
      const nextTaxDetails = syncTaxDetailsAmount(
        {
          ...current.taxDetails,
          ewtCode: nextEwtCode,
          ewtPercent: nextEwtPercent,
        },
        current.taxDetails.grossAmount,
        current.taxRate,
      );

      return {
        ...current,
        taxDetails: nextTaxDetails,
      };
    });
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-tax-rate-dialog-title"
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_16px_48px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-darknavy/10 px-5 py-4">
          <h3
            id="app-tax-rate-dialog-title"
            className="text-2xl font-medium text-darknavy"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-darknavy/60 transition hover:bg-darknavy/5"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-3 px-4 py-4">
          <TaxDialogRow controlId="tax-gross-amount" label="Gross Amount :">
            <input
              id="tax-gross-amount"
              value={draftValue.taxDetails.grossAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow controlId="tax-net-amount" label="Net Amount :">
            <input
              id="tax-net-amount"
              value={draftValue.taxDetails.netAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow controlId="tax-vat-code" isRequired label="Tax VAT">
            <AppAdvancedDropdown
              id="tax-vat-code"
              value={normalizeVatDropdownValue(draftValue.taxDetails, taxCodes)}
              options={vatRateOptions}
              placeholder="--Select VAT Rate--"
              searchPlaceholder="Search VAT rate"
              onChange={(value) => updateVatCode(String(value))}
            />
          </TaxDialogRow>

          <TaxDialogRow controlId="tax-vat-percent" label="Percent :">
            <input
              id="tax-vat-percent"
              value={formatPercentField(draftValue.taxDetails.vatPercent)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow controlId="tax-vat-amount" label="VAT Amount :">
            <input
              id="tax-vat-amount"
              value={draftValue.taxDetails.vatAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow controlId="tax-ewt-code" label="EWT Code :">
            <AppAdvancedDropdown
              id="tax-ewt-code"
              value={draftValue.taxDetails.ewtCode}
              emptyMessage="No EWT codes matched the search."
              options={ewtOptions}
              placeholder="--Select EWT code--"
              searchPlaceholder="Search EWT code, rate, or description"
              onChange={(value) => updateEwtCode(String(value))}
            />
          </TaxDialogRow>

          <TaxDialogRow controlId="tax-ewt-percent" label="Percent :">
            <input
              id="tax-ewt-percent"
              value={formatPercentField(draftValue.taxDetails.ewtPercent)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow controlId="tax-ewt-amount" label="EWT Amount :">
            <input
              id="tax-ewt-amount"
              value={draftValue.taxDetails.ewtAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow controlId="tax-amount" label="Amount :">
            <input
              id="tax-amount"
              value={draftValue.taxDetails.amount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>
        </div>

        <div className="border-t border-darknavy/10 px-4 py-3">
          <button
            type="button"
            onClick={() => onSave(draftValue)}
            className="theme-accent-contrast-text inline-flex h-11 w-full items-center justify-center rounded bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
}

function TaxDialogRow({
  children,
  controlId,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  controlId: string;
  isRequired?: boolean;
  label: string;
}) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[7.5rem_1fr]">
      <label htmlFor={controlId} className="text-sm text-darknavy/82">
        {label}
        {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
      </label>
      {children}
    </div>
  );
}

const ReadOnlyFieldClassName =
  "app-theme-field-readonly h-11 w-full rounded-md border px-3 text-sm outline-none";

function formatPercentField(value: number) {
  return `${value.toFixed(2)}%`;
}

export function getVatPercentFromRate(taxRate: string) {
  const seededTaxDetails = createTaxDetails(0, taxRate);

  return seededTaxDetails.vatPercent;
}

export function getEwtPercentFromCode(value: string, taxCodes: AlphanumericTaxCode[]) {
  const matchedTaxRow = taxCodes.find(
    (row) => row.taxType === "EWT" && row.taxCode === value,
  );

  if (matchedTaxRow) {
    return Number(matchedTaxRow.taxRate);
  }

  const matchedPercent = value.match(/(\d+(?:\.\d+)?)(?!.*\d)/);

  return matchedPercent ? Number.parseFloat(matchedPercent[1]) : 0;
}

export function getVatRateFromCode(vatCode: string, taxCodes: AlphanumericTaxCode[]) {
  if (!vatCode) {
    return "0%";
  }

  const matchedTaxRow = taxCodes.find(
    (row) =>
      row.transactionType === "Purchases" &&
      row.taxType === "INPUT VAT" &&
      row.taxCode === vatCode,
  );

  if (matchedTaxRow) {
    return `${matchedTaxRow.taxRate}%`;
  }

  if (vatCode === "VAT-5") {
    return "5%";
  }

  if (vatCode === "VAT-12") {
    return "12%";
  }

  return "0%";
}

export function normalizeVatDropdownValue(
  taxDetails: DisbursementTaxDetails,
  taxCodes: AlphanumericTaxCode[],
) {
  if (!taxDetails.vatCode) {
    return "";
  }

  if (taxCodes.some((row) => row.taxCode === taxDetails.vatCode)) {
    return taxDetails.vatCode;
  }

  const matchedTaxRow = taxCodes.find(
    (row) =>
      row.transactionType === "Purchases" &&
      row.taxType === "INPUT VAT" &&
      Number(row.taxRate) === taxDetails.vatPercent,
  );

  return matchedTaxRow?.taxCode ?? "";
}

export function createVatOptions(taxCodes: AlphanumericTaxCode[]): AppAdvancedDropdownOption[] {
  const uniqueOptions = new Map<string, AppAdvancedDropdownOption>();

  taxCodes.filter(
    (row) =>
      row.transactionType === "Purchases" && row.taxType === "INPUT VAT",
  ).forEach((row) => {
    if (uniqueOptions.has(row.taxCode)) {
      return;
    }

    uniqueOptions.set(row.taxCode, {
      label: `${row.taxRate}%`,
      name: row.taxDescription,
      value: row.taxCode,
    });
  });

  return Array.from(uniqueOptions.values());
}

export function createEwtOptions(taxCodes: AlphanumericTaxCode[]): AppAdvancedDropdownOption[] {
  return taxCodes.filter(
    (row) => row.transactionType === "Purchases" && row.taxType === "EWT",
  ).map((row) => ({
    description: row.taxDescription,
    label: `${row.taxRate}%`,
    name: row.taxCode,
    value: row.taxCode,
  }));
}
