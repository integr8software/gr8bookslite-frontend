import {
	formatMaterialRequestDate,
	getMaterialRequestItemSummary,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type {
	MaterialRequestRecord,
	MaterialRequestStatus,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { MaterialRequestRecordActions } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestRecordActions";
import { MaterialRequestStatusBadge } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestStatusBadge";

type MaterialRequestTableRowProps = {
	request: MaterialRequestRecord;
	onDeleteRequest: (request: MaterialRequestRecord) => void;
	onUpdateRequestStatus: (
		request: MaterialRequestRecord,
		status: MaterialRequestStatus,
	) => void;
};

export function MaterialRequestTableRow({
	request,
	onDeleteRequest,
	onUpdateRequestStatus,
}: MaterialRequestTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold text-skyblue">
				{request.requestNo}
			</td>
			<td className="px-4 py-4">
				{formatMaterialRequestDate(request.documentDate)}
			</td>
			<td className="px-4 py-4">{request.toWarehouse}</td>
			<td className="px-4 py-4">
				{getMaterialRequestItemSummary(request)}
			</td>
			<td className="px-4 py-4">
				<MaterialRequestStatusBadge status={request.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<MaterialRequestRecordActions
					request={request}
					onDeleteRequest={onDeleteRequest}
					onUpdateRequestStatus={onUpdateRequestStatus}
				/>
			</td>
		</tr>
	);
}
