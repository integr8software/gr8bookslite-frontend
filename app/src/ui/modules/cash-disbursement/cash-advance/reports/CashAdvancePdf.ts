import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  formatCashAdvanceCurrency,
  formatCashAdvanceDate,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import type { CashAdvanceFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openCashAdvancePdf(values: CashAdvanceFormValues) {
  pdfMake.createPdf(createCashAdvancePdfDefinition(values)).open();
}

function createCashAdvancePdfDefinition(
  values: CashAdvanceFormValues,
): TDocumentDefinitions {
  return {
    pageSize: "A4",
    pageMargins: [36, 32, 36, 36],
    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
      lineHeight: 1.15,
    },
    content: [
      createHeader(),
      {
        columns: [
          {
            text: "CASH ADVANCE",
            bold: true,
            fontSize: 15,
            margin: [0, 18, 0, 4],
          },
          {
            stack: [
              { text: "Advance No.", bold: true, fontSize: 8 },
              { text: values.transNo || "-", bold: true, fontSize: 12 },
            ],
            alignment: "right",
            margin: [0, 18, 0, 4],
          },
        ],
      },
      horizontalLine(),
      {
        table: {
          widths: ["25%", "25%", "25%", "25%"],
          body: [
            [
              labelValueCell("Document Date", formatPdfDate(values.documentDate)),
              labelValueCell("Status", values.status),
              labelValueCell("Party Code", values.partyCode),
              labelValueCell("Party Name", values.partyName),
            ],
            [
              labelValueCell("Account Code", values.accountCode),
              labelValueCell("Cost Center", values.costCenter),
              labelValueCell("Amount", formatCashAdvanceCurrency(Number(values.amount || 0))),
              labelValueCell("Tax", createTaxSummary(values)),
            ],
          ],
        },
        layout: noBordersLayout,
        margin: [0, 12, 0, 8],
      },
      sectionTitle("References"),
      {
        table: {
          widths: ["25%", "25%", "25%", "25%"],
          body: [
            [
              labelValueCell("Container No.", values.referenceFields.containerNo),
              labelValueCell("Ref No.", values.referenceFields.refNo),
              labelValueCell("Project Ref", values.referenceFields.projectRef),
              labelValueCell(
                "Importation Ref No.",
                values.referenceFields.importationRefNo,
              ),
            ],
          ],
        },
        layout: noBordersLayout,
        margin: [0, 6, 0, 10],
      },
      sectionTitle("Remarks"),
      {
        text: values.remarks || " ",
        margin: [0, 6, 0, 36],
      },
      {
        columns: [
          { text: "", width: "*" },
          {
            stack: [
              horizontalLine(160),
              {
                text: "Authorized Signature",
                alignment: "center",
                fontSize: 8,
                margin: [0, 4, 0, 0],
              },
            ],
            width: 170,
          },
        ],
      },
    ],
  };
}

function createHeader(): Content {
  return {
    columns: [
      {
        text: "LOGO",
        color: "#2b8ec6",
        bold: true,
        alignment: "center",
        width: 72,
        margin: [0, 14, 0, 0],
      },
      {
        stack: [
          {
            text: "Your Company Name Here",
            bold: true,
            fontSize: 13,
            alignment: "center",
          },
          {
            text: "VAT REG TIN : 000-000-000-000",
            alignment: "center",
            fontSize: 8,
            margin: [0, 4, 0, 0],
          },
          {
            text: "Abc, 123, Sample, Malamig, City Of Mandaluyong, NCR",
            alignment: "center",
            fontSize: 8,
            margin: [0, 3, 0, 0],
          },
          {
            text: "Telephone No: 0967-237-4514",
            alignment: "center",
            fontSize: 8,
            margin: [0, 8, 0, 0],
          },
        ],
        width: "*",
      },
      { text: "", width: 72 },
    ],
  };
}

function labelValueCell(label: string, value?: string): Content {
  return {
    stack: [
      { text: label.toUpperCase(), bold: true, color: "#5b6478", fontSize: 7 },
      { text: value || " ", margin: [0, 3, 8, 0] },
    ],
    margin: [0, 4, 8, 6],
  };
}

function sectionTitle(text: string): Content {
  return {
    text,
    bold: true,
    fillColor: "#f7f3e8",
    margin: [0, 8, 0, 0],
  };
}

function horizontalLine(width = 520): Content {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: width,
        y2: 0,
        lineWidth: 0.6,
        lineColor: "#212738",
      },
    ],
  };
}

function createTaxSummary(values: CashAdvanceFormValues) {
  const { taxDetails, taxRate } = values.taxValue;

  if (taxRate === "0%" && !taxDetails.ewtCode) {
    return "No VAT";
  }

  return `${taxRate}${taxDetails.ewtCode ? ` / ${taxDetails.ewtCode}` : ""}`;
}

function formatPdfDate(value: string) {
  return value ? formatCashAdvanceDate(value) : "";
}

const noBordersLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};
