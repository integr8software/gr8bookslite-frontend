"use client";
import { PartyInformationTabOrder } from "@/app/src/constants/modules/party-management/PartyInformationTabsConstants";
import {
  PartyEntityTypeOptions,
  PartyHonorificOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { countErrors } from "@/app/src/data/modules/party-management/PartyInformationTabsData";
import { isPartyEntityTypeWithholdingDefaultEnabled } from "@/app/src/data/modules/party-management/PartyManagementData";
import type {
  PartyInformationDetailsFieldsProps,
  PartyInformationTabId,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { useEffect, useMemo, useRef, useState } from "react";

export function usePartyInformationTabs({
  accountOptions,
  errors,
  isClassificationSelected,
  isPartyCodeReadonly = false,
  isReadonly,
  partyTypeOptions,
  taxDefaultOptionsError = false,
  taxDefaultOptionsLoading = false,
  taxDefaultOptions,
  termOptions,
  responsibilityCenterOptions,
  paymentTypeOptions,
  bankOptions,
  values,
  syncedAddressSources,
  canAddAccountTitle,
  canAddTerm,
  canAddResponsibilityCenter,
  canAddPaymentType,
  canAddBank,
  onAddAccountTitle,
  onAddTerm,
  onAddResponsibilityCenter,
  onAddPaymentType,
  onAddBank,
  onAddressInputChange,
  onCopyAddress,
  onInputChange,
  onPartyTypesChange,
  onSelectBarangay,
  onSelectAutocompleteAddress,
  onSyncAutocompleteAddressDetails,
  onSelectCityMunicipality,
  onSelectProvince,
  onUpdateField,
  onSelectTerm,
  onSelectResponsibilityCenter,
  onSelectPaymentType,
  onSelectBank,
}: PartyInformationDetailsFieldsProps) {
  const [activeTab, setActiveTab] =
    useState<PartyInformationTabId>("basic-information");
  const isPartyTypeSelected = values.partyTypes.length > 0;
  const isDetailsDisabled =
    isReadonly || !isClassificationSelected || !isPartyTypeSelected;
  const showBusinessNameFields = values.classification !== "Individual";
  const showPersonalInfoFields =
    values.partyTypes.includes("Employee") ||
    values.partyTypes.includes("Member");
  const showMemberRegistrationDate = values.partyTypes.includes("Member");
  const isMember = values.partyTypes.includes("Member");
  const showPartyEntityTypeField =
    values.classification === "Non-Individual" && isPartyTypeSelected;
  const showWithholdingDefaults = isPartyEntityTypeWithholdingDefaultEnabled(
    values.partyEntityType,
  );
  const visiblePartyTypeOptions =
    values.classification === "Non-Individual"
      ? partyTypeOptions.filter(
          (type) => type !== "Employee" && type !== "Member",
        )
      : partyTypeOptions;
  const partyTypeSelectOptions = visiblePartyTypeOptions.map((type) => ({
    name: type,
    value: type,
  }));
  const partyEntityTypeSelectOptions = [...PartyEntityTypeOptions]
    .filter((option) => option.classificationScope === values.classification)
    .sort(
      (leftOption, rightOption) => leftOption.sortOrder - rightOption.sortOrder,
    )
    .map((option) => ({
      description: option.description,
      name: option.name,
      value: option.name,
    }));
  const honorificOptions = PartyHonorificOptions.map((honorific) => ({
    description: "description" in honorific ? honorific.description : undefined,
    name: honorific.name,
    value: honorific.name,
  }));
  const basicErrorCount = countErrors(errors, [
    "partyCodeNo",
    "classification",
    "partyEntityType",
    "partyTypes",
    "status",
    "partyName",
    "firstName",
    "lastName",
    "gender",
    "civilStatus",
    "nationality",
    "memberRegistrationDate",
  ]);
  const contactErrorCount = countErrors(errors, [
    "contactPerson",
    "email",
    "contactNo",
    "landline",
    "addresses",
    "addressLine1",
    "addressLine2",
    "regionCode",
    "provinceCode",
    "cityMunicipalityCode",
    "barangayCode",
  ]);
  const bankErrorCount = countErrors(errors, [
    "defaultPaymentTypeId",
    "defaultBank",
    "defaultBankAccountNo",
  ]);
  const taxErrorCount = countErrors(errors, [
    "tin",
    "defaultPurchaseInputVatTaxSourceKey",
    "defaultPurchaseEwtTaxSourceKey",
    "defaultPurchaseFwtTaxSourceKey",
    "defaultPurchaseWvatTaxSourceKey",
    "defaultSalesOutputVatTaxSourceKey",
    "defaultSalesCwtTaxSourceKey",
    "defaultSalesWvatTaxSourceKey",
  ]);
  const accountingErrorCount = countErrors(errors, [
    "termId",
    "defaultResponsibilityCenterId",
    "defaultReceivableAccount",
    "customerAdvanceAccount",
    "defaultPayableAccount",
    "vendorAdvanceAccount",
    "employeeAdvanceAccount",
    "employeePayableAccount",
    "cashAdvanceLimit",
    "purchaseType",
  ]);
  const tabErrorCounts = useMemo(
    () =>
      ({
        "basic-information": basicErrorCount,
        "contact-information": contactErrorCount,
        "bank-information": bankErrorCount,
        "tax-information": taxErrorCount,
        "accounting-information": accountingErrorCount,
      }) satisfies Record<PartyInformationTabId, number>,
    [
      accountingErrorCount,
      bankErrorCount,
      basicErrorCount,
      contactErrorCount,
      taxErrorCount,
    ],
  );
  const totalErrorCount =
    basicErrorCount +
    contactErrorCount +
    bankErrorCount +
    taxErrorCount +
    accountingErrorCount;
  const previousTotalErrorCountRef = useRef(totalErrorCount);
  useEffect(() => {
    if (previousTotalErrorCountRef.current === 0 && totalErrorCount > 0) {
      const firstTabWithErrors = PartyInformationTabOrder.find(
        (tabId) => tabErrorCounts[tabId] > 0,
      );

      if (firstTabWithErrors) {
        queueMicrotask(() => setActiveTab(firstTabWithErrors));
      }
    }

    previousTotalErrorCountRef.current = totalErrorCount;
  }, [tabErrorCounts, totalErrorCount]);
  return {
    errors,
    isClassificationSelected,
    isPartyCodeReadonly,
    isReadonly,
    values,
    onInputChange,
    onPartyTypesChange,
    onUpdateField,
    isDetailsDisabled,
    showBusinessNameFields,
    showPersonalInfoFields,
    showMemberRegistrationDate,
    isMember,
    showPartyEntityTypeField,
    partyTypeSelectOptions,
    partyEntityTypeSelectOptions,
    honorificOptions,
    syncedAddressSources,
    onAddressInputChange,
    onCopyAddress,
    onSelectBarangay,
    onSelectAutocompleteAddress,
    onSyncAutocompleteAddressDetails,
    onSelectCityMunicipality,
    onSelectProvince,
    paymentTypeOptions,
    bankOptions,
    canAddPaymentType,
    canAddBank,
    onAddPaymentType,
    onAddBank,
    onSelectPaymentType,
    onSelectBank,
    taxDefaultOptionsError,
    taxDefaultOptionsLoading,
    taxDefaultOptions,
    showWithholdingDefaults,
    accountOptions,
    termOptions,
    responsibilityCenterOptions,
    canAddAccountTitle,
    canAddTerm,
    canAddResponsibilityCenter,
    onAddAccountTitle,
    onAddTerm,
    onAddResponsibilityCenter,
    onSelectTerm,
    onSelectResponsibilityCenter,
    basicErrorCount,
    contactErrorCount,
    bankErrorCount,
    taxErrorCount,
    accountingErrorCount,
    activeTab,
    setActiveTab,
  };
}
