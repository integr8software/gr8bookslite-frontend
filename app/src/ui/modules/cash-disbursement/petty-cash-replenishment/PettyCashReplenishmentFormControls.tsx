import type { ReactNode } from "react";
import type { usePettyCashReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentFormPage";

export type PettyCashReplenishmentFormPageState = ReturnType<
  typeof usePettyCashReplenishmentFormPage
>;

export const inputClassName = [
  "app-data-entry-field h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3",
  "text-sm text-darknavy outline-none transition focus:border-skyblue",
  "focus:ring-2 focus:ring-skyblue/20",
].join(" ");

export const readOnlyClassName = [
  "app-data-entry-field h-10 w-full rounded-lg border border-darknavy/10 bg-white",
  "px-3 text-sm text-darknavy outline-none",
].join(" ");

export const buttonBaseClassName = [
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4",
  "text-sm font-semibold transition",
].join(" ");

export const secondaryButtonClassName = [
  buttonBaseClassName,
  "border border-darknavy/10 bg-white text-darknavy hover:bg-slate-50",
].join(" ");

export const outlineButtonClassName = [
  buttonBaseClassName,
  "border border-darknavy/10 bg-white text-darknavy hover:bg-skyblue/10",
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
    <label className="grid gap-2 text-sm">
      <span className="text-sm font-semibold text-darknavy/70">{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}

export function ReadOnlyTotal({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-darknavy/80">{label}</p>
      <div className={readOnlyClassName}>{value}</div>
    </div>
  );
}
