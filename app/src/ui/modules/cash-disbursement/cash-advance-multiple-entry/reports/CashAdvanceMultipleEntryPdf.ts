import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  calculateCashAdvanceMultipleEntryTotal,
  formatCashAdvanceMultipleEntryAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import type {
  CashAdvanceMultipleEntryFormValues,
  CashAdvanceMultipleEntryItem,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openCashAdvanceMultipleEntryPdf(
  values: CashAdvanceMultipleEntryFormValues,
  responsibilityCenterOptions: AppAdvancedDropdownOption[] = [],
) {
  pdfMake.createPdf(createCashAdvanceMultipleEntryPdfDefinition(values, responsibilityCenterOptions)).open();
}

function createCashAdvanceMultipleEntryPdfDefinition(
  values: CashAdvanceMultipleEntryFormValues,
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
): TDocumentDefinitions {
  const totalAmount = calculateCashAdvanceMultipleEntryTotal(values.items);
  const responsibilityCenterNames = Array.from(
    new Set(
      values.items
        .map((item) => getResponsibilityCenterName(item.responsibilityCenter, responsibilityCenterOptions))
        .filter(Boolean),
    ),
  ).join(", ");

  const itemRows: TableCell[][] = values.items.map((row: CashAdvanceMultipleEntryItem, index: number) => [
    { text: String(index + 1), alignment: "center" },
    { text: row.partyName || "-" },
    { text: getResponsibilityCenterName(row.responsibilityCenter, responsibilityCenterOptions) || "-" },
    { text: row.particulars || "-" },
    { text: formatCashAdvanceMultipleEntryAmount(row.amount), alignment: "right" },
  ]);

  return {
    pageSize: "A4",
    pageMargins: [32, 32, 32, 32],
    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
      lineHeight: 1.15,
    },
    content: [
      {
        table: {
          widths: [100, "*", 100],
          body: [
            [
              {
                text: "integr8",
                color: "#126eb8",
                bold: true,
                fontSize: 24,
                alignment: "center",
                margin: [0, 8, 0, 0],
              },
              {
                stack: [
                  { text: "Your Company Name Here", bold: true, fontSize: 12, alignment: "center" },
                  { text: "VAT REG TIN : 000-000-000", alignment: "center", margin: [0, 4, 0, 0] },
                  {
                    text: "ABC, 123, Sample, Malamig, CITY OF MANDALUYONG, NCR, SECOND DISTRICT",
                    alignment: "center",
                    margin: [0, 4, 0, 0],
                  },
                  { text: "Telephone No: 0967-237-4514", alignment: "center", margin: [0, 8, 0, 0] },
                ],
              },
              { text: "" },
            ],
          ],
        },
        layout: "noBorders",
        margin: [0, 0, 0, 16],
      },
      {
        text: "CASH ADVANCE MULTIPLE ENTRY",
        alignment: "center",
        bold: true,
        fontSize: 16,
        margin: [0, 0, 0, 4],
      },
      {
        text: values.transNo || "-",
        alignment: "center",
        bold: true,
        fontSize: 12,
        margin: [0, 0, 0, 16],
      },
      {
        columns: [
          { text: [{ text: "Party Name: ", bold: true }, values.partyName || "-"] },
          { text: [{ text: "Document Date: ", bold: true }, formatDate(values.documentDate)] },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        columns: [
          { text: [{ text: "Project: ", bold: true }, values.projectRef || values.projectCode || "-"] },
          { text: [{ text: "Total Amount: ", bold: true }, formatCashAdvanceMultipleEntryAmount(totalAmount)] },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        columns: [
          { text: [{ text: "Responsibility Center: ", bold: true }, responsibilityCenterNames || "-"] },
          { text: [{ text: "Status: ", bold: true }, values.status || "-"] },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        text: [{ text: "Remarks: ", bold: true }, values.remarks || "-"],
        margin: [0, 0, 0, 16],
      },
      {
        text: "Cash Advance Entries",
        bold: true,
        fontSize: 11,
        margin: [0, 8, 0, 8],
      },
      {
        table: {
          headerRows: 1,
          widths: [24, "*", 120, "*", 80],
          body: [
            [
              { text: "#", bold: true, alignment: "center" },
              { text: "Party Name", bold: true },
              { text: "Responsibility Center", bold: true },
              { text: "Particulars", bold: true },
              { text: "Amount", bold: true, alignment: "right" },
            ],
            ...itemRows,
            [
              { text: "Total", colSpan: 4, bold: true },
              {},
              {},
              {},
              { text: formatCashAdvanceMultipleEntryAmount(totalAmount), bold: true, alignment: "right" },
            ],
          ],
        },
        layout: {
          hLineWidth: (i: number, node: { table: { body: TableCell[][] } }) =>
            i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: (i: number, node: { table: { body: TableCell[][] } }) =>
            i === 0 || i === 1 || i === node.table.body.length ? "#212738" : "#e2e8f0",
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 0, 0, 24],
      },
      {
        columns: [
          { text: [{ text: "Prepared by:\n\n\n\n", bold: true }, "____________________"] },
          { text: [{ text: "Checked by:\n\n\n\n", bold: true }, "____________________"] },
          { text: [{ text: "Approved by:\n\n\n\n", bold: true }, "____________________"] },
        ],
        margin: [0, 16, 0, 0],
      },
    ],
  };
}

function getResponsibilityCenterName(value: string, options: AppAdvancedDropdownOption[]) {
  if (!value) return "";
  return options.find((option) => option.value === value || option.label === value || option.name === value)?.name ?? value;
}
