import type { ReactNode } from "react";
import type { usePettyCashVoucherFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherFormPage";

export type PettyCashVoucherFormPageState = ReturnType<
  typeof usePettyCashVoucherFormPage
>;

export const inputClassName = [
  "app-data-entry-field h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3",
  "text-sm text-darknavy outline-none transition focus:border-skyblue",
  "focus:ring-2 focus:ring-skyblue/20",
].join(" ");

export const secondaryButtonClassName = [
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border",
  "border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy",
  "transition hover:bg-skyblue/10",
].join(" ");

export const primaryButtonClassName = [
  "inline-flex h-10 min-w-24 items-center justify-center gap-2",
  "rounded-lg bg-darknavy px-4 text-sm font-semibold text-white",
  "transition hover:bg-darknavy/90",
].join(" ");

export function Field({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-darknavy/70">{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}
