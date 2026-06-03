import type {
  PartyClassification,
  PartyInformationStatus,
  PartyType,
  VatRegistrationType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export const PartyManagementHref = "/maintenance/party-management";

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
  { key: "status", label: "Status", className: "w-[9rem]" },
  { key: "addressLabel", label: "Address", className: "w-[28rem]" },
  {
    label: "Actions",
    className: "w-[8rem] text-center",
  },
] as const;
