import { ApprovalManagementModuleOptions } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import { UserListMockData } from "@/app/src/data/modules/system-administration/user-management/users/UserListData";
import type {
	ApprovalApproverOption,
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalManagementRecord,
	ApprovalStageFormValues,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

export const ApprovalApproverOptions: ApprovalApproverOption[] =
	UserListMockData.filter((user) => user.status === "Active").map((user) => ({
		email: user.email,
		id: user.id,
		name: user.name,
		role: user.userRole,
		status: user.status,
	}));

export const MockApprovalManagementWorkflows: ApprovalManagementRecord[] = [
	{
		id: "approval-dv",
		moduleCode: "DV",
		moduleName: "Disbursement Voucher",
		stageCount: 2,
		stages: [
			{
				id: "approval-dv-stage-1",
				sequence: 1,
				name: "Finance Review",
				approverIds: ["usr-003", "usr-009"],
				requirement: "any",
			},
			{
				id: "approval-dv-stage-2",
				sequence: 2,
				name: "Management Approval",
				approverIds: ["usr-001"],
				requirement: "all",
			},
		],
		status: "Active",
		description: "Standard approval flow for disbursement vouchers.",
		updatedAt: "2026-05-22T08:35:00.000Z",
	},
	{
		id: "approval-pr",
		moduleCode: "PR",
		moduleName: "Purchase Request",
		stageCount: 3,
		stages: [
			{
				id: "approval-pr-stage-1",
				sequence: 1,
				name: "Department Review",
				approverIds: ["usr-002", "usr-008"],
				requirement: "any",
			},
			{
				id: "approval-pr-stage-2",
				sequence: 2,
				name: "Budget Check",
				approverIds: ["usr-003", "usr-009"],
				requirement: "all",
			},
			{
				id: "approval-pr-stage-3",
				sequence: 3,
				name: "Final Approval",
				approverIds: ["usr-001"],
				requirement: "all",
			},
		],
		status: "Active",
		description: "Purchase requests pass through department, budget, and final review.",
		updatedAt: "2026-05-21T15:10:00.000Z",
	},
	{
		id: "approval-jv",
		moduleCode: "JV",
		moduleName: "Journal Voucher",
		stageCount: 1,
		stages: [
			{
				id: "approval-jv-stage-1",
				sequence: 1,
				name: "Accounting Approval",
				approverIds: ["usr-003", "usr-009"],
				requirement: "any",
			},
		],
		status: "Inactive",
		description: "Previous journal voucher approval rule.",
		updatedAt: "2026-05-18T11:42:00.000Z",
	},
];

export function createApprovalManagementInitialFormValues(): ApprovalManagementFormValues {
	const stageCount = 2;

	return {
		moduleCode: "",
		stageCount,
		stages: createApprovalStagesForCount([], stageCount),
		status: "Active",
		description: "",
	};
}

export function createApprovalManagementFormValues(
	record: ApprovalManagementRecord,
): ApprovalManagementFormValues {
	return {
		moduleCode: record.moduleCode,
		stageCount: record.stageCount,
		stages: record.stages.map((stage) => ({ ...stage })),
		status: record.status,
		description: record.description,
	};
}

export function createApprovalStagesForCount(
	currentStages: ApprovalStageFormValues[],
	stageCount: number,
): ApprovalStageFormValues[] {
	return Array.from({ length: stageCount }, (_, index) => {
		const existingStage = currentStages[index];

		if (existingStage) {
			return {
				...existingStage,
				sequence: index + 1,
				name: existingStage.name || `Stage ${index + 1}`,
			};
		}

		return createApprovalStage(index + 1);
	});
}

export function createApprovalManagementRecord(
	values: ApprovalManagementFormValues,
): ApprovalManagementRecord {
	const moduleCode = values.moduleCode || "DV";

	return {
		id: `approval-${Date.now()}`,
		moduleCode,
		moduleName: getApprovalManagementModuleName(moduleCode),
		stageCount: values.stageCount,
		stages: normalizeApprovalStages(values.stages),
		status: values.status,
		description: values.description.trim(),
		updatedAt: new Date().toISOString(),
	};
}

export function updateApprovalManagementRecord(
	record: ApprovalManagementRecord,
	values: ApprovalManagementFormValues,
): ApprovalManagementRecord {
	const moduleCode = values.moduleCode || record.moduleCode;

	return {
		...record,
		moduleCode,
		moduleName: getApprovalManagementModuleName(moduleCode),
		stageCount: values.stageCount,
		stages: normalizeApprovalStages(values.stages),
		status: values.status,
		description: values.description.trim(),
		updatedAt: new Date().toISOString(),
	};
}

export function getApprovalManagementModuleName(
	moduleCode: ApprovalManagementModuleCode,
) {
	return (
		ApprovalManagementModuleOptions.find((option) => option.code === moduleCode)
			?.name ?? moduleCode
	);
}

function createApprovalStage(sequence: number): ApprovalStageFormValues {
	return {
		id: `approval-stage-${Date.now()}-${sequence}`,
		sequence,
		name: `Stage ${sequence}`,
		approverIds: [],
		requirement: "any",
	};
}

function normalizeApprovalStages(stages: ApprovalStageFormValues[]) {
	return stages.map((stage, index) => ({
		...stage,
		sequence: index + 1,
		name: stage.name.trim() || `Stage ${index + 1}`,
		approverIds: Array.from(new Set(stage.approverIds)),
	}));
}
