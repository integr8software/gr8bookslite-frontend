import type {
  DisbursementVoucherBankAccount,
  DisbursementVoucherFormValues,
  DisbursementVoucherPaymentFieldsProps,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord as AppPaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import {
  DisbursementVoucherBankSearchPlaceholder,
  DisbursementVoucherBankSelectPlaceholder,
  DisbursementVoucherFieldClassName,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { FieldShell } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";

export function DisbursementVoucherPaymentFields({
  bankAccounts,
  canAddBankAccount,
  isReadonly,
  isMultiCheckNumber,
  onUpdateBankAccount,
  onUpdatePaymentDetails,
  onOpenBankAccountDrawer,
  paymentType,
  paymentTypeRecord,
  values,
}: DisbursementVoucherPaymentFieldsProps) {
  const kind = getPaymentTypeDetailKind(paymentType, paymentTypeRecord);

  if (!paymentType || kind === "" || kind === "cash") {
    return null;
  }

  if (kind === "bank-transfer") {
    return (
      <div className="grid min-w-0 gap-4">
        <FieldShell controlId="disbursement-voucher-from-bank" label="From Bank">
          <BankAccountDropdown
            bankAccounts={bankAccounts}
            id="disbursement-voucher-from-bank"
            isReadonly={isReadonly}
            showAccountTitle
            addAction={
              !isReadonly && canAddBankAccount
                ? {
                    label: "Add Bank",
                    onClick: onOpenBankAccountDrawer,
                  }
                : undefined
            }
            value={values.paymentDetails.bankAccountCode}
            onChange={onUpdateBankAccount}
          />
        </FieldShell>
        <FieldShell controlId="disbursement-voucher-to-bank" label="To Bank">
          <ToBankDropdown
            bankAccounts={bankAccounts}
            id="disbursement-voucher-to-bank"
            isReadonly={isReadonly}
            addAction={
              !isReadonly && canAddBankAccount
                ? {
                    label: "Add Bank",
                    onClick: onOpenBankAccountDrawer,
                  }
                : undefined
            }
            value={values.paymentDetails.transferToBank ?? ""}
            accountNo={values.paymentDetails.transferAccountNo ?? ""}
            onChange={(nextDetails) => onUpdatePaymentDetails(nextDetails)}
          />
        </FieldShell>
        <FieldShell controlId="disbursement-voucher-transfer-account-no" label="Account No.">
          <input
            id="disbursement-voucher-transfer-account-no"
            value={values.paymentDetails.transferAccountNo ?? ""}
            readOnly={isReadonly}
            onChange={(event) => onUpdatePaymentDetails({ transferAccountNo: event.target.value })}
            className={DisbursementVoucherFieldClassName}
          />
        </FieldShell>
      </div>
    );
  }

  const isCheckPayment = kind === "with-bank";

  return (
    <div className="grid min-w-0 gap-4">
      <FieldShell controlId="disbursement-voucher-payment-bank" label="Bank">
        <BankAccountDropdown
          bankAccounts={bankAccounts}
          id="disbursement-voucher-payment-bank"
          isReadonly={isReadonly}
          addAction={
            !isReadonly && canAddBankAccount
              ? {
                  label: "Add Bank",
                  onClick: onOpenBankAccountDrawer,
                }
              : undefined
          }
          value={values.paymentDetails.bankAccountCode}
          onChange={onUpdateBankAccount}
        />
      </FieldShell>
      <FieldShell controlId="disbursement-voucher-payment-payee" label="Payee">
        <input
          id="disbursement-voucher-payment-payee"
          value={values.paymentDetails.payee ?? values.partyName}
          readOnly={isReadonly}
          onChange={(event) => onUpdatePaymentDetails({ payee: event.target.value })}
          className={DisbursementVoucherFieldClassName}
        />
      </FieldShell>
      {isCheckPayment ? (
        <FieldShell label="Multi Check No.">
          <AppSwitch
            readOnly={isReadonly}
            value={isMultiCheckNumber}
            falseOption={{ label: "No", value: false }}
            trueOption={{ label: "Yes", value: true }}
            onChange={(isMultiCheckNumber) =>
              onUpdatePaymentDetails({
                checkNo: isMultiCheckNumber ? "" : values.paymentDetails.checkNo,
                isMultiCheckNumber,
              })
            }
          />
        </FieldShell>
      ) : null}
      {!isCheckPayment || !isMultiCheckNumber ? (
        <>
          <FieldShell controlId="disbursement-voucher-payment-document-no" label={isCheckPayment ? "Check No." : "Debit Memo No."}>
            <input
              id="disbursement-voucher-payment-document-no"
              value={values.paymentDetails.checkNo}
              readOnly={isReadonly}
              onChange={(event) => onUpdatePaymentDetails({ checkNo: event.target.value })}
              className={DisbursementVoucherFieldClassName}
            />
          </FieldShell>
        </>
      ) : null}
    </div>
  );
}

function BankAccountDropdown({
  addAction,
  bankAccounts,
  id,
  isReadonly,
  onChange,
  showAccountTitle = false,
  value,
}: {
  addAction?: {
    label: string;
    onClick: () => void;
  };
  bankAccounts: DisbursementVoucherBankAccount[];
  id?: string;
  isReadonly: boolean;
  onChange: (accountCode: string) => void;
  showAccountTitle?: boolean;
  value: string;
}) {
  const options = createBankAccountOptions(bankAccounts, { showAccountTitle });

  return (
    <AppAdvancedDropdown
      addAction={addAction}
      id={id}
      value={value}
      readOnly={isReadonly}
      options={options}
      placeholder={DisbursementVoucherBankSelectPlaceholder}
      searchPlaceholder={DisbursementVoucherBankSearchPlaceholder}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

function ToBankDropdown({
  addAction,
  accountNo,
  bankAccounts,
  id,
  isReadonly,
  onChange,
  value,
}: {
  addAction?: {
    label: string;
    onClick: () => void;
  };
  accountNo: string;
  bankAccounts: DisbursementVoucherBankAccount[];
  id?: string;
  isReadonly: boolean;
  onChange: (nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>) => void;
  value: string;
}) {
  const options = createToBankOptions({
    accountNo,
    bankAccounts,
    value,
  });
  const selectedBank = bankAccounts.find(
    (bankAccount) => bankAccount.bankName === value && (!accountNo || bankAccount.accountNo === accountNo),
  );
  const selectedValue =
    selectedBank?.id ?? options.find((option) => option.name === value && (!accountNo || option.label === accountNo))?.value ?? value;

  return (
    <AppAdvancedDropdown
      addAction={addAction}
      id={id}
      value={selectedValue}
      readOnly={isReadonly}
      options={options}
      placeholder={DisbursementVoucherBankSelectPlaceholder}
      searchPlaceholder={DisbursementVoucherBankSearchPlaceholder}
      onChange={(nextValue) => {
        const selectedValue = String(nextValue);
        const selectedBank = bankAccounts.find((bankAccount) => bankAccount.id === selectedValue);

        onChange({
          transferAccountName: selectedBank?.accountName ?? "",
          transferAccountNo: selectedBank?.accountNo ?? "",
          transferToBank: selectedBank?.bankName ?? selectedValue,
        });
      }}
      onSelectOption={(option) => {
        const selectedBank = bankAccounts.find((bankAccount) => bankAccount.id === option.value);

        if (!selectedBank) {
          return;
        }

        onChange({
          transferAccountName: selectedBank.accountName,
          transferAccountNo: selectedBank.accountNo,
          transferToBank: selectedBank.bankName,
        });
      }}
    />
  );
}

function createBankAccountOptions(
  bankAccounts: DisbursementVoucherBankAccount[],
  options: { showAccountTitle?: boolean } = {},
): AppAdvancedDropdownOption[] {
  return bankAccounts.map((bankAccount) => ({
    description: options.showAccountTitle ? bankAccount.accountTitle : undefined,
    label: bankAccount.accountNo,
    name: formatBankBranchName(bankAccount),
    value: bankAccount.accountCode,
  }));
}

function createToBankOptions({
  accountNo,
  bankAccounts,
  value,
}: {
  accountNo: string;
  bankAccounts: DisbursementVoucherBankAccount[];
  value: string;
}): AppAdvancedDropdownOption[] {
  const options = bankAccounts.map((bankAccount) => ({
    label: bankAccount.accountNo,
    name: formatBankBranchName(bankAccount),
    value: bankAccount.id,
  }));

  if (value.trim() && !options.some((option) => option.name === value && (!accountNo || option.label === accountNo))) {
    options.push({
      label: accountNo,
      name: value,
      value,
    });
  }

  return options;
}

function formatBankBranchName(bankAccount: DisbursementVoucherBankAccount) {
  return bankAccount.branch ? `${bankAccount.bankName} (${bankAccount.branch})` : bankAccount.bankName;
}

export function getPaymentTypeDetailKind(paymentType: string, paymentTypeRecord?: AppPaymentTypeRecord | null) {
  if (paymentTypeRecord?.type === "Cash") {
    return "cash";
  }

  if (paymentTypeRecord?.type === "Check") {
    return "with-bank";
  }

  if (paymentTypeRecord?.type === "Bank Transfer") {
    return "bank-transfer";
  }

  if (paymentTypeRecord?.type === "Digital Wallet") {
    return "bank-transfer";
  }

  if (paymentTypeRecord?.type === "Non-Cash Settlement") {
    return "debit-memo";
  }

  const normalizedPaymentType = paymentType.trim().toLowerCase();

  if (!normalizedPaymentType) {
    return "";
  }

  if (normalizedPaymentType.includes("bank transfer") || normalizedPaymentType.includes("wire") || normalizedPaymentType === "transfer") {
    return "bank-transfer";
  }

  if (normalizedPaymentType.includes("debit memo") || normalizedPaymentType.includes("debit")) {
    return "debit-memo";
  }

  if (normalizedPaymentType.includes("check")) {
    return "with-bank";
  }

  if (
    normalizedPaymentType.includes("instapay") ||
    normalizedPaymentType.includes("pesonet") ||
    normalizedPaymentType.includes("peso net") ||
    normalizedPaymentType.includes("ewallet") ||
    normalizedPaymentType.includes("e-wallet") ||
    normalizedPaymentType.includes("wallet") ||
    normalizedPaymentType.includes("online")
  ) {
    return "bank-transfer";
  }

  if (normalizedPaymentType === "cash" || normalizedPaymentType.includes("g-cash")) {
    return "cash";
  }

  return "";
}
