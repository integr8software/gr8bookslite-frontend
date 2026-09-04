import { OrvalApiClient } from "@/app/src/services/shared/api/OrvalApiClient";
import type {
  ApprovalManagementModuleOption,
  ApprovalManagementRecord,
  ApprovalRoutingRuleRecord,
  ApprovalStageRecord,
} from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";
import type { ApprovalTransactionApiRecord } from "@/app/src/types/modules/approval-management/ApprovalTransactionTypes";

type ApprovalManagementModulesResponse = {
  modules: Array<ApprovalManagementModuleOption & { id: number }>;
};

type ApprovalWorkflowApiRecord = Omit<ApprovalManagementRecord, "routingRules" | "stages"> & {
  routingRules: Array<Omit<ApprovalRoutingRuleRecord, "stageIds"> & { stageIds: string[] }>;
  stages: Array<Omit<ApprovalStageRecord, "approverIds"> & { approverIds: number[] }>;
};

type ApprovalWorkflowsResponse = {
  workflows: ApprovalWorkflowApiRecord[];
};

type UpsertApprovalWorkflowResponse = {
  message: string;
  workflow: ApprovalWorkflowApiRecord;
};

type ApprovalTransactionsResponse = {
  transactions: ApprovalTransactionApiRecord[];
};

export type ApprovalTransactionActionPayload = {
  remarks?: string | null;
  transactionId: string;
};

type UpsertApprovalWorkflowPayload = {
  description: string;
  moduleCode: string;
  moduleName: string;
  routingRules: Array<{
    amountOperator: string;
    amountValue: string;
    basis: string;
    name: string;
    sequence: number;
    stageSequences: number[];
  }>;
  stages: Array<{
    approverIds: number[];
    name: string;
    requirement: string;
    sequence: number;
    sourceApproverSetupId?: string;
  }>;
  status: string;
};

export async function GetApprovalManagementModules() {
  const response = await OrvalApiClient<ApprovalManagementModulesResponse>({
    method: "GET",
    url: "/api/v1/system-administration/approval-management/modules",
  });

  return response.modules.map((module) => ({
    code: module.code,
    name: module.name,
  }));
}

export async function GetApprovalManagementWorkflows() {
  const response = await OrvalApiClient<ApprovalWorkflowsResponse>({
    method: "GET",
    url: "/api/v1/system-administration/approval-management/workflows",
  });

  return response.workflows.map(mapApprovalWorkflowApiRecord);
}

export async function UpsertApprovalManagementWorkflow(workflow: ApprovalManagementRecord) {
  const response = await OrvalApiClient<UpsertApprovalWorkflowResponse>({
    data: createUpsertApprovalWorkflowPayload(workflow),
    method: "PUT",
    url: `/api/v1/system-administration/approval-management/workflows/${encodeURIComponent(workflow.moduleCode)}`,
  });

  return mapApprovalWorkflowApiRecord(response.workflow);
}

export async function InactivateApprovalManagementWorkflow(workflowId: string) {
  const response = await OrvalApiClient<ApprovalWorkflowApiRecord>({
    method: "PATCH",
    url: `/api/v1/system-administration/approval-management/workflows/${encodeURIComponent(workflowId)}/inactivate`,
  });

  return mapApprovalWorkflowApiRecord(response);
}

export async function GetApprovalTransactions() {
  const response = await OrvalApiClient<ApprovalTransactionsResponse>({
    method: "GET",
    url: "/api/v1/system-administration/approval-management/transactions",
  });

  return response.transactions;
}

export async function ApproveApprovalTransaction({ remarks, transactionId }: ApprovalTransactionActionPayload) {
  return OrvalApiClient<ApprovalTransactionApiRecord>({
    data: { remarks },
    method: "POST",
    url: `/api/v1/system-administration/approval-management/transactions/${encodeURIComponent(transactionId)}/approve`,
  });
}

export async function DisapproveApprovalTransaction({ remarks, transactionId }: ApprovalTransactionActionPayload) {
  return OrvalApiClient<ApprovalTransactionApiRecord>({
    data: { remarks },
    method: "POST",
    url: `/api/v1/system-administration/approval-management/transactions/${encodeURIComponent(transactionId)}/disapprove`,
  });
}

function mapApprovalWorkflowApiRecord(workflow: ApprovalWorkflowApiRecord): ApprovalManagementRecord {
  return {
    ...workflow,
    routingRules: workflow.routingRules.map((rule) => ({
      ...rule,
      stageIds: rule.stageIds.map(String),
    })),
    stages: workflow.stages.map((stage) => ({
      ...stage,
      approverIds: stage.approverIds.map(String),
    })),
  };
}

function createUpsertApprovalWorkflowPayload(workflow: ApprovalManagementRecord): UpsertApprovalWorkflowPayload {
  const stageSequenceById = new Map(workflow.stages.map((stage) => [stage.id, stage.sequence]));

  return {
    description: workflow.description,
    moduleCode: workflow.moduleCode,
    moduleName: workflow.moduleName,
    routingRules: workflow.routingRules.map((rule) => ({
      amountOperator: rule.amountOperator,
      amountValue: rule.amountValue,
      basis: rule.basis,
      name: rule.name,
      sequence: rule.sequence,
      stageSequences: rule.stageIds
        .map((stageId) => stageSequenceById.get(stageId))
        .filter((sequence): sequence is number => Boolean(sequence)),
    })),
    stages: workflow.stages.map((stage) => ({
      approverIds: stage.approverIds.map((approverId) => Number(approverId)).filter(Number.isInteger),
      name: stage.name,
      requirement: stage.requirement,
      sequence: stage.sequence,
      sourceApproverSetupId: stage.sourceApproverSetupId ?? getSourceApproverSetupId(stage.id),
    })),
    status: workflow.status,
  };
}

function getSourceApproverSetupId(stageId: string) {
  const sourceId = stageId.startsWith("approval-stage-")
    ? stageId.replace("approval-stage-", "").split("-").slice(0, 5).join("-")
    : stageId;

  return isUuid(sourceId) ? sourceId : undefined;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
