import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  PartyImportColumnHeader,
  PartyImportColumnId,
  PartyImportColumnWidths,
  PartyAccountingAccountField,
  PartyClassification,
  PartyEntityType,
  PartyInformationStatus,
  PartyInformationTableRecord,
  PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const PartyManagementHref = MODULE_ROUTE_MAP.PM;

export const PartyManagementApiPath = "/maintenance/party-maintenance";

export const PartyManagementParentLabel = "Party management";

export const PartyInformationTitle = "Party Information";

export const PartyInformationDescription = "Maintain people and organizations used across sales, purchasing, payroll, and tax reporting.";

export const PartyAccountingAccountFieldLabels: Record<
  PartyAccountingAccountField,
  string
> = {
  customerAdvanceAccount: "Default Customer Advance Account",
  defaultPayableAccount: "Default Payable Account",
  defaultReceivableAccount: "Default Receivable Account",
  employeeAdvanceAccount: "Default Employee Advance Account",
  employeePayableAccount: "Default Employee Payable Account",
  vendorAdvanceAccount: "Default Vendor Advance Account",
};

export const PartyManagementTablePaginationStorageKey = "maintenance-party-management-party-information";

export const PartyManagementEditFromParam = "from";

export const PartyManagementEditFromViewValue = "view";

export const PartyManagementEditFromViewQuery = `${PartyManagementEditFromParam}=${PartyManagementEditFromViewValue}`;

export const PartyManagementDrawerFormId = "party-management-drawer-form";

export const PartyImportBillingAddressRole = "billing";

export const PartyImportDefaultAddressRole = "default";

export const PartyImportDeliveryAddressRole = "delivery";

export const PartyImportHomeAddressRole = "home";

export const PartyClassificationOptions = ["Individual", "Non-Individual"] as const satisfies readonly PartyClassification[];

export const PartyTypeOptions = ["Vendor", "Customer", "Employee", "Member"] as const satisfies readonly PartyType[];

export const PartyEntityTypeOptions = [
  {
    name: "Individual / Sole Proprietor",
    description: "A person operating a business under their own name or registered trade name",
    classificationScope: "Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 10,
  },
  {
    name: "Partnership",
    description: "A business owned by two or more partners",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 20,
  },
  {
    name: "Corporation",
    description: "A registered stock or non-stock corporation",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 30,
  },
  {
    name: "Cooperative",
    description: "A member-owned and member-managed organization",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 40,
  },
  {
    name: "Government Agency",
    description: "National government department, bureau, commission, or office",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: true,
    sortOrder: 50,
  },
  {
    name: "Local Government Unit",
    description: "Province, city, municipality, or barangay",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: true,
    sortOrder: 60,
  },
  {
    name: "Government-Owned or Controlled Corporation",
    description: "A corporation owned or controlled by the government",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: true,
    sortOrder: 70,
  },
  {
    name: "NGO / Non-Government Organization",
    description: "A private organization established for social, humanitarian, or development purposes",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: true,
    sortOrder: 80,
  },
  {
    name: "Nonprofit Organization",
    description: "An organization that does not distribute profits to owners or members",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 90,
  },
  {
    name: "Foundation",
    description: "A nonprofit entity commonly established for charitable or social programs",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 100,
  },
  {
    name: "Educational Institution",
    description: "School, college, university, or training institution",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 110,
  },
  {
    name: "Religious Organization",
    description: "Church, ministry, religious order, or faith-based institution",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 120,
  },
  {
    name: "Healthcare Institution",
    description: "Hospital, clinic, laboratory, or medical institution",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 130,
  },
  {
    name: "Foreign Company",
    description: "A vendor registered outside the Philippines",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 140,
  },
  {
    name: "International Organization",
    description: "Organizations such as development agencies or intergovernmental bodies",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 150,
  },
  {
    name: "Professional / Freelancer",
    description: "An independent consultant, lawyer, accountant, engineer, artist, or similar professional",
    classificationScope: "Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 160,
  },
  {
    name: "Association",
    description: "A professional, trade, community, or membership-based organization",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 170,
  },
  {
    name: "Other",
    description: "Used when no standard classification applies",
    classificationScope: "Non-Individual",
    showsGovernmentWithholdingDefaults: false,
    sortOrder: 180,
  },
] as const satisfies readonly {
  name: PartyEntityType;
  description: string;
  classificationScope: PartyClassification;
  showsGovernmentWithholdingDefaults: boolean;
  sortOrder: number;
}[];

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

export const PartyGenderOptions = ["Male", "Female", "Prefer not to say"] as const;

export const PartyCivilStatusOptions = ["Single", "Married", "Widowed", "Separated"] as const;

export const PartyDefaultNationality = "Filipino";

export const PartyManagementAllFilter = "All";
export const PartyInformationActiveStatus = "Active";
export const PartyInformationStatusOptions = [PartyInformationActiveStatus, "Inactive"] as const satisfies readonly PartyInformationStatus[];

