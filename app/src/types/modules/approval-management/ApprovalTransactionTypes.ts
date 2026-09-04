export type ApprovalTransactionApiRecord = {
  amount: string;
  approvers: Array<{
    approvedAt: string | null;
    name: string;
    remarks?: string | null;
    sequence: number;
    status: string;
    userId: number;
  }>;
  blockerName?: string | null;
  canUpdateStatus: boolean;
  isSequential: boolean;
  currentApproverId?: number | null;
  id: string;
  moduleName: string;
  moduleScope: string;
  referenceNo: string;
  remarks: string;
  requestedAt: string;
  ruleId: string;
  ruleName: string;
  status: string;
};

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
  remarks: string;
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
