import {
  BIRAtcSourceUrl,
  PartyClassificationOptions,
  PartyImportDefaultColumnIndexes,
  PartyImportMaxFileSizeBytes,
  PartyImportMinFileSizeBytes,
  PartyImportTemplateHeaders,
  PartyTypeOptions,
  VatRegistrationTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
  isAtcCodeLike,
  normalizeAtcCode,
} from "@/app/src/data/shared/tax/AtcCode";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import type {
  PartyAddress,
  PartyClassification,
  PartyImportCellErrors,
  PartyImportCellWarnings,
  PartyImportColumnId,
  PartyImportPreviewRow,
  PartyInformationFormValues,
  PartyInformationRecord,
  PartyType,
  VatRegistrationType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";

export const PartyAtcCodeSource = {
  label:
    "BIR Form 2307, January 2018 ENCS - Schedules of Alphanumeric Tax Codes",
  url: BIRAtcSourceUrl,
};

export const PartyDefaultAccountingAccounts = {
  customerAdvanceAccount: "",
  defaultPayableAccount: "",
  defaultReceivableAccount: "",
  employeeAdvanceAccount: "",
  employeePayableAccount: "",
  vendorAdvanceAccount: "",
} as const;

type PartyDefaultAccountingAccountValues = {
  customerAdvanceAccount: string;
  defaultPayableAccount: string;
  defaultReceivableAccount: string;
  employeeAdvanceAccount: string;
  employeePayableAccount: string;
  vendorAdvanceAccount: string;
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
  customerAdvanceAccount: "",
  defaultPayableAccount: "",
  vendorAdvanceAccount: "",
  employeeAdvanceAccount: "",
  employeePayableAccount: "",
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
    defaultReceivableAccount: "",
    customerAdvanceAccount: "",
    defaultPayableAccount: "",
    vendorAdvanceAccount: "",
    employeeAdvanceAccount: "",
    employeePayableAccount: "",
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
    customerAdvanceAccount: "",
    defaultPayableAccount: "",
    vendorAdvanceAccount: "",
    employeeAdvanceAccount: "",
    employeePayableAccount: "",
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
    customerAdvanceAccount: "",
    defaultPayableAccount: "",
    vendorAdvanceAccount: "",
    employeeAdvanceAccount: "",
    employeePayableAccount: "",
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
    defaultReceivableAccount: "",
    customerAdvanceAccount: "",
    defaultPayableAccount: "",
    vendorAdvanceAccount: "",
    employeeAdvanceAccount: "",
    employeePayableAccount: "",
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
  const accountingAccounts = applyPartyDefaultAccountingAccounts(
    {
      defaultReceivableAccount: record.defaultReceivableAccount ?? "",
      customerAdvanceAccount: record.customerAdvanceAccount ?? "",
      defaultPayableAccount: record.defaultPayableAccount ?? "",
      vendorAdvanceAccount: record.vendorAdvanceAccount ?? "",
      employeeAdvanceAccount: record.employeeAdvanceAccount ?? "",
      employeePayableAccount: record.employeePayableAccount ?? "",
    },
    record.partyTypes,
  );

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
    defaultReceivableAccount: accountingAccounts.defaultReceivableAccount,
    customerAdvanceAccount: accountingAccounts.customerAdvanceAccount,
    defaultPayableAccount: accountingAccounts.defaultPayableAccount,
    vendorAdvanceAccount: accountingAccounts.vendorAdvanceAccount,
    employeeAdvanceAccount: accountingAccounts.employeeAdvanceAccount,
    employeePayableAccount: accountingAccounts.employeePayableAccount,
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
  const partyTypes = normalizePartyTypesForClassification(
    values.partyTypes,
    values.classification,
  );
  const addresses = normalizePartyAddresses(
    values.addresses,
    partyTypes,
    values.classification,
  );
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
  const accountingAccounts = applyPartyDefaultAccountingAccounts(
    values,
    partyTypes,
  );

  return {
    partyCodeNo: values.partyCodeNo.trim(),
    classification: values.classification,
    partyTypes,
    status: values.status,
    name,
    tradeName:
      values.classification === "Non-Individual"
        ? values.tradeName.trim() || null
        : null,
    address: getDefaultPartyAddress(addresses),
    addresses,
    defaultReceivableAccount: partyTypes.includes("Customer")
      ? accountingAccounts.defaultReceivableAccount
      : "",
    customerAdvanceAccount: partyTypes.includes("Customer")
      ? accountingAccounts.customerAdvanceAccount
      : "",
    defaultPayableAccount: partyTypes.includes("Vendor")
      ? accountingAccounts.defaultPayableAccount
      : "",
    vendorAdvanceAccount: partyTypes.includes("Vendor")
      ? accountingAccounts.vendorAdvanceAccount
      : "",
    employeeAdvanceAccount: partyTypes.includes("Employee")
      ? accountingAccounts.employeeAdvanceAccount
      : "",
    employeePayableAccount: partyTypes.includes("Employee")
      ? accountingAccounts.employeePayableAccount
      : "",
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

export function createExistingPartyIdentityMap(
  parties: PartyInformationRecord[],
) {
  const codes = new Map<string, string>();
  const names = new Map<string, string>();

  parties.forEach((party) => {
    const normalizedCode = normalizePartyIdentity(party.partyCodeNo);
    const normalizedName = normalizePartyIdentity(getPartyDisplayName(party));

    if (normalizedCode) {
      codes.set(normalizedCode, party.partyCodeNo);
    }

    if (normalizedName) {
      names.set(normalizedName, getPartyDisplayName(party));
    }
  });

  return { codes, names };
}

export function createBlankPartyImportRow(
  rowNumber: number,
): PartyImportPreviewRow {
  const address = createEmptyPartyAddress({
    id: `party-import-address-${rowNumber}`,
    isBilling: true,
    isDefault: true,
  });

  return {
    cellErrors: {},
    cellWarnings: {},
    id: `party-import-preview-${rowNumber}-${Date.now()}`,
    party: {
      partyCodeNo: "",
      classification: "Non-Individual",
      partyTypes: ["Vendor"],
      status: "Active",
      partyName: "",
      tradeName: "",
      firstName: "",
      middleName: "",
      lastName: "",
      suffixName: "",
      address,
      addresses: [address],
      defaultReceivableAccount: "",
      customerAdvanceAccount: "",
      defaultPayableAccount: PartyDefaultAccountingAccounts.defaultPayableAccount,
      vendorAdvanceAccount: PartyDefaultAccountingAccounts.vendorAdvanceAccount,
      employeeAdvanceAccount: "",
      employeePayableAccount: "",
      termId: "",
      termName: "",
      tin: "",
      vatRegistrationType: "",
      atcCode: "",
      email: "",
      contactNo: "",
    },
    rowErrors: [],
    rowNumber,
  };
}

export function renumberPartyImportRows(rows: PartyImportPreviewRow[]) {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

export function removeDuplicatePartyImportRows(
  rows: PartyImportPreviewRow[],
  baseRows: PartyImportPreviewRow[],
) {
  const seenCodes = new Set(
    baseRows
      .map((row) => normalizePartyIdentity(row.party.partyCodeNo))
      .filter(Boolean),
  );
  const seenNames = new Set(
    baseRows
      .map((row) => normalizePartyIdentity(getImportPartyDisplayName(row.party)))
      .filter(Boolean),
  );
  const uniqueRows: PartyImportPreviewRow[] = [];
  let skippedCount = 0;

  rows.forEach((row) => {
    const normalizedCode = normalizePartyIdentity(row.party.partyCodeNo);
    const normalizedName = normalizePartyIdentity(
      getImportPartyDisplayName(row.party),
    );

    if (
      (normalizedCode && seenCodes.has(normalizedCode)) ||
      (normalizedName && seenNames.has(normalizedName))
    ) {
      skippedCount += 1;
      return;
    }

    if (normalizedCode) {
      seenCodes.add(normalizedCode);
    }
    if (normalizedName) {
      seenNames.add(normalizedName);
    }
    uniqueRows.push(row);
  });

  return { rows: uniqueRows, skippedCount };
}

export function getNextPartyImportRowNumber(rows: PartyImportPreviewRow[]) {
  return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function normalizeImportedPartyCellValue(
  field: PartyImportColumnId,
  value: string,
) {
  if (field === "classification") {
    return normalizeImportedPartyClassification(value);
  }

  if (field === "partyTypes") {
    return normalizeImportedPartyTypes(value);
  }

  if (field === "vatRegistrationType") {
    return normalizeImportedVatRegistrationType(value);
  }

  if (field === "tin") {
    return formatImportedTin(value);
  }

  if (field === "atcCode") {
    return value ? normalizeAtcCode(value) : "";
  }

  return value;
}

export async function downloadPartyImportTemplate() {
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet("Parties");

    worksheet.addRow(PartyImportTemplateHeaders);
    for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
      worksheet.getCell(`B${rowNumber}`).dataValidation = {
        allowBlank: false,
        formulae: [`"${PartyClassificationOptions.join(",")}"`],
        showErrorMessage: true,
        type: "list",
      };
      worksheet.getCell(`K${rowNumber}`).dataValidation = {
        allowBlank: true,
        formulae: [`"${VatRegistrationTypeOptions.join(",")}"`],
        showErrorMessage: true,
        type: "list",
      };
    }
    worksheet.columns = PartyImportTemplateHeaders.map((header) => ({
      width: Math.max(14, header.length + 4),
    }));

    const buffer = await workbook.xlsx.writeBuffer();

    downloadBlob(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "party-management-import-template.xlsx",
    );
  } catch {
    downloadBlob(
      new Blob([createPartyImportTemplateCsv()], {
        type: "text/csv;charset=utf-8",
      }),
      "party-management-import-template.csv",
    );
  }
}

function createPartyImportTemplateCsv() {
  return [PartyImportTemplateHeaders]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
}

export async function readPartyImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    const rows = await readPartyImportXlsxRows(await file.arrayBuffer());

    return formatPartyImportRowsAsText(rows);
  }

  if (
    fileName.endsWith(".csv") ||
    fileName.endsWith(".tsv") ||
    fileName.endsWith(".txt")
  ) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

async function readPartyImportXlsxRows(buffer: ArrayBuffer) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.default.Workbook();

  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("No worksheet was found in the Excel file.");
  }

  const rows: string[][] = [];

  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];

    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cells[columnNumber - 1] = formatPartyImportExcelCellValue(
        cell.value,
        cell.text,
      );
    });
    rows.push(cells);
  });

  return rows;
}

