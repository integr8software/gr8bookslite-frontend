import { FileText } from "lucide-react";
import { MaterialRequestHref } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import type { MaterialRequestRecord } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type MaterialRequestRecordActionsProps = {
	request: MaterialRequestRecord;
	onDeleteRequest: (request: MaterialRequestRecord) => void;
};

export function MaterialRequestRecordActions({
	request,
	onDeleteRequest,
}: MaterialRequestRecordActionsProps) {
	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${MaterialRequestHref}/view/${request.id}`}
				label={`View material request ${request.requestNo}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${MaterialRequestHref}/edit/${request.id}`}
				label={`Edit material request ${request.requestNo}`}
			/>
			<ModuleTableActionLink
				icon={FileText}
				href={`${MaterialRequestHref}/view/${request.id}`}
				label={`Open material request ${request.requestNo}`}
			/>
			<ModuleTableActionButton
				variant="delete"
				onClick={() => onDeleteRequest(request)}
				label={`Delete material request ${request.requestNo}`}
			/>
		</ModuleTableActions>
	);
}
