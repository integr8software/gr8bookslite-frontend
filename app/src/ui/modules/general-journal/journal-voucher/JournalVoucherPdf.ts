import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  formatJournalVoucherReportAccount,
  formatJournalVoucherReportAmount,
  formatJournalVoucherReportDate,
  formatJournalVoucherReportExchangeRate,
  getJournalVoucherEntryParticulars,
  getJournalVoucherEntryPartyLabel,
  getJournalVoucherReportTotals,
} from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherReportData";
import type {
  JournalVoucherFormValues,
  JournalVoucherLine,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

type PdfText = string | Array<string | { text: string; bold?: boolean }>;

export function openJournalVoucherPdf(values: JournalVoucherFormValues) {
  pdfMake.createPdf(createJournalVoucherPdfDefinition(values)).open();
}

function createJournalVoucherPdfDefinition(values: JournalVoucherFormValues): TDocumentDefinitions {
  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [24, 24, 24, 24],
    defaultStyle: {
      font: "Roboto",
      fontSize: 7,
      lineHeight: 1.05,
    },
    content: [
      {
        table: {
          widths: ["*"],
          body: [
            [createHeaderTable()],
            [createTitleAndDateRow(values)],
            [createVoucherStatusRow(values)],
            [createCurrencyRow(values)],
            [createRemarksRow(values)],
            [createJournalEntriesTable(values)],
            [createApprovalTable(values)],
          ],
        },
        layout: outerLayout,
      },
    ],
  };
}

function createHeaderTable(): TableCell {
  return {
    table: {
      widths: [120, "*"],
      body: [
        [
          {
            text: "Logo",
            alignment: "center",
            bold: true,
            color: "#1a6290",
            fontSize: 7,
            margin: [0, 17, 0, 15],
          },
          {
            stack: [
              {
                text: "Your Company Name Here",
                bold: true,
                fontSize: 10,
                alignment: "center",
              },
              {
                text: "VAT REG TIN : 000-000-000-000",
                alignment: "center",
                bold: true,
                margin: [0, 4, 0, 0],
              },
              {
                text: "Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District",
                alignment: "center",
                bold: true,
                margin: [0, 4, 0, 0],
              },
              {
                text: "Telephone No: 0967-237-4514",
                alignment: "center",
                bold: true,
                margin: [0, 4, 0, 0],
              },
            ],
            margin: [0, 10, 0, 10],
          },
        ],
      ],
    },
    layout: noBordersLayout,
  };
}

function createTitleAndDateRow(values: JournalVoucherFormValues): TableCell {
  return {
    table: {
      widths: ["*", 190],
      body: [
        [
          {
            text: "JOURNAL VOUCHER",
            bold: true,
            fontSize: 17,
            margin: [6, 7, 0, 6],
          },
          {
            text: [{ text: "Document Date: ", bold: true }, formatJournalVoucherReportDate(values.documentDate)],
            margin: [4, 8, 4, 4],
          },
        ],
      ],
    },
    layout: thinGridLayout,
  };
}

function createVoucherStatusRow(values: JournalVoucherFormValues): TableCell {
  return createTwoColumnInfoRow(
    [{ text: "JV No.: ", bold: true }, values.transactionNo || "-"],
    [{ text: "Status: ", bold: true }, values.status || "-"],
  );
}

function createCurrencyRow(values: JournalVoucherFormValues): TableCell {
  return createTwoColumnInfoRow(
    [{ text: "Currency: ", bold: true }, values.currencyType || "-"],
    [{ text: "Exchange Rate: ", bold: true }, formatJournalVoucherReportExchangeRate(values.currencyRate)],
  );
}

function createTwoColumnInfoRow(leftText: PdfText, rightText: PdfText): TableCell {
  return {
    table: {
      widths: ["*", 190],
      body: [
        [
          {
            text: leftText,
            margin: [3, 3, 3, 3],
          },
          {
            text: rightText,
            margin: [3, 3, 3, 3],
          },
        ],
      ],
    },
    layout: thinGridLayout,
  };
}

function createRemarksRow(values: JournalVoucherFormValues): TableCell {
  return {
    text: [{ text: "REMARKS: ", bold: true }, values.remarks || "-"],
    margin: [3, 3, 3, 3],
  };
}

