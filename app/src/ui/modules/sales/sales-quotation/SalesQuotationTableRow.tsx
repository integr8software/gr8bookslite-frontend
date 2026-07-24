import { FileText } from "lucide-react";
import { SalesQuotationHref } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import {
	formatSalesQuotationCurrency,
	formatSalesQuotationDate,
	getSalesQuotationTotal,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type SalesQuotationTableRowProps = {
	request: SalesQuotationRecord;
	onDeleteRequest: (request: SalesQuotationRecord) => void;
};

export function SalesQuotationTableRow({
	request,
	onDeleteRequest,
}: SalesQuotationTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{request.transNo}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{request.partyName}</div>
				<div className="text-xs text-darknavy/55">
					{request.partyCode}
				</div>
			</td>
			<td className="px-4 py-4">
				{formatSalesQuotationDate(request.prDate)}
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{request.status}
				</span>
			</td>
			<td className="px-4 py-4 text-right font-semibold">
				{formatSalesQuotationCurrency(
					getSalesQuotationTotal(request),
				)}
			</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${SalesQuotationHref}/view/${request.id}`}
						label={`View sales quotation ${request.transNo}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${SalesQuotationHref}/edit/${request.id}`}
						label={`Edit sales quotation ${request.transNo}`}
					/>
					<ModuleTableActionLink
						icon={FileText}
						href={`${SalesQuotationHref}/view/${request.id}?preview=1`}
						label={`Preview sales quotation ${request.transNo}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDeleteRequest(request)}
						label={`Delete sales quotation ${request.transNo}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
