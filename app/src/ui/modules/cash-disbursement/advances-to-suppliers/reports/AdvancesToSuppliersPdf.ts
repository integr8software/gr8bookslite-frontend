import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import type { AdvancesToSuppliersFormValues } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openAdvancesToSuppliersPdf(values: AdvancesToSuppliersFormValues) {
  pdfMake.createPdf(createPdfDefinition(values)).open();
}

function createPdfDefinition(values: AdvancesToSuppliersFormValues): TDocumentDefinitions {
  const totalPoAmount = Number(values.totalPoAmount.replace(/,/g, "")) || 0;
  const advancePaymentAmount = Number(values.advancePaymentAmount.replace(/,/g, "")) || 0;
  return {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { font: "Roboto", fontSize: 10 },
    content: [
      { text: "ADVANCES TO SUPPLIERS", alignment: "center", bold: true, fontSize: 18 },
      { text: values.transactionNo, alignment: "center", margin: [0, 4, 0, 24] },
      {
        columns: [
          { text: [{ text: "Party: ", bold: true }, values.partyName] },
          { text: [{ text: "Date: ", bold: true }, formatDate(values.documentDate)] },
        ],
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          { text: [{ text: "PO Reference: ", bold: true }, values.poReference] },
          { text: [{ text: "Status: ", bold: true }, values.status] },
        ],
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          { text: [{ text: "Total PO Amount: ", bold: true }, formatCurrency(totalPoAmount)] },
          { text: [{ text: "Advance Payment (%): ", bold: true }, `${values.advancePaymentPercentage}%`] },
        ],
        margin: [0, 0, 0, 12],
      },
      { text: [{ text: "Amount of Advance Payment: ", bold: true }, formatCurrency(advancePaymentAmount)], margin: [0, 0, 0, 12] },
      { text: [{ text: "Default Account: ", bold: true }, `${values.accountTitle} (${values.accountCode})`], margin: [0, 0, 0, 12] },
      { text: [{ text: "Remarks: ", bold: true }, values.remarks], margin: [0, 8, 0, 0] },
    ],
  };
}