export function parsePartyImportText(
  text: string,
  startRowNumber = 1,
): PartyImportPreviewRow[] {
  const rows = parsePartyImportTabularRows(text).filter((row) =>
    row.some((cell) => cell.trim() !== ""),
  );

  if (rows.length === 0) {
    return [];
  }

  const headerIndexes = getPartyImportHeaderIndexes(rows[0]);
  const indexes = headerIndexes ?? PartyImportDefaultColumnIndexes;
  const dataRows = headerIndexes ? rows.slice(1) : rows;
  const importBatchId = Date.now();

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row, index) => {
      const rowNumber = startRowNumber + index;

      return createPartyImportPreviewRow(row, indexes, rowNumber, importBatchId, index);
    });
}

function createPartyImportPreviewRow(
  row: string[],
  indexes: Partial<Record<PartyImportColumnId, number>>,
  rowNumber: number,
  importBatchId: number,
  index: number,
): PartyImportPreviewRow {
  const classification = normalizeImportedPartyClassification(
    getImportedPartyValue(row, indexes.classification),
  );
  const partyTypes = normalizeImportedPartyTypes(
    getImportedPartyValue(row, indexes.partyTypes),
  );
  const normalizedPartyTypes = normalizePartyTypesForClassification(
    partyTypes,
    classification,
  );
  const address = createEmptyPartyAddress({
    id: `party-import-${importBatchId}-${index}-address-default`,
    isBilling:
      normalizedPartyTypes.includes("Customer") ||
      normalizedPartyTypes.includes("Vendor"),
    isDefault: true,
    isDelivery: normalizedPartyTypes.includes("Customer"),
    isHome: normalizedPartyTypes.includes("Employee"),
  });
  const accountingAccounts = applyPartyDefaultAccountingAccounts(
    {
      customerAdvanceAccount: "",
      defaultPayableAccount: "",
      defaultReceivableAccount: "",
      employeeAdvanceAccount: "",
      employeePayableAccount: "",
      vendorAdvanceAccount: "",
    },
    normalizedPartyTypes,
  );
  const party: Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt"> = {
    partyCodeNo: getImportedPartyValue(row, indexes.partyCodeNo),
    classification,
    partyTypes: normalizedPartyTypes,
    status: "Active",
    partyName: getImportedPartyValue(row, indexes.partyName),
    tradeName: getImportedPartyValue(row, indexes.tradeName),
    firstName: getImportedPartyValue(row, indexes.firstName),
    middleName: getImportedPartyValue(row, indexes.middleName),
    lastName: getImportedPartyValue(row, indexes.lastName),
    suffixName: getImportedPartyValue(row, indexes.suffixName),
    address: {
      ...address,
      addressLine1: getImportedPartyValue(row, indexes.addressLine1),
      addressLine2: getImportedPartyValue(row, indexes.addressLine2),
      barangay: getImportedPartyValue(row, indexes.barangay),
      cityMunicipality: getImportedPartyValue(row, indexes.cityMunicipality),
      province: getImportedPartyValue(row, indexes.province),
      region: getImportedPartyValue(row, indexes.region),
    },
    addresses: [],
    ...accountingAccounts,
    termId: "",
    termName: "",
    tin: formatImportedTin(getImportedPartyValue(row, indexes.tin)),
    vatRegistrationType: normalizeImportedVatRegistrationType(
      getImportedPartyValue(row, indexes.vatRegistrationType),
    ),
    atcCode: normalizeAtcCode(getImportedPartyValue(row, indexes.atcCode)),
    email: getImportedPartyValue(row, indexes.email),
    contactNo: getImportedPartyValue(row, indexes.contactNo),
  };

  party.addresses = [party.address];

  return {
    cellErrors: {},
    cellWarnings: {},
    id: `party-import-preview-${rowNumber}-${importBatchId}-${index}`,
    party,
    rowErrors: [],
    rowNumber,
  };
}

