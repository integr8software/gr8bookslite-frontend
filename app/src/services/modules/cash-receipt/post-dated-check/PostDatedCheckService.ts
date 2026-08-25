import {
  getInitialPostDatedCheckRegistries,
  getPostDatedCheckTotal,
  MockPostDatedCheckParties,
  writeStoredPostDatedCheckRegistries,
} from "@/app/src/data/modules/cash-receipt/post-dated-check/PostDatedCheckData";
import type {
  PostDatedCheckFormValues,
  PostDatedCheckPermissions,
  PostDatedCheckRecord,
  PostDatedCheckStatus,
} from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";

const MockPermissions: PostDatedCheckPermissions = {
  canView: true,
  canCreate: true,
  canUpdate: true,
  canApprove: true,
  canDisapprove: true,
  canClose: true,
  canCancel: true,
  canExport: true,
};

export async function listPostDatedChecks(branchUnitId?: number | null) {
  const registries = getInitialPostDatedCheckRegistries().filter(
    (record) => !branchUnitId || record.branchUnitId === branchUnitId || record.branchUnitId === 1,
  );
  return {
    registries,
    statistics: {
      totalRegistries: registries.length,
      draftRegistries: countStatus(registries, "Draft"),
      approvedRegistries: countStatus(registries, "For Approval"),
      closedRegistries: countStatus(registries, "Posted"),
      disapprovedRegistries: countStatus(registries, "Disapproved"),
      cancelledRegistries: countStatus(registries, "Cancelled"),
    },
    permissions: MockPermissions,
  };
}

export async function getPostDatedCheck(id: string, branchUnitId?: number | null) {
  void branchUnitId;
  const record = getInitialPostDatedCheckRegistries().find((item) => item.id === id);
  if (!record) throw new Error("Post Dated Check not found.");
  return record;
}

export async function getPostDatedCheckParties() {
  return MockPostDatedCheckParties.map((party) => ({ ...party }));
}

export async function getPostDatedCheckNumber(branchUnitId?: number | null) {
  void branchUnitId;
  const nextNumber =
    getInitialPostDatedCheckRegistries().reduce((highest, record) => {
      const value = Number(record.registryNo.match(/(\d+)$/)?.[1] ?? 0);
      return Math.max(highest, value);
    }, 0) + 1;
  return { inputMode: "AUTO", registryNo: `PDC-${new Date().getFullYear()}-${String(nextNumber).padStart(4, "0")}` };
}

export async function createPostDatedCheck(values: PostDatedCheckFormValues, branchUnitId?: number | null) {
  const records = getInitialPostDatedCheckRegistries();
  const now = new Date().toISOString();
  const record: PostDatedCheckRecord = {
    ...values,
    id: `pdc-reg-${Date.now()}`,
    branchUnitId: branchUnitId ?? 1,
    details: values.details.map((detail) => ({ ...detail })),
    totalAmount: getPostDatedCheckTotal(values.details),
    status: "Draft",
    createdAt: now,
    updatedAt: now,
  };
  writeStoredPostDatedCheckRegistries([record, ...records]);
  return record;
}

export async function updatePostDatedCheck(id: string, values: PostDatedCheckFormValues, branchUnitId?: number | null) {
  let updated: PostDatedCheckRecord | undefined;
  const records = getInitialPostDatedCheckRegistries().map((record) => {
    if (record.id !== id) return record;
    updated = {
      ...record,
      ...values,
      branchUnitId: branchUnitId ?? record.branchUnitId,
      details: values.details.map((detail) => ({ ...detail })),
      totalAmount: getPostDatedCheckTotal(values.details),
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (!updated) throw new Error("Post Dated Check not found.");
  writeStoredPostDatedCheckRegistries(records);
  return updated;
}

export async function updatePostDatedCheckStatus(id: string, status: PostDatedCheckStatus) {
  let updated: PostDatedCheckRecord | undefined;
  const records = getInitialPostDatedCheckRegistries().map((record) => {
    if (record.id !== id) return record;
    updated = { ...record, status, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (!updated) throw new Error("Post Dated Check not found.");
  writeStoredPostDatedCheckRegistries(records);
  return updated;
}

function countStatus(records: PostDatedCheckRecord[], status: PostDatedCheckStatus) {
  return records.filter((record) => record.status === status).length;
}
