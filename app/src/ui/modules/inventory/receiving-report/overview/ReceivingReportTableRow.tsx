import {
  formatReceivingReportCurrency,
  formatReceivingReportDate,
  type ReceivingReportRecord,
  type ReceivingReportStatus,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import { ReceivingReportRecordActions } from "@/app/src/ui/modules/inventory/receiving-report/overview/ReceivingReportRecordActions";
import { ReceivingReportStatusBadge } from "@/app/src/ui/modules/inventory/receiving-report/overview/ReceivingReportStatusBadge";

export function ReceivingReportTableRow({
  id,
  onUpdateStatus,
  record,
}: {
  id: string;
  onUpdateStatus: (
    record: ReceivingReportRecord,
    status: ReceivingReportStatus,
  ) => void;
  record: ReceivingReportRecord;
}) {
  return (
    <tr
      key={id}
      className="module-table-row border-b border-darknavy/8 last:border-b-0"
    >
      <td className="px-4 py-4 font-semibold text-skyblue">
        {record.transactionNo}
      </td>
      <td className="px-4 py-4">
        {formatReceivingReportDate(record.documentDate)}
      </td>
      <td className="px-4 py-4">{record.vceName}</td>
      <td className="px-4 py-4">{record.vceCode}</td>
      <td className="px-4 py-4">{record.poNo}</td>
      <td className="px-4 py-4">{record.warehouse}</td>
      <td className="px-4 py-4 font-semibold text-darknavy">
        {formatReceivingReportCurrency(record.netAmount)}
      </td>
      <td className="px-4 py-4">
        <ReceivingReportStatusBadge status={record.status} />
      </td>
      <td className="px-4 py-4 text-center">
        <ReceivingReportRecordActions
          record={record}
          onUpdateStatus={onUpdateStatus}
        />
      </td>
    </tr>
  );
}
