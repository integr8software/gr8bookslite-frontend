import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

export const moduleDataEntryMoneyClassName =
  "h-10 w-full rounded-none border-0 bg-transparent px-3 text-right tabular-nums text-sm text-darknavy placeholder:text-darknavy/35 shadow-none transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-60 read-only:cursor-default read-only:focus:ring-0";

export function ModuleDataEntryMoneyCell({
  className,
  id,
  name,
  onChange,
  placeholder,
  readOnly,
  value,
}: {
  className?: string;
  id: string;
  name: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string | number;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {name}
      </label>
      <MoneyNumberField
        id={id}
        name={name}
        value={String(value ?? "")}
        readOnly={readOnly}
        placeholder={placeholder}
        onValueChange={onChange ?? (() => undefined)}
        className={`${moduleDataEntryMoneyClassName} ${className ?? ""}`}
      />
    </>
  );
}
