import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  TaxMaintenance,
  TaxMaintenanceStatus,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import {
  formatTaxMaintenancePercentage,
} from "@/app/src/data/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceData";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const TaxMaintenanceHref = MODULE_ROUTE_MAP.TXM;

export const TaxMaintenanceApiPath = "/maintenance/tax-maintenance";

export const TaxMaintenanceTitle = "Tax Maintenance";

export const TaxMaintenanceParentLabel = "Accounting master data";

export const TaxMaintenanceDescription =
  "Maintain VAT registration types, tax percentages, and default chart account mappings.";

export const TaxMaintenanceDrawerFormId = "tax-maintenance-drawer-form";

export const TaxMaintenanceStatusOptions = [
  "Active",
  "Inactive",
] as const satisfies readonly TaxMaintenanceStatus[];

export const TaxMaintenanceActionCopy = {
  add: {
    title: "Add Tax Type",
    description: "Create a VAT registration type for party tax setup.",
  },
  edit: {
    title: "Edit Tax Type",
    description: "Update VAT registration type details and account mappings.",
  },
  view: {
    title: "View Tax Type",
    description: "Review VAT registration type details and account mappings.",
  },
} as const;

export const TaxMaintenanceFieldClassName =
  "app-disabled-control h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.035] disabled:text-darknavy/35 disabled:placeholder:text-darknavy/32";

export const TaxMaintenanceTablePaginationStorageKey =
  "maintenance:financial-management:tax-maintenance";

