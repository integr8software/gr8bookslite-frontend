import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { calculateRequestForPaymentTotals } from "@/app/src/data/modules/cash-disbursement/request-for-payment/RequestForPaymentData";
import type { RequestForPaymentFormValues } from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openRequestForPaymentPdf(values: RequestForPaymentFormValues) {
  pdfMake.createPdf(createRequestForPaymentPdfDefinition(values)).open();
}

function createRequestForPaymentPdfDefinition(values: RequestForPaymentFormValues): TDocumentDefinitions {
  const totals = calculateRequestForPaymentTotals(values.items);
  const itemRows: TableCell[][] = values.items.map((item, index) => [
    { text: String(index + 1), alignment: "center" },
    formatDate(item.date),
    item.refType,
    item.refNumber || "-",
    item.particulars || "-",
    item.responsibilityCenterName || item.responsibilityCenterCode || "-",
    { text: formatCurrency(Number(item.amount.replace(/,/g, "")) || 0), alignment: "right" },
  ]);

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [32, 32, 32, 32],
    defaultStyle: { font: "Roboto", fontSize: 9 },
    content: [
      { text: "REQUEST FOR PAYMENT", alignment: "center", bold: true, fontSize: 18 },
      { text: values.transactionNo, alignment: "center", margin: [0, 4, 0, 16] },
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: [{ text: "Payee: ", bold: true }, values.partyName] },
              { text: [{ text: "Payment Method: ", bold: true }, values.paymentMethod] },
              {
                text: [
                  { text: "Responsibility Center: ", bold: true },
                  values.responsibilityCenter || values.responsibilityCenterCode || "-",
                ],
              },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: [{ text: "Document Date: ", bold: true }, formatDate(values.documentDate)] },
              { text: [{ text: "Date Needed: ", bold: true }, formatDate(values.dateNeeded)] },
              { text: [{ text: "Total Amount: ", bold: true }, formatCurrency(totals.totalAmount)] },
            ],
          },
        ],
        margin: [0, 0, 0, 16],
      },
      {
        table: {
          headerRows: 1,
          widths: [24, 60, 60, 80, "*", 100, 75],
          body: [
            [
              { text: "#", bold: true, alignment: "center" },
              { text: "Date", bold: true },
              { text: "Ref Type", bold: true },
              { text: "Ref Number", bold: true },
              { text: "Particulars", bold: true },
              { text: "Responsibility Center", bold: true },
              { text: "Amount", bold: true, alignment: "right" },
            ],
            ...itemRows,
          ],
        },
      },
      {
        columns: [
          { text: [{ text: "Remarks: ", bold: true }, values.remarks || "None"], width: "60%" },
          {
            text: [
              { text: "Grand Total: ", bold: true },
              { text: formatCurrency(totals.totalAmount), bold: true },
            ],
            alignment: "right",
            width: "40%",
          },
        ],
        margin: [0, 16, 0, 24],
      },
      {
        columns: [
          {
            stack: [
              { text: "Requested By:", bold: true },
              { text: "\n\n__________________________", margin: [0, 10, 0, 4] },
              { text: "Signature over Printed Name", fontSize: 8, color: "#666" },
            ],
          },
          {
            stack: [
              { text: "Reviewed By:", bold: true },
              { text: "\n\n__________________________", margin: [0, 10, 0, 4] },
              { text: "Department Head", fontSize: 8, color: "#666" },
            ],
          },
          {
            stack: [
              { text: "Approved By:", bold: true },
              { text: "\n\n__________________________", margin: [0, 10, 0, 4] },
              { text: "Finance / Comptroller", fontSize: 8, color: "#666" },
            ],
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
}
