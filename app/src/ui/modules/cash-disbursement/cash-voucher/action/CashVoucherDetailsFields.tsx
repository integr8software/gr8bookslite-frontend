import { useMemo } from "react";
import { CashVoucherPartyOptions, CashVoucherProjectOptions } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type { CashVoucherDetailsFormProps } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
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

export function CashVoucherDetailsFields({
  canAddPartyName,
  canAddProjectName,
  currencyOptions,
  errors,
  isExchangeRateLoading,
  isReadonly,
  onOpenPartyNameDrawer,
  onOpenProjectNameDrawer,
  onCurrencyChange,
  onPartyChange,
  onUpdateField,
  values,
}: CashVoucherDetailsFormProps) {
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createVoucherPartyOptions({
        currentPartyCode: values.partyCode,
        currentPartyName: values.partyName,
      }),
    [values.partyCode, values.partyName],
  );

  const projectOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createVoucherProjectOptions({
        currentProjectCode: values.costCenter,
        currentProjectName: values.projectName,
      }),
    [values.costCenter, values.projectName],
  );

  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-5 xl:grid-cols-3">
        {/* Column 1: Name & Lookup Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" error={errors.partyName} isRequired>
            <AppLookupDropdown
              value={values.partyCode}
              options={partyOptions}
              readOnly={isReadonly}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              addAction={
                !isReadonly && canAddPartyName
                  ? {
                      label: "Add Party Name",
                      onClick: onOpenPartyNameDrawer,
                    }
                  : undefined
              }
              onChange={(code, name) => {
                const party = partyOptions.find((option) => option.value === code);
                const partyName = party?.name ?? name ?? values.partyName;
                onPartyChange(code, partyName);
              }}
            />
          </TransactionField>

          <TransactionField label="Project Name">
            <AppLookupDropdown
              value={values.projectName}
              options={projectOptions}
              readOnly={isReadonly}
              placeholder="Select Project Name"
              searchPlaceholder="Search Project Name"
              addAction={
                !isReadonly && canAddProjectName
                  ? {
                      label: "Add Project Name",
                      onClick: onOpenProjectNameDrawer,
                    }
                  : undefined
              }
              onChange={(projectName) => {
                const project = projectOptions.find((option) => option.value === projectName);
                onUpdateField("projectName", projectName);
                onUpdateField("costCenter", project?.label === projectName ? "" : (project?.label ?? ""));
              }}
            />
          </TransactionField>

          <TransactionField label="Remarks" error={errors.remarks}>
            <AppLimitedTextarea
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${TransactionFieldClassName} min-h-28 max-w-full resize py-3`}
              counterMode="used"
              placeholder="Optional Remarks"
            />
          </TransactionField>
        </div>

        {/* Column 2: Aligned Code & Currency Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={values.partyCode}
            isReadonly
            isRequired
            label="Party Code"
            error={errors.partyCode}
            onValueChange={(value) => onPartyChange(value, values.partyName)}
            placeholder="Party Code"
          />

          <TransactionTextField
            value={values.costCenter}
            isReadonly
            label="Project Code"
            onValueChange={(value) => onUpdateField("costCenter", value)}
            placeholder="Project Code"
          />

          <CurrencyExchangeRateRow
            currencyLabel="Currency"
            currencyControlId="cash-voucher-currency"
            currencyError={errors.currency}
            exchangeRateControlId="cash-voucher-fx-rate"
            exchangeRateError={errors.fxRate}
            currencyControl={
              <AppAdvancedDropdown
                id="cash-voucher-currency"
                className="w-full min-w-0"
                value={values.currency}
                readOnly={isReadonly}
                isClearable={false}
                menuMinWidth={320}
                options={currencyOptions}
                placeholder="Currency"
                searchPlaceholder="Search Currency"
                onChange={(value) => onCurrencyChange(String(value))}
              />
            }
            exchangeRateControl={
              <input
                id="cash-voucher-fx-rate"
                type="text"
                inputMode="decimal"
                value={values.fxRate}
                readOnly={isReadonly}
                disabled={isReadonly || isExchangeRateLoading}
                onChange={(event) => onUpdateField("fxRate", formatExchangeRateInput(event.target.value))}
                className={`${TransactionFieldClassName} text-right tabular-nums${isReadonly || isExchangeRateLoading ? " transaction-readonly-placeholder" : ""}`}
                placeholder="0.00"
              />
            }
          />
        </div>

        {/* Column 3: Transaction Identity & Status */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={values.voucherNo}
            isReadonly
            isRequired
            label="CV No."
            error={errors.voucherNo}
            onValueChange={(value) => onUpdateField("voucherNo", value)}
            placeholder="Auto Generated CV Transaction Number"
          />

          <TransactionTextField
            value={values.voucherDate}
            isReadonly={isReadonly}
            isRequired
            label="Document Date"
            error={errors.voucherDate}
            type="date"
            onValueChange={(value) => onUpdateField("voucherDate", value)}
          />

          <TransactionTextField value={values.status} isReadonly label="Status" error={errors.status} onValueChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}

function createVoucherPartyOptions({
  currentPartyCode,
  currentPartyName,
}: {
  currentPartyCode: string;
  currentPartyName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...CashVoucherPartyOptions];

  if (currentPartyCode.trim() || currentPartyName.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current voucher value",
      label: currentPartyCode || "Current voucher",
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode || currentPartyName,
    });
  }

  return options;
}

function createVoucherProjectOptions({
  currentProjectCode,
  currentProjectName,
}: {
  currentProjectCode: string;
  currentProjectName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...CashVoucherProjectOptions];

  if (currentProjectName.trim()) {
    addUniqueDropdownOption(options, {
      label: currentProjectCode || "Current project",
      name: currentProjectName,
      value: currentProjectName,
    });
  }

  return options;
}

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim()) {
    return;
  }

  if (options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}
