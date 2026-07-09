import {
  BIRAtcSourceUrl,
  PartyTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
  isAtcCodeLike,
  normalizeAtcCode,
} from "@/app/src/data/shared/tax/AtcCode";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import type {
  PartyAddress,
  PartyClassification,
  PartyInformationFormValues,
  PartyInformationRecord,
  PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export const MaxPartyAddressCount = 10;

export const PartyAtcCodeSource = {
  label:
    "BIR Form 2307, January 2018 ENCS - Schedules of Alphanumeric Tax Codes",
  url: BIRAtcSourceUrl,
};

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
  addresses: [createEmptyPartyAddress()],
  activeAddressId: "address-default",
  defaultReceivableAccount: "",
  defaultPayableAccount: "",
  employeeReceivableAccount: "",
  employeeAdvanceAccount: "",
  termId: "",
  termName: "",
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
      id: "party-001-address-default",
      addressName: "Default Address",
      addressLine1: "Unit 1204 Finance Center",
      addressLine2: "26th Street",
      barangay: "Bonifacio Global City",
      barangayCode: "137607000",
      cityMunicipality: "Taguig City",
      cityMunicipalityCode: "137607000",
      isBilling: true,
      isDefault: true,
      isDelivery: true,
      province: "Metro Manila",
      provinceCode: "137600000",
      region: "National Capital Region",
      regionCode: "130000000",
    },
    addresses: [],
    defaultReceivableAccount: "1010200001",
    defaultPayableAccount: "2010100001",
    employeeReceivableAccount: "",
    employeeAdvanceAccount: "",
    termId: "term-1",
    termName: "Standard payment terms",
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
      id: "party-002-address-default",
      addressName: "Default Address",
      addressLine1: "42 Sampaguita Street",
      addressLine2: "",
      barangay: "San Lorenzo",
      barangayCode: "137602000",
      cityMunicipality: "Makati City",
      cityMunicipalityCode: "137602000",
      isBilling: false,
      isDefault: true,
      isDelivery: false,
      province: "Metro Manila",
      provinceCode: "137600000",
      region: "National Capital Region",
      regionCode: "130000000",
    },
    addresses: [],
    defaultReceivableAccount: "",
    defaultPayableAccount: "",
    employeeReceivableAccount: "",
    employeeAdvanceAccount: "1010300001",
    termId: "",
    termName: "",
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
      id: "party-003-address-default",
      addressName: "Default Address",
      addressLine1: "Warehouse 8, Harbor Industrial Park",
      addressLine2: "R-10 Road",
      barangay: "Tangos North",
      barangayCode: "137503000",
      cityMunicipality: "Navotas City",
      cityMunicipalityCode: "137503000",
      isBilling: true,
      isDefault: true,
      isDelivery: false,
      province: "Metro Manila",
      provinceCode: "137500000",
      region: "National Capital Region",
      regionCode: "130000000",
    },
    addresses: [],
    defaultReceivableAccount: "",
    defaultPayableAccount: "2010100001",
    employeeReceivableAccount: "",
    employeeAdvanceAccount: "",
    termId: "term-1",
    termName: "Standard payment terms",
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
      id: "party-004-address-default",
      addressName: "Default Address",
      addressLine1: "15 Orchid Lane",
      addressLine2: "Phase 2",
      barangay: "Lahug",
      barangayCode: "072217000",
      cityMunicipality: "Cebu City",
      cityMunicipalityCode: "072217000",
      isBilling: true,
      isDefault: true,
      isDelivery: true,
      province: "Cebu",
      provinceCode: "072200000",
      region: "Central Visayas",
      regionCode: "070000000",
    },
    addresses: [],
    defaultReceivableAccount: "1010200001",
    defaultPayableAccount: "",
    employeeReceivableAccount: "",
    employeeAdvanceAccount: "",
    termId: "term-1",
    termName: "Standard payment terms",
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
  const addresses = normalizePartyAddressesForForm(record);
  const defaultAddress = getDefaultPartyAddress(addresses);

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
    address: { ...defaultAddress },
    addresses,
    activeAddressId: defaultAddress.id,
    defaultReceivableAccount: record.defaultReceivableAccount ?? "",
    defaultPayableAccount: record.defaultPayableAccount ?? "",
    employeeReceivableAccount: record.employeeReceivableAccount ?? "",
    employeeAdvanceAccount: record.employeeAdvanceAccount ?? "",
    termId: record.termId ?? "",
    termName: record.termName ?? "",
    tin: record.tin,
    vatRegistrationType: record.vatRegistrationType,
    atcCode: record.atcCode ? normalizeAtcCode(record.atcCode) : "",
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
    address: getDefaultPartyAddress(values.addresses),
    addresses: normalizePartyAddresses(values.addresses),
    defaultReceivableAccount: values.defaultReceivableAccount,
    defaultPayableAccount: values.defaultPayableAccount,
    employeeReceivableAccount: "",
    employeeAdvanceAccount: values.employeeAdvanceAccount,
    termId: values.termId,
    termName: values.termName,
    tin: values.tin.trim(),
    vatRegistrationType: values.vatRegistrationType,
    atcCode: values.atcCode ? normalizeAtcCode(values.atcCode) : "",
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
  const normalizedCode = normalizeAtcCode(value);

  return isAtcCodeLike(normalizedCode);
}