function createJournalEntriesTable(values: JournalVoucherFormValues): TableCell {
  const totals = getJournalVoucherReportTotals(values);
  const body: TableCell[][] = [
    [sectionHeaderCell("Accounting Entries", 9), {}, {}, {}, {}, {}, {}, {}, {}],
    [
      headerCell("Account"),
      headerCell("Party"),
      headerCell("Particulars"),
      headerCell("Cost Center"),
      headerCell("Ref No."),
      headerCell("VAT"),
      headerCell("EWT"),
      headerCell("Debit", "right"),
      headerCell("Credit", "right"),
    ],
    ...values.lines.map((line) => createJournalEntryRow(line, values)),
    [totalLabelCell(7), {}, {}, {}, {}, {}, {}, totalAmountCell(totals.totalDebit), totalAmountCell(totals.totalCredit)],
  ];

  return {
    table: {
      headerRows: 2,
      widths: [120, 80, "*", 85, 62, 50, 50, 64, 64],
      body,
    },
    layout: thinGridLayout,
  };
}

function createJournalEntryRow(line: JournalVoucherLine, values: JournalVoucherFormValues): TableCell[] {
  return [
    bodyCell(formatJournalVoucherReportAccount(line.accountCode, line.accountTitle)),
    bodyCell(getJournalVoucherEntryPartyLabel(line)),
    bodyCell(getJournalVoucherEntryParticulars(line, values)),
    bodyCell(line.responsibilityCenter || "-"),
    bodyCell(line.refNo || "-"),
    bodyCell(line.vatType || "-"),
    bodyCell(line.atcCode || "-"),
    bodyCell(line.debit ? formatJournalVoucherReportAmount(line.debit) : "", "right"),
    bodyCell(line.credit ? formatJournalVoucherReportAmount(line.credit) : "", "right"),
  ];
}

function createApprovalTable(values: JournalVoucherFormValues): TableCell {
  return {
    table: {
      widths: ["*", "*", "*", 140],
      body: [
        [
          approvalCell("Prepared by:", "-"),
          approvalCell("Verified by:", "-"),
          approvalCell("Approved by:", "-"),
          {
            stack: [
              { text: "JV NO.:", bold: true },
              {
                text: values.transactionNo || "-",
                bold: true,
                fontSize: getVoucherNumberFontSize(values.transactionNo),
                alignment: "right",
                margin: [0, 14, 4, 0],
                noWrap: false,
              },
            ],
            margin: [3, 3, 3, 3],
          },
        ],
      ],
    },
    layout: thinGridLayout,
  };
}

function approvalCell(label: string, value: string): TableCell {
  return {
    stack: [
      { text: label },
      {
        text: value,
        alignment: "center",
        margin: [0, 20, 0, 0],
      },
    ],
    margin: [3, 3, 3, 3],
  };
}

function sectionHeaderCell(text: string, colSpan: number): TableCell {
  return {
    text,
    bold: true,
    colSpan,
    fillColor: "#f5f5f5",
    margin: [3, 3, 3, 3],
  };
}

function headerCell(text: string, alignment: "left" | "right" = "left"): TableCell {
  return {
    text,
    bold: true,
    alignment,
    margin: [3, 3, 3, 3],
  };
}

function bodyCell(text: string, alignment: "left" | "right" = "left"): TableCell {
  return {
    text,
    alignment,
    margin: [3, 3, 3, 10],
  };
}

function totalLabelCell(colSpan: number): TableCell {
  return {
    text: "Total:",
    bold: true,
    alignment: "right",
    colSpan,
    margin: [3, 3, 3, 3],
  };
}

function totalAmountCell(value: number): TableCell {
  return {
    text: formatJournalVoucherReportAmount(value),
    bold: true,
    alignment: "right",
    margin: [3, 3, 3, 3],
  };
}

function getVoucherNumberFontSize(value: string) {
  if (value.length > 14) {
    return 11;
  }

  if (value.length > 10) {
    return 14;
  }

  return 20;
}

const noBordersLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

const outerLayout = {
  hLineWidth: () => 1,
  vLineWidth: () => 1,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

const thinGridLayout = {
  hLineWidth: () => 0.35,
  vLineWidth: () => 0.35,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};
