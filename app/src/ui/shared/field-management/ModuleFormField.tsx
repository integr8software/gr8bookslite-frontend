"use client";

import { isValidElement, useId, type MouseEventHandler, type ReactNode } from "react";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";
import { joinClasses } from "@/app/src/ui/shared/main-layout/utils";

export type ModuleFormFieldProps = {
  children: ReactNode;
  className?: string;
  error?: string | null;
  helper?: string | null;
  htmlFor?: string;
  id?: string;
  label?: ReactNode;
  labelClassName?: string;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  required?: boolean;
  warning?: string | null;
};

export type ModuleReadonlyFieldProps = {
  children: ReactNode;
  className?: string;
  label: ReactNode;
  labelClassName?: string;
};

export function ModuleFormField({
  children,
  className,
  error,
  helper,
  htmlFor,
  id,
  label,
  labelClassName,
  onMouseDown,
  required,
  warning,
}: ModuleFormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor ?? id ?? (isValidElement<{ id?: string }>(children) ? (children.props.id ?? generatedId) : generatedId);

  return (
    <div className={className} onMouseDown={onMouseDown}>
      {label ? (
        <label htmlFor={fieldId} className={joinClasses("mb-2 block text-sm font-semibold text-darknavy", labelClassName)}>
          {label}
          {typeof label === "string" ? (
            <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={required} label={label} leadingSpace />
          ) : required ? (
            <span className="ml-1 text-coralpink">*</span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span>
      ) : warning ? (
        <span className="mt-1 block text-xs font-medium text-amber-600">{warning}</span>
      ) : helper ? (
        <span className="mt-1 block text-xs font-medium text-darknavy/55">{helper}</span>
      ) : null}
    </div>
  );
}

export const FormField = ModuleFormField;
export type FormFieldProps = ModuleFormFieldProps;

export function ModuleReadonlyField({ children, className, label, labelClassName }: ModuleReadonlyFieldProps) {
  return (
    <ModuleFormField className={className} label={label} labelClassName={labelClassName}>
      <div className="min-h-11 rounded-md border border-darknavy/10 bg-darknavy/[0.03] px-3 py-2.5 text-sm font-medium text-darknavy">
        {children}
      </div>
    </ModuleFormField>
  );
}

export const ReadonlyField = ModuleReadonlyField;
export type ReadonlyFieldProps = ModuleReadonlyFieldProps;
