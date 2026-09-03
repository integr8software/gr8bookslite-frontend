import type { ChangeEvent } from "react";

export const moduleDataEntryInputClassName =
  "h-10 w-full min-w-0 rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy placeholder:text-darknavy/35 shadow-none transition focus:outline-none focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35 read-only:cursor-default read-only:focus:ring-0 read-only:bg-offwhite/45 read-only:text-darknavy/70";

export function ModuleDataEntryInputCell({
  align = "left",
  className,
  id,
  isInvalid = false,
  isWarning = false,
  name,
  onChange,
  placeholder,
  readOnly,
  title,
  type = "text",
  value,
}: {
  align?: "left" | "right" | "center";
  className?: string;
  id: string;
  isInvalid?: boolean;
  isWarning?: boolean;
  name: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  title?: string;
  type?: "text" | "date" | "number" | "password" | "email";
  value: string | number;
}) {
  const alignClass =
    align === "right"
      ? "text-right tabular-nums"
      : align === "center"
        ? "text-center"
        : "text-left";

  const statusClass = isInvalid
    ? "bg-coralpink/10 text-coralpink ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/10 focus:ring-coralpink/60"
    : isWarning
      ? "bg-amber-500/10 text-darknavy ring-2 ring-inset ring-amber-400 focus:bg-amber-500/10 focus:ring-amber-500"
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
        title={title ?? placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value)}
        className={`${moduleDataEntryInputClassName} ${alignClass} ${statusClass} ${className ?? ""}`}
      />
    </>
  );
}
