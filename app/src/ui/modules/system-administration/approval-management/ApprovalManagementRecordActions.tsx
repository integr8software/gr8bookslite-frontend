import Link from "next/link";
import { CircleOff, Edit3, Eye } from "lucide-react";
import { ApprovalManagementHref } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import type { ApprovalManagementRecord } from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

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
		<div className="flex items-center gap-1">
			<Link
				href={`${ApprovalManagementHref}/view/${workflow.id}`}
				aria-label={`View ${workflow.moduleName} approval workflow`}
				className={tableActionClassName}
			>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</Link>
			<Link
				href={`${ApprovalManagementHref}/edit/${workflow.id}`}
				aria-label={`Edit ${workflow.moduleName} approval workflow`}
				className={tableActionClassName}
			>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</Link>
			<button
				type="button"
				disabled={isInactive}
				onClick={() => onSetInactive(workflow)}
				aria-label={`Set ${workflow.moduleName} approval workflow as inactive`}
				className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
			>
				<CircleOff className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";
