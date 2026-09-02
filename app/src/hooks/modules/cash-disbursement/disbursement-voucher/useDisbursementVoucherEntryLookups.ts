"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CashDisbursementActiveStatus,
  CashDisbursementTaxTypeEwt,
  CashDisbursementTaxTypeVat,
} from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import {
  createAccountingChartAccountOptions,
  createDefaultAccountExpenseOptions,
  getAccountingPartyFallbackValue,
  isGeneratedAccountingEntry,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import { createEwtOptions, createVatOptions } from "@/app/src/data/shared/tax/TaxData";
import { FetchChartAccountsTree } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type {
  DisbursementLineEntry,
  DisbursementVoucherPartyDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

type DisbursementVoucherEntryLookupOptions = {
  activeCompanyId: number | null;
  defaultAccounts: Parameters<typeof createDefaultAccountExpenseOptions>[0];
  entries: DisbursementLineEntry[];
  livePartyOptions: DisbursementVoucherPartyDropdownOption[];
  liveResponsibilityCenterOptions: AppAdvancedDropdownOption[];
};

export function useDisbursementVoucherEntryLookups({
  activeCompanyId,
  defaultAccounts,
  entries,
  livePartyOptions,
  liveResponsibilityCenterOptions,
}: DisbursementVoucherEntryLookupOptions) {
  const chartAccountsQuery = useQuery({
    queryKey: ChartsOfAccountsQueryKeys.tree(activeCompanyId),
    queryFn: FetchChartAccountsTree,
    staleTime: 60_000,
  });
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);

  const liveChartAccounts = useMemo(
    () => createSpecificChartAccountOptions(chartAccountsQuery.data ?? []),
    [chartAccountsQuery.data],
  );
  const chartAccounts = useMemo(
    () => createAccountingChartAccountOptions(entries, liveChartAccounts),
    [entries, liveChartAccounts],
  );
  const expenseAccounts = useMemo(() => createDefaultAccountExpenseOptions(defaultAccounts), [defaultAccounts]);
  const expenseRows = useMemo(() => entries.filter((entry) => !isGeneratedAccountingEntry(entry)), [entries]);

  const partyOptions = useMemo<DisbursementVoucherPartyDropdownOption[]>(() => {
    const options: DisbursementVoucherPartyDropdownOption[] = livePartyOptions.map((option) => {
      const vatCode = findPartyTaxCode(taxCodes, option.defaultPurchaseInputVatTaxSourceKey, CashDisbursementTaxTypeVat);
      const ewtCode = findPartyTaxCode(taxCodes, option.defaultPurchaseEwtTaxSourceKey, CashDisbursementTaxTypeEwt);

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
    isChartAccountsError: chartAccountsQuery.isError,
    isChartAccountsLoading: chartAccountsQuery.isLoading,
    isTaxCodesError: taxCodesQuery.isError,
    isTaxCodesLoading: taxCodesQuery.isLoading,
    partyOptions,
    responsibilityCenterOptions,
    taxCodes,
    vatOptions,
  };
}

function findPartyTaxCode(
  taxCodes: AlphanumericTaxCode[],
  sourceKey: string | undefined,
  taxType: typeof CashDisbursementTaxTypeEwt | typeof CashDisbursementTaxTypeVat,
) {
  if (!sourceKey) {
    return "";
  }

  const taxCode = taxCodes.find(
    (tax) =>
      tax.sourceKey === sourceKey &&
      (taxType === CashDisbursementTaxTypeVat
        ? tax.taxType === "INPUT VAT" || tax.taxType === CashDisbursementTaxTypeVat
        : tax.taxType === CashDisbursementTaxTypeEwt || tax.taxType === "CWT"),
  );

  return taxCode ? (taxType === CashDisbursementTaxTypeEwt ? taxCode.officialAtcCode || taxCode.taxCode : taxCode.taxCode) : "";
}

function createSpecificChartAccountOptions(accounts: ChartAccount[]): ModuleChartAccount[] {
  return accounts.flatMap((account) => {
    const childOptions = createSpecificChartAccountOptions(account.children ?? []);

    if (account.status !== CashDisbursementActiveStatus || account.accountLevel !== "SPECIFIC" || !account.isPostingAccount) {
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
