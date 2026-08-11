import type { ApprovalTransactionApiRecord } from "@/app/src/services/modules/approval-management/ApprovalManagementApi";

export type ApprovalTransactionApprover = ApprovalTransactionApiRecord["approvers"][number];

export type ApprovalTransactionRow = {
	amount: string;
	approvalPath: string;
	canAct: boolean;
	currentApproverName: string;
	id: string;
	moduleName: string;
	moduleScope: string;
	referenceNo: string;
	requestedAt: string;
	ruleId: string;
	ruleName: string;
	statusLabel: string;
	transaction: ApprovalTransactionApiRecord;
};

export type ApprovalTransactionFilters = {
	approverId: string;
	moduleCode: string;
	query: string;
	ruleId: string;
};