export const BIRAtcSourceUrl = "https://bir-cdn.bir.gov.ph/local/pdf/2307%20Jan%202018%20ENCS%20v3.pdf";

export const PartyManagementActionCopy = {
  add: {
    title: "Add Party Information",
    description: "Create a party profile for sales, purchasing, payroll, and tax workflows.",
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
  { key: "partyEntityType", label: "Entity Type", className: "w-[18rem]" },
  { key: "partyTypesLabel", label: "Type", className: "w-[12rem]" },
  { key: "contactPerson", label: "Contact Person", className: "w-[18rem]" },
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

export const PartyManagementTablePreferencesStorageKey = "gr8booksneo:party-management:table-preferences";
export const PartyManagementTablePreferencesModuleKey = "maintenance:party-management";
export const PartyManagementDefaultColumnOrder = PartyManagementTableColumns.map((column) => ("key" in column ? column.key : "actions"));
export const PartyManagementDefaultColumnVisibility: VisibilityState = {
  billingAddressLabel: false,
  civilStatus: false,
  contactPerson: false,
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
  partyEntityType: false,
  tin: false,
  updatedAt: false,
  updatedBy: false,
};
export const PartyManagementDefaultSorting: SortingState = [{ id: "name", desc: false }];

export const PartyInformationExportColumns: ModuleTableExportColumn<PartyInformationTableRecord>[] = [
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
  { header: "Cash Advance Limit", value: "cashAdvanceLimit" },
];

export const PartyManagementFieldClassName =
  "app-disabled-control h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.035] disabled:text-darknavy/35 disabled:placeholder:text-darknavy/32";

export const PartyManagementSelectClassName = `app-select-control ${PartyManagementFieldClassName}`;

export const PartyManagementFieldControlSelector = '[role="combobox"], input:not([type="hidden"]), select, textarea, button';

export const PartyImportTemplateHeaders = [
  "Party Code",
  "Classification",
  "Party Entity Type",
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
  "ATC Code",
  "Contact Person",
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
  "Cash Advance Limit",
];

export const PartyImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";

export const PartyImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const PartyImportDefaultColumnIndexes: Partial<Record<PartyImportColumnId, number>> = {
  partyCodeNo: 0,
  classification: 1,
  partyEntityType: 2,
  partyTypes: 3,
  partyName: 4,
  tradeName: 5,
  honorific: 6,
  firstName: 7,
  middleName: 8,
  lastName: 9,
  suffixName: 10,
  gender: 11,
  civilStatus: 12,
  nationality: 13,
  memberRegistrationDate: 14,
  tin: 15,
  atcCode: 16,
  contactPerson: 17,
  email: 18,
  contactNo: 19,
  landline: 20,
  homeAddressLine1: 21,
  homeAddressLine2: 22,
  homeBarangay: 23,
  homeCityMunicipality: 24,
  homeProvince: 25,
  billingAddressLine1: 26,
  billingAddressLine2: 27,
  billingBarangay: 28,
  billingCityMunicipality: 29,
  billingProvince: 30,
  deliveryAddressLine1: 31,
  deliveryAddressLine2: 32,
  deliveryBarangay: 33,
  deliveryCityMunicipality: 34,
  deliveryProvince: 35,
  termName: 36,
  defaultReceivableAccount: 37,
  customerAdvanceAccount: 38,
  defaultPayableAccount: 39,
  vendorAdvanceAccount: 40,
  employeeAdvanceAccount: 41,
  employeePayableAccount: 42,
  cashAdvanceLimit: 43,
};

export const PartyImportFieldOrder: PartyImportColumnId[] = [
  "partyCodeNo",
  "classification",
  "partyEntityType",
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
  "atcCode",
  "contactPerson",
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
  "cashAdvanceLimit",
];

export const PartyImportSelectionColumnWidth = ModuleImportFixedColumnsWidth;

export const PartyImportDefaultColumnWidths: PartyImportColumnWidths = {
  partyCodeNo: 150,
  classification: 160,
  partyEntityType: 240,
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
  atcCode: 130,
  contactPerson: 220,
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
  cashAdvanceLimit: 180,
};

export const PartyImportColumnHeaders: PartyImportColumnHeader[] = PartyImportFieldOrder.map((id, index) => ({
  className: "px-3",
  id,
  label: PartyImportTemplateHeaders[index] ?? id,
}));

export const PartyImportPreviewColumnCount = PartyImportFieldOrder.length + 1;

export const PartyImportPreviewGridLabel = "Import preview grid. Paste copied Excel rows here.";

export const PartyImportPreviewEmptyMessage = "Upload a file, or focus here and paste copied Excel rows.";

export const PartyImportPreviewPageSize = 20;
export const PartyImportBatchSize = 25;
export const PartyImportMinFileSizeBytes = 1;
export const PartyImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;
