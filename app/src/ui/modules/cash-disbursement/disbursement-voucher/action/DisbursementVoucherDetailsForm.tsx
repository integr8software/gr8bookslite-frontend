import { useMemo } from "react";
import {
  DisbursementVoucherPartyOptions,
  DisbursementVoucherProjectOptions,
  createVoucherCurrencyOptions,
  getVoucherCurrencyExchangeRate,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementVoucherDetailsFormProps,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord as AppPaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { DisbursementVoucherFieldClassName } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import { FieldShell } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherFieldControls";
import {
  DisbursementVoucherPaymentFields,
  getPaymentTypeDetailKind,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherPaymentFields";

export function DisbursementVoucherDetailsForm({
  bankAccounts,
  canAddBankAccount,
  canAddPartyName,
  canAddPaymentType,
  canAddProjectName,
  errors,
  isReadonly,
  onOpenPartyNameDialog,
  onOpenBankAccountDrawer,
  onOpenPaymentTypeDrawer,
  onOpenProjectNameDialog,
  onPartyChange,
  onPaymentTypeChange,
  onUpdateBankAccount,
  onUpdateField,
  onUpdatePaymentDetails,
  paymentTypeRecords,
  values,
}: DisbursementVoucherDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <DisbursementVoucherHeaderFields
        bankAccounts={bankAccounts}
        canAddBankAccount={canAddBankAccount}
        canAddPartyName={canAddPartyName}
        canAddPaymentType={canAddPaymentType}
        canAddProjectName={canAddProjectName}
        errors={errors}
        isReadonly={isReadonly}
        onOpenPartyNameDialog={onOpenPartyNameDialog}
        onOpenBankAccountDrawer={onOpenBankAccountDrawer}
        onOpenPaymentTypeDrawer={onOpenPaymentTypeDrawer}
        onOpenProjectNameDialog={onOpenProjectNameDialog}
        onPartyChange={onPartyChange}
        onPaymentTypeChange={onPaymentTypeChange}
        onUpdateBankAccount={onUpdateBankAccount}
        onUpdateField={onUpdateField}
        onUpdatePaymentDetails={onUpdatePaymentDetails}
        paymentTypeRecords={paymentTypeRecords}
        values={values}
      />
    </section>
  );
}

function DisbursementVoucherHeaderFields({
  bankAccounts,
  canAddBankAccount,
  canAddPartyName,
  canAddPaymentType,
  canAddProjectName,
  errors,
  isReadonly,
  onOpenPartyNameDialog,
  onOpenBankAccountDrawer,
  onOpenPaymentTypeDrawer,
  onOpenProjectNameDialog,
  onPartyChange,
  onPaymentTypeChange,
  onUpdateBankAccount,
  onUpdateField,
  onUpdatePaymentDetails,
  paymentTypeRecords,
  values,
}: DisbursementVoucherDetailsFormProps) {
  const selectedPaymentTypeRecord = paymentTypeRecords.find((record) => record.paymentType === values.paymentMethod) ?? null;
  const isCheckPayment = getPaymentTypeDetailKind(values.paymentMethod, selectedPaymentTypeRecord) === "with-bank";
  const shouldShowHeaderCheckDetails = isCheckPayment && !values.paymentDetails.isMultiCheckNumber;
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
  const currencyOptions = useMemo(() => createVoucherCurrencyDropdownOptions(), []);

  function updateCurrency(nextCurrency: string) {
    onUpdateField("currency", nextCurrency as DisbursementVoucherFormValues["currency"]);
    onUpdateField("fxRate", getVoucherCurrencyExchangeRate(nextCurrency));
  }

  return (
    <>
      <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-3">
        <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="disbursement-voucher-payment-type" label="Payment Type" error={errors.paymentMethod} isRequired>
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
          </FieldShell>
          <FieldShell controlId="disbursement-voucher-party" label="Party Name" error={errors.partyName} isRequired>
            <AppAdvancedDropdown
              id="disbursement-voucher-party"
              addAction={
                !isReadonly && canAddPartyName
                  ? {
                      label: "Add Party Name",
                      onClick: onOpenPartyNameDialog,
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
          <FieldShell controlId="disbursement-voucher-project-name" label="Project Name">
            <AppAdvancedDropdown
              id="disbursement-voucher-project-name"
              value={values.projectName}
              readOnly={isReadonly}
              addAction={
                !isReadonly && canAddProjectName
                  ? {
                      label: "Add Project Name",
                      onClick: onOpenProjectNameDialog,
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
                onUpdateField("costCenter", project?.label ?? values.costCenter);
              }}
            />
          </FieldShell>
          <FieldShell controlId="disbursement-voucher-currency" label="Currency" error={errors.currency}>
            <CurrencyExchangeRateRow
              currencyControl={
                <AppAdvancedDropdown
                  id="disbursement-voucher-currency"
                  className="w-full min-w-0"
                  value={values.currency}
                  readOnly={isReadonly}
                  isClearable={false}
                  menuMinWidth={260}
                  options={currencyOptions}
                  placeholder="Currency"
                  searchPlaceholder="Search currency"
                  onChange={(value) => updateCurrency(String(value))}
                />
              }
              exchangeRateControl={
                <input
                  id="disbursement-voucher-fx-rate"
                  type="text"
                  inputMode="decimal"
                  value={values.fxRate}
                  readOnly={isReadonly}
                  onChange={(event) => onUpdateField("fxRate", formatExchangeRateInput(event.target.value))}
                  className={`${DisbursementVoucherFieldClassName} text-right`}
                />
              }
            />
          </FieldShell>
          <FieldShell controlId="disbursement-voucher-remarks" label="Remarks" error={errors.remarks}>
            <AppLimitedTextarea
              id="disbursement-voucher-remarks"
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${DisbursementVoucherFieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <DisbursementVoucherPaymentFields
            bankAccounts={bankAccounts}
            canAddBankAccount={canAddBankAccount}
            isReadonly={isReadonly}
            isMultiCheckNumber={Boolean(values.paymentDetails.isMultiCheckNumber)}
            onOpenBankAccountDrawer={onOpenBankAccountDrawer}
            paymentType={values.paymentMethod}
            paymentTypeRecord={selectedPaymentTypeRecord}
            values={values}
            onUpdateBankAccount={onUpdateBankAccount}
            onUpdatePaymentDetails={onUpdatePaymentDetails}
          />
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="disbursement-voucher-no" label="DV No." error={errors.voucherNo} isRequired>
            <input
              id="disbursement-voucher-no"
              value={values.voucherNo}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("voucherNo", event.target.value)}
              className={DisbursementVoucherFieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="disbursement-voucher-dv-date" label="DV Date" error={errors.voucherDate} isRequired>
            <input
              id="disbursement-voucher-dv-date"
              type="date"
              value={values.voucherDate}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("voucherDate", event.target.value)}
              className={DisbursementVoucherFieldClassName}
            />
          </FieldShell>
          {shouldShowHeaderCheckDetails ? (
            <>
              <FieldShell controlId="disbursement-voucher-payment-check-status" label="Check Status">
                <input
                  id="disbursement-voucher-payment-check-status"
                  value={values.paymentDetails.checkStatus ?? ""}
                  readOnly
                  className={`${DisbursementVoucherFieldClassName} bg-darknavy/5 text-darknavy/55`}
                />
              </FieldShell>
              <FieldShell controlId="disbursement-voucher-payment-check-date" label="Check Date">
                <input
                  id="disbursement-voucher-payment-check-date"
                  type="date"
                  value={values.paymentDetails.checkDate || values.voucherDate}
                  readOnly={isReadonly}
                  onChange={(event) => onUpdatePaymentDetails({ checkDate: event.target.value })}
                  className={DisbursementVoucherFieldClassName}
                />
              </FieldShell>
            </>
          ) : null}
          <FieldShell controlId="disbursement-voucher-status" label="Status" error={errors.status}>
            <input
              id="disbursement-voucher-status"
              value={values.status}
              readOnly
              className={`${DisbursementVoucherFieldClassName} !bg-darknavy/5 text-darknavy/60`}
            />
          </FieldShell>
        </div>
      </div>
    </>
  );
}

function createVoucherCurrencyDropdownOptions(): AppAdvancedDropdownOption[] {
  return createVoucherCurrencyOptions().map((currency) => ({
    label: currency.isDefault ? `${currency.name} | Default` : currency.name,
    name: currency.code,
    value: currency.code,
  }));
}

function createVoucherPaymentTypeOptions({
  paymentTypeRecords,
}: {
  paymentTypeRecords: AppPaymentTypeRecord[];
}): AppAdvancedDropdownOption[] {
  return paymentTypeRecords
    .filter((record) => record.status === "Active")
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
