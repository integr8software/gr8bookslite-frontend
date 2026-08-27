import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

export const moduleDataEntryMoneyClassName =
  "h-10 w-full rounded-none border-0 bg-transparent px-3 text-right tabular-nums text-sm text-darknavy placeholder:text-darknavy/35 shadow-none transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-60 read-only:cursor-default read-only:focus:ring-0";

export function ModuleDataEntryMoneyCell({
  className,
  id,
  isInvalid = false,
  name,
  onChange,
  placeholder = "0.00",
  readOnly,
  value,
}: {
  className?: string;
  id: string;
  isInvalid?: boolean;
  name: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string | number;
}) {
  const displayValue =
    value === 0 || value === "0" || value === "0.00" || value === null || value === undefined
      ? ""
      : String(value);

  const invalidClass = isInvalid
    ? "bg-coralpink/10 text-coralpink ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/10 focus:ring-coralpink/60"
    : "";

  return (
    <>
      <label htmlFor={id} className="sr-only">
        {name}
      </label>
      <MoneyNumberField
        id={id}
        name={name}
        value={displayValue}
        readOnly={readOnly}
        placeholder={placeholder}
        onValueChange={onChange ?? (() => undefined)}
        className={`${moduleDataEntryMoneyClassName} ${invalidClass} ${className ?? ""}`}
      />
    </>
  );
}
