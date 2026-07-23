import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type {
  TaxMaintenance,
  TaxMaintenanceAccountSummary,
  TaxMaintenancePermissions,
  TaxMaintenanceStatistics,
} from "@/app/src/types/modules/financial-maintenance/tax-maintenance/TaxMaintenanceTypes";

export const EmptyTaxMaintenancePermissions: TaxMaintenancePermissions = {
  canView: false,
  canCreate: false,
  canUpdate: false,
  canExport: false,
  canImport: false,
};

export const ReservedRoleTaxMaintenancePermissions: TaxMaintenancePermissions = {
  canView: true,
  canCreate: true,
  canUpdate: true,
  canExport: true,
  canImport: true,
};

export const EmptyTaxMaintenanceStatistics: TaxMaintenanceStatistics = {
  totalTaxes: 0,
  activeTaxes: 0,
  inactiveTaxes: 0,
};

export function getTaxMaintenanceTableMinWidthClassName(
  visibleColumnCount: number,
) {
  if (visibleColumnCount >= 17) return "min-w-[230rem]";
  if (visibleColumnCount >= 15) return "min-w-[206rem]";
  if (visibleColumnCount >= 13) return "min-w-[182rem]";
  if (visibleColumnCount >= 11) return "min-w-[158rem]";
  if (visibleColumnCount >= 9) return "min-w-[134rem]";
  if (visibleColumnCount >= 7) return "min-w-[110rem]";
  if (visibleColumnCount >= 5) return "min-w-[86rem]";
  return "min-w-[64rem]";
}

export function formatTaxMaintenancePercentage(
  value: string | number,
  isExempted = false,
) {
  if (isExempted) {
    return "Exempted";
  }

  return `${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  })}%`;
}

export function formatTaxMaintenanceAccount(
  account?: TaxMaintenanceAccountSummary | null,
) {
  return account ? `${account.accountCode} - ${account.accountTitle}` : "";
}

export function getTaxMaintenanceSearchText(tax: TaxMaintenance) {
  return [
    tax.name,
    tax.description,
    tax.percentage,
    tax.isExempted ? "exempted no tax" : "",
    tax.status,
    tax.createdBy,
    tax.updatedBy,
    formatTaxMaintenanceAccount(tax.accounts?.inputVatAccount),
    formatTaxMaintenanceAccount(tax.accounts?.outputVatAccount),
    formatTaxMaintenanceAccount(tax.accounts?.deferredVatAccount),
    formatTaxMaintenanceAccount(tax.accounts?.expandedWithholdingTaxAccount),
    formatTaxMaintenanceAccount(tax.accounts?.creditableWithholdingTaxAccount),
    formatTaxMaintenanceAccount(tax.accounts?.withholdingVatableTaxAccount),
    formatTaxMaintenanceAccount(tax.accounts?.finalWithholdingTaxAccount),
  ]
    .join(" ")
    .toLowerCase();
}

export function mapChartAccountToModuleChartAccount(
  account: ChartAccount,
): ModuleChartAccount {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    accountType: account.accountType,
    statementGroup: account.statementGroup,
    statementSection: account.statementSection,
    normalBalance: account.normalBalance === "CREDIT" ? "Credit" : "Debit",
    accountCategory: account.isPostingAccount ? "Posting" : "Header",
    description: account.description,
    status: account.status,
    children: account.children?.map(mapChartAccountToModuleChartAccount),
  };
}
