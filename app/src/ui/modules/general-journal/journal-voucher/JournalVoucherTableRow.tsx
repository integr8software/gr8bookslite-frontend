import { CalendarDays } from "lucide-react";
import { JournalVoucherHref } from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import {
  formatJournalVoucherAmount,
  getJournalVoucherTotals,
} from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import type { JournalVoucherRecord } from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type JournalVoucherTableRowProps = {
  record: JournalVoucherRecord;
  onDeleteRecord: (record: JournalVoucherRecord) => void;
};

export function JournalVoucherTableRow({
  record,
  onDeleteRecord,
}: JournalVoucherTableRowProps) {
  const totals = getJournalVoucherTotals(record.lines);

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      <td className="px-4 py-4 font-semibold">{record.transactionNo}</td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-skyblue" aria-hidden="true" />
          {record.documentDate}
        </span>
      </td>
      <td className="px-4 py-4">
        <p className="line-clamp-2 max-w-[22rem] text-sm text-darknavy/75">
          {record.remarks || "No remarks"}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className="font-medium">{record.currencyType}</div>
        <div className="text-xs text-darknavy/55">
          Exchange Rate {formatJournalVoucherAmount(record.currencyRate)}
        </div>
      </td>
      <td className="px-4 py-4 text-right font-semibold tabular-nums">
        {formatJournalVoucherAmount(totals.totalDebit)}
      </td>
      <td className="px-4 py-4 text-right font-semibold tabular-nums">
        {formatJournalVoucherAmount(totals.totalCredit)}
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
          {record.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <ModuleTableActions>
          <ModuleTableActionLink
            variant="view"
            href={`${JournalVoucherHref}/view/${record.id}`}
            label={`View journal voucher ${record.transactionNo}`}
          />
          <ModuleTableActionLink
            variant="edit"
            href={`${JournalVoucherHref}/edit/${record.id}`}
            label={`Edit journal voucher ${record.transactionNo}`}
          />
          <ModuleTableActionButton
            variant="delete"
            onClick={() => onDeleteRecord(record)}
            label={`Delete journal voucher ${record.transactionNo}`}
          />
        </ModuleTableActions>
      </td>
    </tr>
  );
}