export function validatePartyImportRows(
  rows: PartyImportPreviewRow[],
  existingPartyIdentities: ReturnType<typeof createExistingPartyIdentityMap>,
) {
  const importedCodeCounts = new Map<string, number>();
  const importedNameCounts = new Map<string, number>();

  rows.forEach((row) => {
    const normalizedCode = normalizePartyIdentity(row.party.partyCodeNo);
    const normalizedName = normalizePartyIdentity(
      getImportPartyDisplayName(row.party),
    );

    if (normalizedCode) {
      importedCodeCounts.set(
        normalizedCode,
        (importedCodeCounts.get(normalizedCode) ?? 0) + 1,
      );
    }
    if (normalizedName) {
      importedNameCounts.set(
        normalizedName,
        (importedNameCounts.get(normalizedName) ?? 0) + 1,
      );
    }
  });

  return rows.map((row) => {
    const cellErrors: PartyImportCellErrors = {};
    const cellWarnings: PartyImportCellWarnings = {};
    const rowErrors: string[] = [];
    const normalizedCode = normalizePartyIdentity(row.party.partyCodeNo);
    const normalizedName = normalizePartyIdentity(
      getImportPartyDisplayName(row.party),
    );

    if (!row.party.partyCodeNo.trim()) {
      cellErrors.partyCodeNo = ["Party code is required."];
    }
    if (
      normalizedCode &&
      existingPartyIdentities.codes.has(normalizedCode)
    ) {
      cellErrors.partyCodeNo = [
        ...(cellErrors.partyCodeNo ?? []),
        `Party code already exists: ${existingPartyIdentities.codes.get(normalizedCode)}.`,
      ];
    }
    if (
      normalizedCode &&
      (importedCodeCounts.get(normalizedCode) ?? 0) > 1
    ) {
      cellErrors.partyCodeNo = [
        ...(cellErrors.partyCodeNo ?? []),
        "Duplicate party code in import.",
      ];
    }

    if (!PartyClassificationOptions.includes(row.party.classification)) {
      cellErrors.classification = [
        "Classification must be Individual or Non-Individual.",
      ];
    }

    if (row.party.partyTypes.length === 0) {
      cellErrors.partyTypes = ["Select at least one party type."];
    }
    if (
      row.party.classification === "Non-Individual" &&
      row.party.partyTypes.includes("Employee")
    ) {
      cellErrors.partyTypes = [
        ...(cellErrors.partyTypes ?? []),
        "Employee is only available for individual parties.",
      ];
    }

    if (row.party.classification === "Non-Individual") {
      if (!row.party.partyName.trim()) {
        cellErrors.partyName = ["Party name is required."];
      }
    } else {
      if (!row.party.firstName.trim()) {
        cellErrors.firstName = ["First name is required."];
      }
      if (!row.party.lastName.trim()) {
        cellErrors.lastName = ["Last name is required."];
      }
    }

    if (
      normalizedName &&
      existingPartyIdentities.names.has(normalizedName)
    ) {
      const field =
        row.party.classification === "Individual" ? "lastName" : "partyName";
      cellErrors[field] = [
        ...(cellErrors[field] ?? []),
        `Party already exists: ${existingPartyIdentities.names.get(normalizedName)}.`,
      ];
    }
    if (
      normalizedName &&
      (importedNameCounts.get(normalizedName) ?? 0) > 1
    ) {
      const field =
        row.party.classification === "Individual" ? "lastName" : "partyName";
      cellErrors[field] = [
        ...(cellErrors[field] ?? []),
        "Duplicate party name in import.",
      ];
    }

    if (
      row.party.vatRegistrationType &&
      !VatRegistrationTypeOptions.includes(row.party.vatRegistrationType)
    ) {
      cellErrors.vatRegistrationType = ["Choose a valid VAT registration type."];
    }
    if (row.party.atcCode && !isAtcCodeLike(row.party.atcCode)) {
      cellErrors.atcCode = ["Enter a valid BIR ATC code."];
    }
    if (row.party.tin && !/^\d{3}-\d{3}-\d{3}-\d{3}$/.test(row.party.tin)) {
      cellErrors.tin = ["TIN must use the format 000-000-000-000."];
    }
    if (row.party.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.party.email)) {
      cellErrors.email = ["Enter a valid email address."];
    }
    if (
      row.party.contactNo &&
      !/^\+63 \d{3} \d{3} \d{4}$/.test(row.party.contactNo)
    ) {
      cellErrors.contactNo = [
        "Enter a valid contact number in the +63 000 000 0000 format.",
      ];
    }

    if (!row.party.address.addressLine1.trim()) {
      cellWarnings.addressLine1 = [
        "Address line 1 is blank. You can complete it after import.",
      ];
    }

    return { ...row, cellErrors, cellWarnings, rowErrors };
  });
}

