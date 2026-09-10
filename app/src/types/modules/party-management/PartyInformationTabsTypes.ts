import type { usePartyInformationTabs } from "@/app/src/hooks/modules/party-management/usePartyInformationTabs";
import type {
  PartyAccountingAccountOptions,
  PartyInformationDetailsFieldsProps,
  PartyInformationFieldUpdateHandler,
  PartyInformationFormErrors,
  PartyInformationFormValues,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { PartyTaxDefaultClassificationKey } from "@/app/src/types/shared/tax/TaxTypes";
import { type ReactNode } from "react";

export type TaxDefaultLoadState = "error" | "loading" | "ready";

export type PartyInformationFieldProps = {
  children: ReactNode;
  error?: string;
  label: string;
  required?: boolean;
};

export type PartyInformationStatusFieldProps = {
  error?: string;
  isReadonly: boolean;
  value: PartyInformationFormValues["status"];
  onValueChange: (value: PartyInformationFormValues["status"]) => void;
};

export type PartyTaxDefaultFieldProps = {
  disabled: boolean;
  error?: string;
  field: PartyTaxDefaultClassificationKey;
  label: string;
  loadState: TaxDefaultLoadState;
  options: PartyInformationDetailsFieldsProps["taxDefaultOptions"][PartyTaxDefaultClassificationKey];
  value: string;
  onUpdateField: PartyInformationFieldUpdateHandler;
};

export type PartyTaxDefaultGroupProps = { children: ReactNode; title: string };

export type PartyAccountingFieldsProps = {
  accountOptions: PartyAccountingAccountOptions;
  canAddAccountTitle?: boolean;
  canAddResponsibilityCenter?: boolean;
  canAddTerm?: boolean;
  disabled: boolean;
  errors: PartyInformationFormErrors;
  responsibilityCenterOptions?: AppAdvancedDropdownOption[];
  termOptions: PartyInformationDetailsFieldsProps["termOptions"];
  values: PartyInformationFormValues;
  onAddAccountTitle?: PartyInformationDetailsFieldsProps["onAddAccountTitle"];
  onAddResponsibilityCenter?: PartyInformationDetailsFieldsProps["onAddResponsibilityCenter"];
  onAddTerm?: PartyInformationDetailsFieldsProps["onAddTerm"];
  onSelectResponsibilityCenter?: PartyInformationDetailsFieldsProps["onSelectResponsibilityCenter"];
  onSelectTerm: PartyInformationDetailsFieldsProps["onSelectTerm"];
  onUpdateField: PartyInformationFieldUpdateHandler;
};

export type PartyTabCommonProps = Pick<
  ReturnType<typeof usePartyInformationTabs>,
  "errors" | "isDetailsDisabled" | "onUpdateField" | "values"
>;

export type PartyBasicInformationTabProps = PartyTabCommonProps &
  Pick<
    ReturnType<typeof usePartyInformationTabs>,
    | "isClassificationSelected"
    | "isPartyCodeReadonly"
    | "isReadonly"
    | "onInputChange"
    | "onPartyTypesChange"
    | "showBusinessNameFields"
    | "showPersonalInfoFields"
    | "showMemberRegistrationDate"
    | "isMember"
    | "showPartyEntityTypeField"
    | "partyTypeSelectOptions"
    | "partyEntityTypeSelectOptions"
    | "honorificOptions"
  >;

export type PartyContactInformationTabProps = PartyTabCommonProps &
  Pick<
    ReturnType<typeof usePartyInformationTabs>,
    | "isReadonly"
    | "syncedAddressSources"
    | "onAddressInputChange"
    | "onCopyAddress"
    | "onInputChange"
    | "onSelectBarangay"
    | "onSelectAutocompleteAddress"
    | "onSyncAutocompleteAddressDetails"
    | "onSelectCityMunicipality"
    | "onSelectProvince"
  >;

export type PartyBankInformationTabProps = PartyTabCommonProps &
  Pick<
    ReturnType<typeof usePartyInformationTabs>,
    | "isReadonly"
    | "paymentTypeOptions"
    | "bankOptions"
    | "canAddPaymentType"
    | "canAddBank"
    | "onAddPaymentType"
    | "onAddBank"
    | "onInputChange"
    | "onSelectPaymentType"
    | "onSelectBank"
  >;

export type PartyTaxInformationTabProps = PartyTabCommonProps &
  Pick<
    ReturnType<typeof usePartyInformationTabs>,
    | "isReadonly"
    | "taxDefaultOptionsError"
    | "taxDefaultOptionsLoading"
    | "taxDefaultOptions"
    | "onInputChange"
    | "showWithholdingDefaults"
  >;

export type PartyAccountingInformationTabProps = PartyTabCommonProps &
  Pick<
    ReturnType<typeof usePartyInformationTabs>,
    | "accountOptions"
    | "termOptions"
    | "responsibilityCenterOptions"
    | "canAddAccountTitle"
    | "canAddTerm"
    | "canAddResponsibilityCenter"
    | "onAddAccountTitle"
    | "onAddTerm"
    | "onAddResponsibilityCenter"
    | "onSelectTerm"
    | "onSelectResponsibilityCenter"
  >;
