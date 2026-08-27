import { cloneElement, isValidElement, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

export const TransactionFieldClassName = [
  "app-data-entry-field h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3",
  "text-sm font-medium text-darknavy outline-none transition focus:border-skyblue",
  "placeholder:text-darknavy/35 focus:ring-2 focus:ring-skyblue/20",
].join(" ");

export type TransactionFieldProps = {
  children: ReactNode;
  compact?: boolean;
  controlId?: string;
  error?: string;
  isRequired?: boolean;
  label: string;
};

export function TransactionField({
  children,
  compact = false,
  controlId: providedControlId,
  error,
  isRequired = false,
  label,
}: TransactionFieldProps) {
  const generatedId = useId();
  const isLabelableChild =
    isValidElement(children) &&
    (typeof children.type !== "string" || ["button", "input", "select", "textarea"].includes(children.type));
  const controlId = providedControlId ?? (isLabelableChild ? generatedId : undefined);
  const fieldControl = controlId && isValidElement<{ id?: string }>(children)
    ? cloneElement(children, { id: children.props.id ?? controlId })
    : children;
  const labelContent = (
    <>
      {label}
      <ModuleFieldRequiredMark fallbackRequired={isRequired} label={label} />
    </>
  );

  if (compact) {
    return (
      <div className="grid min-w-0 gap-2">
        {controlId ? (
          <label htmlFor={controlId} className="text-sm font-semibold text-darknavy">
            {labelContent}
          </label>
        ) : (
          <span className="text-sm font-semibold text-darknavy">{labelContent}</span>
        )}
        {fieldControl}
        {error ? <span className="text-xs font-medium text-coralpink">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
          {labelContent}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">{labelContent}</span>
      )}
      <div className="min-w-0">
        {fieldControl}
        {error ? <span className="mt-1.5 block text-xs font-semibold text-coralpink">{error}</span> : null}
      </div>
    </div>
  );
}

export type TransactionTextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "onChange" | "readOnly" | "value"> & {
  error?: string;
  isMoney?: boolean;
  isReadonly?: boolean;
  isRequired?: boolean;
  label: string;
  onValueChange: (value: string) => void;
  value: string;
};

export function TransactionTextField({
  error,
  isMoney = false,
  isReadonly = false,
  isRequired = false,
  label,
  onValueChange,
  placeholder,
  type = "text",
  value,
  ...inputProps
}: TransactionTextFieldProps) {
  const generatedId = useId();
  const controlId = inputProps.id ?? generatedId;
  const className = [
    TransactionFieldClassName,
    isMoney ? "text-right tabular-nums" : "",
    isReadonly ? "transaction-readonly-placeholder" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TransactionField controlId={controlId} label={label} error={error} isRequired={isRequired}>
      {isMoney ? (
        <MoneyNumberField
          {...inputProps}
          id={controlId}
          value={value}
          readOnly={isReadonly}
          onValueChange={onValueChange}
          className={className}
          placeholder={placeholder}
        />
      ) : (
        <input
          {...inputProps}
          id={controlId}
          type={type}
          value={value}
          readOnly={isReadonly}
          onChange={(event) => onValueChange(event.target.value)}
          className={className}
          placeholder={placeholder}
        />
      )}
    </TransactionField>
  );
}
