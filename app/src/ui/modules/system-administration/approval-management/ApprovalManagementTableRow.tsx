import {
	formatApprovalApproverNames,
	formatApprovalStageRequirement,
	formatApprovalWorkflowUpdatedAt,
} from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementFormatters";
import type { ApprovalManagementRecord } from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import { ApprovalManagementRecordActions } from "./ApprovalManagementRecordActions";

type ApprovalManagementTableRowProps = {
	approverNameById: Map<string, string>;
	workflow: ApprovalManagementRecord;
	onSetInactive: (workflow: ApprovalManagementRecord) => void;
};

export function ApprovalManagementTableRow({
	approverNameById,
	onSetInactive,
	workflow,
}: ApprovalManagementTableRowProps) {
	const firstStageApprovers = workflow.stages
		.flatMap((stage) => stage.approverIds)
		.filter((approverId, index, approverIds) => approverIds.indexOf(approverId) === index)
		.slice(0, 4);

	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4">
				<div className="font-semibold text-darknavy">{workflow.moduleName}</div>
				<div className="text-xs text-darknavy/55">{workflow.moduleCode}</div>
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{workflow.stageCount} {workflow.stageCount === 1 ? "stage" : "stages"}
				</span>
			</td>
			<td className="px-4 py-4">
				<div className="grid gap-1">
					{workflow.stages.map((stage) => (
						<span
							key={stage.id}
							className="text-xs font-medium text-darknavy/70"
						>
							Stage {stage.sequence}: {formatApprovalStageRequirement(stage)}
						</span>
					))}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="text-xs font-medium text-darknavy">
					{formatApprovalApproverNames(firstStageApprovers, approverNameById)}
				</div>
				<div className="mt-1 text-xs text-darknavy/45">
					{workflow.stages.reduce(
						(total, stage) => total + stage.approverIds.length,
						0,
					)}{" "}
					stage assignments
				</div>
			</td>
			<td className="px-4 py-4">
				<span
					className={
						workflow.status === "Active"
							? "inline-flex rounded-full bg-citron/30 px-3 py-1 text-xs font-semibold text-darknavy"
							: "inline-flex rounded-full bg-darknavy/8 px-3 py-1 text-xs font-semibold text-darknavy/55"
					}
				>
					{workflow.status}
				</span>
			</td>
			<td className="px-4 py-4 text-xs font-medium text-darknavy/65">
				{formatApprovalWorkflowUpdatedAt(workflow.updatedAt)}
			</td>
			<td className="px-4 py-4">
				<ApprovalManagementRecordActions
					workflow={workflow}
					onSetInactive={onSetInactive}
				/>
			</td>
		</tr>
	);
}
