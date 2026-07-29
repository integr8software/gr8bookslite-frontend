import {
  BIRAtcSourceUrl,
  PartyClassificationOptions,
  PartyImportDefaultColumnIndexes,
  PartyImportMaxFileSizeBytes,
  PartyImportMinFileSizeBytes,
  PartyImportTemplateHeaders,
  PartyDefaultNationality,
  PartyTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { isAtcCodeLike, normalizeAtcCode } from "@/app/src/data/shared/tax/AtcCode";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import {
  createEmptyPartyAddress,
  getAddressRoleLabel,
  getDefaultPartyAddress,
  getPartyAddressRoles,
  hasPersonalInformationPartyType,
  normalizePartyAddresses,
  normalizePartyAddressesForForm,
  normalizePartyTypesForClassification,
} from "@/app/src/data/modules/party-management/PartyManagementAddressData";
import type { PartyAddressRole } from "@/app/src/data/modules/party-management/PartyManagementAddressData";
import type {
  PartyAddress,
  PartyClassification,
  PartyImportCellErrors,
  PartyImportCellWarnings,
  PartyImportColumnId,
  PartyImportPreviewRow,
  PartyInformationFormValues,
  PartyInformationRecord,
  PartyInformationTableRecord,
  PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { todayDateValue } from "@/app/src/utils/date.util";
import { formatFileSize } from "@/app/src/utils/file.util";
import { isModuleImportOptionValue } from "@/app/src/utils/module-import.util";

export const PartyAtcCodeSource = {
  label: "BIR Form 2307, January 2018 ENCS - Schedules of Alphanumeric Tax Codes",
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

const PartyDefaultTaxSourceKeys = {
  defaultPurchaseInputVatTaxSourceKey: "",
  defaultPurchaseEwtTaxSourceKey: "",
  defaultPurchaseFwtTaxSourceKey: "",
  defaultPurchaseWvatTaxSourceKey: "",
  defaultSalesOutputVatTaxSourceKey: "",
  defaultSalesCwtTaxSourceKey: "",
  defaultSalesWvatTaxSourceKey: "",
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
  honorific: "",
  gender: "",
  civilStatus: "",
  nationality: PartyDefaultNationality,
  memberRegistrationDate: "",
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
  atcCode: "",
  ...PartyDefaultTaxSourceKeys,
  email: "",
  contactNo: "",
  landline: "",
};

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
    honorific: normalizePartyHonorific(record.honorific ?? ""),
    gender: record.gender ?? "",
    civilStatus: record.civilStatus ?? "",
    nationality: record.nationality ?? PartyDefaultNationality,
    memberRegistrationDate: record.memberRegistrationDate ?? "",
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
    atcCode: record.atcCode ? normalizeAtcCode(record.atcCode) : "",
    defaultPurchaseInputVatTaxSourceKey: record.defaultPurchaseInputVatTaxSourceKey ?? "",
    defaultPurchaseEwtTaxSourceKey: record.defaultPurchaseEwtTaxSourceKey ?? "",
    defaultPurchaseFwtTaxSourceKey: record.defaultPurchaseFwtTaxSourceKey ?? "",
    defaultPurchaseWvatTaxSourceKey: record.defaultPurchaseWvatTaxSourceKey ?? "",
    defaultSalesOutputVatTaxSourceKey: record.defaultSalesOutputVatTaxSourceKey ?? "",
    defaultSalesCwtTaxSourceKey: record.defaultSalesCwtTaxSourceKey ?? "",
    defaultSalesWvatTaxSourceKey: record.defaultSalesWvatTaxSourceKey ?? "",
    email: record.email,
    contactNo: record.contactNo,
    landline: record.landline ?? "",
  };
}

export function createPartySubmitPayload(values: PartyInformationFormValues) {
  const partyTypes = normalizePartyTypesForClassification(values.partyTypes, values.classification);
  const addresses = normalizePartyAddresses(values.addresses, partyTypes, values.classification);
  const name =
    values.classification === "Non-Individual"
      ? values.partyName.trim()
      : [values.firstName, values.middleName, values.lastName, values.suffixName]
          .map((part) => part.trim())
          .filter(Boolean)
          .join(" ");
  const accountingAccounts = applyPartyDefaultAccountingAccounts(values, partyTypes);

  return {
    partyCodeNo: values.partyCodeNo.trim(),
    classification: values.classification,
    partyTypes,
    status: values.status,
    name,
    tradeName: values.classification === "Non-Individual" ? values.tradeName.trim() || null : null,
    honorific:
      values.classification === "Individual"
        ? normalizePartyHonorific(values.honorific) || null
        : null,
    gender: hasPersonalInformationPartyType(partyTypes) ? values.gender.trim() || null : null,
    civilStatus: hasPersonalInformationPartyType(partyTypes)
      ? values.civilStatus.trim() || null
      : null,
    nationality: hasPersonalInformationPartyType(partyTypes)
      ? values.nationality.trim() || PartyDefaultNationality
      : null,
    memberRegistrationDate: partyTypes.includes("Member")
      ? values.memberRegistrationDate || todayDateValue()
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
    atcCode: values.atcCode ? normalizeAtcCode(values.atcCode) : "",
    defaultPurchaseInputVatTaxSourceKey: values.defaultPurchaseInputVatTaxSourceKey,
    defaultPurchaseEwtTaxSourceKey: values.defaultPurchaseEwtTaxSourceKey,
    defaultPurchaseFwtTaxSourceKey: values.defaultPurchaseFwtTaxSourceKey,
    defaultPurchaseWvatTaxSourceKey: values.defaultPurchaseWvatTaxSourceKey,
    defaultSalesOutputVatTaxSourceKey: values.defaultSalesOutputVatTaxSourceKey,
    defaultSalesCwtTaxSourceKey: values.defaultSalesCwtTaxSourceKey,
    defaultSalesWvatTaxSourceKey: values.defaultSalesWvatTaxSourceKey,
    email: values.email.trim() || null,
    contactNo: normalizePartyContactNo(values.contactNo) || null,
    landline: values.landline.trim() || null,
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

export function createPartyInformationRecordFromTableRecord(
  record: PartyInformationTableRecord,
): PartyInformationRecord {
  return {
    address: record.address,
    addresses: record.addresses,
    atcCode: record.atcCode,
    defaultPurchaseInputVatTaxSourceKey: record.defaultPurchaseInputVatTaxSourceKey,
    defaultPurchaseEwtTaxSourceKey: record.defaultPurchaseEwtTaxSourceKey,
    defaultPurchaseFwtTaxSourceKey: record.defaultPurchaseFwtTaxSourceKey,
    defaultPurchaseWvatTaxSourceKey: record.defaultPurchaseWvatTaxSourceKey,
    defaultSalesOutputVatTaxSourceKey: record.defaultSalesOutputVatTaxSourceKey,
    defaultSalesCwtTaxSourceKey: record.defaultSalesCwtTaxSourceKey,
    defaultSalesWvatTaxSourceKey: record.defaultSalesWvatTaxSourceKey,
    classification: record.classification,
    contactNo: record.contactNo,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    customerAdvanceAccount: record.customerAdvanceAccount,
    defaultPayableAccount: record.defaultPayableAccount,
    defaultReceivableAccount: record.defaultReceivableAccount,
    email: record.email,
    employeeAdvanceAccount: record.employeeAdvanceAccount,
    employeePayableAccount: record.employeePayableAccount,
    firstName: record.firstName,
    id: record.id,
    lastName: record.lastName,
    middleName: record.middleName,
    partyCodeNo: record.partyCodeNo,
    partyName: record.partyName,
    partyTypes: record.partyTypes,
    status: record.status,
    suffixName: record.suffixName,
    honorific: record.honorific,
    gender: record.gender,
    civilStatus: record.civilStatus,
    nationality: record.nationality,
    memberRegistrationDate: record.memberRegistrationDate,
    termId: record.termId,
    termName: record.termName,
    tin: record.tin,
    tradeName: record.tradeName,
    updatedBy: record.updatedBy,
    updatedAt: record.updatedAt,
    vendorAdvanceAccount: record.vendorAdvanceAccount,
  };
}

export function getPartyDisplayName(record: PartyInformationRecord) {
  if (record.classification === "Non-Individual") {
    return record.partyName;
  }

  return [record.firstName, record.middleName, record.lastName, record.suffixName]
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

export function createExistingPartyIdentityMap(parties: PartyInformationRecord[]) {
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

export function createBlankPartyImportRow(rowNumber: number): PartyImportPreviewRow {
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
      honorific: "",
      gender: "",
      civilStatus: "",
      nationality: "",
      memberRegistrationDate: "",
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
      atcCode: "",
      ...PartyDefaultTaxSourceKeys,
      email: "",
      contactNo: "",
      landline: "",
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
    baseRows.map((row) => normalizePartyIdentity(row.party.partyCodeNo)).filter(Boolean),
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
    const normalizedName = normalizePartyIdentity(getImportPartyDisplayName(row.party));

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

export function normalizeImportedPartyCellValue(field: PartyImportColumnId, value: string) {
  if (field === "classification") {
    return normalizeImportedPartyClassification(value);
  }

  if (field === "partyTypes") {
    return normalizeImportedPartyTypes(value);
  }

  if (field === "honorific") {
    return normalizePartyHonorific(value);
  }

  if (field === "tin") {
    return formatImportedTin(value);
  }

  if (field === "contactNo") {
    return normalizePartyContactNo(value);
  }

  if (field === "memberRegistrationDate") {
    return normalizeImportedDateValue(value);
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
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

export async function readPartyImportFileText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    const rows = await readPartyImportXlsxRows(await file.arrayBuffer());

    return formatPartyImportRowsAsText(rows);
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
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
      cells[columnNumber - 1] = formatPartyImportExcelCellValue(cell.value, cell.text);
    });
    rows.push(cells);
  });

  return rows;
}

export function parsePartyImportText(text: string, startRowNumber = 1): PartyImportPreviewRow[] {
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
  const partyTypes = normalizeImportedPartyTypes(getImportedPartyValue(row, indexes.partyTypes));
  const normalizedPartyTypes = normalizePartyTypesForClassification(partyTypes, classification);
  const accountingAccounts = applyPartyDefaultAccountingAccounts(
    {
      customerAdvanceAccount: getImportedPartyValue(row, indexes.customerAdvanceAccount),
      defaultPayableAccount: getImportedPartyValue(row, indexes.defaultPayableAccount),
      defaultReceivableAccount: getImportedPartyValue(row, indexes.defaultReceivableAccount),
      employeeAdvanceAccount: getImportedPartyValue(row, indexes.employeeAdvanceAccount),
      employeePayableAccount: getImportedPartyValue(row, indexes.employeePayableAccount),
      vendorAdvanceAccount: getImportedPartyValue(row, indexes.vendorAdvanceAccount),
    },
    normalizedPartyTypes,
  );
  const addresses = createImportPartyAddresses(
    row,
    indexes,
    normalizedPartyTypes,
    classification,
    `party-import-${importBatchId}-${index}`,
  );
  const address = addresses[0] ?? createEmptyPartyAddress();
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
    honorific: normalizePartyHonorific(getImportedPartyValue(row, indexes.honorific)),
    gender: getImportedPartyValue(row, indexes.gender),
    civilStatus: getImportedPartyValue(row, indexes.civilStatus),
    nationality: getImportedPartyValue(row, indexes.nationality),
    memberRegistrationDate: normalizeImportedDateValue(
      getImportedPartyValue(row, indexes.memberRegistrationDate),
    ),
    address,
    addresses,
    ...accountingAccounts,
    termId: "",
    termName: getImportedPartyValue(row, indexes.termName),
    tin: formatImportedTin(getImportedPartyValue(row, indexes.tin)),
    atcCode: normalizeAtcCode(getImportedPartyValue(row, indexes.atcCode)),
    ...PartyDefaultTaxSourceKeys,
    email: getImportedPartyValue(row, indexes.email),
    contactNo: getImportedPartyValue(row, indexes.contactNo),
    landline: getImportedPartyValue(row, indexes.landline),
  };

  return {
    cellErrors: {},
    cellWarnings: {},
    id: `party-import-preview-${rowNumber}-${importBatchId}-${index}`,
    party,
    rowErrors: [],
    rowNumber,
  };
}

function createImportPartyAddresses(
  row: string[],
  indexes: Partial<Record<PartyImportColumnId, number>>,
  partyTypes: PartyType[],
  classification: PartyClassification,
  idPrefix: string,
) {
  const roles = getPartyAddressRoles(
    normalizePartyTypesForClassification(partyTypes, classification),
  );
  const fallbackAddress = {
    addressLine1: getImportedPartyValue(row, indexes.addressLine1),
    addressLine2: getImportedPartyValue(row, indexes.addressLine2),
    barangay: getImportedPartyValue(row, indexes.barangay),
    cityMunicipality: getImportedPartyValue(row, indexes.cityMunicipality),
    province: getImportedPartyValue(row, indexes.province),
  };
  const addresses = roles.map((role, index) => {
    const roleAddress = getImportedPartyAddressByRole(row, indexes, role);

    return createEmptyPartyAddress({
      id: `${idPrefix}-address-${role}`,
      addressName: getAddressRoleLabel(role),
      addressLine1: roleAddress.addressLine1 || fallbackAddress.addressLine1,
      addressLine2: roleAddress.addressLine2 || fallbackAddress.addressLine2,
      barangay: roleAddress.barangay || fallbackAddress.barangay,
      cityMunicipality: roleAddress.cityMunicipality || fallbackAddress.cityMunicipality,
      province: roleAddress.province || fallbackAddress.province,
      isBilling: role === "billing",
      isDefault: index === 0,
      isDelivery: role === "delivery",
      isHome: role === "home",
    });
  });

  if (addresses.length > 0) {
    return addresses;
  }

  return [
    createEmptyPartyAddress({
      id: `${idPrefix}-address-default`,
      addressName: "Address",
      ...fallbackAddress,
      isDefault: true,
    }),
  ];
}

function getImportedPartyAddressByRole(
  row: string[],
  indexes: Partial<Record<PartyImportColumnId, number>>,
  role: PartyAddressRole,
) {
  if (role === "home") {
    return {
      addressLine1: getImportedPartyValue(row, indexes.homeAddressLine1),
      addressLine2: getImportedPartyValue(row, indexes.homeAddressLine2),
      barangay: getImportedPartyValue(row, indexes.homeBarangay),
      cityMunicipality: getImportedPartyValue(row, indexes.homeCityMunicipality),
      province: getImportedPartyValue(row, indexes.homeProvince),
    };
  }

  if (role === "delivery") {
    return {
      addressLine1: getImportedPartyValue(row, indexes.deliveryAddressLine1),
      addressLine2: getImportedPartyValue(row, indexes.deliveryAddressLine2),
      barangay: getImportedPartyValue(row, indexes.deliveryBarangay),
      cityMunicipality: getImportedPartyValue(row, indexes.deliveryCityMunicipality),
      province: getImportedPartyValue(row, indexes.deliveryProvince),
    };
  }

  return {
    addressLine1: getImportedPartyValue(row, indexes.billingAddressLine1),
    addressLine2: getImportedPartyValue(row, indexes.billingAddressLine2),
    barangay: getImportedPartyValue(row, indexes.billingBarangay),
    cityMunicipality: getImportedPartyValue(row, indexes.billingCityMunicipality),
    province: getImportedPartyValue(row, indexes.billingProvince),
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
    const normalizedName = normalizePartyIdentity(getImportPartyDisplayName(row.party));

    if (normalizedCode) {
      importedCodeCounts.set(normalizedCode, (importedCodeCounts.get(normalizedCode) ?? 0) + 1);
    }
    if (normalizedName) {
      importedNameCounts.set(normalizedName, (importedNameCounts.get(normalizedName) ?? 0) + 1);
    }
  });

  return rows.map((row) => {
    const cellErrors: PartyImportCellErrors = {};
    const cellWarnings: PartyImportCellWarnings = {};
    const rowErrors: string[] = [];
    const normalizedCode = normalizePartyIdentity(row.party.partyCodeNo);
    const normalizedName = normalizePartyIdentity(getImportPartyDisplayName(row.party));

    if (!row.party.partyCodeNo.trim()) {
      cellErrors.partyCodeNo = ["Party code is required."];
    }
    if (normalizedCode && existingPartyIdentities.codes.has(normalizedCode)) {
      cellErrors.partyCodeNo = [
        ...(cellErrors.partyCodeNo ?? []),
        `Party code already exists: ${existingPartyIdentities.codes.get(normalizedCode)}.`,
      ];
    }
    if (normalizedCode && (importedCodeCounts.get(normalizedCode) ?? 0) > 1) {
      cellErrors.partyCodeNo = [
        ...(cellErrors.partyCodeNo ?? []),
        "Duplicate party code in import.",
      ];
    }

    if (!row.party.classification.trim()) {
      cellErrors.classification = ["Classification is required. Choose a value from the list."];
    } else if (!isModuleImportOptionValue(row.party.classification, PartyClassificationOptions)) {
      cellErrors.classification = ["Choose Individual or Non-Individual from the list."];
    }

    if (row.party.partyTypes.length === 0) {
      cellErrors.partyTypes = ["Select at least one party type."];
    }
    if (
      row.party.classification === "Non-Individual" &&
      (row.party.partyTypes.includes("Employee") || row.party.partyTypes.includes("Member"))
    ) {
      cellErrors.partyTypes = [
        ...(cellErrors.partyTypes ?? []),
        "Employee and Member are only available for individual parties.",
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

    if (normalizedName && existingPartyIdentities.names.has(normalizedName)) {
      const field = row.party.classification === "Individual" ? "lastName" : "partyName";
      cellErrors[field] = [
        ...(cellErrors[field] ?? []),
        `Party already exists: ${existingPartyIdentities.names.get(normalizedName)}.`,
      ];
    }
    if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
      const field = row.party.classification === "Individual" ? "lastName" : "partyName";
      cellErrors[field] = [...(cellErrors[field] ?? []), "Duplicate party name in import."];
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
    if (row.party.contactNo && !/^\+63 \d{3} \d{3} \d{4}$/.test(row.party.contactNo)) {
      cellErrors.contactNo = ["Enter a valid contact number in the +63 000 000 0000 format."];
    }

    if (row.party.partyTypes.includes("Member")) {
      if (!row.party.gender?.trim()) {
        cellErrors.gender = ["Gender is required for members."];
      }
      if (!row.party.civilStatus?.trim()) {
        cellErrors.civilStatus = ["Civil status is required for members."];
      }
      if (!row.party.nationality?.trim()) {
        cellErrors.nationality = ["Nationality is required for members."];
      }
      if (!row.party.memberRegistrationDate?.trim()) {
        cellErrors.memberRegistrationDate = ["Member registration date is required."];
      }
    }

    if (
      row.party.memberRegistrationDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(row.party.memberRegistrationDate)
    ) {
      cellErrors.memberRegistrationDate = ["Member registration date must use YYYY-MM-DD."];
    }

    validateImportedPartyAddresses(row.party, cellErrors, cellWarnings);

    return { ...row, cellErrors, cellWarnings, rowErrors };
  });
}

export function partyImportRowHasErrors(row: PartyImportPreviewRow) {
  return (
    row.rowErrors.length > 0 ||
    Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
  );
}

function validateImportedPartyAddresses(
  party: Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt">,
  cellErrors: PartyImportCellErrors,
  cellWarnings: PartyImportCellWarnings,
) {
  const addresses = party.addresses.length > 0 ? party.addresses : [party.address];

  addresses.forEach((address, index) => {
    const fieldMap = getPartyImportAddressFieldMap(address, index);

    if (!address.addressLine1.trim()) {
      cellWarnings[fieldMap.addressLine1] = [
        "Address line 1 is blank. You can complete it after import.",
      ];
    }
    if (!address.barangay.trim()) {
      cellErrors[fieldMap.barangay] = ["Barangay is required."];
    }
    if (!address.cityMunicipality.trim()) {
      cellErrors[fieldMap.cityMunicipality] = ["City/Municipality is required."];
    }
    if (!address.province.trim()) {
      cellErrors[fieldMap.province] = ["Province is required."];
    }
  });
}

function getPartyImportAddressFieldMap(
  address: PartyAddress,
  index: number,
): Record<
  "addressLine1" | "addressLine2" | "barangay" | "cityMunicipality" | "province",
  PartyImportColumnId
> {
  if (address.isHome) {
    return {
      addressLine1: "homeAddressLine1",
      addressLine2: "homeAddressLine2",
      barangay: "homeBarangay",
      cityMunicipality: "homeCityMunicipality",
      province: "homeProvince",
    };
  }

  if (address.isDelivery) {
    return {
      addressLine1: "deliveryAddressLine1",
      addressLine2: "deliveryAddressLine2",
      barangay: "deliveryBarangay",
      cityMunicipality: "deliveryCityMunicipality",
      province: "deliveryProvince",
    };
  }

  if (address.isBilling) {
    return {
      addressLine1: "billingAddressLine1",
      addressLine2: "billingAddressLine2",
      barangay: "billingBarangay",
      cityMunicipality: "billingCityMunicipality",
      province: "billingProvince",
    };
  }

  return {
    addressLine1: index === 0 ? "addressLine1" : "billingAddressLine1",
    addressLine2: index === 0 ? "addressLine2" : "billingAddressLine2",
    barangay: index === 0 ? "barangay" : "billingBarangay",
    cityMunicipality: index === 0 ? "cityMunicipality" : "billingCityMunicipality",
    province: index === 0 ? "province" : "billingProvince",
  };
}

function normalizeImportedPartyAddressesForRecord(
  sourceAddresses: PartyAddress[],
  partyTypes: PartyType[],
  classification: PartyClassification,
) {
  const roles = getPartyAddressRoles(
    normalizePartyTypesForClassification(partyTypes, classification),
  );

  if (roles.length === 0) {
    const source = sourceAddresses[0] ?? createEmptyPartyAddress();

    return [
      {
        ...source,
        addressName: source.addressName || "Address",
        isBilling: false,
        isDefault: true,
        isDelivery: false,
        isHome: false,
      },
    ];
  }

  return roles.map((role, index) => {
    const source =
      sourceAddresses.find((address) => addressHasRole(address, role)) ??
      sourceAddresses[index] ??
      sourceAddresses[0] ??
      createEmptyPartyAddress();

    return {
      ...source,
      addressName: source.addressName || getAddressRoleLabel(role),
      isBilling: role === "billing",
      isDefault: index === 0,
      isDelivery: role === "delivery",
      isHome: role === "home",
    };
  });
}

function addressHasRole(address: PartyAddress, role: PartyAddressRole) {
  if (role === "billing") return address.isBilling;
  if (role === "delivery") return address.isDelivery;

  return address.isHome;
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
  const partyTypes = normalizePartyTypesForClassification(party.partyTypes, party.classification);
  const accountingAccounts = applyPartyDefaultAccountingAccounts(party, partyTypes);
  const addresses = normalizeImportedPartyAddressesForRecord(
    party.addresses.length > 0 ? party.addresses : [party.address],
    partyTypes,
    party.classification,
  );
  const address = addresses[0] ?? createEmptyPartyAddress();
  const hasPersonalInformation = hasPersonalInformationPartyType(partyTypes);

  return {
    ...party,
    id: `party-import-${Date.now()}-${index}`,
    partyCodeNo: party.partyCodeNo.trim(),
    classification: party.classification,
    partyTypes,
    status: "Active",
    partyName: party.classification === "Non-Individual" ? party.partyName.trim() : "",
    tradeName: party.classification === "Non-Individual" ? party.tradeName.trim() : "",
    firstName: party.classification === "Individual" ? party.firstName.trim() : "",
    middleName: party.classification === "Individual" ? party.middleName.trim() : "",
    lastName: party.classification === "Individual" ? party.lastName.trim() : "",
    suffixName: party.classification === "Individual" ? party.suffixName.trim() : "",
    honorific:
      party.classification === "Individual" ? normalizePartyHonorific(party.honorific ?? "") : "",
    gender: hasPersonalInformation ? (party.gender ?? "").trim() : "",
    civilStatus: hasPersonalInformation ? (party.civilStatus ?? "").trim() : "",
    nationality: hasPersonalInformation
      ? (party.nationality ?? "").trim() || PartyDefaultNationality
      : "",
    memberRegistrationDate: partyTypes.includes("Member")
      ? party.memberRegistrationDate || todayDateValue()
      : "",
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
    termId: party.termId,
    termName: party.termName.trim(),
    atcCode: party.atcCode ? normalizeAtcCode(party.atcCode) : "",
    defaultPurchaseInputVatTaxSourceKey: party.defaultPurchaseInputVatTaxSourceKey,
    defaultPurchaseEwtTaxSourceKey: party.defaultPurchaseEwtTaxSourceKey,
    defaultPurchaseFwtTaxSourceKey: party.defaultPurchaseFwtTaxSourceKey,
    defaultPurchaseWvatTaxSourceKey: party.defaultPurchaseWvatTaxSourceKey,
    defaultSalesOutputVatTaxSourceKey: party.defaultSalesOutputVatTaxSourceKey,
    defaultSalesCwtTaxSourceKey: party.defaultSalesCwtTaxSourceKey,
    defaultSalesWvatTaxSourceKey: party.defaultSalesWvatTaxSourceKey,
    email: party.email.trim(),
    contactNo: normalizePartyContactNo(party.contactNo),
    landline: party.landline?.trim() ?? "",
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
      ? values.defaultReceivableAccount || defaults.defaultReceivableAccount
      : "",
    customerAdvanceAccount: partyTypes.includes("Customer")
      ? values.customerAdvanceAccount || defaults.customerAdvanceAccount
      : "",
    defaultPayableAccount: partyTypes.includes("Vendor")
      ? values.defaultPayableAccount || defaults.defaultPayableAccount
      : "",
    vendorAdvanceAccount: partyTypes.includes("Vendor")
      ? values.vendorAdvanceAccount || defaults.vendorAdvanceAccount
      : "",
    employeeAdvanceAccount: partyTypes.includes("Employee")
      ? values.employeeAdvanceAccount || defaults.employeeAdvanceAccount
      : "",
    employeePayableAccount: partyTypes.includes("Employee")
      ? values.employeePayableAccount || defaults.employeePayableAccount
      : "",
  };
}

function normalizePartyRecordValues(
  values: PartyInformationFormValues,
): Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt"> {
  if (!values.classification) {
    throw new Error("Party classification is required.");
  }

  const partyTypes = normalizePartyTypesForClassification(values.partyTypes, values.classification);
  const addresses = normalizePartyAddresses(values.addresses, partyTypes, values.classification);
  const defaultAddress = getDefaultPartyAddress(addresses);
  const accountingAccounts = applyPartyDefaultAccountingAccounts(values, partyTypes);

  return {
    ...values,
    partyCodeNo: values.partyCodeNo.trim(),
    classification: values.classification,
    partyName: values.classification === "Non-Individual" ? values.partyName.trim() : "",
    status: values.status,
    tradeName: values.classification === "Non-Individual" ? values.tradeName.trim() : "",
    firstName: values.classification === "Individual" ? values.firstName.trim() : "",
    middleName: values.classification === "Individual" ? values.middleName.trim() : "",
    lastName: values.classification === "Individual" ? values.lastName.trim() : "",
    suffixName: values.classification === "Individual" ? values.suffixName.trim() : "",
    honorific:
      values.classification === "Individual" ? normalizePartyHonorific(values.honorific) : "",
    gender: hasPersonalInformationPartyType(partyTypes) ? values.gender.trim() : "",
    civilStatus: hasPersonalInformationPartyType(partyTypes) ? values.civilStatus.trim() : "",
    nationality: hasPersonalInformationPartyType(partyTypes)
      ? values.nationality.trim() || PartyDefaultNationality
      : "",
    memberRegistrationDate: partyTypes.includes("Member")
      ? values.memberRegistrationDate || todayDateValue()
      : "",
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
    defaultPurchaseInputVatTaxSourceKey: values.defaultPurchaseInputVatTaxSourceKey,
    defaultPurchaseEwtTaxSourceKey: values.defaultPurchaseEwtTaxSourceKey,
    defaultPurchaseFwtTaxSourceKey: values.defaultPurchaseFwtTaxSourceKey,
    defaultPurchaseWvatTaxSourceKey: values.defaultPurchaseWvatTaxSourceKey,
    defaultSalesOutputVatTaxSourceKey: values.defaultSalesOutputVatTaxSourceKey,
    defaultSalesCwtTaxSourceKey: values.defaultSalesCwtTaxSourceKey,
    defaultSalesWvatTaxSourceKey: values.defaultSalesWvatTaxSourceKey,
    email: values.email.trim(),
    contactNo: normalizePartyContactNo(values.contactNo),
    landline: values.landline.trim(),
  };
}

function normalizePartyContactNo(value: string) {
  const contactNo = value.trim();

  return contactNo === DefaultPhilippineContactNumber.trim() ? "" : contactNo;
}

export {
  applyDefaultAddressRoles,
  clearAddressRolesForPartyTypes,
  createEmptyPartyAddress,
  hasPersonalInformationPartyType,
  normalizePartyTypesForClassification,
  setPartyDefaultAddress,
} from "@/app/src/data/modules/party-management/PartyManagementAddressData";

function normalizePartyHonorific(value: string) {
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function parsePartyImportTabularRows(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalizedText.includes("\t")
    ? normalizedText.split("\n").map((line) => line.split("\t").map((cell) => cell.trim()))
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
  if (["partyname", "name", "companyname", "organizationname"].includes(normalized))
    return "partyName";
  if (["tradename"].includes(normalized)) return "tradeName";
  if (["honorific", "title", "salutation"].includes(normalized)) return "honorific";
  if (["firstname", "givenname"].includes(normalized)) return "firstName";
  if (["middlename"].includes(normalized)) return "middleName";
  if (["lastname", "surname"].includes(normalized)) return "lastName";
  if (["suffixname", "suffix"].includes(normalized)) return "suffixName";
  if (["gender", "sex"].includes(normalized)) return "gender";
  if (["civilstatus", "maritalstatus"].includes(normalized)) return "civilStatus";
  if (["nationality", "citizenship"].includes(normalized)) return "nationality";
  if (
    ["memberregistrationdate", "memberdate", "registrationdate", "membershipdate"].includes(
      normalized,
    )
  )
    return "memberRegistrationDate";
  if (["tin", "tinno", "taxidentificationnumber"].includes(normalized)) return "tin";
  if (["atccode", "atc"].includes(normalized)) return "atcCode";
  if (["email", "emailaddress"].includes(normalized)) return "email";
  if (["contactno", "contactnumber", "phone", "mobile", "mobilenumber"].includes(normalized))
    return "contactNo";
  if (["landline", "landlinenumber", "telephone"].includes(normalized)) return "landline";
  if (["addressline1", "address1"].includes(normalized)) return "addressLine1";
  if (["addressline2", "address2"].includes(normalized)) return "addressLine2";
  if (["barangay", "brgy"].includes(normalized)) return "barangay";
  if (["citymunicipality", "city", "municipality"].includes(normalized)) return "cityMunicipality";
  if (["province"].includes(normalized)) return "province";
  if (["homeaddressline1", "homeaddress1"].includes(normalized)) return "homeAddressLine1";
  if (["homeaddressline2", "homeaddress2"].includes(normalized)) return "homeAddressLine2";
  if (["homebarangay", "homebrgy"].includes(normalized)) return "homeBarangay";
  if (["homecitymunicipality", "homecity", "homemunicipality"].includes(normalized))
    return "homeCityMunicipality";
  if (["homeprovince"].includes(normalized)) return "homeProvince";
  if (["billingaddressline1", "billingaddress1"].includes(normalized)) return "billingAddressLine1";
  if (["billingaddressline2", "billingaddress2"].includes(normalized)) return "billingAddressLine2";
  if (["billingbarangay", "billingbrgy"].includes(normalized)) return "billingBarangay";
  if (["billingcitymunicipality", "billingcity", "billingmunicipality"].includes(normalized))
    return "billingCityMunicipality";
  if (["billingprovince"].includes(normalized)) return "billingProvince";
  if (["deliveryaddressline1", "deliveryaddress1"].includes(normalized))
    return "deliveryAddressLine1";
  if (["deliveryaddressline2", "deliveryaddress2"].includes(normalized))
    return "deliveryAddressLine2";
  if (["deliverybarangay", "deliverybrgy"].includes(normalized)) return "deliveryBarangay";
  if (["deliverycitymunicipality", "deliverycity", "deliverymunicipality"].includes(normalized))
    return "deliveryCityMunicipality";
  if (["deliveryprovince"].includes(normalized)) return "deliveryProvince";
  if (["terms", "term", "termname", "defaultterms"].includes(normalized)) return "termName";
  if (
    [
      "defaultreceivableaccount",
      "defaultreceivableaccounttitle",
      "receivableaccount",
      "receivableaccounttitle",
    ].includes(normalized)
  )
    return "defaultReceivableAccount";
  if (
    [
      "defaultcustomeradvanceaccount",
      "defaultcustomeradvanceaccounttitle",
      "customeradvanceaccount",
      "customeradvanceaccounttitle",
    ].includes(normalized)
  )
    return "customerAdvanceAccount";
  if (
    [
      "defaultpayableaccount",
      "defaultpayableaccounttitle",
      "payableaccount",
      "payableaccounttitle",
    ].includes(normalized)
  )
    return "defaultPayableAccount";
  if (
    [
      "defaultvendoradvanceaccount",
      "defaultvendoradvanceaccounttitle",
      "vendoradvanceaccount",
      "vendoradvanceaccounttitle",
    ].includes(normalized)
  )
    return "vendorAdvanceAccount";
  if (
    [
      "defaultemployeeadvanceaccount",
      "defaultemployeeadvanceaccounttitle",
      "employeeadvanceaccount",
      "employeeadvanceaccounttitle",
    ].includes(normalized)
  )
    return "employeeAdvanceAccount";
  if (
    [
      "defaultemployeepayableaccount",
      "defaultemployeepayableaccounttitle",
      "employeepayableaccount",
      "employeepayableaccounttitle",
    ].includes(normalized)
  )
    return "employeePayableAccount";
  return null;
}

function getImportedPartyValue(row: string[], index?: number) {
  return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

export function normalizeImportedPartyClassification(value: string): PartyClassification {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (["individual", "person"].includes(normalized)) {
    return "Individual";
  }

  if (
    ["nonindividual", "nonindiv", "company", "organization", "corporation"].includes(normalized)
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

      return PartyTypeOptions.find((option) => option.toLowerCase() === normalized);
    })
    .filter((type): type is PartyType => Boolean(type));

  return normalizedTypes.length > 0 ? normalizedTypes : ["Vendor"];
}

function normalizeImportedDateValue(value: string) {
  const dateValue = value.trim();

  if (!dateValue) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toISOString().slice(0, 10);
}

function formatImportedTin(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  const groups = digits.match(/.{1,3}/g) ?? [];

  return groups.join("-");
}

function getImportPartyDisplayName(
  party: Pick<
    PartyInformationRecord,
    "classification" | "firstName" | "middleName" | "lastName" | "partyName" | "suffixName"
  >,
) {
  if (party.classification === "Non-Individual") {
    return party.partyName;
  }

  return [party.firstName, party.middleName, party.lastName, party.suffixName]
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
