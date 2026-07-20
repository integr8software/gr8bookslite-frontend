import type {
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type {
  PartyImportColumnHeader,
  PartyImportColumnId,
  PartyImportColumnWidths,
  PartyClassification,
  PartyInformationStatus,
  PartyInformationTableRecord,
  PartyType,
  VatRegistrationType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const PartyManagementHref = MODULE_ROUTE_MAP.PM;

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

export const PartyManagementDrawerFormId = "party-management-drawer-form";

export const PartyClassificationOptions = [
  "Individual",
  "Non-Individual",
] as const satisfies readonly PartyClassification[];

export const PartyTypeOptions = [
  "Vendor",
  "Customer",
  "Employee",
  "Member",
] as const satisfies readonly PartyType[];

export const PartyHonorificOptions = [
  { name: "Mr.", description: "Mister" },
  { name: "Mrs.", description: "Missus" },
  { name: "Ms." },
  { name: "Miss" },
  { name: "Mx.", description: "Mix" },
  { name: "Sir" },
  { name: "Madam" },
  { name: "Ma'am" },
  { name: "Dr.", description: "Doctor" },
  { name: "Prof.", description: "Professor" },
  { name: "Engr.", description: "Engineer" },
  { name: "Atty.", description: "Attorney" },
  { name: "Capt.", description: "Captain" },
  { name: "Hon.", description: "Honorable" },
  { name: "Rev.", description: "Reverend" },
  { name: "Fr.", description: "Father" },
  { name: "Pastor" },
] as const;

export const PartyGenderOptions = [
  "Male",
  "Female",
  "Prefer not to say",
] as const;

export const PartyCivilStatusOptions = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
] as const;

export const PartyDefaultNationality = "Filipino";

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
  { key: "partyCodeNo", label: "Party Code", className: "w-[11rem]" },
  { key: "name", label: "Party Name", className: "w-[22rem]" },
  {
    key: "classification",
    label: "Classification",
    className: "w-[11rem]",
  },
  { key: "partyTypesLabel", label: "Type", className: "w-[12rem]" },
  { key: "email", label: "Email Address", className: "w-[18rem]" },
  { key: "contactNo", label: "Mobile Number", className: "w-[12rem]" },
  { key: "landline", label: "Landline", className: "w-[12rem]" },
  { key: "homeAddressLabel", label: "Home Address", className: "w-[24rem]" },
  {
    key: "billingAddressLabel",
    label: "Billing Address",
    className: "w-[24rem]",
  },
  {
    key: "deliveryAddressLabel",
    label: "Delivery Address",
    className: "w-[24rem]",
  },
  { key: "tin", label: "TIN", className: "w-[12rem]" },
  {
    key: "vatRegistrationType",
    label: "VAT Registration",
    className: "w-[14rem]",
  },
  { key: "gender", label: "Gender", className: "w-[12rem]" },
  { key: "civilStatus", label: "Civil Status", className: "w-[12rem]" },
  { key: "nationality", label: "Nationality", className: "w-[12rem]" },
  {
    key: "memberRegistrationDate",
    label: "Member Registration Date",
    className: "w-[15rem]",
  },
  { key: "createdBy", label: "Created By", className: "w-[14rem]" },
  { key: "createdAt", label: "Date Created", className: "w-[16rem]" },
  { key: "updatedBy", label: "Updated By", className: "w-[14rem]" },
  { key: "updatedAt", label: "Date Modified", className: "w-[16rem]" },
  { key: "status", label: "Status", className: "w-[9rem] text-center" },
  {
    label: "Action",
    className: "w-[12rem] text-center",
  },
] as const;

export const PartyManagementTablePreferencesStorageKey =
  "gr8booksneo:party-management:table-preferences";
export const PartyManagementTablePreferencesModuleKey =
  "maintenance:party-management";
export const PartyManagementDefaultColumnOrder = PartyManagementTableColumns.map(
  (column) => ("key" in column ? column.key : "actions"),
);
export const PartyManagementDefaultColumnVisibility: VisibilityState = {
  billingAddressLabel: false,
  civilStatus: false,
  createdAt: false,
  createdBy: false,
  email: false,
  gender: false,
  homeAddressLabel: false,
  landline: false,
  memberRegistrationDate: false,
  nationality: false,
  partyCodeNo: false,
  deliveryAddressLabel: false,
  tin: false,
  updatedAt: false,
  updatedBy: false,
  vatRegistrationType: false,
};
export const PartyManagementDefaultSorting: SortingState = [
  { id: "name", desc: false },
];

export const PartyInformationExportColumns: ModuleTableExportColumn<PartyInformationTableRecord>[] =
  [
    ...PartyManagementTableColumns.flatMap((column) =>
      "key" in column
        ? [
            {
              header: column.label,
              id: column.key,
              value: column.key,
            },
          ]
        : [],
    ),
    { header: "BIR ATC Code", value: "atcCode" },
    { header: "Terms", value: "termName" },
    { header: "Default Receivable Account", value: "defaultReceivableAccount" },
    { header: "Default Customer Advance Account", value: "customerAdvanceAccount" },
    { header: "Default Payable Account", value: "defaultPayableAccount" },
    { header: "Default Vendor Advance Account", value: "vendorAdvanceAccount" },
    { header: "Default Employee Advance Account", value: "employeeAdvanceAccount" },
    { header: "Default Employee Payable Account", value: "employeePayableAccount" },
  ];

export const PartyManagementFieldClassName =
  "app-disabled-control h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.035] disabled:text-darknavy/35 disabled:placeholder:text-darknavy/32";

export const PartyManagementSelectClassName = `app-select-control ${PartyManagementFieldClassName}`;

