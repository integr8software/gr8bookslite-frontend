import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  formatAccountsPayableVoucherAmountInWords,
  formatAccountsPayableVoucherReportAccount,
  formatAccountsPayableVoucherReportAmount,
  formatAccountsPayableVoucherReportDate,
  getAccountsPayableVoucherEntryPartyLabel,
  getAccountsPayableVoucherReportTotals,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherReportData";
import type {
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherExpenseLine,
  AccountsPayableVoucherFormValues,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

type PdfText = string | Array<string | { text: string; bold?: boolean }>;

export function openAccountsPayableVoucherPdf(
  values: AccountsPayableVoucherFormValues,
) {
  pdfMake.createPdf(createAccountsPayableVoucherPdfDefinition(values)).open();
}

function createAccountsPayableVoucherPdfDefinition(
  values: AccountsPayableVoucherFormValues,
): TDocumentDefinitions {
  return {
    pageSize: "A4",
    pageOrientation: "portrait",
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
            [createPartyRow(values)],
            [createAmountRow(values)],
            [createPayableTypeRow(values)],
            [createForRow(values)],
            [createDetailsTable(values)],
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

function createTitleAndDateRow(
  values: AccountsPayableVoucherFormValues,
): TableCell {
  return {
    table: {
      widths: ["*", 180],
      body: [
        [
          {
            text: "ACCOUNTS PAYABLE VOUCHER",
            bold: true,
            fontSize: 17,
            margin: [6, 7, 0, 6],
          },
          {
            text: [
              { text: "Document Date: ", bold: true },
              formatAccountsPayableVoucherReportDate(values.documentDate),
            ],
            margin: [4, 8, 4, 4],
          },
        ],
      ],
    },
    layout: thinGridLayout,
  };
}

function createPartyRow(values: AccountsPayableVoucherFormValues): TableCell {
  return createTwoColumnInfoRow(
    [{ text: "PAY TO: ", bold: true }, values.partyName || "-"],
    [{ text: "APV No.: ", bold: true }, values.transactionNo || "-"],
  );
}

function createAmountRow(values: AccountsPayableVoucherFormValues): TableCell {
  const totals = getAccountsPayableVoucherReportTotals(values);

  return createTwoColumnInfoRow(
    [
      { text: "AMOUNT: ", bold: true },
      formatAccountsPayableVoucherAmountInWords(
        totals.voucherAmount,
        values.currency,
      ),
    ],
    [{ text: "Ref No: ", bold: true }, values.referenceNo || "-"],
  );
}

function createPayableTypeRow(
  values: AccountsPayableVoucherFormValues,
): TableCell {
  return createTwoColumnInfoRow(
    [{ text: "PAYABLE TYPE: ", bold: true }, values.payableType || "-"],
    [
      { text: "Due Date: ", bold: true },
      formatAccountsPayableVoucherReportDate(values.dueDate),
    ],
  );
}

function createTwoColumnInfoRow(
  leftText: PdfText,
  rightText: PdfText,
): TableCell {
  return {
    table: {
      widths: ["*", 180],
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

function createForRow(values: AccountsPayableVoucherFormValues): TableCell {
  return {
    text: [
      { text: "FOR: ", bold: true },
      values.remarks || values.terms || "-",
    ],
    margin: [3, 3, 3, 3],
  };
}

function createDetailsTable(values: AccountsPayableVoucherFormValues): TableCell {
  const totals = getAccountsPayableVoucherReportTotals(values);
  const body: TableCell[][] = [
    [sectionHeaderCell("Expense Details", 7), {}, {}, {}, {}, {}, {}],
    [
      headerCell("Expense Account"),
      headerCell("Party"),
      headerCell("Particulars"),
      headerCell("Cost Center"),
      headerCell("Gross", "right"),
      headerCell("EWT", "right"),
      headerCell("Total Due", "right"),
    ],
    ...values.expenseLines.map(createDetailRow),
    [
      totalLabelCell(4),
      {},
      {},
      {},
      totalAmountCell(totals.grossAmount),
      totalAmountCell(totals.ewtAmount),
      totalAmountCell(totals.totalAmountDue),
    ],
  ];

  return {
    table: {
      headerRows: 2,
      widths: [132, 88, "*", 70, 56, 50, 58],
      body,
    },
    layout: thinGridLayout,
  };
}

function createDetailRow(
  line: AccountsPayableVoucherExpenseLine,
): TableCell[] {
  return [
    bodyCell(
      formatAccountsPayableVoucherReportAccount(
        line.expenseAccountCode,
        line.expenseType,
      ),
    ),
    bodyCell(line.partyName || line.partyCode || "-"),
    bodyCell(line.particulars || "-"),
    bodyCell(line.responsibilityCenter || "-"),
    bodyCell(formatAccountsPayableVoucherReportAmount(line.amount), "right"),
    bodyCell(
      line.ewtAmount
        ? formatAccountsPayableVoucherReportAmount(line.ewtAmount)
        : "",
      "right",
    ),
    bodyCell(
      formatAccountsPayableVoucherReportAmount(line.totalAmountDue),
      "right",
    ),
  ];
}

function createJournalEntriesTable(
  values: AccountsPayableVoucherFormValues,
): TableCell {
  const totals = getAccountsPayableVoucherReportTotals(values);
  const body: TableCell[][] = [
    [sectionHeaderCell("Accounting Entries", 6), {}, {}, {}, {}, {}],
    [
      headerCell("Account"),
      headerCell("Party"),
      headerCell("Particulars"),
      headerCell("Cost Center"),
      headerCell("Debit", "right"),
      headerCell("Credit", "right"),
    ],
    ...values.accountingEntries.map((entry) => createJournalEntryRow(entry, values)),
    [
      totalLabelCell(4),
      {},
      {},
      {},
      totalAmountCell(totals.totalDebit),
      totalAmountCell(totals.totalCredit),
    ],
  ];

  return {
    table: {
      headerRows: 2,
      widths: [132, 88, "*", 70, 64, 64],
      body,
    },
    layout: thinGridLayout,
  };
}

function createJournalEntryRow(
  entry: AccountsPayableVoucherAccountingEntry,
  values: AccountsPayableVoucherFormValues,
): TableCell[] {
  return [
    bodyCell(
      formatAccountsPayableVoucherReportAccount(
        entry.accountCode,
        entry.accountTitle,
      ),
    ),
    bodyCell(getAccountsPayableVoucherEntryPartyLabel(entry, values)),
    bodyCell(entry.particulars || "-"),
    bodyCell(entry.responsibilityCenter || "-"),
    bodyCell(
      entry.debit ? formatAccountsPayableVoucherReportAmount(entry.debit) : "",
      "right",
    ),
    bodyCell(
      entry.credit
        ? formatAccountsPayableVoucherReportAmount(entry.credit)
        : "",
      "right",
    ),
  ];
}

function createApprovalTable(values: AccountsPayableVoucherFormValues): TableCell {
  return {
    table: {
      widths: ["*", "*", "*", 115],
      body: [
        [
          approvalCell("Prepared by:", "-"),
          approvalCell("Verified by:", "-"),
          approvalCell("Approved by:", "-"),
          {
            stack: [
              { text: "APV NO.:", bold: true },
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

function headerCell(
  text: string,
  alignment: "left" | "right" = "left",
): TableCell {
  return {
    text,
    bold: true,
    alignment,
    margin: [3, 3, 3, 3],
  };
}

function bodyCell(
  text: string,
  alignment: "left" | "right" = "left",
): TableCell {
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
    text: formatAccountsPayableVoucherReportAmount(value),
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
