import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CashVoucherEntryColumnLabels,
  CashVoucherExpenseEntryView,
  DefaultCashVoucherEntryColumnWidths,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  applyVoucherPartyToEntryUpdates,
  createAccountingChartAccountOptions,
  createDefaultAccountExpenseOptions,
  getAccountingPartyFallbackValue,
  isGeneratedAccountingEntry,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import { createEwtOptions, createVatOptions } from "@/app/src/data/shared/tax/TaxData";
import { FetchChartAccountsTree } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type {
  CashVoucherEntryView,
  VoucherDataEntryProps,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type { CashVoucherPartyDropdownOption } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type { CashVoucherLineEntry } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { CashVoucherAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherAccountingEntryTable";
import { createCashVoucherAccountingEntryColumns } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryColumns";
import { CashVoucherDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherDetailEntryTable";
import {
  CashVoucherEntryTabs,
  CashVoucherAccountingEntryView,
} from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryTabs";

export function CashVoucherEntrySection(props: VoucherDataEntryProps) {
  const {
    canAddExpenseType,
    canAddPartyName,
    canAddResponsibilityCenter,
    defaultAccounts,
    entries,
    errors,
    isReadonly,
    onAddEntries,
    onAddExpenseType,
    onAddPartyName,
    onAddResponsibilityCenter,
    onClearEntries,
    onDuplicateEntry,
    onInsertEntry,
    onMoveEntry,
    onRemoveEntry,
    onUpdateEntry,
    onUpdateEntryFields,
    partyOptions: livePartyOptions,
    partyCode,
    partyName,
    responsibilityCenterOptions: liveResponsibilityCenterOptions,
    totalCredit,
    totalDebit,
  } = props;
  const variance = Math.abs(totalDebit - totalCredit);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  const [entryView, setEntryView] = useState<CashVoucherEntryView>(CashVoucherExpenseEntryView);
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

  const partyOptions = useMemo<CashVoucherPartyDropdownOption[]>(() => {
    const options: CashVoucherPartyDropdownOption[] = livePartyOptions.map((option) => {
      const vatCode = findPartyTaxCode(taxCodes, option.defaultPurchaseInputVatTaxSourceKey, "VAT");
      const ewtCode = findPartyTaxCode(taxCodes, option.defaultPurchaseEwtTaxSourceKey, "EWT");

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

  const updateExpenseEntryFields = useCallback(
    (entryId: string, updates: Partial<CashVoucherLineEntry>) => {
      const currentEntry = entries.find((entry) => entry.id === entryId);
      const nextUpdates = applyVoucherPartyToEntryUpdates(currentEntry, updates, partyCode, partyName);

      onUpdateEntryFields(entryId, nextUpdates);
    },
    [entries, onUpdateEntryFields, partyCode, partyName],
  );

  const accountingColumns = useMemo(
    () =>
      createCashVoucherAccountingEntryColumns({
        canAddPartyName,
        chartAccounts,
        columnLabels: CashVoucherEntryColumnLabels,
        columnWidths: DefaultCashVoucherEntryColumnWidths,
        ewtOptions,
        isReadonly,
        onAddPartyName,
        onUpdateEntry,
        onUpdateEntryFields,
        partyOptions,
        taxCodes,
        vatOptions,
      }),
    [
      canAddPartyName,
      chartAccounts,
      ewtOptions,
      isReadonly,
      onAddPartyName,
      onUpdateEntry,
      onUpdateEntryFields,
      partyOptions,
      taxCodes,
      vatOptions,
    ],
  );

  if (entryView === CashVoucherAccountingEntryView) {
    return (
      <CashVoucherAccountingEntryTable
        accountingColumns={accountingColumns}
        accountingRows={entries}
        errors={errors}
        isReadonly={isReadonly}
        title={<CashVoucherEntryTabs activeTab={entryView} onTabChange={setEntryView} />}
        totalCredit={totalCredit}
        totalDebit={totalDebit}
        variance={variance}
        onAddEntries={onAddEntries}
        onClearEntries={onClearEntries}
        onDuplicateEntry={onDuplicateEntry}
        onInsertEntry={onInsertEntry}
        onMoveEntry={onMoveEntry}
        onRemoveEntry={onRemoveEntry}
      />
    );
  }

  return (
    <CashVoucherDetailEntryTable
      accountingColumns={accountingColumns}
      canAddExpenseType={canAddExpenseType}
      canAddResponsibilityCenter={canAddResponsibilityCenter}
      errors={errors}
      ewtOptions={ewtOptions}
      expenseAccounts={expenseAccounts}
      expenseRows={expenseRows}
      isReadonly={isReadonly}
      title={<CashVoucherEntryTabs activeTab={entryView} onTabChange={setEntryView} />}
      onAddEntries={onAddEntries}
      onAddExpenseType={onAddExpenseType}
      onAddResponsibilityCenter={onAddResponsibilityCenter}
      onClearEntries={onClearEntries}
      onDuplicateEntry={onDuplicateEntry}
      onInsertEntry={onInsertEntry}
      onMoveEntry={onMoveEntry}
      onRemoveEntry={onRemoveEntry}
      responsibilityCenterOptions={responsibilityCenterOptions}
      taxCodes={taxCodes}
      updateExpenseEntryFields={updateExpenseEntryFields}
      vatOptions={vatOptions}
    />
  );
}

function findPartyTaxCode(
  taxCodes: AlphanumericTaxCode[],
  sourceKey: string | undefined,
  taxType: "EWT" | "VAT",
) {
  if (!sourceKey) {
    return "";
  }

  const taxCode = taxCodes.find(
    (tax) =>
      tax.sourceKey === sourceKey &&
      (taxType === "VAT"
        ? tax.taxType === "INPUT VAT" || tax.taxType === "VAT"
        : tax.taxType === "EWT" || tax.taxType === "CWT"),
  );

  return taxCode ? (taxType === "EWT" ? taxCode.officialAtcCode || taxCode.taxCode : taxCode.taxCode) : "";
}

function createSpecificChartAccountOptions(accounts: ChartAccount[]): ModuleChartAccount[] {
  return accounts.flatMap((account) => {
    const childOptions = createSpecificChartAccountOptions(account.children ?? []);

    if (account.status !== "Active" || account.accountLevel !== "SPECIFIC" || !account.isPostingAccount) {
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
