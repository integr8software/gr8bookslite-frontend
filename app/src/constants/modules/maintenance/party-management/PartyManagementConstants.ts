import type {
  PartyImportColumnHeader,
  PartyImportColumnId,
  PartyImportColumnWidths,
  PartyClassification,
  PartyInformationStatus,
  PartyType,
  VatRegistrationType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";

export const PartyManagementHref = "/maintenance/party-management";

export const PartyManagementApiPath = "/maintenance/party-maintenance";

export const PartyManagementParentLabel = "Party management";

export const PartyInformationTitle = "Party Information";

export const PartyInformationDescription =
  "Maintain people and organizations used across sales, purchasing, payroll, and tax reporting.";

export const PartyManagementTablePaginationStorageKey =
  "maintenance-party-management-party-information";

export const PartyManagementEditFromParam = "from";

export const PartyManagementEditFromViewValue = "view";

export const PartyManagementEditFromViewQuery = `${PartyManagementEditFromParam}=${PartyManagementEditFromViewValue}`;

export const PartyClassificationOptions = [
  "Individual",
  "Non-Individual",
] as const satisfies readonly PartyClassification[];

export const PartyTypeOptions = [
  "Vendor",
  "Customer",
  "Employee",
] as const satisfies readonly PartyType[];

export const PartyInformationStatusOptions = [
  "Active",
  "Inactive",
] as const satisfies readonly PartyInformationStatus[];

export const VatRegistrationTypeOptions = [
  "VAT Registered",
  "Zero Rated",
  "Non-VAT",
  "Exempt",
  "Capital Goods",
  "Other Than Capital Goods",
  "Services",
] as const satisfies readonly VatRegistrationType[];

export const BIRAtcSourceUrl =
  "https://bir-cdn.bir.gov.ph/local/pdf/2307%20Jan%202018%20ENCS%20v3.pdf";

export const PartyManagementActionCopy = {
  add: {
    title: "Add Party Information",
    description:
      "Create a party profile for sales, purchasing, payroll, and tax workflows.",
  },
  edit: {
    title: "Edit Party Information",
    description: "Update party details and compliance information.",
  },
  view: {
    title: "View Party Information",
    description: "Review party details and compliance information.",
  },
} as const;

export const PartyManagementTableColumns = [
  { key: "name", label: "Name", className: "w-[22rem]" },
  {
    key: "classification",
    label: "Classification",
    className: "w-[11rem]",
  },
  { key: "partyTypesLabel", label: "Type", className: "w-[12rem]" },
  { key: "addressLabel", label: "Address", className: "w-[28rem]" },
  { key: "status", label: "Status", className: "w-[9rem] text-center" },
  {
    label: "Actions",
    className: "w-[12rem] text-center",
  },
] as const;

export const PartyImportTemplateHeaders = [
  "Party Code",
  "Classification",
  "Party Types",
  "Party Name",
  "Trade Name",
  "First Name",
  "Middle Name",
  "Last Name",
  "Suffix Name",
  "TIN No",
  "VAT Registry",
  "ATC Code",
  "Email",
  "Contact No",
  "Address Line 1",
  "Address Line 2",
  "Barangay",
  "City/Municipality",
  "Province",
  "Region",
];

export const PartyImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";

export const PartyImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const PartyImportDefaultColumnIndexes: Record<PartyImportColumnId, number> =
  {
    partyCodeNo: 0,
    classification: 1,
    partyTypes: 2,
    partyName: 3,
    tradeName: 4,
    firstName: 5,
    middleName: 6,
    lastName: 7,
    suffixName: 8,
    tin: 9,
    vatRegistrationType: 10,
    atcCode: 11,
    email: 12,
    contactNo: 13,
    addressLine1: 14,
    addressLine2: 15,
    barangay: 16,
    cityMunicipality: 17,
    province: 18,
    region: 19,
  };

export const PartyImportFieldOrder: PartyImportColumnId[] = [
  "partyCodeNo",
  "classification",
  "partyTypes",
  "partyName",
  "tradeName",
  "firstName",
  "middleName",
  "lastName",
  "suffixName",
  "tin",
  "vatRegistrationType",
  "atcCode",
  "email",
  "contactNo",
  "addressLine1",
  "addressLine2",
  "barangay",
  "cityMunicipality",
  "province",
  "region",
];

export const PartyImportSelectionColumnWidth = 64;

export const PartyImportDefaultColumnWidths: PartyImportColumnWidths = {
  partyCodeNo: 150,
  classification: 160,
  partyTypes: 180,
  partyName: 240,
  tradeName: 220,
  firstName: 180,
  middleName: 180,
  lastName: 180,
  suffixName: 120,
  tin: 170,
  vatRegistrationType: 190,
  atcCode: 130,
  email: 220,
  contactNo: 170,
  addressLine1: 240,
  addressLine2: 220,
  barangay: 180,
  cityMunicipality: 190,
  province: 180,
  region: 220,
};

export const PartyImportColumnHeaders: PartyImportColumnHeader[] =
  PartyImportFieldOrder.map((id, index) => ({
    className: "px-3",
    id,
    label: PartyImportTemplateHeaders[index] ?? id,
  }));

export const PartyImportPreviewColumnCount = PartyImportFieldOrder.length + 1;

export const PartyImportPreviewGridLabel =
  "Import preview grid. Paste copied Excel rows here.";

export const PartyImportPreviewEmptyMessage =
  "Upload a file, or focus here and paste copied Excel rows.";

export const PartyImportPreviewPageSize = 10;
export const PartyImportBatchSize = 25;
export const PartyImportMinFileSizeBytes = 1;
export const PartyImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;
