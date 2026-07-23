import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  SalesInvoiceLineItem,
  SalesInvoiceTotals,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";

export function calculateSalesInvoiceTotals(
  lineItems: SalesInvoiceLineItem[],
): SalesInvoiceTotals {
  return lineItems.reduce(
    (summary, item) => {
      const quantity = parseMoneyNumberInput(item.quantity);
      const returnQuantity = parseMoneyNumberInput(item.returnQuantity);
      const unitPrice = parseMoneyNumberInput(item.price);
      const discount = parseMoneyNumberInput(item.discount);
      const vatRate =
        item.vatable === "True" || item.vatType === "VATable"
          ? parseMoneyNumberInput(item.vatRate) / 100
          : 0;
      const grossAmount =
        parseMoneyNumberInput(item.totalSales) ||
        Math.max(quantity - returnQuantity, 0) * unitPrice;
      const netAmount = Math.max(grossAmount - discount, 0);
      const vatAmount = parseMoneyNumberInput(item.vatAmount) || netAmount * vatRate;

      return {
        discount: summary.discount + discount,
        grossAmount: summary.grossAmount + grossAmount,
        netAmount: summary.netAmount + netAmount,
        vatAmount: summary.vatAmount + vatAmount,
      };
    },
    {
      discount: 0,
      grossAmount: 0,
      netAmount: 0,
      vatAmount: 0,
    },
  );
}

export function salesInvoiceLineHasData(item: SalesInvoiceLineItem) {
  return (
    item.amountDue.trim() !== "" ||
    item.barcode.trim() !== "" ||
    item.discount.trim() !== "" ||
    item.ewtAmount.trim() !== "" ||
    item.itemCode.trim() !== "" ||
    item.name.trim() !== "" ||
    item.price.trim() !== "" ||
    item.quantity.trim() !== "" ||
    item.refNo.trim() !== "" ||
    item.resCenter.trim() !== "" ||
    item.returnQuantity.trim() !== "" ||
    item.totalSales.trim() !== "" ||
    item.uom.trim() !== "" ||
    item.vatAmount.trim() !== ""
  );
}

export function salesInvoiceLineIsComplete(item: SalesInvoiceLineItem) {
  return (
    item.name.trim() !== "" &&
    parseMoneyNumberInput(item.quantity) > 0 &&
    parseMoneyNumberInput(item.price) > 0
  );
}
