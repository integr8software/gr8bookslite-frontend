import { CalendarDays } from "lucide-react";
import { BeginningBalanceUploaderHref } from "@/app/src/constants/modules/others/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import {
  formatBeginningBalanceAmount,
  getBeginningBalanceUploaderTotals,
} from "@/app/src/data/modules/others/beginning-balance-uploader/BeginningBalanceUploaderData";
import type { BeginningBalanceUploaderRecord } from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function BeginningBalanceUploaderTableRow({
  record,
  onDeleteRecord,
}: {
  record: BeginningBalanceUploaderRecord;
  onDeleteRecord: (record: BeginningBalanceUploaderRecord) => void;
}) {
  const totals = getBeginningBalanceUploaderTotals(record.rows);

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      <td className="px-4 py-4 font-semibold text-skyblue">{record.transactionNumber}</td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-skyblue" aria-hidden="true" />
          {record.documentDate}
        </span>
      </td>
      <td className="max-w-[22rem] px-4 py-4">
        <div className="truncate font-medium text-darknavy">{record.remarks || "No remarks"}</div>
        <div className="text-xs text-darknavy/50">{record.rows.length} detail entries</div>
      </td>
      <td className="px-4 py-4">{record.currencyType}</td>
      <td className="px-4 py-4 text-right font-semibold tabular-nums">
        {formatBeginningBalanceAmount(totals.debit)}
      </td>
      <td className="px-4 py-4">
        <span
          className={joinClasses(
            "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold",
            record.status === "Posted"
              ? "bg-citron/25 text-darknavy"
              : "bg-offwhite text-darknavy/70",
          )}
        >
          {record.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <ModuleTableActions>
          <ModuleTableActionLink
            variant="view"
            href={`${BeginningBalanceUploaderHref}/view/${record.id}`}
            label={`View ${record.transactionNumber}`}
          />
          <ModuleTableActionLink
            variant="edit"
            href={`${BeginningBalanceUploaderHref}/edit/${record.id}`}
            label={`Edit ${record.transactionNumber}`}
          />
          <ModuleTableActionButton
            variant="delete"
            label={`Delete ${record.transactionNumber}`}
            onClick={() => onDeleteRecord(record)}
          />
        </ModuleTableActions>
      </td>
    </tr>
  );
}
