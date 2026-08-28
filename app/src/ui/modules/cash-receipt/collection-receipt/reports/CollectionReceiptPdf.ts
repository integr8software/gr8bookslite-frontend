import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  calculateCollectionReceiptTotals,
  formatCollectionReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import type { CollectionReceiptFormValues } from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openCollectionReceiptPdf(values: CollectionReceiptFormValues) {
  pdfMake.createPdf(createCollectionReceiptPdfDefinition(values)).open();
}

function createCollectionReceiptPdfDefinition(values: CollectionReceiptFormValues): TDocumentDefinitions {
  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [26, 22, 26, 22],
    defaultStyle: {
      font: "Roboto",
      fontSize: 8,
      lineHeight: 1.05,
    },
    content: [
      {
        table: {
          widths: [170, "*"],
          body: [[createPaymentTable(values), createReceiptBody(values)]],
        },
        layout: noBordersLayout,
      },
    ],
  };
}

function createPaymentTable(values: CollectionReceiptFormValues): TableCell {
  const totals = calculateCollectionReceiptTotals(values.lineEntries);
  const receiptAmount = Math.max(totals.credit, totals.debit);
  const paymentType = values.paymentType.toLowerCase();
  const cashAmount = paymentType.includes("cash") ? receiptAmount : 0;
  const checkAmount = paymentType.includes("check") ? receiptAmount : 0;
  const rows = createPaymentRows(values, receiptAmount);

  return {
    table: {
      widths: ["*", 70],
      body: [
        [
          {
            text: "IN PAYMENT OF",
            bold: true,
            alignment: "center",
            colSpan: 2,
            margin: [2, 4, 2, 4],
          },
          {},
        ],
        [leftHeaderCell("PARTICULARS"), leftHeaderCell("AMOUNT", "right")],
        ...rows.map((row) => [leftBodyCell(row.particulars), leftBodyCell(row.amount, "right")]),
        [leftHeaderCell("TOTAL AMOUNT DUE"), leftBodyCell(formatCollectionReceiptAmount(receiptAmount), "right")],
        [
          {
            text: "FORM OF PAYMENT",
            bold: true,
            alignment: "center",
            colSpan: 2,
            margin: [2, 3, 2, 3],
          },
          {},
        ],
        [leftHeaderCell("[ ]  CASH PAYMENT"), leftBodyCell(formatCollectionReceiptAmount(cashAmount), "right")],
        [leftHeaderCell("[ ]  CHECK PAYMENT"), leftBodyCell(formatCollectionReceiptAmount(checkAmount), "right")],
        [leftHeaderCell("CHECK NO."), leftBodyCell("")],
        [leftHeaderCell("BANK/BRANCH"), leftBodyCell("")],
        [leftHeaderCell("CHECK DATE"), leftBodyCell("")],
      ],
    },
    layout: thinGridLayout,
    margin: [0, 5, 8, 0],
  };
}

function createReceiptBody(values: CollectionReceiptFormValues): TableCell {
  const totals = calculateCollectionReceiptTotals(values.lineEntries);
  const receiptAmount = Math.max(totals.credit, totals.debit);
  const primaryParticular = values.remarks || values.lineEntries.find((entry) => entry.collectionType.trim())?.collectionType || "-";

  return {
    stack: [
      createHeader(),
      {
        columns: [
          {
            text: "COLLECTION RECEIPT",
            bold: true,
            fontSize: 11,
            margin: [0, 24, 0, 0],
          },
          {
            text: `No. ${formatReceiptNo(values.receiptNo)}`,
            bold: true,
            fontSize: 13,
            alignment: "right",
            margin: [0, 0, 0, 0],
          },
        ],
      },
      {
        columns: [
          { text: "", width: "*" },
          { text: "Date", width: 28, margin: [0, 8, 0, 0] },
          underlineText(formatAutoReceiptDate(), 118, "center"),
        ],
      },
      receiptLine("Received from", values.customerName),
      receiptLine("Address", ""),
      {
        columns: [{ text: "TIN:", width: 30 }, underlineText("", "*"), { text: "Business Style", width: 82 }, underlineText("", "*")],
        margin: [0, 6, 0, 0],
      },
      receiptLine("the amount of", formatAmountInWords(receiptAmount)),
      {
        columns: [
          { text: "", width: "*" },
          underlineText("", 210),
          { text: "( P", width: 18 },
          underlineText(formatCollectionReceiptAmount(receiptAmount), 110, "center"),
          { text: ")", width: 10 },
        ],
        margin: [0, 10, 0, 0],
      },
      {
        columns: [{ text: "as partial/full payment of", width: 126 }, underlineText(primaryParticular, "*", "center")],
        margin: [0, 26, 0, 0],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 500,
            y2: 0,
            lineWidth: 0.5,
          },
        ],
        margin: [0, 18, 0, 0],
      },
      {
        columns: [
          { text: "", width: "*" },
          {
            stack: [
              underlineText(values.status === "Approved" ? "Admin Admin" : "", "*", "center"),
              {
                text: "Authorized Signature",
                alignment: "center",
                fontSize: 7,
              },
            ],
            width: 130,
            margin: [0, 28, 0, 0],
          },
        ],
      },
      {
        text: '"THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAX"',
        bold: true,
        decoration: "underline",
        alignment: "center",
        margin: [0, 16, 0, 0],
      },
    ],
    margin: [0, 0, 0, 0],
  } as TableCell;
}

