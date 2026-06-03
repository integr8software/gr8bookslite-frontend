import { ApprovalManagementHref } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import type { ApprovalManagementRecord } from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ApprovalManagementRecordActionsProps = {
	workflow: ApprovalManagementRecord;
	onSetInactive: (workflow: ApprovalManagementRecord) => void;
};

export function ApprovalManagementRecordActions({
	onSetInactive,
	workflow,
}: ApprovalManagementRecordActionsProps) {
	const isInactive = workflow.status === "Inactive";

	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${ApprovalManagementHref}/view/${workflow.id}`}
				label={`View ${workflow.moduleName} approval workflow`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${ApprovalManagementHref}/edit/${workflow.id}`}
				label={`Edit ${workflow.moduleName} approval workflow`}
			/>
			<ModuleTableActionButton
				variant="inactive"
				disabled={isInactive}
				onClick={() => onSetInactive(workflow)}
				label={`Set ${workflow.moduleName} approval workflow as inactive`}
			/>
		</ModuleTableActions>
	);
}
