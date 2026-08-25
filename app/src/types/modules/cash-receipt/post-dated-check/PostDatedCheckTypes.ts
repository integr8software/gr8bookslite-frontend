export type PostDatedCheckStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type PostDatedCheckType = "Lodgment" | "Release";
export type PostDatedCheckDetail = {
  id: string;
  lineNumber: number;
  pdcDate: string;
  pdcBank: string;
  pdcNo: string;
  referenceNo: string;
  amount: number;
};
export type PostDatedCheckRecord = {
  id: string;
  branchUnitId: number;
  registryNo: string;
  registryDate: string;
  partyId: string;
  partyCode: string;
  partyName: string;
  type: PostDatedCheckType;
  remarks: string;
  totalAmount: number;
  status: PostDatedCheckStatus;
  details: PostDatedCheckDetail[];
  createdAt: string;
  updatedAt: string;
};
export type PostDatedCheckFormValues = Pick<
  PostDatedCheckRecord,
  "registryNo" | "registryDate" | "partyId" | "partyCode" | "partyName" | "type" | "remarks" | "details"
>;
export type PostDatedCheckParty = { id: string; partyCode: string; partyName: string };
export type PostDatedCheckPermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canApprove: boolean;
  canDisapprove: boolean;
  canClose: boolean;
  canCancel: boolean;
  canExport: boolean;
};
export type PostDatedCheckFormErrors = Partial<Record<"registryNo" | "registryDate" | "partyId" | "type" | "details", string>> & {
  detailErrors?: Record<string, Partial<Record<"pdcDate" | "pdcBank" | "pdcNo" | "referenceNo" | "amount", string>>>;
};
