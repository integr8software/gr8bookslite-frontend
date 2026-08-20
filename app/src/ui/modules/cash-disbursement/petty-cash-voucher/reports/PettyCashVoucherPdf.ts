import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import type { PettyCashVoucherFormValues } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openPettyCashVoucherPdf(values: PettyCashVoucherFormValues) {
  pdfMake.createPdf(createPettyCashVoucherPdfDefinition(values)).open();
}

function createPettyCashVoucherPdfDefinition(values: PettyCashVoucherFormValues): TDocumentDefinitions {
  const amount = Number(values.amount.replace(/,/g, "")) || 0;
  const netAmount = Number(values.netAmount.replace(/,/g, "")) || 0;
  const vatAmount = Number(values.vatAmount.replace(/,/g, "")) || 0;

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
          { text: [{ text: "PCV Date: ", bold: true }, formatDate(values.documentDate)] },
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
          { text: [{ text: "Status: ", bold: true }, values.status || "-"] },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: [{ text: "Default Account: ", bold: true }, `${values.accountTitle || "-"} (${values.accountCode || "-"})`] },
          { text: [{ text: "VATable: ", bold: true }, values.vatable === "True" ? "Yes" : "No"] },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: [{ text: "Gross Amount: ", bold: true }, formatCurrency(amount)] },
          { text: [{ text: "VAT Amount: ", bold: true }, formatCurrency(vatAmount)] },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: [{ text: "Net Amount: ", bold: true }, formatCurrency(netAmount)] },
          { text: [{ text: "Currency: ", bold: true }, values.currency || "PHP"] },
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