function createHeader(): Content {
  return {
    columns: [
      {
        text: "LOGO",
        color: "#16844b",
        bold: true,
        alignment: "center",
        width: 100,
        margin: [0, 8, 0, 0],
      },
      {
        stack: [
          {
            text: "Your Company Name Here",
            bold: true,
            fontSize: 11,
            alignment: "center",
          },
          {
            text: "VAT REG TIN : 000-000-000-000",
            alignment: "center",
            fontSize: 7,
            margin: [0, 4, 0, 0],
          },
          {
            text: "Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District",
            alignment: "center",
            fontSize: 7,
            margin: [0, 4, 0, 0],
          },
          {
            text: "Telephone No: 0967-237-4514",
            alignment: "center",
            fontSize: 7,
            margin: [0, 14, 0, 0],
          },
        ],
        width: "*",
      },
    ],
  };
}

function receiptLine(label: string, value: string): Content {
  return {
    columns: [{ text: label, width: 78 }, underlineText(value || "", "*")],
    margin: [0, 8, 0, 0],
  } as Content;
}

function underlineText(text: string, width: number | "*", alignment: "left" | "center" | "right" = "left"): Content {
  return {
    width,
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: text || " ",
            alignment,
            margin: [2, 0, 2, 1],
          },
        ],
      ],
    },
    layout: underlineLayout,
  } as Content;
}

function createPaymentRows(values: CollectionReceiptFormValues, receiptAmount: number) {
  const populatedRows = values.lineEntries
    .filter((entry) => entry.collectionType || entry.referenceNo)
    .map((entry, index) => ({
      particulars: entry.collectionType || entry.referenceNo || "-",
      amount: index === 0 ? formatCollectionReceiptAmount(receiptAmount) : formatCollectionReceiptAmount(0),
    }));
  const rows = populatedRows.length ? populatedRows : [{ particulars: "", amount: formatCollectionReceiptAmount(receiptAmount) }];

  return [
    ...rows,
    ...Array.from({ length: Math.max(0, 7 - rows.length) }, () => ({
      particulars: "",
      amount: "",
    })),
  ].slice(0, 7);
}

function leftHeaderCell(text: string, alignment: "left" | "right" = "left"): TableCell {
  return {
    text,
    bold: true,
    alignment,
    margin: [2, 3, 2, 3],
  };
}

function leftBodyCell(text: string, alignment: "left" | "right" = "left"): TableCell {
  return {
    text,
    alignment,
    margin: [2, 3, 2, 8],
  };
}

function formatReceiptNo(value: string) {
  const numeric = value.replace(/\D/g, "");

  return numeric ? numeric.slice(-6).padStart(6, "0") : value || "-";
}

function formatAutoReceiptDate() {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function formatAmountInWords(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "-";
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  const wholePesos = Math.floor(roundedAmount);
  const centavos = Math.round((roundedAmount - wholePesos) * 100);
  const pesoWords = toTitleCase(numberToWords(wholePesos));

  return `${pesoWords} And ${centavos.toString().padStart(2, "0")} / 100`;
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
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
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

const noBordersLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
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

const underlineLayout = {
  hLineWidth: (lineIndex: number) => (lineIndex === 1 ? 0.5 : 0),
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};
