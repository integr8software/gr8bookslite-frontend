import type { ChangeEvent } from "react";

export const moduleDataEntryInputClassName =
  "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm text-darknavy placeholder:text-darknavy/35 shadow-none transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-60 read-only:cursor-default read-only:focus:ring-0";

export function ModuleDataEntryInputCell({
  align = "left",
  className,
  id,
  isInvalid = false,
  name,
  onChange,
  placeholder,
  readOnly,
  type = "text",
  value,
}: {
  align?: "left" | "right" | "center";
  className?: string;
  id: string;
  isInvalid?: boolean;
  name: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: "text" | "date" | "number" | "password" | "email";
  value: string | number;
}) {
  const alignClass =
    align === "right"
      ? "text-right tabular-nums"
      : align === "center"
        ? "text-center"
        : "text-left";

  const invalidClass = isInvalid
    ? "bg-coralpink/10 text-coralpink ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/10 focus:ring-coralpink/60"
    : "";

  const displayValue =
    placeholder === "0.00" && (value === 0 || value === "0" || value === "0.00")
      ? ""
      : value;

  return (
    <>
      <label htmlFor={id} className="sr-only">
        {name}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={displayValue}
        readOnly={readOnly}
        placeholder={placeholder}
        title={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value)}
        className={`${moduleDataEntryInputClassName} ${alignClass} ${invalidClass} ${className ?? ""}`}
      />
    </>
  );
}
