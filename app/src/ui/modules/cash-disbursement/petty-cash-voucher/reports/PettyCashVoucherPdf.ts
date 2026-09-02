import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { PettyCashVoucherFormValues } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openPettyCashVoucherPdf(values: PettyCashVoucherFormValues) {
  pdfMake.createPdf(createPettyCashVoucherPdfDefinition(values)).open();
}

function createPettyCashVoucherPdfDefinition(values: PettyCashVoucherFormValues): TDocumentDefinitions {
  const amount = parseMoneyNumberInput(values.amount);
  const vatAmount = parseMoneyNumberInput(values.vatAmount);
  const ewtAmount = parseMoneyNumberInput(values.ewtAmount);
  const netAmount = parseMoneyNumberInput(values.netAmount);

  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 36],
    defaultStyle: { font: "Roboto", fontSize: 9.5, lineHeight: 1.15 },
    content: [
      { text: "PETTY CASH VOUCHER", alignment: "center", bold: true, fontSize: 18 },
      { text: values.transactionNo || "-", alignment: "center", margin: [0, 4, 0, 20] },
      {
        columns: [
          { text: [{ text: "Party: ", bold: true }, `${values.partyName || "-"} (${values.partyCode || "-"})`] },
          { text: [{ text: "Document Date: ", bold: true }, formatDate(values.documentDate)] },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: [{ text: "Default Account: ", bold: true }, `${values.accountTitle || "-"} (${values.accountCode || "-"})`] },
          { text: [{ text: "Status: ", bold: true }, values.status || "-"] },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: [
              { text: "Responsibility Center: ", bold: true },
              `${values.responsibilityCenter || "-"} (${values.responsibilityCenterCode || "-"})`,
            ],
          },
          { text: [{ text: "VAT Type: ", bold: true }, values.vatType || "-"] },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: [{ text: "Gross Amount: ", bold: true }, formatCurrency(amount)] },
          { text: [{ text: "VAT Amount: ", bold: true }, `${formatCurrency(vatAmount)} (${values.vatRate || "0.00%"})`] },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: [{ text: "EWT Amount: ", bold: true }, `${formatCurrency(ewtAmount)} (${values.ewtCode ? `${values.ewtCode} - ${values.ewtRate || "0.00%"}` : values.ewtRate || "0.00%"})`] },
          { text: [{ text: "Net Amount: ", bold: true }, formatCurrency(netAmount)] },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: [{ text: "Currency: ", bold: true }, values.currency || "PHP"] },
          { text: [{ text: "Exchange Rate: ", bold: true }, values.exchangeRate || "1.00"] },
        ],
        margin: [0, 0, 0, 10],
      },
      { text: [{ text: "Remarks: ", bold: true }, values.remarks || "-"], margin: [0, 6, 0, 24] },
      {
        columns: [
          { text: [{ text: "Prepared by:\n\n\n\n", bold: true }, "____________________"] },
          { text: [{ text: "Checked by:\n\n\n\n", bold: true }, "____________________"] },
          { text: [{ text: "Approved by:\n\n\n\n", bold: true }, "____________________"] },
        ],
        margin: [0, 16, 0, 0],
      },
    ],
  };
}