export const TaxMaintenanceTableColumns = [
  { key: "name", label: "VAT Name", className: "w-[16%]" },
  { key: "description", label: "Description", className: "w-[18%]" },
  { key: "percentage", label: "Percentage", className: "w-[10%] text-center" },
  { key: "inputVatAccountCode", label: "Input VAT Code", className: "w-[12%]" },
  { key: "inputVatAccountTitle", label: "Input VAT Title", className: "w-[18%]" },
  { key: "outputVatAccountCode", label: "Output VAT Code", className: "w-[12%]" },
  { key: "outputVatAccountTitle", label: "Output VAT Title", className: "w-[18%]" },
  { key: "deferredVatAccountCode", label: "Deferred VAT Code", className: "w-[12%]" },
  { key: "deferredVatAccountTitle", label: "Deferred VAT Title", className: "w-[18%]" },
  {
    key: "expandedWithholdingTaxAccountCode",
    label: "Expanded Withholding TAX Code",
    className: "w-[14%]",
  },
  {
    key: "expandedWithholdingTaxAccountTitle",
    label: "Expanded Withholding TAX Title",
    className: "w-[18%]",
  },
  {
    key: "creditableWithholdingTaxAccountCode",
    label: "Creditable Withholding TAX Code",
    className: "w-[14%]",
  },
  {
    key: "creditableWithholdingTaxAccountTitle",
    label: "Creditable Withholding TAX Title",
    className: "w-[18%]",
  },
  {
    key: "withholdingVatableTaxAccountCode",
    label: "Withholding Vatable TAX Code",
    className: "w-[14%]",
  },
  {
    key: "withholdingVatableTaxAccountTitle",
    label: "Withholding Vatable TAX Title",
    className: "w-[18%]",
  },
  {
    key: "finalWithholdingTaxAccountCode",
    label: "Final Withholding TAX Code",
    className: "w-[14%]",
  },
  {
    key: "finalWithholdingTaxAccountTitle",
    label: "Final Withholding TAX Title",
    className: "w-[18%]",
  },
  { key: "status", label: "Status", className: "w-[12%] text-center" },
  { key: "createdBy", label: "Created By", className: "w-[14%]" },
  { key: "createdAt", label: "Date Created", className: "w-[16%]" },
  { key: "updatedBy", label: "Updated By", className: "w-[14%]" },
  { key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
  { label: "Action", className: "w-[16%] text-center" },
] as const;

export const TaxMaintenanceTablePreferencesStorageKey =
  "gr8booksneo:tax-maintenance:table-preferences";
export const TaxMaintenanceTablePreferencesModuleKey =
  "maintenance:tax-maintenance";
export const TaxMaintenanceDefaultColumnOrder = TaxMaintenanceTableColumns.map(
  (column) => ("key" in column ? column.key : "actions"),
);
export const TaxMaintenanceDefaultColumnVisibility: VisibilityState = {
  description: false,
  inputVatAccountCode: false,
  inputVatAccountTitle: false,
  outputVatAccountCode: false,
  outputVatAccountTitle: false,
  deferredVatAccountCode: false,
  deferredVatAccountTitle: false,
  expandedWithholdingTaxAccountCode: false,
  expandedWithholdingTaxAccountTitle: false,
  creditableWithholdingTaxAccountCode: false,
  creditableWithholdingTaxAccountTitle: false,
  withholdingVatableTaxAccountCode: false,
  withholdingVatableTaxAccountTitle: false,
  finalWithholdingTaxAccountCode: false,
  finalWithholdingTaxAccountTitle: false,
  createdBy: false,
  createdAt: false,
  updatedBy: false,
  updatedAt: false,
};
export const TaxMaintenanceDefaultSorting: SortingState = [
  { id: "name", desc: false },
];

export const TaxMaintenanceExportColumns: ModuleTableExportColumn<TaxMaintenance>[] =
  [
    { header: "VAT Name", id: "name", value: "name" },
    { header: "Description", id: "description", value: "description" },
    {
      header: "Percentage",
      id: "percentage",
      value: (tax) => formatTaxMaintenancePercentage(tax.percentage),
    },
    {
      header: "Input VAT Code",
      id: "inputVatAccountCode",
      value: (tax) => tax.accounts?.inputVatAccount?.accountCode ?? "",
    },
    {
      header: "Input VAT Title",
      id: "inputVatAccountTitle",
      value: (tax) => tax.accounts?.inputVatAccount?.accountTitle ?? "",
    },
    {
      header: "Output VAT Code",
      id: "outputVatAccountCode",
      value: (tax) => tax.accounts?.outputVatAccount?.accountCode ?? "",
    },
    {
      header: "Output VAT Title",
      id: "outputVatAccountTitle",
      value: (tax) => tax.accounts?.outputVatAccount?.accountTitle ?? "",
    },
    {
      header: "Deferred VAT Code",
      id: "deferredVatAccountCode",
      value: (tax) => tax.accounts?.deferredVatAccount?.accountCode ?? "",
    },
    {
      header: "Deferred VAT Title",
      id: "deferredVatAccountTitle",
      value: (tax) => tax.accounts?.deferredVatAccount?.accountTitle ?? "",
    },
    {
      header: "Expanded Withholding TAX Code",
      id: "expandedWithholdingTaxAccountCode",
      value: (tax) =>
        tax.accounts?.expandedWithholdingTaxAccount?.accountCode ?? "",
    },
    {
      header: "Expanded Withholding TAX Title",
      id: "expandedWithholdingTaxAccountTitle",
      value: (tax) =>
        tax.accounts?.expandedWithholdingTaxAccount?.accountTitle ?? "",
    },
    {
      header: "Creditable Withholding TAX Code",
      id: "creditableWithholdingTaxAccountCode",
      value: (tax) =>
        tax.accounts?.creditableWithholdingTaxAccount?.accountCode ?? "",
    },
    {
      header: "Creditable Withholding TAX Title",
      id: "creditableWithholdingTaxAccountTitle",
      value: (tax) =>
        tax.accounts?.creditableWithholdingTaxAccount?.accountTitle ?? "",
    },
    {
      header: "Withholding Vatable TAX Code",
      id: "withholdingVatableTaxAccountCode",
      value: (tax) =>
        tax.accounts?.withholdingVatableTaxAccount?.accountCode ?? "",
    },
    {
      header: "Withholding Vatable TAX Title",
      id: "withholdingVatableTaxAccountTitle",
      value: (tax) =>
        tax.accounts?.withholdingVatableTaxAccount?.accountTitle ?? "",
    },
    {
      header: "Final Withholding TAX Code",
      id: "finalWithholdingTaxAccountCode",
      value: (tax) =>
        tax.accounts?.finalWithholdingTaxAccount?.accountCode ?? "",
    },
    {
      header: "Final Withholding TAX Title",
      id: "finalWithholdingTaxAccountTitle",
      value: (tax) =>
        tax.accounts?.finalWithholdingTaxAccount?.accountTitle ?? "",
    },
    { header: "Status", id: "status", value: "status" },
    { header: "Created By", id: "createdBy", value: "createdBy" },
    { header: "Date Created", id: "createdAt", value: "createdAt" },
    { header: "Updated By", id: "updatedBy", value: "updatedBy" },
    { header: "Date Modified", id: "updatedAt", value: "updatedAt" },
  ];
