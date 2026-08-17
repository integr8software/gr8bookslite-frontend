import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { calculatePettyCashFundReplenishmentTotals } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import type { PettyCashFundReplenishmentFormValues } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openPettyCashFundReplenishmentPdf(values: PettyCashFundReplenishmentFormValues) {
  pdfMake.createPdf(createPdfDefinition(values)).open();
}

function createPdfDefinition(values: PettyCashFundReplenishmentFormValues): TDocumentDefinitions {
  const totals = calculatePettyCashFundReplenishmentTotals(values.entries);
  const rows: TableCell[][] = values.entries.map((entry) => [formatDate(entry.pettyCashDate), entry.pettyCashNo, entry.accountTitle, { text: formatCurrency(Number(entry.totalAmount.replace(/,/g, "")) || 0), alignment: "right" }]);
  return { pageSize: "A4", pageMargins: [32, 32, 32, 32], defaultStyle: { font: "Roboto", fontSize: 9 }, content: [
    { text: "PETTY CASH FUND REPLENISHMENT", alignment: "center", bold: true, fontSize: 18 },
    { text: values.transactionNo, alignment: "center", margin: [0, 4, 0, 20] },
    { columns: [{ text: [{ text: "Party: ", bold: true }, values.partyName] }, { text: [{ text: "Document Date: ", bold: true }, formatDate(values.documentDate)] }, { text: [{ text: "Total Amount: ", bold: true }, formatCurrency(totals.totalAmount)] }], margin: [0, 0, 0, 16] },
    { table: { headerRows: 1, widths: [65, 100, "*", 80], body: [["Date", "Petty Cash No.", "Account Title", "Total Amount"], ...rows] } },
    { text: [{ text: "Remarks: ", bold: true }, values.remarks], margin: [0, 16, 0, 0] },
  ] };
}
