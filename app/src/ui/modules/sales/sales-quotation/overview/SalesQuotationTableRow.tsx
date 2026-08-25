import {
  formatSalesQuotationCurrency,
  formatSalesQuotationDate,
  getSalesQuotationTotal,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import { SalesQuotationRecordActions } from "@/app/src/ui/modules/sales/sales-quotation/overview/SalesQuotationRecordActions";
import { SalesQuotationStatusBadge } from "@/app/src/ui/modules/sales/sales-quotation/overview/SalesQuotationStatusBadge";

type SalesQuotationTableRowProps = {
  request: SalesQuotationRecord;
  onDeleteRequest: (request: SalesQuotationRecord) => void;
};

export function SalesQuotationTableRow({ request, onDeleteRequest }: SalesQuotationTableRowProps) {
  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      <td className="px-4 py-4 font-semibold">{request.transNo}</td>
      <td className="px-4 py-4">
        <div className="font-medium">{request.partyName}</div>
        <div className="text-xs text-darknavy/55">{request.partyCode}</div>
      </td>
      <td className="px-4 py-4">{formatSalesQuotationDate(request.prDate)}</td>
      <td className="px-4 py-4">
        <SalesQuotationStatusBadge status={request.status} />
      </td>
      <td className="px-4 py-4 text-right font-semibold">{formatSalesQuotationCurrency(getSalesQuotationTotal(request))}</td>
      <td className="px-4 py-4">
        <SalesQuotationRecordActions request={request} onDeleteRequest={onDeleteRequest} />
      </td>
    </tr>
  );
}
