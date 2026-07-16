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
  { key: "name", label: "Tax Name", className: "w-[16%]" },
  { key: "percentage", label: "Percentage", className: "w-[10%] text-center" },
  { key: "inputVatAccountCode", label: "Input VAT Code", className: "w-[12%]" },
  {
    key: "inputVatAccountTitle",
    label: "Input VAT Account Title",
    className: "w-[18%]",
  },
  { key: "outputVatAccountCode", label: "Output VAT Code", className: "w-[12%]" },
  {
    key: "outputVatAccountTitle",
    label: "Output VAT Account Title",
    className: "w-[18%]",
  },
  {
    key: "vatPayableAccountCode",
    label: "VAT Payable Code",
    className: "w-[12%]",
  },
  {
    key: "vatPayableAccountTitle",
    label: "VAT Payable Account Title",
    className: "w-[18%]",
  },
  {
    key: "deferredInputTaxAccountCode",
    label: "Deferred Input Tax Code",
    className: "w-[14%]",
  },
  {
    key: "deferredInputTaxAccountTitle",
    label: "Deferred Input Tax Account Title",
    className: "w-[18%]",
  },
  {
    key: "deferredOutputVatAccountCode",
    label: "Deferred Output VAT Code",
    className: "w-[14%]",
  },
  {
    key: "deferredOutputVatAccountTitle",
    label: "Deferred Output VAT Account Title",
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
  deferredInputTaxAccountCode: false,
  deferredInputTaxAccountTitle: false,
  deferredOutputVatAccountCode: false,
  deferredOutputVatAccountTitle: false,
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
    { header: "Tax Name", id: "name", value: "name" },
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
      header: "Input VAT Account Title",
      id: "inputVatAccountTitle",
      value: (tax) => tax.accounts?.inputVatAccount?.accountTitle ?? "",
    },
    {
      header: "Output VAT Code",
      id: "outputVatAccountCode",
      value: (tax) => tax.accounts?.outputVatAccount?.accountCode ?? "",
    },
    {
      header: "Output VAT Account Title",
      id: "outputVatAccountTitle",
      value: (tax) => tax.accounts?.outputVatAccount?.accountTitle ?? "",
    },
    {
      header: "VAT Payable Code",
      id: "vatPayableAccountCode",
      value: (tax) => tax.accounts?.vatPayableAccount?.accountCode ?? "",
    },
    {
      header: "VAT Payable Account Title",
      id: "vatPayableAccountTitle",
      value: (tax) => tax.accounts?.vatPayableAccount?.accountTitle ?? "",
    },
    {
      header: "Deferred Input Tax Code",
      id: "deferredInputTaxAccountCode",
      value: (tax) => tax.accounts?.deferredInputTaxAccount?.accountCode ?? "",
    },
    {
      header: "Deferred Input Tax Account Title",
      id: "deferredInputTaxAccountTitle",
      value: (tax) => tax.accounts?.deferredInputTaxAccount?.accountTitle ?? "",
    },
    {
      header: "Deferred Output VAT Code",
      id: "deferredOutputVatAccountCode",
      value: (tax) => tax.accounts?.deferredOutputVatAccount?.accountCode ?? "",
    },
    {
      header: "Deferred Output VAT Account Title",
      id: "deferredOutputVatAccountTitle",
      value: (tax) => tax.accounts?.deferredOutputVatAccount?.accountTitle ?? "",
    },
    { header: "Status", id: "status", value: "status" },
    { header: "Created By", id: "createdBy", value: "createdBy" },
    { header: "Date Created", id: "createdAt", value: "createdAt" },
    { header: "Updated By", id: "updatedBy", value: "updatedBy" },
    { header: "Date Modified", id: "updatedAt", value: "updatedAt" },
  ];
