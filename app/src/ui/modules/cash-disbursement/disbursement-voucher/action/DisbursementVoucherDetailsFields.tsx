import { useMemo } from "react";
import {
  DisbursementVoucherPartyOptions,
  DisbursementVoucherProjectOptions,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherDetailsFormProps } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord as AppPaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { DisbursementVoucherFieldClassName } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import { TransactionField } from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";

export function DisbursementVoucherDetailsFields({
  canAddPartyName,
  canAddPaymentType,
  canAddProjectName,
  currencyOptions,
  errors,
  isExchangeRateLoading,
  isReadonly,
  onOpenPartyNameDrawer,
  onOpenPaymentTypeDrawer,
  onOpenProjectNameDrawer,
  onCurrencyChange,
  onPartyChange,
  onPaymentTypeChange,
  onUpdateField,
  paymentTypeRecords,
  values,
}: DisbursementVoucherDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <DisbursementVoucherHeaderFields
        canAddPartyName={canAddPartyName}
        canAddPaymentType={canAddPaymentType}
        canAddProjectName={canAddProjectName}
        currencyOptions={currencyOptions}
        errors={errors}
        isExchangeRateLoading={isExchangeRateLoading}
        isReadonly={isReadonly}
        onOpenPartyNameDrawer={onOpenPartyNameDrawer}
        onOpenPaymentTypeDrawer={onOpenPaymentTypeDrawer}
        onOpenProjectNameDrawer={onOpenProjectNameDrawer}
        onCurrencyChange={onCurrencyChange}
        onPartyChange={onPartyChange}
        onPaymentTypeChange={onPaymentTypeChange}
        onUpdateField={onUpdateField}
        paymentTypeRecords={paymentTypeRecords}
        values={values}
      />
    </section>
  );
}

function DisbursementVoucherHeaderFields({
  canAddPartyName,
  canAddPaymentType,
  canAddProjectName,
  currencyOptions,
  errors,
  isExchangeRateLoading,
  isReadonly,
  onOpenPartyNameDrawer,
  onOpenPaymentTypeDrawer,
  onOpenProjectNameDrawer,
  onCurrencyChange,
  onPartyChange,
  onPaymentTypeChange,
  onUpdateField,
  paymentTypeRecords,
  values,
}: DisbursementVoucherDetailsFormProps) {
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
  const paymentTypeOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createVoucherPaymentTypeOptions({
        paymentTypeRecords,
      }),
    [paymentTypeRecords],
  );

  return (
    <>
      <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-3">
        <div className="grid min-w-0 content-start gap-4">
          <TransactionField controlId="disbursement-voucher-party" label="Party Name" error={errors.partyName} isRequired>
            <AppAdvancedDropdown
              id="disbursement-voucher-party"
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
          </TransactionField>
          <TransactionField controlId="disbursement-voucher-project-name" label="Project Name">
            <AppAdvancedDropdown
              id="disbursement-voucher-project-name"
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
          </TransactionField>
          <TransactionField controlId="disbursement-voucher-remarks" label="Remarks" error={errors.remarks}>
            <AppLimitedTextarea
              id="disbursement-voucher-remarks"
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${DisbursementVoucherFieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
          </TransactionField>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <TransactionField controlId="disbursement-voucher-party-code" label="Party Code">
            <input id="disbursement-voucher-party-code" value={values.partyCode} readOnly className={DisbursementVoucherFieldClassName} />
          </TransactionField>
          <TransactionField controlId="disbursement-voucher-project-code" label="Project Code">
            <input
              id="disbursement-voucher-project-code"
              value={values.costCenter}
              readOnly
              className={DisbursementVoucherFieldClassName}
            />
          </TransactionField>
          <TransactionField controlId="disbursement-voucher-payment-type" label="Payment Type" error={errors.paymentMethod} isRequired>
            <AppAdvancedDropdown
              id="disbursement-voucher-payment-type"
              value={values.paymentMethod}
              readOnly={isReadonly}
              addAction={
                !isReadonly && canAddPaymentType
                  ? {
                      label: "Add Payment Type",
                      onClick: onOpenPaymentTypeDrawer,
                    }
                  : undefined
              }
              options={paymentTypeOptions}
              placeholder="Select Payment Type"
              searchPlaceholder="Search payment type"
              onChange={(value) => onPaymentTypeChange(String(value))}
            />
          </TransactionField>
          <TransactionField controlId="disbursement-voucher-currency" label="Currency" error={errors.currency || errors.fxRate}>
            <CurrencyExchangeRateRow
              exchangeRateControlId="disbursement-voucher-fx-rate"
              currencyControl={
                <AppAdvancedDropdown
                  id="disbursement-voucher-currency"
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
                  id="disbursement-voucher-fx-rate"
                  type="text"
                  inputMode="decimal"
                  value={values.fxRate}
                  readOnly={isReadonly}
                  disabled={isReadonly || isExchangeRateLoading}
                  onChange={(event) => onUpdateField("fxRate", formatExchangeRateInput(event.target.value))}
                  className={`${DisbursementVoucherFieldClassName} text-right`}
                />
              }
            />
          </TransactionField>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <TransactionField controlId="disbursement-voucher-no" label="Disbursement Voucher No." error={errors.voucherNo} isRequired>
            <input
              id="disbursement-voucher-no"
              value={values.voucherNo}
              readOnly
              placeholder="Auto Generated Disbursement Voucher Transaction Number"
              className={DisbursementVoucherFieldClassName}
            />
          </TransactionField>
          <TransactionField controlId="disbursement-voucher-dv-date" label="Disbursement Voucher Date" error={errors.voucherDate} isRequired>
            <input
              id="disbursement-voucher-dv-date"
              type="date"
              value={values.voucherDate}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("voucherDate", event.target.value)}
              className={DisbursementVoucherFieldClassName}
            />
          </TransactionField>
          <TransactionField controlId="disbursement-voucher-status" label="Status" error={errors.status}>
            <input id="disbursement-voucher-status" value={values.status} readOnly className={DisbursementVoucherFieldClassName} />
          </TransactionField>
        </div>
      </div>
    </>
  );
}

function createVoucherPaymentTypeOptions({
  paymentTypeRecords,
}: {
  paymentTypeRecords: AppPaymentTypeRecord[];
}): AppAdvancedDropdownOption[] {
  return paymentTypeRecords
    .filter((record) => record.status === "Active" && (record.type === "Bank Transfer" || record.type === "Check"))
    .map((record) => ({
      label: record.type,
      name: record.paymentType,
      value: record.paymentType,
    }));
}

function createVoucherPartyOptions({
  currentPartyCode,
  currentPartyName,
}: {
  currentPartyCode: string;
  currentPartyName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherPartyOptions];

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
  const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherProjectOptions];

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
