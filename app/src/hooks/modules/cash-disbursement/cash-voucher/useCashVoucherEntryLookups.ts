import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createAccountingChartAccountOptions,
  createDefaultAccountExpenseOptions,
  getAccountingPartyFallbackValue,
  isGeneratedAccountingEntry,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import {
  PurchaseTaxTypeCwt,
  PurchaseTaxTypeEwt,
  PurchaseTaxTypeInputVat,
  PurchaseTaxTypeVat,
  createEwtOptionsFromDefaultAccounts,
  createVatOptionsFromDefaultAccounts,
} from "@/app/src/data/shared/tax/TaxData";
import { FetchChartAccountsTree } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useTaxDefaultAccountOptionGroups } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type {
  CashVoucherPartyDropdownOption,
  CashVoucherLineEntry,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

const ActiveChartAccountStatus = "Active";

type CashVoucherEntryLookupOptions = {
  activeCompanyId: number | null;
  defaultAccounts: Parameters<typeof createDefaultAccountExpenseOptions>[0];
  entries: CashVoucherLineEntry[];
  livePartyOptions: CashVoucherPartyDropdownOption[];
  liveResponsibilityCenterOptions: AppAdvancedDropdownOption[];
};

export function useCashVoucherEntryLookups({
  activeCompanyId,
  defaultAccounts,
  entries,
  livePartyOptions,
  liveResponsibilityCenterOptions,
}: CashVoucherEntryLookupOptions) {
  const chartAccountsQuery = useQuery({
    queryKey: ChartsOfAccountsQueryKeys.tree(activeCompanyId),
    queryFn: FetchChartAccountsTree,
    staleTime: 60_000,
  });
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxDefaultAccountOptionsQuery = useTaxDefaultAccountOptionGroups();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(
    () =>
      createVatOptionsFromDefaultAccounts(
        taxDefaultAccountOptionsQuery.data?.find((group) => group.classification === "input-purchases")?.options ?? [],
      ),
    [taxDefaultAccountOptionsQuery.data],
  );
  const ewtOptions = useMemo(
    () =>
      createEwtOptionsFromDefaultAccounts(
        taxDefaultAccountOptionsQuery.data?.find((group) => group.classification === "purchase-ewt")?.options ?? [],
      ),
    [taxDefaultAccountOptionsQuery.data],
  );

  const liveChartAccounts = useMemo(() => createSpecificChartAccountOptions(chartAccountsQuery.data ?? []), [chartAccountsQuery.data]);
  const chartAccounts = useMemo(() => createAccountingChartAccountOptions(entries, liveChartAccounts), [entries, liveChartAccounts]);
  const expenseAccounts = useMemo(() => createDefaultAccountExpenseOptions(defaultAccounts), [defaultAccounts]);
  const expenseRows = useMemo(() => entries.filter((entry) => !isGeneratedAccountingEntry(entry)), [entries]);

  const partyOptions = useMemo<CashVoucherPartyDropdownOption[]>(() => {
    const options: CashVoucherPartyDropdownOption[] = livePartyOptions.map((option) => {
      const vatCode = findPartyTaxCode(taxCodes, option.defaultPurchaseInputVatTaxSourceKey, PurchaseTaxTypeVat);
      const ewtCode = findPartyTaxCode(taxCodes, option.defaultPurchaseEwtTaxSourceKey, PurchaseTaxTypeEwt);

      return { ...option, vatCode, ewtCode };
    });
    const optionNames = new Set(options.map((option) => option.name.toLowerCase()));
    const customValues = new Set(options.map((option) => option.value));
    const customOptions: AppAdvancedDropdownOption[] = [];

    entries.forEach((entry) => {
      const currentPartyName = (entry.partyName ?? "").trim();
      const value = getAccountingPartyFallbackValue(currentPartyName);

      if (!currentPartyName || optionNames.has(currentPartyName.toLowerCase()) || customValues.has(value)) {
        return;
      }

      customValues.add(value);
      customOptions.push({
        description: "Copied entry party",
        label: entry.partyCode ?? "",
        name: currentPartyName,
        value,
      });
    });

    return [...options, ...customOptions];
  }, [entries, livePartyOptions, taxCodes]);

  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = [...liveResponsibilityCenterOptions];
    const optionValues = new Set(options.map((option) => option.value));
    const customOptions: AppAdvancedDropdownOption[] = [];

    entries.forEach((entry) => {
      const responsibilityCenter = (entry.responsibilityCenter ?? "").trim();

      if (!responsibilityCenter || optionValues.has(responsibilityCenter)) {
        return;
      }

      optionValues.add(responsibilityCenter);
      customOptions.push({
        description: "Copied responsibility center",
        label: responsibilityCenter,
        name: responsibilityCenter,
        value: responsibilityCenter,
      });
    });

    return [...options, ...customOptions];
  }, [entries, liveResponsibilityCenterOptions]);

  return {
    chartAccounts,
    ewtOptions,
    expenseAccounts,
    expenseRows,
    partyOptions,
    responsibilityCenterOptions,
    taxCodes,
    vatOptions,
  };
}

function findPartyTaxCode(
  taxCodes: AlphanumericTaxCode[],
  sourceKey: string | undefined,
  taxType: typeof PurchaseTaxTypeEwt | typeof PurchaseTaxTypeVat,
) {
  if (!sourceKey) {
    return "";
  }

  const taxCode = taxCodes.find(
    (tax) =>
      tax.sourceKey === sourceKey &&
      (taxType === PurchaseTaxTypeVat
        ? tax.taxType === PurchaseTaxTypeInputVat || tax.taxType === PurchaseTaxTypeVat
        : tax.taxType === PurchaseTaxTypeEwt || tax.taxType === PurchaseTaxTypeCwt),
  );

  return taxCode ? (taxType === PurchaseTaxTypeEwt ? taxCode.officialAtcCode || taxCode.taxCode : taxCode.taxCode) : "";
}

function createSpecificChartAccountOptions(accounts: ChartAccount[]): ModuleChartAccount[] {
  return accounts.flatMap((account) => {
    const childOptions = createSpecificChartAccountOptions(account.children ?? []);

    if (account.status !== ActiveChartAccountStatus || account.accountLevel !== "SPECIFIC" || !account.isPostingAccount) {
      return childOptions;
    }

    return [
      {
        accountCategory: account.accountLevel,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        description: account.description || account.statementSection,
        id: account.id,
        normalBalance: account.normalBalance === "CREDIT" ? "Credit" : "Debit",
        statementGroup: account.statementGroup,
        statementSection: account.statementSection,
        status: account.status,
      },
      ...childOptions,
    ];
  });
}
