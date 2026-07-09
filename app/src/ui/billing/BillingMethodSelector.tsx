"use client";

import { Building2, Check, CreditCard, QrCode, Repeat2, Smartphone } from "lucide-react";
import type { ReactNode } from "react";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type BillingMethodSelectorProps = {
  disabled?: boolean;
  mode: BillingMode;
  onChange: (mode: BillingMode) => void;
};

const ManualMethods = [
  "GCash",
  "Maya",
  "QRPh",
  "Visa / Mastercard",
  "BPI Direct Debit",
  "UBP Direct Debit",
];

export function BillingMethodSelector({
  disabled,
  mode,
  onChange,
}: BillingMethodSelectorProps) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold text-darknavy">Billing method</p>
      <div className="grid gap-3 xl:grid-cols-2">
        <BillingMethodOption
          checked={mode === "MANUAL"}
          disabled={disabled}
          icon={<QrCode className="h-5 w-5" aria-hidden="true" />}
          label="Manual Payment"
          helper="Pay every billing cycle through hosted checkout. No saved payment method and no automatic deduction."
          onSelect={() => onChange("MANUAL")}
        >
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ManualMethods.map((method) => (
              <span
                key={method}
                className={joinClasses(
                  "inline-flex min-w-0 items-center gap-2 text-xs font-semibold",
                  mode === "MANUAL" ? "text-offwhite/82" : "text-darknavy/70",
                )}
              >
                <Check
                  className={joinClasses(
                    "h-3.5 w-3.5 shrink-0",
                    mode === "MANUAL" ? "text-citron" : "text-emerald-600",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{method}</span>
              </span>
            ))}
          </div>
        </BillingMethodOption>

        <BillingMethodOption
          checked={mode === "AUTO"}
          disabled={disabled}
          icon={<Repeat2 className="h-5 w-5" aria-hidden="true" />}
          label="Auto Renewal"
          helper="Save a payment method and renew automatically every billing cycle. Cancel anytime."
          onSelect={() => onChange("AUTO")}
        >
          <div
            className={joinClasses(
              "mt-4 grid gap-2 text-xs font-semibold",
              mode === "AUTO" ? "text-offwhite/82" : "text-darknavy/70",
            )}
          >
            <span className="inline-flex items-center gap-2">
              <CreditCard
                className={joinClasses(
                  "h-3.5 w-3.5 shrink-0",
                  mode === "AUTO" ? "text-citron" : "text-skyblue",
                )}
                aria-hidden="true"
              />
              Saved card payment setup
            </span>
            <span className="inline-flex items-center gap-2">
              <Smartphone
                className={joinClasses(
                  "h-3.5 w-3.5 shrink-0",
                  mode === "AUTO" ? "text-citron" : "text-skyblue",
                )}
                aria-hidden="true"
              />
              PayMongo authentication when required
            </span>
            <span className="inline-flex items-center gap-2">
              <Building2
                className={joinClasses(
                  "h-3.5 w-3.5 shrink-0",
                  mode === "AUTO" ? "text-citron" : "text-skyblue",
                )}
                aria-hidden="true"
              />
              Automatic renewal through subscription billing
            </span>
          </div>
        </BillingMethodOption>
      </div>
    </div>
  );
}

function BillingMethodOption({
  checked,
  children,
  disabled,
  helper,
  icon,
  label,
  onSelect,
}: {
  checked: boolean;
  children: ReactNode;
  disabled?: boolean;
  helper: string;
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={joinClasses(
        "min-h-[13rem] rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 disabled:cursor-not-allowed disabled:opacity-60",
        checked
          ? "border-darknavy/65 bg-darknavy text-offwhite shadow-sm"
          : "border-darknavy/12 bg-white text-darknavy hover:border-skyblue/55 hover:bg-skyblue/5",
      )}
      aria-pressed={checked}
    >
      <span className="flex items-start gap-3">
        <span
          className={joinClasses(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            checked ? "bg-offwhite/14 text-offwhite" : "bg-skyblue/12 text-darknavy",
          )}
        >
          {icon}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-base font-semibold">
            <span
              className={joinClasses(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                checked
                  ? "border-citron bg-citron text-darknavy"
                  : "border-darknavy/25 bg-white",
              )}
            >
              {checked ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
            </span>
            {label}
          </span>
          <span
            className={joinClasses(
              "mt-2 block text-sm leading-6",
              checked ? "text-offwhite/74" : "text-darknavy/62",
            )}
          >
            {helper}
          </span>
        </span>
      </span>
      <span
        className={joinClasses(
          checked ? "text-offwhite/82" : "text-darknavy",
        )}
      >
        {children}
      </span>
    </button>
  );
}