export function partyImportRowHasErrors(row: PartyImportPreviewRow) {
  return (
    row.rowErrors.length > 0 ||
    Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
  );
}

export function validatePartyImportFileSize(file: File) {
  if (file.size < PartyImportMinFileSizeBytes) {
    return `Upload a file larger than ${formatFileSize(PartyImportMinFileSizeBytes)}.`;
  }

  if (file.size > PartyImportMaxFileSizeBytes) {
    return `Upload a file up to ${formatFileSize(PartyImportMaxFileSizeBytes)}.`;
  }

  return null;
}

export function isPartyImportGridPasteTarget(target: EventTarget | null) {
  return !(
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

export function createPartyImportRecord(
  party: Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt">,
  index: number,
): PartyInformationRecord {
  const now = new Date().toISOString();
  const partyTypes = normalizePartyTypesForClassification(
    party.partyTypes,
    party.classification,
  );
  const accountingAccounts = applyPartyDefaultAccountingAccounts(
    party,
    partyTypes,
  );
  const addresses = applyDefaultAddressRoles(
    [
      {
        ...party.address,
        addressName: party.address.addressName || "Default Address",
        isDefault: true,
      },
    ],
    partyTypes,
    party.classification,
  );
  const address = addresses[0] ?? createEmptyPartyAddress();

  return {
    ...party,
    id: `party-import-${Date.now()}-${index}`,
    partyCodeNo: party.partyCodeNo.trim(),
    classification: party.classification,
    partyTypes,
    status: party.status,
    partyName:
      party.classification === "Non-Individual" ? party.partyName.trim() : "",
    tradeName:
      party.classification === "Non-Individual" ? party.tradeName.trim() : "",
    firstName:
      party.classification === "Individual" ? party.firstName.trim() : "",
    middleName:
      party.classification === "Individual" ? party.middleName.trim() : "",
    lastName:
      party.classification === "Individual" ? party.lastName.trim() : "",
    suffixName:
      party.classification === "Individual" ? party.suffixName.trim() : "",
    address,
    addresses,
    defaultReceivableAccount: partyTypes.includes("Customer")
      ? accountingAccounts.defaultReceivableAccount
      : "",
    customerAdvanceAccount: partyTypes.includes("Customer")
      ? accountingAccounts.customerAdvanceAccount
      : "",
    defaultPayableAccount: partyTypes.includes("Vendor")
      ? accountingAccounts.defaultPayableAccount
      : "",
    vendorAdvanceAccount: partyTypes.includes("Vendor")
      ? accountingAccounts.vendorAdvanceAccount
      : "",
    employeeAdvanceAccount: partyTypes.includes("Employee")
      ? accountingAccounts.employeeAdvanceAccount
      : "",
    employeePayableAccount: partyTypes.includes("Employee")
      ? accountingAccounts.employeePayableAccount
      : "",
    tin: party.tin.trim(),
    atcCode: party.atcCode ? normalizeAtcCode(party.atcCode) : "",
    email: party.email.trim(),
    contactNo: normalizePartyContactNo(party.contactNo),
    createdAt: now,
    updatedAt: now,
  };
}

export function applyPartyDefaultAccountingAccounts<
  TValues extends Pick<
    PartyInformationFormValues,
    | "customerAdvanceAccount"
    | "defaultPayableAccount"
    | "defaultReceivableAccount"
    | "employeeAdvanceAccount"
    | "employeePayableAccount"
    | "vendorAdvanceAccount"
  >,
>(
  values: TValues,
  partyTypes: PartyType[],
  defaults: PartyDefaultAccountingAccountValues = PartyDefaultAccountingAccounts,
) {
  return {
    ...values,
    defaultReceivableAccount: partyTypes.includes("Customer")
      ? values.defaultReceivableAccount ||
        defaults.defaultReceivableAccount
      : "",
    customerAdvanceAccount: partyTypes.includes("Customer")
      ? values.customerAdvanceAccount ||
        defaults.customerAdvanceAccount
      : "",
    defaultPayableAccount: partyTypes.includes("Vendor")
      ? values.defaultPayableAccount ||
        defaults.defaultPayableAccount
      : "",
    vendorAdvanceAccount: partyTypes.includes("Vendor")
      ? values.vendorAdvanceAccount ||
        defaults.vendorAdvanceAccount
      : "",
    employeeAdvanceAccount: partyTypes.includes("Employee")
      ? values.employeeAdvanceAccount ||
        defaults.employeeAdvanceAccount
      : "",
    employeePayableAccount: partyTypes.includes("Employee")
      ? values.employeePayableAccount ||
        defaults.employeePayableAccount
      : "",
  };
}

function normalizePartyRecordValues(
  values: PartyInformationFormValues,
): Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt"> {
  if (!values.classification) {
    throw new Error("Party classification is required.");
  }

  const partyTypes = normalizePartyTypesForClassification(
    values.partyTypes,
    values.classification,
  );
  const addresses = normalizePartyAddresses(
    values.addresses,
    partyTypes,
    values.classification,
  );
  const defaultAddress = getDefaultPartyAddress(addresses);
  const accountingAccounts = applyPartyDefaultAccountingAccounts(
    values,
    partyTypes,
  );

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
    partyTypes,
    defaultReceivableAccount: partyTypes.includes("Customer")
      ? accountingAccounts.defaultReceivableAccount
      : "",
    customerAdvanceAccount: partyTypes.includes("Customer")
      ? accountingAccounts.customerAdvanceAccount
      : "",
    defaultPayableAccount: partyTypes.includes("Vendor")
      ? accountingAccounts.defaultPayableAccount
      : "",
    vendorAdvanceAccount: partyTypes.includes("Vendor")
      ? accountingAccounts.vendorAdvanceAccount
      : "",
    employeeAdvanceAccount: partyTypes.includes("Employee")
      ? accountingAccounts.employeeAdvanceAccount
      : "",
    employeePayableAccount: partyTypes.includes("Employee")
      ? accountingAccounts.employeePayableAccount
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
    defaultReceivableAccount: "",
    customerAdvanceAccount: "",
    defaultPayableAccount: "",
    vendorAdvanceAccount: "",
    employeeAdvanceAccount: "",
    employeePayableAccount: "",
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
    isBilling?: boolean;
    isDefault?: boolean;
    isDelivery?: boolean;
    isHome?: boolean;
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
    isBilling: Boolean(options.isBilling),
    isBuilding: false,
    isDefault: options.isDefault ?? true,
    isDelivery: Boolean(options.isDelivery),
    isForeign: false,
    isHome: Boolean(options.isHome),
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
    isBuilding: Boolean(address.isBuilding),
    isDefault: address.isDefault,
    isDelivery: address.isDelivery,
    isForeign: Boolean(address.isForeign),
    isHome: Boolean(address.isHome),
    province: address.province.trim(),
    provinceCode: address.provinceCode,
    region: address.region.trim(),
    regionCode: address.regionCode,
  };
}

