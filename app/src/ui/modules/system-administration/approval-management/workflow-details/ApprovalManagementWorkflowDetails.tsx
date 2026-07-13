import type { ChangeEventHandler } from "react";
import { Settings2 } from "lucide-react";
import { ApprovalStageCountOptions } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import type {
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementRecord,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import {
	ApprovalManagementField,
	approvalManagementFieldClassName,
} from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementEditorFields";

type ApprovalManagementWorkflowDetailsProps = {
	errors: ApprovalManagementFormErrors;
	selectedWorkflow: ApprovalManagementRecord;
	values: ApprovalManagementFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
};

export function ApprovalManagementWorkflowDetails({
	errors,
	onInputChange,
	selectedWorkflow,
	values,
}: ApprovalManagementWorkflowDetailsProps) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="flex items-center gap-2 px-4 py-3">
				<Settings2
					className="h-4 w-4 text-darknavy/55"
					aria-hidden="true"
				/>
				<h3 className="text-base font-semibold text-darknavy">
					Workflow Details
				</h3>
			</div>
			<div className="grid gap-4 px-4 pb-4 md:grid-cols-3">
				<ApprovalManagementField
					label="Module"
					error={errors.moduleCode}
				>
					<input
						value={selectedWorkflow.moduleName}
						readOnly
						className={`${approvalManagementFieldClassName} bg-offwhite/65`}
					/>
				</ApprovalManagementField>
				<ApprovalManagementField
					label="Module Code"
					error={errors.moduleCode}
				>
					<input
						value={selectedWorkflow.moduleCode}
						readOnly
						className={`${approvalManagementFieldClassName} bg-offwhite/65 font-mono`}
					/>
				</ApprovalManagementField>
				<ApprovalManagementField
					label="Approval Levels"
					error={errors.stageCount}
				>
					<select
						name="stageCount"
						value={values.stageCount}
						onChange={onInputChange}
						className={approvalManagementFieldClassName}
					>
						{ApprovalStageCountOptions.map((stageCount) => (
							<option key={stageCount} value={stageCount}>
								{stageCount}
							</option>
						))}
					</select>
				</ApprovalManagementField>
			</div>
		</section>
	);
}
