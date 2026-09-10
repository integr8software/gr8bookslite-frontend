import { PartyAccountingAccountFieldLabels } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import type { TaxDefaultLoadState } from "@/app/src/types/modules/party-management/PartyInformationTabsTypes";
import type {
  PartyAccountingAccountField,
  PartyInformationDetailsFieldsProps,
  PartyInformationFormErrors,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";

export function getTaxDefaultLoadState(
  isLoading: boolean,
  isError: boolean,
): TaxDefaultLoadState {
  if (isLoading) {
    return "loading";
  }

  if (isError) {
    return "error";
  }

  return "ready";
}

export function getTaxDefaultEmptyMessage(loadState: TaxDefaultLoadState) {
  if (loadState === "loading") {
    return "Loading tax records...";
  }

  if (loadState === "error") {
    return "Unable to load tax records. Check your session and try again.";
  }

  return "No matching tax records found.";
}

export function createAccountAddAction(
  field: PartyAccountingAccountField,
  canAddAccountTitle?: boolean,
  disabled?: boolean,
  onAddAccountTitle?: PartyInformationDetailsFieldsProps["onAddAccountTitle"],
) {
  return canAddAccountTitle && onAddAccountTitle
    ? {
        disabled,
        label: `Add ${PartyAccountingAccountFieldLabels[field]} Title`,
        onClick: () => onAddAccountTitle(field),
      }
    : undefined;
}

export function countErrors(
  errors: PartyInformationFormErrors,
  fields: Array<keyof PartyInformationFormErrors>,
) {
  return fields.filter((field) => Boolean(errors[field])).length;
}

export function getSingleSelectedValue(value: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? "") : value;
}
