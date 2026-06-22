"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Plus, Users, X } from "lucide-react";
import {
  DefaultPhilippineContactNumber,
  FormatPhilippineContactNumber,
} from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { formatTermDuration } from "@/app/src/data/modules/maintenance/financial-management/term-management/TermManagementDisplay";
import {
  PartyInformationInitialFormValues,
  createPartyInformationRecord,
  getPartyAtcCodeOptionsByClassification,
  getPartyDisplayName,
  isKnownPartyType,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagement";
import { usePhilippineAddressOptions } from "@/app/src/hooks/shared/address/ph/usePhilippineAddressOptions";
import type {
  PartyAddress,
  PartyInformationFormErrors,
  PartyInformationFormValues,
  PartyInformationRecord,
  PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { PartyInformationDetailsFields } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationDetailsFields";
import { validatePartyInformationForm } from "@/app/src/validations/modules/maintenance/party-management/PartyManagementValidation";
import type {
	AddressAutocompleteDetails,
	AddressAutocompleteItem,
} from "@/app/src/services/shared/address/AddressReferenceApi";

type AppPartyDialogProps = {
  isOpen: boolean;
  suggestedPartyType?: PartyType;
  onClose: () => void;
  onSelect: (record: PartyInformationRecord) => void;
};

const PartyTypeCardCopy: Record<
  PartyType,
  { description: string; title: string }
> = {
  Vendor: {
    title: "Add Vendor",
    description:
      "Create a vendor party profile for supplier payments and purchasing workflows.",
  },
  Customer: {
    title: "Add Customer",
    description:
      "Create a customer party profile for billing, collections, and related transactions.",
  },
  Employee: {
    title: "Add Employee",
    description:
      "Create an employee party profile for reimbursements, payroll-linked entries, and advances.",
  },
};

export function AppPartyDialog({
  isOpen,
  suggestedPartyType = "Vendor",
  onClose,
  onSelect,
}: AppPartyDialogProps) {
  const records = usePartyManagementStore((state) => state.records);

  if (!isOpen) {
    return null;
  }

  return (
    <AppPartyDialogContent
      key={`${suggestedPartyType}-${records.length}`}
      records={records}
      suggestedPartyType={suggestedPartyType}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}

function AppPartyDialogContent({
  records,
  suggestedPartyType,
  onClose,
  onSelect,
}: {
  records: PartyInformationRecord[];
  suggestedPartyType: PartyType;
  onClose: () => void;
  onSelect: (record: PartyInformationRecord) => void;
}) {
  const addRecord = usePartyManagementStore((state) => state.addRecord);
  const terms = useTermManagementStore((state) => state.terms);
  const [partyType, setPartyType] = useState<PartyType>(suggestedPartyType);
  const [values, setValues] = useState<PartyInformationFormValues>(() =>
    createDialogInitialValues(records, suggestedPartyType),
  );
  const [errors, setErrors] = useState<PartyInformationFormErrors>({});
  const activeAddress =
    values.addresses.find((address) => address.id === values.activeAddressId) ??
    values.addresses[0] ??
    values.address;
  const addressOptions = usePhilippineAddressOptions({
	barangayCode: activeAddress.barangayCode,
	barangayName: activeAddress.barangay,
    cityMunicipalityCode: activeAddress.cityMunicipalityCode,
	cityMunicipalityName: activeAddress.cityMunicipality,
    provinceCode: activeAddress.provinceCode,
	provinceName: activeAddress.province,
    regionCode: activeAddress.regionCode,
	regionName: activeAddress.region,
  });
  const atcOptions = useMemo(
    () => getPartyAtcCodeOptionsByClassification(values.classification),
    [values.classification],
  );
  const accountOptions = useMemo(
    () => getModuleChartAccounts({ moduleKey: "maintenance-transaction-type" }),
    [],
  );
  const termOptions = useMemo(
    () =>
      terms
        .filter((term) => term.status === "Active")
        .map((term) => ({
          description: formatTermDuration(term),
          name: term.name,
          value: term.id,
        })),
    [terms],
  );
  const isClassificationSelected = Boolean(values.classification);
  const dialogCopy = PartyTypeCardCopy[partyType];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function updateField<TKey extends keyof PartyInformationFormValues>(
    field: TKey,
    value: PartyInformationFormValues[TKey],
  ) {
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
    if (!isClassificationSelected) {
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
    const selectedValues = Array.isArray(value) ? value : [value];
    const nextPartyTypes = selectedValues.filter(isKnownPartyType);

    setValues((current) => ({
      ...current,
      partyTypes: nextPartyTypes,
    }));
    setErrors((current) => ({ ...current, partyTypes: undefined }));
  }

  function selectAtcCode(value: string | string[]) {
    const code = getSingleSelectedValue(value);

    setValues((current) => ({
      ...current,
      atcCode: code,
    }));
    setErrors((current) => ({ ...current, atcCode: undefined }));
  }

  function selectProvince(value: string | string[]) {
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
		region: option?.regionName ?? "",
		regionCode: option?.regionCode ?? "",
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

  function selectAutocompleteAddress(
    address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
  ) {
    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((currentAddress) =>
        currentAddress.id === current.activeAddressId
          ? {
              ...currentAddress,
				addressLine1: details?.addressLine1 ?? currentAddress.addressLine1,
				addressLine2: details?.addressLine2 ?? currentAddress.addressLine2,
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

  function syncAutocompleteAddressDetails(details: AddressAutocompleteDetails) {
    setValues((current) => ({
      ...current,
      addresses: current.addresses.map((currentAddress) =>
        currentAddress.id === current.activeAddressId
          ? {
              ...currentAddress,
              addressLine1:
                details.addressLine1 ?? currentAddress.addressLine1,
              addressLine2:
                details.addressLine2 ?? currentAddress.addressLine2,
            }
          : currentAddress,
      ),
    }));
  }

  function selectCityMunicipality(value: string | string[]) {
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

  function handlePartyTypeChange(nextPartyType: PartyType) {
    setPartyType(nextPartyType);
    setValues((current) => ({
      ...current,
      partyTypes: [nextPartyType],
    }));
    setErrors((current) => ({ ...current, partyTypes: undefined }));
  }

  function selectTerm(value: string | string[]) {
    const termId = getSingleSelectedValue(value);
    const term = terms.find((currentTerm) => currentTerm.id === termId);

    setValues((current) => ({
      ...current,
      termId,
      termName: term?.name ?? "",
    }));
  }

  function handleSave() {
    const nextErrors = validatePartyInformationForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextRecord = createPartyInformationRecord(values);

    addRecord(nextRecord);
    onSelect(nextRecord);
    onClose();
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="party-dialog-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-7xl flex-col overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              Party Name Setup
            </p>
            <h2
              id="party-dialog-title"
              className="mt-1 text-2xl font-semibold text-darknavy"
            >
              {dialogCopy.title}
            </h2>
            <p className="mt-1 text-sm text-darknavy/55">
              {dialogCopy.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <div className="grid gap-5">
            <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-skyblue/12 text-skyblue">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-darknavy">
                    Party type
                  </p>
                  <p className="text-sm text-darknavy/55">
                    Pick the profile type first, then complete the information
                    below.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {(["Vendor", "Customer", "Employee"] as const).map(
                  (currentType) => (
                    <button
                      key={currentType}
                      type="button"
                      onClick={() => handlePartyTypeChange(currentType)}
                      className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold transition ${partyType === currentType
                          ? "theme-accent-contrast-text border-skyblue bg-skyblue"
                          : "border-darknavy/12 bg-white text-darknavy hover:border-skyblue/40 hover:bg-skyblue/8"
                        }`}
                    >
                      {currentType}
                    </button>
                  ),
                )}
              </div>
            </section>

            <PartyInformationDetailsFields
              addressOptions={addressOptions}
              accountOptions={accountOptions}
              atcOptions={atcOptions}
              errors={errors}
              isClassificationSelected={isClassificationSelected}
              isReadonly={false}
              partyTypeOptions={[partyType]}
              termOptions={termOptions}
              values={values}
              onAddressInputChange={handleAddressInputChange}
              onInputChange={handleInputChange}
              onPartyTypesChange={handlePartyTypesChange}
              onSelectAtcCode={selectAtcCode}
              onSelectAutocompleteAddress={selectAutocompleteAddress}
              onSyncAutocompleteAddressDetails={syncAutocompleteAddressDetails}
              onSelectBarangay={selectBarangay}
              onSelectCityMunicipality={selectCityMunicipality}
              onSelectProvince={selectProvince}
              onSelectTerm={selectTerm}
              onUpdateField={updateField}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-darknavy/10 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-md bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="theme-accent-contrast-text inline-flex h-11 items-center justify-center gap-2 rounded-md bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Save Party Information
          </button>
        </div>
      </section>
    </div>
  );
}

function createDialogInitialValues(
  records: PartyInformationRecord[],
  partyType: PartyType,
): PartyInformationFormValues {
  return {
    ...PartyInformationInitialFormValues,
    classification: partyType === "Employee" ? "Individual" : "Non-Individual",
    contactNo: DefaultPhilippineContactNumber,
    partyCodeNo: createNextPartyCode(records),
    partyTypes: [partyType],
  };
}

function createNextPartyCode(records: PartyInformationRecord[]) {
  const nextNumber = records.length + 1;

  return `PTY-${nextNumber.toString().padStart(4, "0")}`;
}

function getSingleSelectedValue(value: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

export function mapPartyRecordToPartyValue(record: PartyInformationRecord) {
  return {
    partyCode: record.partyCodeNo,
    partyName: getPartyDisplayName(record),
  };
}
