import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
	MaterialRequestHref,
	canApproveMaterialRequestStatus,
	canCancelMaterialRequestStatus,
	canDisapproveMaterialRequestStatus,
	canEditMaterialRequestStatus,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	getMaterialRequestUncancelStatus,
	getMaterialRequestUndoApprovalStatus,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type {
	MaterialRequestRecord,
	MaterialRequestStatus,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type MaterialRequestRecordActionsProps = {
	request: MaterialRequestRecord;
	onDeleteRequest: (request: MaterialRequestRecord) => void;
	onUpdateRequestStatus: (
		request: MaterialRequestRecord,
		status: MaterialRequestStatus,
	) => void;
};

export function MaterialRequestRecordActions({
	request,
	onUpdateRequestStatus,
}: MaterialRequestRecordActionsProps) {
	const isApproved = request.status === "Approved";
	const isDisapproved = request.status === "Disapproved";
	const isCancelled = request.status === "Cancelled";
	const canEdit = canEditMaterialRequestStatus(request.status);
	const approvalUndoStatus = getMaterialRequestUndoApprovalStatus(request);
	const cancelStatus = isCancelled
		? getMaterialRequestUncancelStatus(request)
		: "Cancelled";
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canApproveMaterialRequestStatus(request.status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () =>
				onUpdateRequestStatus(
					request,
					isApproved ? approvalUndoStatus : "Approved",
				),
			type: "button",
		},
		{
			disabled: !canDisapproveMaterialRequestStatus(request.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateRequestStatus(
					request,
					isDisapproved ? approvalUndoStatus : "Disapproved",
				),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelMaterialRequestStatus(request.status),
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Uncancelled" : "Cancel",
			onSelect: () => onUpdateRequestStatus(request, cancelStatus),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
	];

	return (
		<ModuleTableActions className="!justify-center">
			<ModuleTableActionLink
				href={`${MaterialRequestHref}/view/${request.id}`}
				icon={Eye}
				label={`View material request ${request.requestNo}`}
				title="View"
				variant="view"
			/>
			{canEdit ? (
				<ModuleTableActionLink
					href={`${MaterialRequestHref}/edit/${request.id}`}
					icon={Edit3}
					label={`Edit material request ${request.requestNo}`}
					title="Edit"
					variant="edit"
				/>
			) : (
				<ModuleTableActionButton
					disabled
					icon={Edit3}
					label={`Edit material request ${request.requestNo}`}
					title="Edit"
					variant="edit"
				/>
			)}
			<ModuleActionMenu
				className="[&>button]:h-9 [&>button]:w-9"
				items={overflowItems}
				label={`More actions for material request ${request.requestNo}`}
			/>
		</ModuleTableActions>
	);
}
