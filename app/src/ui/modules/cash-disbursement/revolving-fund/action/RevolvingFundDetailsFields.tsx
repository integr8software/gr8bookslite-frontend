"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RevolvingFundActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import {
  fetchRevolvingFundAccountOptions,
  fetchRevolvingFundPartyOptions,
  fetchRevolvingFundResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundApi";

export function RevolvingFundDetailsFields({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  page: RevolvingFundActionPageState;
}) {
  const partyQuery = useQuery({
    queryKey: ["cash-disbursement", "revolving-fund", "parties"],
    queryFn: fetchRevolvingFundPartyOptions,
  });

  const accountQuery = useQuery({
    queryKey: ["cash-disbursement", "revolving-fund", "accounts"],
    queryFn: fetchRevolvingFundAccountOptions,
  });

  const rcQuery = useQuery({
    queryKey: ["cash-disbursement", "revolving-fund", "rcs"],
    queryFn: fetchRevolvingFundResponsibilityCenters,
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
    const raw = (rcQuery.data ?? []).filter((r: any) => !r.name?.toLowerCase().includes("project"));
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
    const raw = (rcQuery.data ?? []).filter((r: any) => r.name?.toLowerCase().includes("project") || r.isProject);
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
              searchPlaceholder="Search Project"
              addAction={!page.isReadonly ? { label: "Add Project", onClick: onOpenProjectDrawer } : undefined}
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
              placeholder="Select Default Account"
              searchPlaceholder="Search Account"
              onChange={(code, name) => {
                page.updateField("accountCode", code);
                page.updateField("accountTitle", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Remarks">
            <AppLimitedTextarea
              value={page.values.remarks}
              disabled={page.isReadonly}
              onChange={(e) => page.updateField("remarks", e.target.value)}
              className={`${TransactionFieldClassName} min-h-28 max-w-full resize py-3`}
              counterMode="used"
              placeholder="Optional Remarks"
            />
          </TransactionField>
        </div>

        {/* Column 2: Currency & Dates */}
        <div className="grid min-w-0 content-start gap-5">
          <CurrencyExchangeRateRow
            currencyLabel="Currency"
            currencyControl={
              <AppAdvancedDropdown
                value={page.values.currency}
                readOnly={page.isReadonly}
                options={page.currencyOptions}
                placeholder="Currency"
                searchPlaceholder="Search Currency"
                onChange={(val) => page.updateCurrency(String(val))}
              />
            }
            exchangeRateControl={
              <input
                type="text"
                value={page.values.exchangeRate}
                readOnly={page.isReadonly}
                onChange={(e) => page.updateField("exchangeRate", formatExchangeRateInput(e.target.value))}
                className={`${TransactionFieldClassName} text-right tabular-nums`}
                placeholder="1.00"
              />
            }
          />

          <TransactionField label="Document Date" error={page.errors.documentDate} isRequired>
            <input
              type="date"
              value={page.values.documentDate}
              readOnly={page.isReadonly}
              onChange={(e) => page.updateField("documentDate", e.target.value)}
              className={TransactionFieldClassName}
            />
          </TransactionField>
        </div>

        {/* Column 3: Summary Display Cards */}
        <div className="grid min-w-0 content-start gap-3 rounded-lg border border-darknavy/10 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-darknavy">Summary</h3>
          <div className="flex justify-between border-b border-darknavy/10 py-1.5 text-xs text-darknavy/70">
            <span>Total Gross Amount:</span>
            <span className="font-semibold text-darknavy">{page.totals.formattedGrossAmount}</span>
          </div>
          <div className="flex justify-between border-b border-darknavy/10 py-1.5 text-xs text-darknavy/70">
            <span>Total VAT Amount:</span>
            <span className="font-semibold text-darknavy">{page.totals.formattedVatAmount}</span>
          </div>
          <div className="flex justify-between border-b border-darknavy/10 py-1.5 text-xs text-darknavy/70">
            <span>Total Net Amount:</span>
            <span className="font-semibold text-darknavy">{page.totals.formattedNetAmount}</span>
          </div>
          <div className="flex justify-between border-b border-darknavy/10 py-1.5 text-xs text-darknavy/70">
            <span>Total EWT Amount:</span>
            <span className="font-semibold text-darknavy">{page.totals.formattedEwtAmount}</span>
          </div>
          <div className="flex justify-between py-2 text-sm font-bold text-darknavy">
            <span>Total Amount:</span>
            <span>{page.totals.formattedAmount}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
