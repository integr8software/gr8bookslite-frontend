import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

export const moduleDataEntryMoneyClassName =
  "h-10 min-w-0 w-full rounded-none border-0 bg-transparent px-3 text-right tabular-nums text-sm font-medium text-darknavy placeholder:text-darknavy/35 shadow-none transition focus:outline-none focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35 read-only:cursor-default read-only:focus:ring-0 read-only:bg-offwhite/45 read-only:text-darknavy/70";

export function ModuleDataEntryMoneyCell({
  className,
  id,
  isInvalid = false,
  isWarning = false,
  name,
  onChange,
  placeholder = "0.00",
  readOnly,
  title,
  value,
}: {
  className?: string;
  id: string;
  isInvalid?: boolean;
  isWarning?: boolean;
  name: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  title?: string;
  value: string | number;
}) {
  const displayValue =
    value === 0 || value === "0" || value === "0.00" || value === null || value === undefined
      ? ""
      : String(value);

  const statusClass = isInvalid
    ? "bg-coralpink/10 text-coralpink ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/10 focus:ring-coralpink/60"
    : isWarning
      ? "bg-amber-500/10 text-darknavy ring-2 ring-inset ring-amber-400 focus:bg-amber-500/10 focus:ring-amber-500"
      : "";

  return (
    <>
      <label htmlFor={id} className="sr-only">
        {name}
      </label>
      <MoneyNumberField
        id={id}
        name={name}
        title={title}
        value={displayValue}
        readOnly={readOnly}
        placeholder={placeholder}
        onValueChange={onChange ?? (() => undefined)}
        className={`${moduleDataEntryMoneyClassName} ${statusClass} ${className ?? ""}`}
      />
    </>
  );
}
