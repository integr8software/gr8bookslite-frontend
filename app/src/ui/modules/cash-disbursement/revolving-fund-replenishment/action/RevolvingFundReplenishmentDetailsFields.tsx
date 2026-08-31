"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import {
  fetchRevolvingFundReplenishmentAccountOptions,
  fetchRevolvingFundReplenishmentPartyOptions,
  fetchRevolvingFundReplenishmentResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentApi";

export function RevolvingFundReplenishmentDetailsFields({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  page: RevolvingFundReplenishmentActionPageState;
}) {
  const partyQuery = useQuery({
    queryKey: ["cash-disbursement", "revolving-fund-replenishment", "parties"],
    queryFn: fetchRevolvingFundReplenishmentPartyOptions,
  });

  const accountQuery = useQuery({
    queryKey: ["cash-disbursement", "revolving-fund-replenishment", "accounts"],
    queryFn: fetchRevolvingFundReplenishmentAccountOptions,
  });

  const rcQuery = useQuery({
    queryKey: ["cash-disbursement", "revolving-fund-replenishment", "rcs"],
    queryFn: fetchRevolvingFundReplenishmentResponsibilityCenters,
  });

  const partyOptions = useMemo(() => {
    const raw = partyQuery.data ?? [];
    const options = [...raw];
    if (page.values.partyCode && !options.some((o) => o.value === page.values.partyCode || o.label === page.values.partyCode)) {
      options.unshift({
        name: page.values.partyName || page.values.partyCode,
        label: page.values.partyCode,
        value: page.values.partyCode,
        description: page.values.partyName,
      });
    }
    return options;
  }, [partyQuery.data, page.values.partyCode, page.values.partyName]);

  const accountOptions = useMemo(() => {
    const raw = accountQuery.data ?? [];
    const options = [...raw];
    if (page.values.accountCode && !options.some((o) => o.value === page.values.accountCode || o.label === page.values.accountCode)) {
      options.unshift({
        name: page.values.accountTitle || page.values.accountCode,
        label: page.values.accountCode,
        value: page.values.accountCode,
        description: page.values.accountTitle,
      });
    }
    return options;
  }, [accountQuery.data, page.values.accountCode, page.values.accountTitle]);

  const responsibilityCenterOptions = useMemo(() => {
    const raw = (rcQuery.data ?? []).filter((r) => !r.name?.toLowerCase().includes("project"));
    const options = [...raw];
    if (
      page.values.responsibilityCenterCode &&
      !options.some((o) => o.value === page.values.responsibilityCenterCode || o.label === page.values.responsibilityCenterCode)
    ) {
      options.unshift({
        name: page.values.responsibilityCenter || page.values.responsibilityCenterCode,
        label: page.values.responsibilityCenterCode,
        value: page.values.responsibilityCenterCode,
        description: page.values.responsibilityCenter,
      });
    }
    return options;
  }, [rcQuery.data, page.values.responsibilityCenterCode, page.values.responsibilityCenter]);

  const projectOptions = useMemo(() => {
    const raw = (rcQuery.data ?? []).filter((r) => r.name?.toLowerCase().includes("project"));
    const options = raw.length > 0 ? raw : (rcQuery.data ?? []);
    const fullOptions = [...options];
    if (
      page.values.projectCode &&
      !fullOptions.some((o) => o.value === page.values.projectCode || o.label === page.values.projectCode)
    ) {
      fullOptions.unshift({
        name: page.values.projectName || page.values.projectCode,
        label: page.values.projectCode,
        value: page.values.projectCode,
        description: page.values.projectName,
      });
    }
    return fullOptions;
  }, [rcQuery.data, page.values.projectCode, page.values.projectName]);

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Column 1: Name & Lookup Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" error={page.errors.partyName} isRequired>
            <AppLookupDropdown
              value={page.values.partyCode}
              options={partyOptions}
              readOnly={page.isReadonly}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              addAction={!page.isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(code, name) => {
                page.updateField("partyCode", code);
                page.updateField("partyName", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Responsibility Center">
            <AppLookupDropdown
              value={page.values.responsibilityCenterCode}
              options={responsibilityCenterOptions}
              readOnly={page.isReadonly}
              placeholder="Select Responsibility Center"
              searchPlaceholder="Search Responsibility Center"
              addAction={!page.isReadonly ? { label: "Add Responsibility Center", onClick: onOpenResponsibilityCenterDrawer } : undefined}
              onChange={(code, name) => {
                page.updateField("responsibilityCenterCode", code);
                page.updateField("responsibilityCenter", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Project Name">
            <AppLookupDropdown
              value={page.values.projectCode}
              options={projectOptions}
              readOnly={page.isReadonly}
              placeholder="Select Project Name"
              searchPlaceholder="Search Project Name"
              addAction={!page.isReadonly ? { label: "Add Project Name", onClick: onOpenProjectDrawer } : undefined}
              onChange={(code, name) => {
                page.updateField("projectCode", code);
                page.updateField("projectName", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Default Account Title" error={page.errors.accountTitle} isRequired>
            <AppLookupDropdown
              value={page.values.accountCode}
              options={accountOptions}
              readOnly={page.isReadonly}
              placeholder="Select Default Account Title"
              searchPlaceholder="Search Default Account"
              onChange={(code, name) => {
                page.updateField("accountCode", code);
                page.updateField("accountTitle", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Remarks">
            <AppLimitedTextarea
              value={page.values.remarks}
              readOnly={page.isReadonly}
              onChange={(event) => page.updateField("remarks", event.target.value)}
              className={`${TransactionFieldClassName} min-h-28 max-w-full resize py-3`}
              counterMode="used"
              placeholder="Optional Remarks"
            />
          </TransactionField>
        </div>

        {/* Column 2: Aligned Code & Financial Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.partyCode}
            isReadonly
            isRequired
            label="Party Code"
            error={page.errors.partyCode}
            onValueChange={(value) => page.updateField("partyCode", value)}
            placeholder="Party Code"
          />
          <TransactionTextField
            value={page.values.responsibilityCenterCode}
            isReadonly
            label="Responsibility Center Code"
            onValueChange={(value) => page.updateField("responsibilityCenterCode", value)}
            placeholder="Responsibility Center Code"
          />
          <TransactionTextField
            value={page.values.projectCode}
            isReadonly
            label="Project Code"
            onValueChange={(value) => page.updateField("projectCode", value)}
            placeholder="Project Code"
          />
          <TransactionTextField
            value={page.values.accountCode}
            isReadonly
            isRequired
            label="Default Account Code"
            error={page.errors.accountCode}
            onValueChange={(value) => page.updateField("accountCode", value)}
            placeholder="Default Account Code"
          />
          <CurrencyExchangeRateRow
            currencyLabel="Currency"
            currencyControlId="rfr-currency"
            currencyError={page.errors.currency}
            exchangeRateControlId="rfr-exchange-rate"
            exchangeRateError={page.errors.exchangeRate}
            currencyControl={
              <AppAdvancedDropdown
                id="rfr-currency"
                className="w-full min-w-0"
                value={page.values.currency}
                readOnly={page.isReadonly}
                isClearable={false}
                menuMinWidth={320}
                options={page.currencyOptions}
                placeholder="Currency"
                searchPlaceholder="Search Currency"
                onChange={(value) => page.updateCurrency(String(value))}
              />
            }
            exchangeRateControl={
              <input
                id="rfr-exchange-rate"
                type="text"
                inputMode="decimal"
                value={page.values.exchangeRate}
                readOnly={page.isReadonly}
                disabled={page.isReadonly || page.isExchangeRateLoading}
                onChange={(event) => page.updateField("exchangeRate", formatExchangeRateInput(event.target.value))}
                className={`${TransactionFieldClassName} text-right tabular-nums${page.isReadonly || page.isExchangeRateLoading ? " transaction-readonly-placeholder" : ""}`}
                placeholder="0.00"
              />
            }
          />
        </div>

        {/* Column 3: Transaction Identity & Status */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.transactionNo}
            isReadonly
            isRequired
            label="RFR No."
            error={page.errors.transactionNo}
            onValueChange={(value) => page.updateField("transactionNo", value)}
            placeholder="Auto Generated RFR Transaction Number"
          />
          <TransactionTextField
            value={page.values.documentDate}
            isReadonly={page.isReadonly}
            isRequired
            label="RFR Date"
            error={page.errors.documentDate}
            type="date"
            onValueChange={(value) => page.updateField("documentDate", value)}
          />
          <TransactionTextField value={page.values.status} isReadonly label="Status" onValueChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}
