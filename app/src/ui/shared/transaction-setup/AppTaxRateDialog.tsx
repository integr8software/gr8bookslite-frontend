"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementTaxDetails } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

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

  function updateTaxRate(nextTaxRate: string) {
    setDraftValue((current) => {
      const nextTaxDetails = syncTaxDetailsAmount(
        {
          ...current.taxDetails,
          vatCode: nextTaxRate !== "0%" ? `VAT-${nextTaxRate.replace("%", "")}` : "",
          vatPercent: getVatPercentFromRate(nextTaxRate),
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
      const nextEwtPercent = getEwtPercentFromCode(nextEwtCode);
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
      className="fixed inset-0 z-[90] flex items-center justify-center bg-darknavy/45 px-4 py-6 backdrop-blur-sm"
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
        <div className="flex items-center justify-between border-b border-darknavy/10 px-4 py-3">
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
          <TaxDialogRow label="Gross Amount :">
            <input
              value={draftValue.taxDetails.grossAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="Net Amount :">
            <input
              value={draftValue.taxDetails.netAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="VAT Code :">
            <select
              value={draftValue.taxRate}
              onChange={(event) => updateTaxRate(event.target.value)}
              className={FieldClassName}
            >
              <option value="0%">--Select VAT Rate--</option>
              <option value="1%">VAT 1%</option>
              <option value="2%">VAT 2%</option>
              <option value="5%">VAT 5%</option>
              <option value="10%">VAT 10%</option>
              <option value="12%">VAT 12%</option>
            </select>
          </TaxDialogRow>

          <TaxDialogRow label="Percent :">
            <input
              value={formatPercentField(draftValue.taxDetails.vatPercent)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="VAT Amount :">
            <input
              value={draftValue.taxDetails.vatAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="EWT Code :">
            <select
              value={draftValue.taxDetails.ewtCode}
              onChange={(event) => updateEwtCode(event.target.value)}
              className={FieldClassName}
            >
              <option value="">--Select EWT Code--</option>
              <option value="EWT-1">EWT-1</option>
              <option value="EWT-2">EWT-2</option>
              <option value="EWT-5">EWT-5</option>
            </select>
          </TaxDialogRow>

          <TaxDialogRow label="Percent :">
            <input
              value={formatPercentField(draftValue.taxDetails.ewtPercent)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="EWT Amount :">
            <input
              value={draftValue.taxDetails.ewtAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="Amount :">
            <input
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
            className="theme-accent-contrast-text inline-flex h-11 w-full items-center justify-center rounded bg-skyblue px-4 text-sm font-semibold shadow-[0_12px_30px_rgb(var(--skyblue-rgb)/0.24)] transition hover:bg-skyblue/85"
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
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[7.5rem_1fr]">
      <label className="text-sm text-darknavy/82">{label}</label>
      {children}
    </div>
  );
}

const FieldClassName =
  "h-11 w-full rounded-md border border-darknavy/12 bg-offwhite/80 px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/40 focus:bg-white";

const ReadOnlyFieldClassName =
  "h-11 w-full rounded-md border border-darknavy/12 bg-darknavy/[0.04] px-3 text-sm text-darknavy/70 outline-none";

function formatPercentField(value: number) {
  return `${value.toFixed(2)}%`;
}

function getVatPercentFromRate(taxRate: string) {
  const seededTaxDetails = createTaxDetails(0, taxRate);

  return seededTaxDetails.vatPercent;
}

function getEwtPercentFromCode(value: string) {
  if (value === "EWT-1") {
    return 1;
  }

  if (value === "EWT-2") {
    return 2;
  }

  if (value === "EWT-5") {
    return 5;
  }

  return 0;
}
