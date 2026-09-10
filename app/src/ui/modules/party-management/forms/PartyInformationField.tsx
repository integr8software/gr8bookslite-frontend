"use client";
import { PartyManagementFieldControlSelector } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import type { PartyInformationFieldProps } from "@/app/src/types/modules/party-management/PartyInformationTabsTypes";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";
import { type MouseEvent as ReactMouseEvent } from "react";

export function Field({
  children,
  error,
  label,
  required,
}: PartyInformationFieldProps) {
  function handleFieldMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (
      !(target instanceof Element) ||
      target.closest(PartyManagementFieldControlSelector)
    ) {
      return;
    }

    const control = event.currentTarget.querySelector<HTMLElement>(
      PartyManagementFieldControlSelector,
    );

    if (
      !control ||
      control.matches(":disabled") ||
      control.getAttribute("aria-disabled") === "true"
    ) {
      return;
    }

    event.preventDefault();
    control.focus();

    if (control.getAttribute("role") === "combobox") {
      control.click();
    }
  }

  return (
    <FormField
      error={error}
      label={label}
      onMouseDown={handleFieldMouseDown}
      required={required}
    >
      {children}
    </FormField>
  );
}