export const PartyManagementFieldControlSelector =
  '[role="combobox"], input:not([type="hidden"]), select, textarea, button';

export const PartyManagementDrawerSecondaryActionClassName =
  "inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15";

export const PartyManagementDrawerPrimaryActionClassName =
  "theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-4 text-sm font-semibold shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45";

export const PartyImportTemplateHeaders = [
  "Party Code",
  "Classification",
  "Party Types",
  "Party Name",
  "Trade Name",
  "Honorific",
  "First Name",
  "Middle Name",
  "Last Name",
  "Suffix Name",
  "Gender",
  "Civil Status",
  "Nationality",
  "Member Registration Date",
  "TIN No",
  "VAT Registry",
  "ATC Code",
  "Email",
  "Mobile Number",
  "Landline",
  "Home Address Line 1",
  "Home Address Line 2",
  "Home Barangay",
  "Home City/Municipality",
  "Home Province",
  "Billing Address Line 1",
  "Billing Address Line 2",
  "Billing Barangay",
  "Billing City/Municipality",
  "Billing Province",
  "Delivery Address Line 1",
  "Delivery Address Line 2",
  "Delivery Barangay",
  "Delivery City/Municipality",
  "Delivery Province",
  "Terms",
  "Default Receivable Account Title",
  "Default Customer Advance Account Title",
  "Default Payable Account Title",
  "Default Vendor Advance Account Title",
  "Default Employee Advance Account Title",
  "Default Employee Payable Account Title",
];

export const PartyImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";

export const PartyImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const PartyImportDefaultColumnIndexes: Partial<Record<PartyImportColumnId, number>> =
  {
    partyCodeNo: 0,
    classification: 1,
    partyTypes: 2,
    partyName: 3,
    tradeName: 4,
    honorific: 5,
    firstName: 6,
    middleName: 7,
    lastName: 8,
    suffixName: 9,
    gender: 10,
    civilStatus: 11,
    nationality: 12,
    memberRegistrationDate: 13,
    tin: 14,
    vatRegistrationType: 15,
    atcCode: 16,
    email: 17,
    contactNo: 18,
    landline: 19,
    homeAddressLine1: 20,
    homeAddressLine2: 21,
    homeBarangay: 22,
    homeCityMunicipality: 23,
    homeProvince: 24,
    billingAddressLine1: 25,
    billingAddressLine2: 26,
    billingBarangay: 27,
    billingCityMunicipality: 28,
    billingProvince: 29,
    deliveryAddressLine1: 30,
    deliveryAddressLine2: 31,
    deliveryBarangay: 32,
    deliveryCityMunicipality: 33,
    deliveryProvince: 34,
    termName: 35,
    defaultReceivableAccount: 36,
    customerAdvanceAccount: 37,
    defaultPayableAccount: 38,
    vendorAdvanceAccount: 39,
    employeeAdvanceAccount: 40,
    employeePayableAccount: 41,
  };

export const PartyImportFieldOrder: PartyImportColumnId[] = [
  "partyCodeNo",
  "classification",
  "partyTypes",
  "partyName",
  "tradeName",
  "honorific",
  "firstName",
  "middleName",
  "lastName",
  "suffixName",
  "gender",
  "civilStatus",
  "nationality",
  "memberRegistrationDate",
  "tin",
  "vatRegistrationType",
  "atcCode",
  "email",
  "contactNo",
  "landline",
  "homeAddressLine1",
  "homeAddressLine2",
  "homeBarangay",
  "homeCityMunicipality",
  "homeProvince",
  "billingAddressLine1",
  "billingAddressLine2",
  "billingBarangay",
  "billingCityMunicipality",
  "billingProvince",
  "deliveryAddressLine1",
  "deliveryAddressLine2",
  "deliveryBarangay",
  "deliveryCityMunicipality",
  "deliveryProvince",
  "termName",
  "defaultReceivableAccount",
  "customerAdvanceAccount",
  "defaultPayableAccount",
  "vendorAdvanceAccount",
  "employeeAdvanceAccount",
  "employeePayableAccount",
];

export const PartyImportSelectionColumnWidth = 64;

export const PartyImportDefaultColumnWidths: PartyImportColumnWidths = {
  partyCodeNo: 150,
  classification: 160,
  partyTypes: 180,
  partyName: 240,
  tradeName: 220,
  honorific: 150,
  firstName: 180,
  middleName: 180,
  lastName: 180,
  suffixName: 120,
  gender: 150,
  civilStatus: 150,
  nationality: 170,
  memberRegistrationDate: 190,
  tin: 170,
  vatRegistrationType: 190,
  atcCode: 130,
  email: 220,
  contactNo: 170,
  landline: 170,
  addressLine1: 240,
  addressLine2: 220,
  barangay: 180,
  cityMunicipality: 190,
  province: 180,
  homeAddressLine1: 240,
  homeAddressLine2: 220,
  homeBarangay: 180,
  homeCityMunicipality: 190,
  homeProvince: 180,
  billingAddressLine1: 240,
  billingAddressLine2: 220,
  billingBarangay: 180,
  billingCityMunicipality: 190,
  billingProvince: 180,
  deliveryAddressLine1: 240,
  deliveryAddressLine2: 220,
  deliveryBarangay: 180,
  deliveryCityMunicipality: 190,
  deliveryProvince: 180,
  termName: 180,
  defaultReceivableAccount: 260,
  customerAdvanceAccount: 280,
  defaultPayableAccount: 260,
  vendorAdvanceAccount: 280,
  employeeAdvanceAccount: 280,
  employeePayableAccount: 280,
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