function normalizePartyAddresses(
  addresses: PartyAddress[],
  partyTypes: PartyType[] = [],
  classification: PartyClassification | "" = "",
) {
  return applyDefaultAddressRoles(
    addresses.map(normalizePartyAddress),
    partyTypes,
    classification,
  );
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
      addressName: isDefault
        ? address.addressName.trim() || "Default Address"
        : address.addressName === "Default Address"
          ? `Address ${index + 1}`
          : address.addressName,
      isBilling: address.isBilling,
      isBuilding: address.isBuilding,
      isDefault,
      isDelivery: address.isDelivery,
      isForeign: isDefault ? false : address.isForeign,
      isHome: address.isHome,
    };
  }).sort((first, second) => Number(second.isDefault) - Number(first.isDefault));
}

export function clearAddressRolesForPartyTypes(
  addresses: PartyAddress[],
  partyTypes: PartyType[],
  classification: PartyClassification | "" = "",
) {
  return applyDefaultAddressRoles(addresses, partyTypes, classification);
}

export function applyDefaultAddressRoles(
  addresses: PartyAddress[],
  partyTypes: PartyType[],
  classification: PartyClassification | "" = "",
) {
  const normalizedPartyTypes = normalizePartyTypesForClassification(
    partyTypes,
    classification,
  );
  const addressRoles = getPartyAddressRoles(normalizedPartyTypes);

  if (addressRoles.length === 0) {
    return [createEmptyPartyAddress()];
  }

  return addressRoles.map((role, index) => {
    const sourceAddress =
      addresses.find((address) => getAddressRole(address) === role) ??
      (role === "billing" ? addresses[0] : undefined);
    const address = sourceAddress ?? createEmptyPartyAddress();

    return {
      ...address,
      id: address.id && getAddressRole(address) === role ? address.id : `address-${role}`,
      addressName: getAddressRoleLabel(role),
      isBilling: role === "billing",
      isBuilding: false,
      isDefault: index === 0,
      isDelivery: role === "shipping",
      isHome: role === "home",
    };
  });
}

