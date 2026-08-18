import { useMemo } from "react";
import {
  CashVoucherPartyOptions,
  CashVoucherProjectOptions,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type { CashVoucherDetailsFormProps } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { CashVoucherFieldClassName } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import { FieldShell } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherFieldControls";

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
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <CashVoucherHeaderFields
        canAddPartyName={canAddPartyName}
        canAddProjectName={canAddProjectName}
        currencyOptions={currencyOptions}
        errors={errors}
        isExchangeRateLoading={isExchangeRateLoading}
        isReadonly={isReadonly}
        onOpenPartyNameDrawer={onOpenPartyNameDrawer}
        onOpenProjectNameDrawer={onOpenProjectNameDrawer}
        onCurrencyChange={onCurrencyChange}
        onPartyChange={onPartyChange}
        onUpdateField={onUpdateField}
        values={values}
      />
    </section>
  );
}

function CashVoucherHeaderFields({
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
    <>
      <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-3">
        <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="cash-voucher-party" label="Party Name" error={errors.partyName} isRequired>
            <AppAdvancedDropdown
              id="cash-voucher-party"
              addAction={
                !isReadonly && canAddPartyName
                  ? {
                      label: "Add Party Name",
                      onClick: onOpenPartyNameDrawer,
                    }
                  : undefined
              }
              options={partyOptions}
              placeholder="Select Party Name"
              readOnly={isReadonly}
              searchPlaceholder="Search Party Name"
              value={values.partyCode}
              onChange={(value) => {
                const code = String(value);
                const party = partyOptions.find((option) => option.value === code);
                const partyName = party?.name ?? values.partyName;

                onPartyChange(code, partyName);
              }}
            />
          </FieldShell>
          <FieldShell controlId="cash-voucher-project-name" label="Project Name">
            <AppAdvancedDropdown
              id="cash-voucher-project-name"
              value={values.projectName}
              readOnly={isReadonly}
              addAction={
                !isReadonly && canAddProjectName
                  ? {
                      label: "Add Project",
                      onClick: onOpenProjectNameDrawer,
                    }
                  : undefined
              }
              options={projectOptions}
              placeholder="Select Project Name"
              searchPlaceholder="Search Project Name"
              onChange={(value) => {
                const projectName = String(value);
                const project = projectOptions.find((option) => option.value === projectName);

                onUpdateField("projectName", projectName);
                onUpdateField("costCenter", project?.label === projectName ? "" : (project?.label ?? ""));
              }}
            />
          </FieldShell>
          <FieldShell controlId="cash-voucher-remarks" label="Remarks" error={errors.remarks}>
            <AppLimitedTextarea
              id="cash-voucher-remarks"
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${CashVoucherFieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="cash-voucher-party-code" label="Party Code">
            <input id="cash-voucher-party-code" value={values.partyCode} readOnly className={CashVoucherFieldClassName} />
          </FieldShell>
          <FieldShell controlId="cash-voucher-project-code" label="Project Code">
            <input
              id="cash-voucher-project-code"
              value={values.costCenter}
              readOnly
              className={CashVoucherFieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="cash-voucher-currency" label="Currency" error={errors.currency || errors.fxRate}>
            <CurrencyExchangeRateRow
              exchangeRateControlId="cash-voucher-fx-rate"
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
                  searchPlaceholder="Search currency"
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
                  className={`${CashVoucherFieldClassName} text-right`}
                />
              }
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="cash-voucher-no" label="Cash Voucher No." error={errors.voucherNo} isRequired>
            <input
              id="cash-voucher-no"
              value={values.voucherNo}
              readOnly
              placeholder="Auto Generated Cash Voucher Transaction Number"
              className={CashVoucherFieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="cash-voucher-cv-date" label="Cash Voucher Date" error={errors.voucherDate} isRequired>
            <input
              id="cash-voucher-cv-date"
              type="date"
              value={values.voucherDate}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("voucherDate", event.target.value)}
              className={CashVoucherFieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="cash-voucher-status" label="Status" error={errors.status}>
            <input id="cash-voucher-status" value={values.status} readOnly className={CashVoucherFieldClassName} />
          </FieldShell>
        </div>
      </div>
    </>
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


