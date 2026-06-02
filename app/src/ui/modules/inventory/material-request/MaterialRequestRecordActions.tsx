import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import { MaterialRequestHref } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
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
	const cancelStatus = isCancelled
		? request.requiresApproval
			? "Draft"
			: "Active"
		: "Cancelled";
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
				request.status === "Approved",
			icon: CheckCircle2,
			label: "Approve",
			onSelect: () => onUpdateRequestStatus(request, "Approved"),
			type: "button",
		},
		{
			disabled:
				!request.requiresApproval ||
				isCancelled ||
				request.status === "Rejected",
			icon: ThumbsDown,
			label: "Disapprove",
			onSelect: () => onUpdateRequestStatus(request, "Rejected"),
			tone: "danger",
			type: "button",
		},
		{
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
