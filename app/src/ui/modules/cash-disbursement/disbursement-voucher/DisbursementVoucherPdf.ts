import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { formatCurrency } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementLineEntry,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

type PdfText = string | Array<string | { text: string; bold?: boolean }>;

export function openDisbursementVoucherPdf(
  values: DisbursementVoucherFormValues,
) {
  pdfMake.createPdf(createDisbursementVoucherPdfDefinition(values)).open();
}

function createDisbursementVoucherPdfDefinition(
  values: DisbursementVoucherFormValues,
): TDocumentDefinitions {
  return {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [28, 24, 28, 24],
    defaultStyle: {
      font: "Roboto",
      fontSize: 8,
      lineHeight: 1.05,
    },
    content: [
      {
        table: {
          widths: ["*"],
          body: [
            [createHeaderTable()],
            [createTitleAndDateRow(values)],
            [createPayeeRow(values)],
            [createPesosRow(values)],
            [createForRow(values)],
            [createSpacerRow()],
            [createEntriesTable(values)],
            [createApprovalTable(values)],
            [createPaymentReceivedRow()],
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
  values: DisbursementVoucherFormValues,
): TableCell {
  return {
    table: {
      widths: ["*", 220],
      body: [
        [
          {
            text: "DISBURSEMENT VOUCHER",
            bold: true,
            fontSize: 18,
            margin: [6, 7, 0, 6],
          },
          {
            text: [
              { text: "Check Voucher Date: ", bold: true },
              formatShortDateLabel(values.voucherDate),
            ],
            margin: [4, 8, 4, 4],
          },
        ],
      ],
    },
    layout: thinGridLayout,
  };
}

function createPayeeRow(values: DisbursementVoucherFormValues): TableCell {
  const checkOrReferenceNo =
    values.paymentDetails.checkNo ||
    values.paymentDetails.paymentReferenceNo ||
    values.invoiceReferenceNo ||
    "-";

  return createTwoColumnInfoRow(
    [{ text: "PAY TO: ", bold: true }, values.vceName || "-"],
    [{ text: "Check/DM No.: ", bold: true }, checkOrReferenceNo],
  );
}

function createPesosRow(values: DisbursementVoucherFormValues): TableCell {
  const totalDebit = getTotalDebit(values);
  const totalCredit = getTotalCredit(values);
  const voucherAmount = Math.max(
    parseMoneyAmount(values.amount),
    totalDebit,
    totalCredit,
  );

  return createTwoColumnInfoRow(
    [{ text: "PESOS: ", bold: true }, formatPesosInWords(voucherAmount)],
    [{ text: "Ref No: ", bold: true }, values.voucherReferenceNo || "-"],
  );
}

function createTwoColumnInfoRow(
  leftText: PdfText,
  rightText: PdfText,
): TableCell {
  return {
    table: {
      widths: ["*", 220],
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

function createForRow(values: DisbursementVoucherFormValues): TableCell {
  return {
    text: [
      { text: "FOR: ", bold: true },
      values.remarks || values.disbursementType || "-",
    ],
    margin: [3, 3, 3, 3],
  };
}

function createSpacerRow(): TableCell {
  return {
    text: "",
    margin: [0, 0, 0, 48],
  };
}

function createEntriesTable(values: DisbursementVoucherFormValues): TableCell {
  const body: TableCell[][] = [
    [
      headerCell("Account"),
      headerCell("Payee"),
      headerCell("Particulars"),
      headerCell("Cost Center"),
      headerCell("Debit", "right"),
      headerCell("Credit", "right"),
    ],
    ...values.lineEntries.map((entry) => createEntryRow(entry, values)),
    [
      {
        text: "Total:",
        bold: true,
        alignment: "right",
        colSpan: 4,
        margin: [3, 3, 3, 3],
      },
      {},
      {},
      {},
      {
        text: formatCurrency(getTotalDebit(values)),
        bold: true,
        alignment: "right",
        margin: [3, 3, 3, 3],
      },
      {
        text: formatCurrency(getTotalCredit(values)),
        bold: true,
        alignment: "right",
        margin: [3, 3, 3, 3],
      },
    ],
  ];

  return {
    table: {
      headerRows: 1,
      widths: [145, 110, "*", 80, 70, 70],
      body,
    },
    layout: thinGridLayout,
  };
}

function createEntryRow(
  entry: DisbursementLineEntry,
  values: DisbursementVoucherFormValues,
): TableCell[] {
  return [
    bodyCell(formatAccountLabel(entry.accountCode, entry.accountName)),
    bodyCell(entry.partyName || entry.partyCode || values.vceName || "-"),
    bodyCell(entry.particulars || "-"),
    bodyCell(entry.responsibilityCenter || values.costCenter || "-"),
    bodyCell(entry.debit ? formatCurrency(entry.debit) : "", "right"),
    bodyCell(entry.credit ? formatCurrency(entry.credit) : "", "right"),
  ];
}

function createApprovalTable(values: DisbursementVoucherFormValues): TableCell {
  return {
    table: {
      widths: ["*", "*", "*", 110],
      body: [
        [
          approvalCell("Prepared by:", values.preparedBy || "-"),
          approvalCell("Verified by:", "-"),
          approvalCell("Approved by:", "-"),
          {
            stack: [
              { text: "DV NO.:", bold: true },
              {
                text: values.voucherNo || "-",
                bold: true,
                fontSize: getVoucherNumberFontSize(values.voucherNo),
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

function createPaymentReceivedRow(): TableCell {
  return {
    text: "PAYMENT RECEIVED BY:",
    margin: [3, 8, 3, 14],
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
    margin: [3, 3, 3, 16],
  };
}

function getTotalDebit(values: DisbursementVoucherFormValues) {
  return values.lineEntries.reduce((total, entry) => total + entry.debit, 0);
}

function getTotalCredit(values: DisbursementVoucherFormValues) {
  return values.lineEntries.reduce((total, entry) => total + entry.credit, 0);
}

function formatAccountLabel(accountCode: string, accountName: string) {
  if (accountCode && accountName) {
    return `${accountCode} - ${accountName}`;
  }

  return accountCode || accountName || "-";
}

function parseMoneyAmount(value: string) {
  const amount = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));

  return Number.isFinite(amount) ? amount : 0;
}

function formatShortDateLabel(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPesosInWords(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "-";
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  const wholePesos = Math.floor(roundedAmount);
  const centavos = Math.round((roundedAmount - wholePesos) * 100);
  const pesoWords = toTitleCase(numberToWords(wholePesos));

  if (centavos > 0) {
    return `${pesoWords} Pesos And ${centavos}/100 Only`;
  }

  return `${pesoWords} Pesos Only`;
}

function numberToWords(value: number): string {
  if (value === 0) {
    return "zero";
  }

  const units = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const scales = ["", "thousand", "million", "billion"];
  const chunks: string[] = [];
  let remaining = Math.floor(value);
  let scaleIndex = 0;

  while (remaining > 0) {
    const chunk = remaining % 1000;

    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk, units, tens);
      const scale = scales[scaleIndex];

      chunks.unshift(scale ? `${chunkWords} ${scale}` : chunkWords);
    }

    remaining = Math.floor(remaining / 1000);
    scaleIndex += 1;
  }

  return chunks.join(" ");
}

function convertHundreds(value: number, units: string[], tens: string[]) {
  const words: string[] = [];
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;

  if (hundreds > 0) {
    words.push(`${units[hundreds]} hundred`);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      words.push(units[remainder]);
    } else {
      const ten = Math.floor(remainder / 10);
      const unit = remainder % 10;

      words.push(unit ? `${tens[ten]} ${units[unit]}` : tens[ten]);
    }
  }

  return words.join(" ");
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
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
