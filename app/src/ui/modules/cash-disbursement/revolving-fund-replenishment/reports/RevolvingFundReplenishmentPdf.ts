import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { calculateRevolvingFundReplenishmentTotals } from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import type { RevolvingFundReplenishmentFormValues } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openRevolvingFundReplenishmentPdf(values: RevolvingFundReplenishmentFormValues) {
  pdfMake.createPdf(createPdfDefinition(values)).open();
}

function createPdfDefinition(values: RevolvingFundReplenishmentFormValues): TDocumentDefinitions {
  const totals = calculateRevolvingFundReplenishmentTotals(values.entries);
  const rows: TableCell[][] = values.entries.map((entry) => [
    formatDate(entry.revolvingFundDate),
    entry.revolvingFundNo,
    entry.supplierCode,
    entry.supplierName,
    { text: formatCurrency(Number(entry.amount.replace(/,/g, "")) || 0), alignment: "right" },
    { text: formatCurrency(Number(entry.netAmount.replace(/,/g, "")) || 0), alignment: "right" },
    entry.vatType,
    { text: entry.vatPercent, alignment: "right" },
    { text: formatCurrency(Number(entry.vatAmount.replace(/,/g, "")) || 0), alignment: "right" },
    entry.ewtCode,
    { text: entry.ewtPercent, alignment: "right" },
    { text: formatCurrency(Number(entry.ewtAmount.replace(/,/g, "")) || 0), alignment: "right" },
    entry.remarks,
  ]);
  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [32, 32, 32, 32],
    defaultStyle: { font: "Roboto", fontSize: 9 },
    content: [
      { text: "REVOLVING FUND REPLENISHMENT", alignment: "center", bold: true, fontSize: 18 },
      { text: values.transactionNo, alignment: "center", margin: [0, 4, 0, 20] },
      {
        columns: [
          { text: [{ text: "Party: ", bold: true }, values.partyName] },
          { text: [{ text: "Document Date: ", bold: true }, formatDate(values.documentDate)] },
          { text: [{ text: "Total Amount: ", bold: true }, formatCurrency(totals.totalAmount)] },
        ],
        margin: [0, 0, 0, 16],
      },
      {
        table: {
          headerRows: 1,
          widths: [58, 68, 58, "*", 56, 56, 60, 36, 56, 54, 36, 56, "*"],
          body: [
            [
              "RF Date",
              "RF No.",
              "Supplier Code",
              "Supplier Name",
              "Amount",
              "Net Amount",
              "VAT Type",
              "VAT Rate",
              "VAT Amount",
              "EWT Code",
              "EWT Rate",
              "EWT Amount",
              "Remarks",
            ],
            ...rows,
          ],
        },
      },
      { text: [{ text: "Remarks: ", bold: true }, values.remarks], margin: [0, 16, 0, 0] },
    ],
  };
}
