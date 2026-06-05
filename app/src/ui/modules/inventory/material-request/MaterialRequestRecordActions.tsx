import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import { MaterialRequestHref } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import { getMaterialRequestUncancelStatus } from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type {
	MaterialRequestRecord,
	MaterialRequestStatus,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

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
	const isCancelled = request.status === "Cancelled";
	const isApproved = request.status === "Approved";
	const isDisapproved = request.status === "Disapproved";
	const cancelStatus = isCancelled
		? getMaterialRequestUncancelStatus(request)
		: "Cancelled";
	const approvalRevertStatus = request.requiresApproval ? "Pending" : "Active";
	const items: ModuleActionMenuItem[] = [
		{
			href: `${MaterialRequestHref}/view/${request.id}`,
			icon: Eye,
			label: "View",
			type: "link",
		},
		{
			href: `${MaterialRequestHref}/edit/${request.id}`,
			icon: Edit3,
			label: "Edit",
			type: "link",
		},
		{
			disabled:
				!request.requiresApproval ||
				isCancelled ||
				isDisapproved,
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Unapprove" : "Approve",
			onSelect: () =>
				onUpdateRequestStatus(
					request,
					isApproved ? approvalRevertStatus : "Approved",
				),
			type: "button",
		},
		{
			disabled:
				!request.requiresApproval ||
				isCancelled ||
				isApproved,
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapprove" : "Disapprove",
			onSelect: () =>
				onUpdateRequestStatus(
					request,
					isDisapproved ? approvalRevertStatus : "Disapproved",
				),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: isApproved || isDisapproved,
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Uncancel" : "Cancel",
			onSelect: () => onUpdateRequestStatus(request, cancelStatus),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
	];

	return (
		<ModuleTableActions>
			<ModuleActionMenu
				items={items}
				label={`Actions for material request ${request.requestNo}`}
			/>
		</ModuleTableActions>
	);
}
