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
  createPartyInformationFormValues,
  createPartyInformationRecord,
  getPartyAtcCodeOptionsByClassification,
  isKnownPartyType,
  updatePartyInformationRecord,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagement";
import { usePhilippineAddressOptions } from "@/app/src/hooks/shared/address/ph/usePhilippineAddressOptions";
import type {
  PartyAddress,
  PartyInformationActionMode,
  PartyInformationFormErrors,
  PartyInformationFormValues,
  PartyInformationStatus,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { validatePartyInformationForm } from "@/app/src/validations/modules/maintenance/party-management/PartyManagementValidation";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";

export function usePartyManagementAction() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const partyManagement = usePartyManagementStore();
  const terms = useTermManagementStore((state) => state.terms);
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
  const addressOptions = usePhilippineAddressOptions({
    cityMunicipalityCode: activeAddress.cityMunicipalityCode,
    provinceCode: activeAddress.provinceCode,
    regionCode: activeAddress.regionCode,
  });
  const isReadonly = mode === "view";
  const isClassificationSelected = Boolean(values.classification);
  const nextStatus: PartyInformationStatus =
    existingRecord?.status === "Active" ? "Inactive" : "Active";
  const atcOptions = useMemo(
    () => getPartyAtcCodeOptionsByClassification(values.classification),
    [values.classification],
  );
  const accountOptions = useMemo(
    () =>
      getModuleChartAccounts({
        moduleKey: "maintenance-transaction-type",
      }),
    [],
  );
  const termOptions = useMemo(
    () =>
      terms
        .filter((term) => term.status === "Active")
        .map((term) => ({
          description: `${term.period} ${term.datemode.toLowerCase()}${term.period === "1" ? "" : "s"}`,
          name: term.name,
          value: term.id,
        })),
    [terms],
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
        return {
          ...current,
          classification: value as PartyInformationFormValues["classification"],
          partyName: "",
          tradeName: "",
          firstName: "",
          middleName: "",
          lastName: "",
          suffixName: "",
          atcCode: "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateAddressField(field: keyof PartyAddress, value: string) {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((address) =>
        address.id === current.activeAddressId
          ? { ...address, [field]: value }
          : address,
      ),
    }));
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
    );
  }

  function handlePartyTypesChange(value: string | string[]) {
    if (isReadonly) {
      return;
    }

    const values = Array.isArray(value) ? value : [value];
    const partyTypes = values.filter(isKnownPartyType);

    setValues((current) => ({
      ...current,
      partyTypes,
      defaultReceivableAccount: partyTypes.includes("Customer")
        ? current.defaultReceivableAccount
        : "",
      defaultPayableAccount: partyTypes.includes("Vendor")
        ? current.defaultPayableAccount
        : "",
      employeeReceivableAccount: partyTypes.includes("Employee")
        ? current.employeeReceivableAccount
        : "",
      employeeAdvanceAccount: partyTypes.includes("Employee")
        ? current.employeeAdvanceAccount
        : "",
    }));
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

  function selectProvince(value: string | string[]) {
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
        address.id === current.activeAddressId
          ? {
              ...address,
        barangay: "",
        barangayCode: "",
        cityMunicipality: "",
        cityMunicipalityCode: "",
        province: option?.name ?? "",
        provinceCode: code,
            }
          : address,
      ),
    }));
    setErrors((current) => ({
      ...current,
      barangayCode: undefined,
      cityMunicipalityCode: undefined,
      provinceCode: undefined,
    }));
  }

  function selectCityMunicipality(value: string | string[]) {
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
        address.id === current.activeAddressId
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

  function selectBarangay(value: string | string[]) {
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
        address.id === current.activeAddressId
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

  function addAddress() {
    if (isReadonly || !isClassificationSelected) {
      return;
    }

    const id = `address-${Date.now().toString(36)}`;

    setValues((current) => ({
      ...current,
      activeAddressId: id,
      addresses: [
        ...current.addresses,
        {
          id,
          addressName: `Address ${current.addresses.length + 1}`,
          addressLine1: "",
          addressLine2: "",
          barangay: "",
          barangayCode: "",
          cityMunicipality: "",
          cityMunicipalityCode: "",
          isBilling: false,
          isDefault: false,
          isDelivery: false,
          province: "",
          provinceCode: "",
          region: "",
          regionCode: "",
        },
      ],
    }));
  }

  function removeAddress(addressId: string) {
    if (isReadonly || values.addresses.length <= 1) {
      return;
    }

    setValues((current) => {
      const nextAddresses = current.addresses.filter(
        (address) => address.id !== addressId,
      );
      const nextDefaultAddresses = nextAddresses.some((address) => address.isDefault)
        ? nextAddresses
        : nextAddresses.map((address, index) => ({
            ...address,
            isDefault: index === 0,
          }));

      return {
        ...current,
        activeAddressId: nextDefaultAddresses[0]?.id ?? "",
        addresses: nextDefaultAddresses,
      };
    });
  }

  function selectAddress(addressId: string) {
    setValues((current) => ({
      ...current,
      activeAddressId: addressId,
    }));
  }

  function setDefaultAddress(addressId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      activeAddressId: addressId,
      addresses: current.addresses.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    }));
    setErrors((current) => ({ ...current, addresses: undefined }));
  }

  function updateAddressMeta(
    addressId: string,
    field: "addressName" | "isBilling" | "isDelivery",
    value: string | boolean,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((address) =>
        address.id === addressId ? { ...address, [field]: value } : address,
      ),
    }));
  }

  function selectTerm(value: string | string[]) {
    const termId = getSingleSelectedValue(value);
    const term = terms.find((currentTerm) => currentTerm.id === termId);

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
    atcOptions,
    cancelHref,
    editHref,
    errors,
    existingRecord,
    handleAddressInputChange,
    handleConfirmStatusChange,
    handleInputChange,
    handlePartyTypesChange,
    handleSubmit,
    addAddress,
    isClassificationSelected,
    isMutating: partyManagement.isMutating,
    isReadonly,
    isStatusDialogOpen,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    nextStatus,
    partyTypeOptions: PartyTypeOptions,
    removeAddress,
    selectBarangay,
    selectCityMunicipality,
    selectProvince,
    selectRegion,
    selectAtcCode,
    selectAddress,
    selectTerm,
    setIsStatusDialogOpen,
    setDefaultAddress,
    termOptions,
    updateAddressMeta,
    updateField,
    values,
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
