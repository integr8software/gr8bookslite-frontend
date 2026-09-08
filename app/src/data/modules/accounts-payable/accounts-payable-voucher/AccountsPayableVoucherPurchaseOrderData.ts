import { createAccountsPayableVoucherExpenseLine } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import { getPurchaseOrderItemNetAmount } from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type { AccountsPayableVoucherLookupAccount } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { PurchaseOrderRecord } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";

export function createAccountsPayableVoucherPurchaseOrderLines(
  order: PurchaseOrderRecord,
  accounts: AccountsPayableVoucherLookupAccount[],
) {
  const debitEntries = order.accountingEntries.filter(
    (entry) => entry.accountCode.trim() && Number(entry.debit) > 0 && Number(entry.credit) === 0,
  );

  return order.items
    .filter((item) => item.itemCode.trim() || item.itemName.trim() || Math.abs(getPurchaseOrderItemNetAmount(item)) > 0)
    .map((item, index) => {
      const name = item.itemName.trim().toLowerCase();
      const sourceEntry = debitEntries.find((entry) => entry.particulars.trim().toLowerCase() === name);
      const namedAccounts = accounts.filter((account) => account.status === "Active" && account.accountName.trim().toLowerCase() === name);
      // Purchase orders fetched from the API may have no journal entries.
      // Resolve the displayed payable type to the same real account used by manual entry.
      const account = sourceEntry
        ? accounts.find((option) => option.status === "Active" && option.accountNumber === sourceEntry.accountCode)
        : namedAccounts.length === 1
          ? namedAccounts[0]
          : undefined;
      const amount = getPurchaseOrderItemNetAmount(item);

      return createAccountsPayableVoucherExpenseLine(index + 1, {
        amount,
        currencyCode: order.currency,
        exchangeRate: order.exchangeRate,
        expenseAccountId: account?.id,
        expenseAccountCode: account?.accountNumber ?? sourceEntry?.accountCode ?? "",
        expenseType: account?.accountName ?? sourceEntry?.accountTitle ?? "",
        netAmount: amount,
        particulars: item.itemName || order.remarks,
        partyCode: order.vceCode,
        partyId: order.partyId,
        partyName: order.vceName,
        referenceNo: order.transNo,
        responsibilityCenterId: item.responsibilityCenterId,
        responsibilityCenter: item.responsibilityCenter,
        totalAmountDue: amount,
      });
    });
}
