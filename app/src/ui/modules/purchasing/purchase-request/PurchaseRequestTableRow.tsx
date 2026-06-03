import { FileText } from "lucide-react";
import { PurchaseRequestHref } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import {
	formatPurchaseRequestCurrency,
	formatPurchaseRequestDate,
	getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type PurchaseRequestTableRowProps = {
	request: PurchaseRequestRecord;
	onDeleteRequest: (request: PurchaseRequestRecord) => void;
};

export function PurchaseRequestTableRow({
	request,
	onDeleteRequest,
}: PurchaseRequestTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{request.transNo}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{request.vceName}</div>
				<div className="text-xs text-darknavy/55">
					{request.vceCode}
				</div>
			</td>
			<td className="px-4 py-4">
				{formatPurchaseRequestDate(request.prDate)}
			</td>
			<td className="px-4 py-4">{request.purchaseType}</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{request.status}
				</span>
			</td>
			<td className="px-4 py-4 text-right font-semibold">
				{formatPurchaseRequestCurrency(
					getPurchaseRequestTotal(request),
				)}
			</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${PurchaseRequestHref}/view/${request.id}`}
						label={`View purchase request ${request.transNo}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${PurchaseRequestHref}/edit/${request.id}`}
						label={`Edit purchase request ${request.transNo}`}
					/>
					<ModuleTableActionLink
						icon={FileText}
						href={`${PurchaseRequestHref}/view/${request.id}?preview=1`}
						label={`Preview purchase request ${request.transNo}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDeleteRequest(request)}
						label={`Delete purchase request ${request.transNo}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
