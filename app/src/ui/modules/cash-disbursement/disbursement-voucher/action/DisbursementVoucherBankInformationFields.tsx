import type { DisbursementVoucherBankInformationFieldsProps } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { TransactionField, TransactionFieldClassName } from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import {
  DisbursementVoucherPaymentFields,
  getPaymentTypeDetailKind,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherPaymentFields";

export function DisbursementVoucherBankInformationFields({
  bankAccounts,
  canAddBankAccount,
  errors,
  isMultiCheckNumber,
  isReadonly,
  onOpenBankAccountDrawer,
  onUpdateBankAccount,
  onUpdatePaymentDetails,
  paymentType,
  paymentTypeRecord,
  paymentTypeRecords,
  values,
}: DisbursementVoucherBankInformationFieldsProps) {
  const selectedPaymentTypeRecord = paymentTypeRecord ?? paymentTypeRecords.find((record) => record.paymentType === paymentType) ?? null;
  const paymentDetailKind = getPaymentTypeDetailKind(paymentType, selectedPaymentTypeRecord);
  const shouldShowCheckDetails = paymentDetailKind === "with-bank";
  const isDebitMemo = selectedPaymentTypeRecord?.type === "Debit Memo" || paymentType.trim().toLowerCase().includes("debit memo");
  const doesNotRequireBankInformation = !paymentDetailKind || paymentDetailKind === "cash";

  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      {doesNotRequireBankInformation ? (
        <div className="rounded-lg border border-dashed border-darknavy/15 bg-darknavy/[0.02] px-4 py-10 text-center">
          <p className="text-sm font-semibold text-darknavy">No bank information required</p>
          <p className="mt-1 text-sm text-darknavy/55">Select a bank-based payment type in Voucher Details to enter bank information.</p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2">
          <DisbursementVoucherPaymentFields
            bankAccounts={bankAccounts}
            canAddBankAccount={canAddBankAccount}
            errors={errors}
            isReadonly={isReadonly}
            isMultiCheckNumber={isMultiCheckNumber}
            onOpenBankAccountDrawer={onOpenBankAccountDrawer}
            paymentType={paymentType}
            paymentTypeRecord={selectedPaymentTypeRecord}
            values={values}
            onUpdateBankAccount={onUpdateBankAccount}
            onUpdatePaymentDetails={onUpdatePaymentDetails}
          />
          {shouldShowCheckDetails ? (
            <div className="grid min-w-0 content-start gap-4">
              <TransactionField controlId="disbursement-voucher-payment-check-status" label="Check Status">
                <input
                  id="disbursement-voucher-payment-check-status"
                  value={values.paymentDetails.checkStatus ?? ""}
                  readOnly
                  className={`${TransactionFieldClassName} !bg-darknavy/5 text-darknavy/60`}
                />
              </TransactionField>
              <TransactionField
                controlId="disbursement-voucher-payment-check-date"
                error={errors.checkDate}
                isRequired
                label="Check Date"
              >
                <input
                  id="disbursement-voucher-payment-check-date"
                  type="date"
                  value={values.paymentDetails.checkDate || values.voucherDate}
                  readOnly={isReadonly}
                  onChange={(event) => onUpdatePaymentDetails({ checkDate: event.target.value })}
                  className={TransactionFieldClassName}
                />
              </TransactionField>
              <TransactionField label={isDebitMemo ? "Multi Debit Memo No." : "Multi Check No."}>
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
              </TransactionField>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