export function normalizePartyTypesForClassification(
  partyTypes: PartyType[],
  classification: PartyClassification | "",
) {
  if (!classification) {
    return [];
  }

  return classification === "Non-Individual"
    ? partyTypes.filter((partyType) => partyType !== "Employee")
    : partyTypes;
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
    record.partyTypes,
    record.classification,
  );
}

function getDefaultPartyAddress(addresses: PartyAddress[]) {
  return (
    setPartyDefaultAddress(addresses.map(normalizePartyAddress)).find(
      (address) => address.isDefault,
    ) ??
    createEmptyPartyAddress()
  );
}

type PartyAddressRole = "billing" | "home" | "shipping";

function getPartyAddressRoles(partyTypes: PartyType[]): PartyAddressRole[] {
  return [
    partyTypes.includes("Employee") ? "home" : null,
    partyTypes.includes("Customer") || partyTypes.includes("Vendor")
      ? "billing"
      : null,
    partyTypes.includes("Customer") ? "shipping" : null,
  ].filter((role): role is PartyAddressRole => Boolean(role));
}

function getAddressRole(address: PartyAddress): PartyAddressRole | undefined {
  if (address.isHome) {
    return "home";
  }

  if (address.isDelivery) {
    return "shipping";
  }

  if (address.isBilling) {
    return "billing";
  }

  return undefined;
}

