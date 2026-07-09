import { UsersRound } from "lucide-react";
import { ApproverSetupMockData } from "@/app/src/data/modules/system-administration/user-management/approver-setup/ApproverSetupData";
import type { ApproverAssignmentType } from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import {
	ApprovalManagementField,
	approvalManagementFieldClassName,
} from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementEditorFields";
import { ApprovalManagementLevelCard } from "@/app/src/ui/modules/system-administration/approval-management/approval-levels/ApprovalManagementLevelCard";

const approvalManagementApproverTypeOptions: ApproverAssignmentType[] = [
	"Level-based",
	"No condition",
	"Temporary",
];

type ApprovalManagementLevelsProps = {
	moduleName: string;
	selectedApproverType: ApproverAssignmentType | "";
	stageCount: number;
	onApproverTypeChange: (type: ApproverAssignmentType | "") => void;
};

export function ApprovalManagementLevels({
	moduleName,
	onApproverTypeChange,
	selectedApproverType,
	stageCount,
}: ApprovalManagementLevelsProps) {
	const visibleSetupRecords = selectedApproverType
		? getVisibleApproverSetupRecords(
				moduleName,
				selectedApproverType,
				stageCount,
			)
		: [];

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="flex items-center gap-2 border-b border-darknavy/10 px-4 py-3">
				<UsersRound
					className="h-4 w-4 text-darknavy/55"
					aria-hidden="true"
				/>
				<h3 className="text-base font-semibold text-darknavy">
					Approval Levels
				</h3>
			</div>
			<div className="grid gap-4 p-4">
				<ApprovalManagementField label="Select Approver Type">
					<select
						value={selectedApproverType}
						onChange={(event) =>
							onApproverTypeChange(
								event.target.value as
									| ApproverAssignmentType
									| "",
							)
						}
						className={approvalManagementFieldClassName}
					>
						<option value="">Select approver type</option>
						{approvalManagementApproverTypeOptions.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</ApprovalManagementField>
				{selectedApproverType ? (
					visibleSetupRecords.length > 0 ? (
						<div className="grid gap-3">
							{visibleSetupRecords.map((record) => (
								<ApprovalManagementLevelCard
									key={record.id}
									record={record}
								/>
							))}
						</div>
					) : (
						<div className="rounded-md border border-darknavy/10 bg-offwhite/45 px-4 py-3 text-sm font-medium text-darknavy/55">
							No approver setup has been assigned for this type
							and workflow yet.
						</div>
					)
				) : null}
			</div>
		</section>
	);
}

function getVisibleApproverSetupRecords(
	moduleName: string,
	selectedApproverType: ApproverAssignmentType,
	stageCount: number,
) {
	const normalizedModuleName = normalizeApprovalSetupText(moduleName);

	return ApproverSetupMockData.filter((record) => {
		if (
			record.assignmentType !== selectedApproverType ||
			record.status === "Expired" ||
			record.sequence > stageCount
		) {
			return false;
		}

		const normalizedScope = normalizeApprovalSetupText(record.moduleScope);

		return (
			normalizedScope === normalizedModuleName ||
			normalizedScope.includes(normalizedModuleName) ||
			normalizedModuleName.includes(normalizedScope)
		);
	}).sort((firstRecord, secondRecord) => {
		if (firstRecord.sequence !== secondRecord.sequence) {
			return firstRecord.sequence - secondRecord.sequence;
		}

		return firstRecord.levelName.localeCompare(secondRecord.levelName);
	});
}

function normalizeApprovalSetupText(value: string) {
	return value.trim().toLowerCase().replaceAll(/\s+/g, " ");
}