function normalizePartyRecordValues(
  values: PartyInformationFormValues,
): Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt"> {
  if (!values.classification) {
    throw new Error("Party classification is required.");
  }

  const addresses = normalizePartyAddresses(values.addresses);
  const defaultAddress = getDefaultPartyAddress(addresses);

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
    address: defaultAddress,
    addresses,
    defaultReceivableAccount: values.partyTypes.includes("Customer")
      ? values.defaultReceivableAccount
      : "",
    defaultPayableAccount: values.partyTypes.includes("Vendor")
      ? values.defaultPayableAccount
      : "",
    employeeReceivableAccount: "",
    employeeAdvanceAccount: values.partyTypes.includes("Employee")
      ? values.employeeAdvanceAccount
      : "",
    termId: values.termId,
    termName: values.termName,
    tin: values.tin.trim(),
    atcCode: values.atcCode ? normalizeAtcCode(values.atcCode) : "",
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
      id: `${id}-address-default`,
      addressName: "Default Address",
      addressLine1: "Makati Business District",
      addressLine2: "",
      barangay: "San Lorenzo",
      barangayCode: "137602000",
      cityMunicipality: "Makati City",
      cityMunicipalityCode: "137602000",
      isBilling: true,
      isDefault: true,
      isDelivery: false,
      province: "Metro Manila",
      provinceCode: "137600000",
      region: "National Capital Region",
      regionCode: "130000000",
    },
    addresses: [],
    defaultReceivableAccount: partyTypes.includes("Customer")
      ? "1010200001"
      : "",
    defaultPayableAccount: partyTypes.includes("Vendor") ? "2010100001" : "",
    employeeReceivableAccount: "",
    employeeAdvanceAccount: partyTypes.includes("Employee") ? "1010300001" : "",
    termId: partyTypes.includes("Employee") ? "" : "term-1",
    termName: partyTypes.includes("Employee") ? "" : "Standard payment terms",
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

export function createEmptyPartyAddress(
  options: {
    addressName?: string;
    id?: string;
    isDefault?: boolean;
  } = {},
): PartyAddress {
  return {
    id: options.id ?? "address-default",
    addressName: options.addressName ?? "Default Address",
    addressLine1: "",
    addressLine2: "",
    barangay: "",
    barangayCode: "",
    cityMunicipality: "",
    cityMunicipalityCode: "",
    isBilling: false,
    isDefault: options.isDefault ?? true,
    isDelivery: false,
    province: "",
    provinceCode: "",
    region: "",
    regionCode: "",
  };
}

function normalizePartyAddress(address: PartyAddress): PartyAddress {
  return {
    id: address.id,
    addressName: address.addressName.trim() || "Address",
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim(),
    barangay: address.barangay.trim(),
    barangayCode: address.barangayCode,
    cityMunicipality: address.cityMunicipality.trim(),
    cityMunicipalityCode: address.cityMunicipalityCode,
    isBilling: address.isBilling,
    isDefault: address.isDefault,
    isDelivery: address.isDelivery,
    province: address.province.trim(),
    provinceCode: address.provinceCode,
    region: address.region.trim(),
    regionCode: address.regionCode,
  };
}

function normalizePartyAddresses(addresses: PartyAddress[]) {
  return setPartyDefaultAddress(addresses.map(normalizePartyAddress));
}

export function setPartyDefaultAddress(
  addresses: PartyAddress[],
  addressId?: string,
) {
  const requestedIndex = addressId
    ? addresses.findIndex((address) => address.id === addressId)
    : -1;
  const currentDefaultIndex = addresses.findIndex(
    (address) => address.isDefault,
  );
  const defaultIndex =
    requestedIndex >= 0
      ? requestedIndex
      : currentDefaultIndex >= 0
        ? currentDefaultIndex
        : 0;

  return addresses.map((address, index) => {
    const isDefault = index === defaultIndex;

    return {
      ...address,
      isBilling: isDefault ? false : address.isBilling,
      isDefault,
      isDelivery: isDefault ? false : address.isDelivery,
    };
  }).sort((first, second) => Number(second.isDefault) - Number(first.isDefault));
}

function normalizePartyAddressesForForm(record: PartyInformationRecord) {
  const addresses =
    record.addresses?.length > 0 ? record.addresses : [record.address];

  return normalizePartyAddresses(
    addresses.map((address, index) => ({
      ...createEmptyPartyAddress(),
      ...address,
      id: address.id || `${record.id}-address-${index + 1}`,
      addressName:
        address.addressName || (index === 0 ? "Default Address" : "Address"),
      isDefault: address.isDefault || index === 0,
    })),
  );
}

function getDefaultPartyAddress(addresses: PartyAddress[]) {
  return (
    normalizePartyAddresses(addresses).find((address) => address.isDefault) ??
    createEmptyPartyAddress()
  );
}
