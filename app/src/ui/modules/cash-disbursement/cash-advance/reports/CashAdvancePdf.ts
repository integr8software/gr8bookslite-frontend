import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  CashAdvancePdfNoBordersLayout,
  CashAdvancePdfRequestFormLayout,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { formatCashAdvanceCurrency } from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import type { CashAdvanceFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openCashAdvancePdf(values: CashAdvanceFormValues) {
  pdfMake.createPdf(createCashAdvancePdfDefinition(values)).open();
}

function createCashAdvancePdfDefinition(values: CashAdvanceFormValues): TDocumentDefinitions {
  const amount = Number(values.amount || 0);
  const accountTitle = values.accountTitle || getCashAdvanceAccountTitle(values.accountCode);
  const purpose = [accountTitle, values.remarks].filter(Boolean).join(" - ");

  return {
    pageSize: "A4",
    pageMargins: [24, 24, 24, 24],
    defaultStyle: {
      font: "Roboto",
      fontSize: 9.5,
      lineHeight: 1.15,
    },
    content: [
      {
        table: {
          widths: ["40%", "40%", "20%"],
          body: [
            [
              {
                colSpan: 3,
                table: {
                  widths: [108, "*", 108],
                  body: [
                    [
                      {
                        text: "integr8",
                        color: "#126eb8",
                        bold: true,
                        fontSize: 28,
                        alignment: "center",
                        margin: [0, 12, 0, 0],
                      },
                      {
                        stack: [
                          { text: "Your Company Name Here", bold: true, fontSize: 13, alignment: "center" },
                          { text: "VAT REG TIN : 000-000-000", alignment: "center", margin: [0, 8, 0, 0] },
                          {
                            text: "ABC, 123, Sample, Malamig, CITY OF MANDALUYONG, NCR, SECOND DISTRICT",
                            alignment: "center",
                            margin: [0, 8, 0, 0],
                          },
                          { text: "Telephone No: 0967-237-4514", alignment: "center", margin: [0, 16, 0, 0] },
                        ],
                        margin: [0, 6, 0, 18],
                      },
                      { text: "" },
                    ],
                  ],
                },
                layout: CashAdvancePdfNoBordersLayout,
              },
              { text: "" },
              { text: "" },
            ],
            [
              {
                text: "CASH ADVANCE REQUEST FORM",
                bold: true,
                fontSize: 20,
                margin: [8, 3, 0, 0],
              },
              {
                colSpan: 2,
                text: [{ text: "Document Date: ", bold: true }, formatCompactDate(values.documentDate)],
                margin: [0, 11, 0, 0],
              },
              { text: "" },
            ],
            requestRow("Name Requesting Cash Advance", values.partyName),
            requestRow("Responsibility Center", values.costCenter),
            requestRow("Amount of Cash Advance", formatCashAdvanceCurrency(amount)),
            requestRow("Amount in Words", amountToWords(amount)),
            requestRow("Project Name", values.referenceFields.projectName, 30),
            requestRow("Purpose of Cash Advance", purpose, 40),
            [
              { text: "Prepared by:", margin: [4, 4, 0, 28] },
              { text: "Approved by:", margin: [4, 4, 0, 28] },
              {
                stack: [
                  { text: "CA NO.:", bold: true },
                  { text: values.transNo || "-", bold: true, fontSize: 18, alignment: "right", margin: [0, 6, 0, 0] },
                ],
                margin: [4, 4, 4, 0],
              },
            ],
          ],
        },
        layout: CashAdvancePdfRequestFormLayout,
      },
      horizontalLine(547, [0, 10, 0, 6]),
      {
        text: "RECEIVED BY:",
        margin: [0, 0, 0, 10],
      },
      horizontalLine(547),
    ],
  };
}

function requestRow(label: string, value?: string, height = 16): TableCell[] {
  return [
    {
      colSpan: 3,
      text: [{ text: `${label.toUpperCase()}: `, bold: true }, value || " "],
      margin: [4, 4, 4, height - 12],
    },
    { text: "" },
    { text: "" },
  ];
}

function horizontalLine(width = 520, margin: [number, number, number, number] = [0, 0, 0, 0]): Content {
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
    margin,
  };
}

function formatCompactDate(value: string) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  return year && month && day ? `${month}/${day}/${year}` : formatDate(value, { locale: "en-US" });
}

function getCashAdvanceAccountTitle(accountCode: string) {
  const accountTitles: Record<string, string> = {
    "1130-CA": "Cash Advance",
    "1130-EA": "Employee Advance",
    "1135-OA": "Officer Advance",
  };

  return accountTitles[accountCode] ?? accountCode;
}

function amountToWords(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  const wholeAmount = Math.floor(value);

  return `${integerToWords(wholeAmount)} Only`;
}

function integerToWords(value: number): string {
  const ones = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (value < 20) return ones[value];
  if (value < 100) {
    return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${ones[value % 10]}` : ""}`;
  }
  if (value < 1000) {
    return `${ones[Math.floor(value / 100)]} Hundred${value % 100 ? ` ${integerToWords(value % 100)}` : ""}`;
  }
  if (value < 1000000) {
    return `${integerToWords(Math.floor(value / 1000))} Thousand${value % 1000 ? ` ${integerToWords(value % 1000)}` : ""}`;
  }

  return `${integerToWords(Math.floor(value / 1000000))} Million${value % 1000000 ? ` ${integerToWords(value % 1000000)}` : ""}`;
}