function getAddressRoleLabel(role: PartyAddressRole) {
  switch (role) {
    case "billing":
      return "Billing Address";
    case "home":
      return "Home Address";
    case "shipping":
      return "Shipping Address";
  }
}

export function parsePartyImportTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText
        .split("\n")
        .map((line) => line.split("\t").map((cell) => cell.trim()))
    : parsePartyImportCsvRows(normalizedText);
}

function parsePartyImportCsvRows(text: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let isQuoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && isQuoted && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (char === "," && !isQuoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (char === "\n" && !isQuoted) {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  rows.push(row);

  return rows;
}

function getPartyImportHeaderIndexes(row: string[]) {
  const indexes: Partial<Record<PartyImportColumnId, number>> = {};

  row.forEach((cell, index) => {
    const key = normalizePartyImportHeader(cell);

    if (key) {
      indexes[key] = index;
    }
  });

  return Object.keys(indexes).length >= 3 ? indexes : null;
}

function normalizePartyImportHeader(value: string): PartyImportColumnId | null {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["partycode", "partycodeno", "code"].includes(normalized)) return "partyCodeNo";
  if (["classification", "partyclassification"].includes(normalized)) return "classification";
  if (["partytypes", "partytype", "type", "types"].includes(normalized)) return "partyTypes";
  if (["partyname", "name", "companyname", "organizationname"].includes(normalized)) return "partyName";
  if (["tradename"].includes(normalized)) return "tradeName";
  if (["firstname", "givenname"].includes(normalized)) return "firstName";
  if (["middlename"].includes(normalized)) return "middleName";
  if (["lastname", "surname"].includes(normalized)) return "lastName";
  if (["suffixname", "suffix"].includes(normalized)) return "suffixName";
  if (["tin", "tinno", "taxidentificationnumber"].includes(normalized)) return "tin";
  if (["vatregistrationtype", "vatregistry", "vat", "vattype"].includes(normalized)) return "vatRegistrationType";
  if (["atccode", "atc"].includes(normalized)) return "atcCode";
  if (["email", "emailaddress"].includes(normalized)) return "email";
  if (["contactno", "contactnumber", "phone", "mobile"].includes(normalized)) return "contactNo";
  if (["addressline1", "address1"].includes(normalized)) return "addressLine1";
  if (["addressline2", "address2"].includes(normalized)) return "addressLine2";
  if (["barangay", "brgy"].includes(normalized)) return "barangay";
  if (["citymunicipality", "city", "municipality"].includes(normalized)) return "cityMunicipality";
  if (["province"].includes(normalized)) return "province";
  if (["region"].includes(normalized)) return "region";

  return null;
}

function getImportedPartyValue(row: string[], index?: number) {
  return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

export function normalizeImportedPartyClassification(
  value: string,
): PartyClassification {
  const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, "");

  if (["individual", "person"].includes(normalized)) {
    return "Individual";
  }

  if (
    ["nonindividual", "nonindiv", "company", "organization", "corporation"].includes(
      normalized,
    )
  ) {
    return "Non-Individual";
  }

  return (value || "Non-Individual") as PartyClassification;
}

export function normalizeImportedPartyTypes(value: string): PartyType[] {
  const normalizedTypes = value
    .split(/[;,|/]+/)
    .map((type) => type.trim())
    .filter(Boolean)
    .map((type) => {
      const normalized = type.toLowerCase();

      return PartyTypeOptions.find(
        (option) => option.toLowerCase() === normalized,
      );
    })
    .filter((type): type is PartyType => Boolean(type));

  return normalizedTypes.length > 0 ? normalizedTypes : ["Vendor"];
}

function normalizeImportedVatRegistrationType(
  value: string,
): VatRegistrationType | "" {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!normalized) {
    return "";
  }

  return (
    VatRegistrationTypeOptions.find(
      (option) =>
        option.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized,
    ) ?? (value as VatRegistrationType)
  );
}

