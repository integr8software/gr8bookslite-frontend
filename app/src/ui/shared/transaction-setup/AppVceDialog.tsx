"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Plus, Users, X } from "lucide-react";
import {
  DefaultPhilippineContactNumber,
  FormatPhilippineContactNumber,
} from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import {
  PartyInformationInitialFormValues,
  createPartyInformationRecord,
  getPartyAtcCodeOptionsByClassification,
  getPartyDisplayName,
  isKnownPartyType,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
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

type AppVceDialogProps = {
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
      "Create a vendor VCE profile for supplier payments and purchasing workflows.",
  },
  Customer: {
    title: "Add Customer",
    description:
      "Create a customer VCE profile for billing, collections, and related transactions.",
  },
  Employee: {
    title: "Add Employee",
    description:
      "Create an employee VCE profile for reimbursements, payroll-linked entries, and advances.",
  },
};

export function AppVceDialog({
  isOpen,
  suggestedPartyType = "Vendor",
  onClose,
  onSelect,
}: AppVceDialogProps) {
  const records = usePartyManagementStore((state) => state.records);

  if (!isOpen) {
    return null;
  }

  return (
    <AppVceDialogContent
      key={`${suggestedPartyType}-${records.length}`}
      records={records}
      suggestedPartyType={suggestedPartyType}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}

function AppVceDialogContent({
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
  const [partyType, setPartyType] = useState<PartyType>(suggestedPartyType);
  const [values, setValues] = useState<PartyInformationFormValues>(() =>
    createDialogInitialValues(records, suggestedPartyType),
  );
  const [errors, setErrors] = useState<PartyInformationFormErrors>({});
  const addressOptions = usePhilippineAddressOptions({
    cityMunicipalityCode: values.address.cityMunicipalityCode,
    provinceCode: values.address.provinceCode,
    regionCode: values.address.regionCode,
  });
  const atcOptions = useMemo(
    () => getPartyAtcCodeOptionsByClassification(values.classification),
    [values.classification],
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
          tradingName: "",
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
      address: {
        ...current.address,
        [field]: value,
      },
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
    updateAddressField(event.target.name as keyof PartyAddress, event.target.value);
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

  function selectRegion(value: string | string[]) {
    const code = getSingleSelectedValue(value);
    const option = addressOptions.regionOptions.find(
      (region) => region.value === code,
    );

    setValues((current) => ({
      ...current,
      address: {
        ...current.address,
        barangay: "",
        barangayCode: "",
        cityMunicipality: "",
        cityMunicipalityCode: "",
        province: "",
        provinceCode: "",
        region: option?.name ?? "",
        regionCode: code,
      },
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
    const code = getSingleSelectedValue(value);
    const option = addressOptions.provinceOptions.find(
      (province) => province.value === code,
    );

    setValues((current) => ({
      ...current,
      address: {
        ...current.address,
        barangay: "",
        barangayCode: "",
        cityMunicipality: "",
        cityMunicipalityCode: "",
        province: option?.name ?? "",
        provinceCode: code,
      },
    }));
    setErrors((current) => ({
      ...current,
      barangayCode: undefined,
      cityMunicipalityCode: undefined,
      provinceCode: undefined,
    }));
  }

  function selectCityMunicipality(value: string | string[]) {
    const code = getSingleSelectedValue(value);
    const option = addressOptions.cityMunicipalityOptions.find(
      (cityMunicipality) => cityMunicipality.value === code,
    );

    setValues((current) => ({
      ...current,
      address: {
        ...current.address,
        barangay: "",
        barangayCode: "",
        cityMunicipality: option?.name ?? "",
        cityMunicipalityCode: code,
      },
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
      address: {
        ...current.address,
        barangay: option?.name ?? "",
        barangayCode: code,
      },
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
      className="fixed inset-0 z-80 flex items-center justify-center bg-darknavy/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="vce-dialog-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-slate-50 shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              VCE Name Setup
            </p>
            <h2 id="vce-dialog-title" className="mt-1 text-2xl font-semibold text-darknavy">
              {dialogCopy.title}
            </h2>
            <p className="mt-1 text-sm text-darknavy/55">{dialogCopy.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <div className="grid gap-5">
            <section className="rounded-[24px] border border-darknavy/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-skyblue/12 text-skyblue">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-darknavy">VCE type</p>
                  <p className="text-sm text-darknavy/55">
                    Pick the profile type first, then complete the information below.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {(["Vendor", "Customer", "Employee"] as const).map((currentType) => (
                  <button
                    key={currentType}
                    type="button"
                    onClick={() => handlePartyTypeChange(currentType)}
                    className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      partyType === currentType
                        ? "theme-accent-contrast-text border-skyblue bg-skyblue shadow-sm shadow-[0_10px_24px_rgb(var(--skyblue-rgb)/0.22)]"
                        : "border-darknavy/12 bg-white text-darknavy hover:border-skyblue/40 hover:bg-skyblue/8"
                    }`}
                  >
                    {currentType}
                  </button>
                ))}
              </div>
            </section>

            <PartyInformationDetailsFields
              addressOptions={addressOptions}
              atcOptions={atcOptions}
              errors={errors}
              isClassificationSelected={isClassificationSelected}
              isReadonly={false}
              partyTypeOptions={[partyType]}
              values={values}
              onAddressInputChange={handleAddressInputChange}
              onInputChange={handleInputChange}
              onPartyTypesChange={handlePartyTypesChange}
              onSelectAtcCode={selectAtcCode}
              onSelectBarangay={selectBarangay}
              onSelectCityMunicipality={selectCityMunicipality}
              onSelectProvince={selectProvince}
              onSelectRegion={selectRegion}
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
            className="theme-accent-contrast-text inline-flex h-11 items-center justify-center gap-2 rounded-md bg-skyblue px-5 text-sm font-semibold shadow-[0_12px_30px_rgb(var(--skyblue-rgb)/0.24)] transition hover:bg-skyblue/85"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Save VCE Information
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

export function mapPartyRecordToVceValue(record: PartyInformationRecord) {
  return {
    vceCode: record.partyCodeNo,
    vceName: getPartyDisplayName(record),
  };
}
