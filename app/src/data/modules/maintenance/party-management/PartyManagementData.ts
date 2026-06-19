import {
  BIRAtcSourceUrl,
  PartyTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
  PhilippineAtcTaxRows,
  getPhilippineAtcPartyClassification,
  normalizePhilippineAtcCode,
  type PhilippineTaxCodeRow,
} from "@/app/src/data/shared/tax/PhilippineAtcData";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import type {
  PartyAddress,
  PartyAtcCodeOption,
  PartyClassification,
  PartyInformationFormValues,
  PartyInformationRecord,
  PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export const PartyAtcCodeOptions: PartyAtcCodeOption[] =
  createPartyAtcCodeOptions();

export const PartyAtcCodeSource = {
  label:
    "BIR Form 2307, January 2018 ENCS - Schedules of Alphanumeric Tax Codes",
  url: BIRAtcSourceUrl,
};

function createPartyAtcCodeOptions() {
  const optionsByCode = new Map<
    string,
    { option: PartyAtcCodeOption; priority: number }
  >();

  for (const row of PhilippineAtcTaxRows) {
    const option = createPartyAtcCodeOption(row);
    const priority = getPartyAtcRowPriority(row);
    const currentOption = optionsByCode.get(option.code);

    if (!currentOption || priority > currentOption.priority) {
      optionsByCode.set(option.code, { option, priority });
    }
  }

  return [...optionsByCode.values()].map(({ option }) => option);
}

function createPartyAtcCodeOption(
  row: PhilippineTaxCodeRow & { officialAtcCode: string },
): PartyAtcCodeOption {
  return {
    category: getPartyAtcCategory(row),
    classifications: getPartyAtcClassifications(row.officialAtcCode),
    code: row.officialAtcCode,
    description: getPartyAtcDescription(row),
    label: `${row.transactionType} ${row.taxType} ${formatPartyAtcRate(
      row.taxRate,
    )}`,
  };
}

function getPartyAtcCategory(
  row: PhilippineTaxCodeRow & { officialAtcCode: string },
) {
  if (row.officialAtcCode.startsWith("WV ")) {
    return "VAT Withholding";
  }

  if (row.taxType === "CWT") {
    return "Creditable Withholding Tax";
  }

  if (row.officialAtcCode.startsWith("WB ")) {
    return "Business Tax Withholding";
  }

  if (row.taxType === "EWT") {
    return "Expanded Withholding Tax";
  }

  return row.taxType;
}

function getPartyAtcClassifications(code: string): PartyClassification[] {
  const classification = getPhilippineAtcPartyClassification(code);

  if (classification === "individual") {
    return ["Individual"];
  }

  if (classification === "nonIndividual") {
    return ["Non-Individual"];
  }

  return ["Individual", "Non-Individual"];
}

function getPartyAtcDescription(row: PhilippineTaxCodeRow) {
  return (
    row.natureOfIncome?.trim() ||
    row.taxDescription.replace(/^[A-Z]{2}\s?\d{3}\s*\|\s*/, "").trim()
  );
}

function getPartyAtcRowPriority(row: PhilippineTaxCodeRow) {
  const isDirectAtcRow =
    row.officialAtcCode === normalizePhilippineAtcCode(row.taxCode);

  return (isDirectAtcRow ? 1_000_000 : 0) + getPartyAtcDescription(row).length;
}

function formatPartyAtcRate(rate: number) {
  return `${rate.toFixed(2)}%`;
}

export const PartyInformationInitialFormValues: PartyInformationFormValues = {
  partyCodeNo: "",
  classification: "",
  partyTypes: [],
  status: "Active",
  partyName: "",
  tradeName: "",
  firstName: "",
  middleName: "",
  lastName: "",
  suffixName: "",
  address: createEmptyPartyAddress(),
  tin: "",
  vatRegistrationType: "",
  atcCode: "",
  email: "",
  contactNo: "",
};

export const PartyInformationInitialRecords: PartyInformationRecord[] = [
  {
    id: "party-001",
    partyCodeNo: "PTY-0001",
    classification: "Non-Individual",
    partyTypes: ["Vendor", "Customer"],
    status: "Active",
    partyName: "Pacific Office Supplies Inc.",
    tradeName: "Pacific Supplies",
    firstName: "",
    middleName: "",
    lastName: "",
    suffixName: "",
    address: {
      addressLine1: "Unit 1204 Finance Center",
      addressLine2: "26th Street",
      barangay: "Bonifacio Global City",
      barangayCode: "137607000",
      cityMunicipality: "Taguig City",
      cityMunicipalityCode: "137607000",
      province: "Metro Manila",
      provinceCode: "137600000",
      region: "National Capital Region",
      regionCode: "130000000",
    },
    tin: "009-432-781-000",
    vatRegistrationType: "VAT Registered",
    atcCode: "WC 158",
    email: "billing@pacificsupplies.example",
    contactNo: "+63 917 555 0182",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-18T08:00:00.000Z",
  },
  {
    id: "party-002",
    partyCodeNo: "PTY-0002",
    classification: "Individual",
    partyTypes: ["Employee"],
    status: "Active",
    partyName: "",
    tradeName: "",
    firstName: "Mara",
    middleName: "Santos",
    lastName: "Reyes",
    suffixName: "",
    address: {
      addressLine1: "42 Sampaguita Street",
      addressLine2: "",
      barangay: "San Lorenzo",
      barangayCode: "137602000",
      cityMunicipality: "Makati City",
      cityMunicipalityCode: "137602000",
      province: "Metro Manila",
      provinceCode: "137600000",
      region: "National Capital Region",
      regionCode: "130000000",
    },
    tin: "182-445-908-000",
    vatRegistrationType: "Services",
    atcCode: "WI 010",
    email: "mara.reyes@example.com",
    contactNo: "+63 918 222 0199",
    createdAt: "2026-05-03T08:00:00.000Z",
    updatedAt: "2026-05-16T08:00:00.000Z",
  },
  {
    id: "party-003",
    partyCodeNo: "PTY-0003",
    classification: "Non-Individual",
    partyTypes: ["Vendor"],
    status: "Inactive",
    partyName: "Northfield Logistics Corporation",
    tradeName: "Northfield Logistics",
    firstName: "",
    middleName: "",
    lastName: "",
    suffixName: "",
    address: {
      addressLine1: "Warehouse 8, Harbor Industrial Park",
      addressLine2: "R-10 Road",
      barangay: "Tangos North",
      barangayCode: "137503000",
      cityMunicipality: "Navotas City",
      cityMunicipalityCode: "137503000",
      province: "Metro Manila",
      provinceCode: "137500000",
      region: "National Capital Region",
      regionCode: "130000000",
    },
    tin: "742-118-306-000",
    vatRegistrationType: "VAT Registered",
    atcCode: "WC 160",
    email: "ap@northfieldlogistics.example",
    contactNo: "+63 919 441 7788",
    createdAt: "2026-05-05T08:00:00.000Z",
    updatedAt: "2026-05-14T08:00:00.000Z",
  },
  {
    id: "party-004",
    partyCodeNo: "PTY-0004",
    classification: "Individual",
    partyTypes: ["Customer"],
    status: "Active",
    partyName: "",
    tradeName: "",
    firstName: "Luis",
    middleName: "Garcia",
    lastName: "Dela Cruz",
    suffixName: "Jr.",
    address: {
      addressLine1: "15 Orchid Lane",
      addressLine2: "Phase 2",
      barangay: "Lahug",
      barangayCode: "072217000",
      cityMunicipality: "Cebu City",
      cityMunicipalityCode: "072217000",
      province: "Cebu",
      provinceCode: "072200000",
      region: "Central Visayas",
      regionCode: "070000000",
    },
    tin: "326-770-452-000",
    vatRegistrationType: "Non-VAT",
    atcCode: "WI 158",
    email: "luis.delacruz@example.com",
    contactNo: "+63 920 333 4455",
    createdAt: "2026-05-07T08:00:00.000Z",
    updatedAt: "2026-05-12T08:00:00.000Z",
  },
  ...createDisbursementVoucherMockParties(),
];

export function createPartyInformationFormValues(
  record: PartyInformationRecord,
): PartyInformationFormValues {
  return {
    partyCodeNo: record.partyCodeNo,
    classification: record.classification,
    partyTypes: [...record.partyTypes],
    status: record.status,
    partyName: record.partyName,
    tradeName: record.tradeName ?? "",
    firstName: record.firstName,
    middleName: record.middleName,
    lastName: record.lastName,
    suffixName: record.suffixName,
    address: { ...record.address },
    tin: record.tin,
    vatRegistrationType: record.vatRegistrationType,
    atcCode: record.atcCode ? normalizePhilippineAtcCode(record.atcCode) : "",
    email: record.email,
    contactNo: record.contactNo,
  };
}

export function createPartySubmitPayload(values: PartyInformationFormValues) {
  const name =
    values.classification === "Non-Individual"
      ? values.partyName.trim()
      : [
          values.firstName,
          values.middleName,
          values.lastName,
          values.suffixName,
        ]
          .map((part) => part.trim())
          .filter(Boolean)
          .join(" ");

  return {
    partyCodeNo: values.partyCodeNo.trim(),
    classification: values.classification,
    partyTypes: values.partyTypes,
    status: values.status,
    name,
    tradeName:
      values.classification === "Non-Individual"
        ? values.tradeName.trim() || null
        : null,
    address: { ...values.address },
    tin: values.tin.trim(),
    vatRegistrationType: values.vatRegistrationType,
    atcCode: values.atcCode ? normalizePhilippineAtcCode(values.atcCode) : "",
    email: values.email.trim() || null,
    contactNo: normalizePartyContactNo(values.contactNo) || null,
  };
}

export function createPartyInformationRecord(
  values: PartyInformationFormValues,
): PartyInformationRecord {
  const now = new Date().toISOString();

  return {
    id: `party_${Date.now().toString(36)}`,
    ...normalizePartyRecordValues(values),
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePartyInformationRecord(
  record: PartyInformationRecord,
  values: PartyInformationFormValues,
): PartyInformationRecord {
  return {
    ...record,
    ...normalizePartyRecordValues(values),
    updatedAt: new Date().toISOString(),
  };
}

export function getPartyDisplayName(record: PartyInformationRecord) {
  if (record.classification === "Non-Individual") {
    return record.partyName;
  }

  return [
    record.firstName,
    record.middleName,
    record.lastName,
    record.suffixName,
  ]
    .filter(Boolean)
    .join(" ");
}

export function isKnownPartyType(value: string): value is PartyType {
  return PartyTypeOptions.includes(value as PartyType);
}

export function isKnownAtcCode(value: string) {
  const normalizedCode = normalizePhilippineAtcCode(value);

  return PartyAtcCodeOptions.some((option) => option.code === normalizedCode);
}

export function getPartyAtcCodeOptionsByClassification(
  classification: PartyClassification | "",
) {
  if (!classification) {
    return [];
  }

  return PartyAtcCodeOptions.filter((option) =>
    option.classifications.includes(classification),
  );
}

function normalizePartyRecordValues(
  values: PartyInformationFormValues,
): Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt"> {
  if (!values.classification) {
    throw new Error("Party classification is required.");
  }

  return {
    ...values,
    partyCodeNo: values.partyCodeNo.trim(),
    classification: values.classification,
    partyName:
      values.classification === "Non-Individual" ? values.partyName.trim() : "",
    status: values.status,
    tradeName:
      values.classification === "Non-Individual" ? values.tradeName.trim() : "",
    firstName:
      values.classification === "Individual" ? values.firstName.trim() : "",
    middleName:
      values.classification === "Individual" ? values.middleName.trim() : "",
    lastName:
      values.classification === "Individual" ? values.lastName.trim() : "",
    suffixName:
      values.classification === "Individual" ? values.suffixName.trim() : "",
    address: normalizePartyAddress(values.address),
    tin: values.tin.trim(),
    atcCode: values.atcCode ? normalizePhilippineAtcCode(values.atcCode) : "",
    email: values.email.trim(),
    contactNo: normalizePartyContactNo(values.contactNo),
  };
}

function normalizePartyContactNo(value: string) {
  const contactNo = value.trim();

  return contactNo === DefaultPhilippineContactNumber.trim() ? "" : contactNo;
}

function createDisbursementVoucherMockParties(): PartyInformationRecord[] {
  const now = "2026-05-18T08:00:00.000Z";

  return [
    createMockParty({
      id: "party-dv-office-depot",
      partyCodeNo: "VCE-OD-204",
      partyName: "North Harbor Office Depot",
      tradeName: "North Harbor Office Depot",
      tin: "201-442-901-000",
      email: "billing@northharboroffice.example",
      contactNo: "+63 917 820 1204",
      createdAt: now,
      updatedAt: now,
    }),
    createMockParty({
      id: "party-dv-metro-utilities",
      partyCodeNo: "VCE-MU-301",
      partyName: "Metro Utilities Services",
      tradeName: "Metro Utilities",
      tin: "311-008-771-000",
      email: "collections@metroutilities.example",
      contactNo: "+63 917 830 1301",
      createdAt: now,
      updatedAt: now,
    }),
    createMockParty({
      id: "party-dv-legal",
      partyCodeNo: "VCE-LAW-108",
      partyName: "Santos and Velasco Legal",
      tradeName: "Santos and Velasco Legal",
      tin: "108-552-664-000",
      email: "billing@santosvelasco.example",
      contactNo: "+63 917 810 1108",
      createdAt: now,
      updatedAt: now,
    }),
    createMockParty({
      id: "party-dv-global-freight",
      partyCodeNo: "VCE-GFM-412",
      partyName: "Global Freight Movers",
      tradeName: "Global Freight Movers",
      tin: "412-226-880-000",
      email: "ap@globalfreight.example",
      contactNo: "+63 917 840 1412",
      createdAt: now,
      updatedAt: now,
    }),
    createMockParty({
      id: "party-dv-techpro",
      partyCodeNo: "VCE-TPI-506",
      partyName: "TechPro Infrastructure",
      tradeName: "TechPro Infrastructure",
      tin: "506-119-742-000",
      email: "billing@techproinfra.example",
      contactNo: "+63 917 850 1506",
      createdAt: now,
      updatedAt: now,
    }),
    createMockParty({
      classification: "Individual",
      id: "party-dv-juan-dela-cruz",
      partyCodeNo: "EMP-044",
      firstName: "Juan",
      middleName: "",
      lastName: "Dela Cruz",
      suffixName: "",
      partyTypes: ["Employee"],
      tin: "044-219-775-000",
      email: "juan.delacruz@example.com",
      contactNo: "+63 917 800 1044",
      createdAt: now,
      updatedAt: now,
    }),
  ];
}

function createMockParty({
  classification = "Non-Individual",
  contactNo,
  createdAt,
  email,
  firstName = "",
  id,
  lastName = "",
  middleName = "",
  partyCodeNo,
  partyName = "",
  partyTypes = ["Vendor"],
  suffixName = "",
  tin,
  tradeName = "",
  updatedAt,
}: {
  classification?: PartyClassification;
  contactNo: string;
  createdAt: string;
  email: string;
  firstName?: string;
  id: string;
  lastName?: string;
  middleName?: string;
  partyCodeNo: string;
  partyName?: string;
  partyTypes?: PartyType[];
  suffixName?: string;
  tin: string;
  tradeName?: string;
  updatedAt: string;
}): PartyInformationRecord {
  return {
    id,
    partyCodeNo,
    classification,
    partyTypes,
    status: "Active",
    partyName,
    tradeName,
    firstName,
    middleName,
    lastName,
    suffixName,
    address: {
      addressLine1: "Makati Business District",
      addressLine2: "",
      barangay: "San Lorenzo",
      barangayCode: "137602000",
      cityMunicipality: "Makati City",
      cityMunicipalityCode: "137602000",
      province: "Metro Manila",
      provinceCode: "137600000",
      region: "National Capital Region",
      regionCode: "130000000",
    },
    tin,
    vatRegistrationType:
      classification === "Individual" ? "Non-VAT" : "VAT Registered",
    atcCode: classification === "Individual" ? "WI 010" : "WC 158",
    email,
    contactNo,
    createdAt,
    updatedAt,
  };
}

function createEmptyPartyAddress(): PartyAddress {
  return {
    addressLine1: "",
    addressLine2: "",
    barangay: "",
    barangayCode: "",
    cityMunicipality: "",
    cityMunicipalityCode: "",
    province: "",
    provinceCode: "",
    region: "",
    regionCode: "",
  };
}

function normalizePartyAddress(address: PartyAddress): PartyAddress {
  return {
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim(),
    barangay: address.barangay.trim(),
    barangayCode: address.barangayCode,
    cityMunicipality: address.cityMunicipality.trim(),
    cityMunicipalityCode: address.cityMunicipalityCode,
    province: address.province.trim(),
    provinceCode: address.provinceCode,
    region: address.region.trim(),
    regionCode: address.regionCode,
  };
}
