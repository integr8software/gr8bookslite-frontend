import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { calculateRevolvingFundTotals } from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import type { RevolvingFundFormValues } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openRevolvingFundPdf(values: RevolvingFundFormValues) {
  pdfMake.createPdf(createRevolvingFundPdfDefinition(values)).open();
}

function createRevolvingFundPdfDefinition(values: RevolvingFundFormValues): TDocumentDefinitions {
  const totals = calculateRevolvingFundTotals(values.items);
  const itemRows: TableCell[][] = values.items.map((item) => [
    formatDate(item.date),
    item.supplierName,
    { text: formatCurrency(Number(item.grossAmount.replace(/,/g, "")) || 0), alignment: "right" },
    item.vatType,
    { text: item.vatPercent, alignment: "right" },
    { text: formatCurrency(Number(item.vatAmount.replace(/,/g, "")) || 0), alignment: "right" },
    item.ewtCode,
    { text: item.ewtPercent, alignment: "right" },
    { text: formatCurrency(Number(item.ewtAmount.replace(/,/g, "")) || 0), alignment: "right" },
    { text: formatCurrency(Number(item.netAmount.replace(/,/g, "")) || 0), alignment: "right" },
    item.particulars || item.remarks || "",
  ]);
  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [32, 32, 32, 32],
    defaultStyle: { font: "Roboto", fontSize: 9 },
    content: [
      { text: "REVOLVING FUND", alignment: "center", bold: true, fontSize: 18 },
      { text: values.transactionNo, alignment: "center", margin: [0, 4, 0, 20] },
      {
        columns: [
          { text: [{ text: "Party: ", bold: true }, values.partyName] },
          { text: [{ text: "Document Date: ", bold: true }, formatDate(values.documentDate)] },
          { text: [{ text: "Total Amount: ", bold: true }, formatCurrency(totals.grossAmount)] },
        ],
        margin: [0, 0, 0, 16],
      },
      {
        table: {
          headerRows: 1,
          widths: [58, "*", 58, 60, 36, 56, 54, 36, 56, 56, "*"],
          body: [
            [
              "Date",
              "Supplier Name",
              "Gross Amount",
              "VAT Type",
              "VAT Rate",
              "VAT Amount",
              "EWT Code",
              "EWT Rate",
              "EWT Amount",
              "Net Amount",
              "Particulars",
            ],
            ...itemRows,
          ],
        },
      },
      { text: [{ text: "Remarks: ", bold: true }, values.remarks], margin: [0, 16, 0, 0] },
    ],
  };
}
