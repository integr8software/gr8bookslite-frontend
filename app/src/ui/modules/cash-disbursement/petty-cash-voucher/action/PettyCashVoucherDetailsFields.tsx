"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PettyCashVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import {
  fetchPettyCashVoucherAccountOptions,
  fetchPettyCashVoucherPartyOptions,
  fetchPettyCashVoucherResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherApi";

export function PettyCashVoucherDetailsFields({
  canAddParty = true,
  canAddResponsibilityCenter = true,
  onOpenPartyDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  canAddParty?: boolean;
  canAddResponsibilityCenter?: boolean;
  onOpenPartyDrawer?: () => void;
  onOpenResponsibilityCenterDrawer?: () => void;
  page: PettyCashVoucherActionPageState;
}) {
  const partyQuery = useQuery({
    queryKey: ["cash-disbursement", "petty-cash-voucher", "parties"],
    queryFn: fetchPettyCashVoucherPartyOptions,
  });

  const accountQuery = useQuery({
    queryKey: ["cash-disbursement", "petty-cash-voucher", "accounts"],
    queryFn: fetchPettyCashVoucherAccountOptions,
  });

  const rcQuery = useQuery({
    queryKey: ["cash-disbursement", "petty-cash-voucher", "rcs"],
    queryFn: fetchPettyCashVoucherResponsibilityCenters,
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
    const raw = rcQuery.data ?? [];
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

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Column 1: Name & Lookup Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" error={page.errors.partyName} isRequired>
            <AppLookupDropdown
              value={page.values.partyCode}
              readOnly={page.isReadonly}
              options={partyOptions}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              addAction={
                !page.isReadonly && canAddParty && onOpenPartyDrawer
                  ? {
                      label: "Add Party Name",
                      onClick: onOpenPartyDrawer,
                    }
                  : undefined
              }
              onChange={(code, name) => {
                page.updateField("partyCode", code);
                page.updateField("partyName", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Responsibility Center">
            <AppLookupDropdown
              value={page.values.responsibilityCenterCode}
              readOnly={page.isReadonly}
              options={responsibilityCenterOptions}
              placeholder="Select Responsibility Center"
              searchPlaceholder="Search Responsibility Center"
              addAction={
                !page.isReadonly && canAddResponsibilityCenter && onOpenResponsibilityCenterDrawer
                  ? {
                      label: "Add Responsibility Center",
                      onClick: onOpenResponsibilityCenterDrawer,
                    }
                  : undefined
              }
              onChange={(code, name) => {
                page.updateField("responsibilityCenterCode", code);
                page.updateField("responsibilityCenter", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Default Account Title" error={page.errors.accountTitle} isRequired>
            <AppLookupDropdown
              value={page.values.accountCode}
              readOnly={page.isReadonly}
              options={accountOptions}
              placeholder="Select Default Account Title"
              searchPlaceholder="Search Default Account Title"
              onChange={(code, name) => {
                page.updateField("accountCode", code);
                page.updateField("accountTitle", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Remarks" error={page.errors.remarks}>
            <AppLimitedTextarea
              className={TransactionFieldClassName}
              disabled={page.isReadonly}
              maxLength={250}
              placeholder="Remarks"
              rows={4}
              value={page.values.remarks}
              onChange={(e) => page.updateField("remarks", e.target.value)}
            />
          </TransactionField>
        </div>

        {/* Column 2: Currency, Dates, and Base Inputs */}
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

          <TransactionField label="Amount" error={page.errors.amount} isRequired>
            <MoneyNumberField
              className={TransactionFieldClassName}
              disabled={page.isReadonly}
              value={page.values.amount}
              onValueChange={(val) => page.updateField("amount", val)}
            />
          </TransactionField>

          <TransactionField label="VAT Type" error={page.errors.vatType}>
            <AppAdvancedDropdown
              value={page.values.vatType}
              readOnly={page.isReadonly}
              options={page.vatTypeOptions}
              placeholder="Select VAT Type"
              searchPlaceholder="Search VAT Type"
              onChange={(val) => page.updateField("vatType", String(val))}
            />
          </TransactionField>
        </div>

        {/* Column 3: Tax and Net Computations */}
        <div className="grid min-w-0 content-start gap-5">
          <div className="grid grid-cols-2 gap-3">
            <TransactionField label="VATable" error={page.errors.vatable}>
              <AppAdvancedDropdown
                value={page.values.vatable || "False"}
                readOnly={page.isReadonly}
                options={page.vatableOptions}
                placeholder="Select VATable"
                searchPlaceholder="Search VATable"
                onChange={(val: any) => page.updateField("vatable", val)}
              />
            </TransactionField>

            <TransactionField label="VAT Rate" error={page.errors.vatRate}>
              <AppAdvancedDropdown
                value={page.values.vatRate}
                readOnly={page.isReadonly}
                options={page.vatOptions}
                placeholder="Select VAT Rate"
                searchPlaceholder="Search VAT Rate"
                onChange={(val) => page.updateField("vatRate", String(val))}
              />
            </TransactionField>
          </div>

          <TransactionField label="VAT Amount" error={page.errors.vatAmount}>
            <MoneyNumberField
              className={TransactionFieldClassName}
              disabled
              value={page.values.vatAmount}
              onValueChange={(val) => page.updateField("vatAmount", val)}
            />
          </TransactionField>

          <div className="grid grid-cols-2 gap-3">
            <TransactionField label="EWT Code" error={page.errors.ewtCode}>
              <AppAdvancedDropdown
                value={page.values.ewtCode}
                readOnly={page.isReadonly}
                options={page.ewtOptions}
                placeholder="Select EWT Code"
                searchPlaceholder="Search EWT Code"
                onChange={(val) => page.updateField("ewtCode", String(val))}
              />
            </TransactionField>

            <TransactionField label="EWT Rate (%)" error={page.errors.ewtRate}>
              <input
                type="text"
                value={page.values.ewtRate}
                readOnly
                className={`${TransactionFieldClassName} bg-slate-50`}
              />
            </TransactionField>
          </div>

          <TransactionField label="EWT Amount" error={page.errors.ewtAmount}>
            <MoneyNumberField
              className={TransactionFieldClassName}
              disabled
              value={page.values.ewtAmount}
              onValueChange={(val) => page.updateField("ewtAmount", val)}
            />
          </TransactionField>

          <TransactionField label="Net Amount" error={page.errors.netAmount}>
            <MoneyNumberField
              className={TransactionFieldClassName}
              disabled
              value={page.values.netAmount}
              onValueChange={(val) => page.updateField("netAmount", val)}
            />
          </TransactionField>
        </div>
      </div>
    </section>
  );
}
