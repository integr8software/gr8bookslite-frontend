import type {
	ApprovalManagementModuleCode,
	ApprovalManagementStatus,
	ApprovalManagementTableColumnKey,
	ApprovalStageRequirement,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

export const ApprovalManagementHref =
	"/system-administration/approval-management";

export const ApprovalManagementPaginationStorageKey =
	"system-administration.approval-management";

export const ApprovalManagementEditFromParam = "from";
export const ApprovalManagementEditFromViewValue = "view";
export const ApprovalManagementEditFromViewQuery = `${ApprovalManagementEditFromParam}=${ApprovalManagementEditFromViewValue}`;

export const ApprovalManagementModuleCodes = [
	"DV",
	"CR",
	"JV",
	"PR",
	"PO",
	"RR",
] as const satisfies readonly ApprovalManagementModuleCode[];

export const ApprovalManagementModuleOptions = [
	{ code: "DV", name: "Disbursement Voucher" },
	{ code: "CR", name: "Cash Receipt" },
	{ code: "JV", name: "Journal Voucher" },
	{ code: "PR", name: "Purchase Request" },
	{ code: "PO", name: "Purchase Order" },
	{ code: "RR", name: "Receiving Report" },
] as const satisfies ReadonlyArray<{
	code: ApprovalManagementModuleCode;
	name: string;
}>;

export const ApprovalStageCountOptions = [1, 2, 3, 4, 5] as const;

export const ApprovalStageRequirementOptions = [
	{ label: "Any one approver", value: "any" },
	{ label: "All approvers", value: "all" },
] as const satisfies ReadonlyArray<{
	label: string;
	value: ApprovalStageRequirement;
}>;

export const ApprovalManagementStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly ApprovalManagementStatus[];

export const ApprovalManagementTableColumns: Array<
	| {
			key: ApprovalManagementTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "moduleName", label: "Module", className: "w-[17rem]" },
	{ key: "stageCount", label: "Stages", className: "w-[8rem]" },
	{ key: "stageConditions", label: "Condition", className: "w-[22rem]" },
	{ key: "approverSummary", label: "Approvers", className: "w-[24rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "updatedAt", label: "Updated", className: "w-[10rem]" },
	{ id: "actions", label: "Actions", className: "w-[10rem]" },
];
