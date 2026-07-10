"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  PartyManagementEditFromParam,
  PartyManagementEditFromViewQuery,
  PartyManagementEditFromViewValue,
  PartyManagementHref,
  PartyTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import {
  PartyInformationInitialFormValues,
  applyPartyDefaultAccountingAccounts,
  clearAddressRolesForPartyTypes,
  createPartyInformationFormValues,
  createPartyInformationRecord,
  isKnownPartyType,
  normalizePartyTypesForClassification,
  updatePartyInformationRecord,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { useTermDropdownOptions } from "@/app/src/hooks/modules/maintenance/term-management/useTermDropdownOptions";
import { usePartyAtcCodeOptions } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useAddressOptions } from "@/app/src/hooks/shared/address/useAddressOptions";
import type {
  PartyAddress,
  PartyInformationActionMode,
  PartyInformationFormErrors,
  PartyInformationFormValues,
  PartyInformationStatus,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { validatePartyInformationForm } from "@/app/src/validations/modules/maintenance/party-management/PartyManagementValidation";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import type {
  AddressAutocompleteDetails,
  AddressAutocompleteItem,
} from "@/app/src/types/shared/address/AddressTypes";

export function usePartyManagementAction() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const partyManagement = usePartyManagementStore();
  const termDropdown = useTermDropdownOptions();
  const mode = getActionMode(pathname);
  const openedFromView =
    mode === "edit" &&
    searchParams.get(PartyManagementEditFromParam) ===
      PartyManagementEditFromViewValue;
  const existingRecord = partyManagement.records.find(
    (record) => record.id === params.recordId,
  );
  const [values, setValues] = useState<PartyInformationFormValues>(() =>
    existingRecord
      ? createPartyInformationFormValues(existingRecord)
      : PartyInformationInitialFormValues,
  );
  const [errors, setErrors] = useState<PartyInformationFormErrors>({});
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const activeAddress =
    values.addresses.find((address) => address.id === values.activeAddressId) ??
    values.addresses[0] ??
    values.address;
  const addressOptions = useAddressOptions({
    barangayCode: activeAddress.barangayCode,
    barangayName: activeAddress.barangay,
    cityMunicipalityCode: activeAddress.cityMunicipalityCode,
    cityMunicipalityName: activeAddress.cityMunicipality,
    provinceCode: activeAddress.provinceCode,
    provinceName: activeAddress.province,
    regionCode: activeAddress.regionCode,
    regionName: activeAddress.region,
  });
  const isReadonly = mode === "view";
  const isClassificationSelected = Boolean(values.classification);
  const canSave = isClassificationSelected && values.partyTypes.length > 0;
  const nextStatus: PartyInformationStatus =
    existingRecord?.status === "Active" ? "Inactive" : "Active";
  const atcDropdown = usePartyAtcCodeOptions(values.classification);
  const accountOptions = useMemo(
    () =>
      getModuleChartAccounts({
        moduleKey: "maintenance-party-management",
      }),
    [],
  );
  const viewHref = existingRecord
    ? `${PartyManagementHref}/view/${existingRecord.id}`
    : PartyManagementHref;
  const cancelHref =
    mode === "edit" && openedFromView ? viewHref : PartyManagementHref;
  const editHref = existingRecord
    ? `${PartyManagementHref}/edit/${existingRecord.id}?${PartyManagementEditFromViewQuery}`
    : undefined;

  function updateField<TKey extends keyof PartyInformationFormValues>(
    field: TKey,
    value: PartyInformationFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      if (field === "classification") {
        const classification =
          value as PartyInformationFormValues["classification"];
        const partyTypes = normalizePartyTypesForClassification(
          current.partyTypes,
          classification,
        );
        const accountingAccounts = applyPartyDefaultAccountingAccounts(
          current,
          partyTypes,
        );

        return {
          ...current,
          classification,
          partyTypes,
          partyName: "",
          tradeName: "",
          firstName: "",
          middleName: "",
          lastName: "",
          suffixName: "",
          atcCode: "",
          addresses: clearAddressRolesForPartyTypes(
            current.addresses,
            partyTypes,
            classification,
          ),
          defaultReceivableAccount: accountingAccounts.defaultReceivableAccount,
          customerAdvanceAccount: accountingAccounts.customerAdvanceAccount,
          defaultPayableAccount: accountingAccounts.defaultPayableAccount,
          vendorAdvanceAccount: accountingAccounts.vendorAdvanceAccount,
          employeeAdvanceAccount: accountingAccounts.employeeAdvanceAccount,
          employeePayableAccount: accountingAccounts.employeePayableAccount,
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateAddressField(
    field: keyof PartyAddress,
    value: string,
    addressId?: string,
  ) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((address) =>
        address.id === (addressId ?? current.activeAddressId)
          ? { ...address, [field]: value }
          : address,
      ),
    }));
    if (field === "addressLine1" || field === "addressLine2") {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const field = event.target.name as keyof PartyInformationFormValues;
    const value =
      field === "tin"
        ? FormatTinNumber(event.target.value)
        : field === "contactNo"
          ? FormatPhilippineContactNumber(event.target.value)
          : event.target.value;

    updateField(field, value as never);
  }

  function handleAddressInputChange(event: ChangeEvent<HTMLInputElement>) {
    updateAddressField(
      event.target.name as keyof PartyAddress,
      event.target.value,
      event.currentTarget.dataset.addressId,
    );
  }

  function handlePartyTypesChange(value: string | string[]) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    const values = Array.isArray(value) ? value : [value];
    const partyTypes = values.filter(isKnownPartyType);

    setValues((current) => {
      const accountingAccounts = applyPartyDefaultAccountingAccounts(
        current,
        partyTypes,
      );

      return {
        ...current,
        partyTypes,
        addresses: clearAddressRolesForPartyTypes(
          current.addresses,
          partyTypes,
          current.classification,
        ),
        defaultReceivableAccount: accountingAccounts.defaultReceivableAccount,
        customerAdvanceAccount: accountingAccounts.customerAdvanceAccount,
        defaultPayableAccount: accountingAccounts.defaultPayableAccount,
        vendorAdvanceAccount: accountingAccounts.vendorAdvanceAccount,
        employeeAdvanceAccount: accountingAccounts.employeeAdvanceAccount,
        employeePayableAccount: accountingAccounts.employeePayableAccount,
      };
    });
    setErrors((current) => ({ ...current, partyTypes: undefined }));
  }

  function selectAtcCode(value: string | string[]) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    const code = getSingleSelectedValue(value);

    setValues((current) => ({
      ...current,
      atcCode: code,
    }));
    setErrors((current) => ({ ...current, atcCode: undefined }));
  }

  function selectRegion(value: string | string[]) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    const code = getSingleSelectedValue(value);
    const option = addressOptions.regionOptions.find(
      (region) => region.value === code,
    );

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((address) =>
        address.id === current.activeAddressId
          ? {
              ...address,
              barangay: "",
              barangayCode: "",
              cityMunicipality: "",
              cityMunicipalityCode: "",
              province: "",
              provinceCode: "",
              region: option?.name ?? "",
              regionCode: code,
            }
          : address,
      ),
    }));
    setErrors((current) => ({
      ...current,
      barangayCode: undefined,
      cityMunicipalityCode: undefined,
      provinceCode: undefined,
      regionCode: undefined,
    }));
  }

  function selectProvince(value: string | string[], addressId?: string) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    const code = getSingleSelectedValue(value);
    const option = addressOptions.provinceOptions.find(
      (province) => province.value === code,
    );

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((address) =>
        address.id === (addressId ?? current.activeAddressId)
          ? {
              ...address,
              barangay: "",
              barangayCode: "",
              cityMunicipality: "",
              cityMunicipalityCode: "",
              province: option?.name ?? "",
              provinceCode: code,
              region: option?.regionName ?? "",
              regionCode: option?.regionCode ?? "",
            }
          : address,
      ),
    }));
    setErrors((current) => ({
      ...current,
      addressLine1: undefined,
      addressLine2: undefined,
      barangayCode: undefined,
      cityMunicipalityCode: undefined,
      provinceCode: undefined,
      regionCode: undefined,
    }));
  }

  function selectAutocompleteAddress(
    address: AddressAutocompleteItem,
    details?: AddressAutocompleteDetails,
    addressId?: string,
  ) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((currentAddress) =>
        currentAddress.id === (addressId ?? current.activeAddressId)
          ? {
              ...currentAddress,
              addressLine1:
                details?.addressLine1 ?? currentAddress.addressLine1,
              addressLine2:
                details?.addressLine2 ?? currentAddress.addressLine2,
              barangay: address.barangay.name,
              barangayCode: address.barangay.code,
              cityMunicipality: address.cityMunicipality.name,
              cityMunicipalityCode: address.cityMunicipality.code,
              province: address.province.name,
              provinceCode: address.province.code,
              region: address.region.name,
              regionCode: address.region.code,
            }
          : currentAddress,
      ),
    }));
    setErrors((current) => ({
      ...current,
      barangayCode: undefined,
      cityMunicipalityCode: undefined,
      provinceCode: undefined,
      regionCode: undefined,
    }));
  }

  function syncAutocompleteAddressDetails(
    details: AddressAutocompleteDetails,
    addressId?: string,
  ) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((currentAddress) =>
        currentAddress.id === (addressId ?? current.activeAddressId)
          ? {
              ...currentAddress,
              addressLine1: details.addressLine1 ?? currentAddress.addressLine1,
              addressLine2: details.addressLine2 ?? currentAddress.addressLine2,
            }
          : currentAddress,
      ),
    }));
    setErrors((current) => ({
      ...current,
      addressLine1: undefined,
      addressLine2: undefined,
    }));
  }

  function selectCityMunicipality(value: string | string[], addressId?: string) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    const code = getSingleSelectedValue(value);
    const option = addressOptions.cityMunicipalityOptions.find(
      (cityMunicipality) => cityMunicipality.value === code,
    );

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((address) =>
        address.id === (addressId ?? current.activeAddressId)
          ? {
              ...address,
              barangay: "",
              barangayCode: "",
              cityMunicipality: option?.name ?? "",
              cityMunicipalityCode: code,
            }
          : address,
      ),
    }));
    setErrors((current) => ({
      ...current,
      barangayCode: undefined,
      cityMunicipalityCode: undefined,
    }));
  }

  function selectBarangay(value: string | string[], addressId?: string) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    const code = getSingleSelectedValue(value);
    const option = addressOptions.barangayOptions.find(
      (barangay) => barangay.value === code,
    );

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((address) =>
        address.id === (addressId ?? current.activeAddressId)
          ? {
              ...address,
              barangay: option?.name ?? "",
              barangayCode: code,
            }
          : address,
      ),
    }));
    setErrors((current) => ({ ...current, barangayCode: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validatePartyInformationForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (mode === "edit" && existingRecord) {
      partyManagement.updateRecord(
        updatePartyInformationRecord(existingRecord, values),
      );
    } else {
      partyManagement.addRecord(createPartyInformationRecord(values));
    }

    router.push(
      mode === "edit" && openedFromView ? viewHref : PartyManagementHref,
    );
  }

  function updateAddressMeta(
    addressId: string,
    field:
      | "addressName"
      | "isBilling"
      | "isDelivery"
      | "isForeign"
      | "isHome",
    value: string | boolean,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((address) =>
        updateAddressRole(address, addressId, field, value),
      ),
    }));
  }

  function selectTerm(value: string | string[]) {
    const termId = getSingleSelectedValue(value);
    const term = termDropdown.terms.find((currentTerm) => currentTerm.id === termId);

    setValues((current) => ({
      ...current,
      termId,
      termName: term?.name ?? "",
    }));
    setErrors((current) => ({ ...current, termId: undefined }));
  }

  function handleConfirmStatusChange() {
    if (!existingRecord) {
      return;
    }

    partyManagement.updateRecord({
      ...existingRecord,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
    setValues((current) => ({ ...current, status: nextStatus }));
    setIsStatusDialogOpen(false);
  }

  return {
    addressOptions,
    accountOptions,
    atcOptions: atcDropdown.options,
    cancelHref,
    editHref,
    errors,
    existingRecord,
    handleAddressInputChange,
    handleConfirmStatusChange,
    handleInputChange,
    handlePartyTypesChange,
    handleSubmit,
    isClassificationSelected,
    canSave,
    isMutating: partyManagement.isMutating,
    isReadonly,
    isStatusDialogOpen,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    nextStatus,
    partyTypeOptions: PartyTypeOptions,
    selectBarangay,
    selectAutocompleteAddress,
    syncAutocompleteAddressDetails,
    selectCityMunicipality,
    selectProvince,
    selectRegion,
    selectAtcCode,
    selectTerm,
    setIsStatusDialogOpen,
    termOptions: termDropdown.options,
    updateAddressMeta,
    updateField,
    values,
  };
}

function updateAddressRole(
  address: PartyAddress,
  addressId: string,
  field:
    | "addressName"
    | "isBilling"
    | "isDelivery"
    | "isForeign"
    | "isHome",
  value: string | boolean,
) {
  if (address.id !== addressId) {
    return address;
  }

  return {
    ...address,
    [field]: value,
  };
}

function getActionMode(pathname: string): PartyInformationActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function getSingleSelectedValue(value: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? "") : value;
}