function formatImportedTin(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  const groups = digits.match(/.{1,3}/g) ?? [];

  return groups.join("-");
}

function getImportPartyDisplayName(
  party: Pick<
    PartyInformationRecord,
    | "classification"
    | "firstName"
    | "middleName"
    | "lastName"
    | "partyName"
    | "suffixName"
  >,
) {
  if (party.classification === "Non-Individual") {
    return party.partyName;
  }

  return [
    party.firstName,
    party.middleName,
    party.lastName,
    party.suffixName,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

export function normalizePartyIdentity(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function formatPartyImportRowsAsText(rows: string[][]) {
  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) =>
      row
        .map((cell) =>
          String(cell ?? "")
            .replace(/\r?\n/g, " ")
            .trim(),
        )
        .join("\t"),
    )
    .join("\n");
}

function formatPartyImportExcelCellValue(value: unknown, displayText?: string) {
  const normalizedDisplayText = String(displayText ?? "")
    .replace(/\r?\n/g, " ")
    .trim();

  if (normalizedDisplayText) {
    return normalizedDisplayText;
  }

  if (value == null) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;

    if (Array.isArray(record.richText)) {
      return record.richText
        .map((part) =>
          typeof part === "object" && part !== null
            ? String((part as Record<string, unknown>).text ?? "")
            : "",
        )
        .join("")
        .replace(/\r?\n/g, " ")
        .trim();
    }

    if ("text" in record) {
      return String(record.text ?? "")
        .replace(/\r?\n/g, " ")
        .trim();
    }

    if ("result" in record) {
      return formatPartyImportExcelCellValue(record.result);
    }
  }

  return String(value).replace(/\r?\n/g, " ").trim();
}

export function waitForNextPartyImportBatch() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 75);
  });
}
