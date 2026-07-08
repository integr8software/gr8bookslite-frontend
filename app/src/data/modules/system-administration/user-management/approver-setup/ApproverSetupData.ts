import { UserListMockData } from "@/app/src/data/modules/system-administration/user-management/users/UserListData";
import type { ApproverSetupRecord } from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";

export const ApproverSetupMockData: ApproverSetupRecord[] = [
	{
		id: "approver-001",
		userIds: ["usr-003", "usr-009"],
		assignmentType: "Level-based",
		levelName: "Finance Review",
		moduleScope: "Disbursement Voucher",
		condition: "Any two approvers",
		sequence: 1,
		status: "Active",
		lastUpdatedBy: "Sin Bad",
		lastUpdatedAt: "2026-07-05",
	},
	{
		id: "approver-002",
		userIds: ["usr-001"],
		assignmentType: "Level-based",
		levelName: "Budget Check",
		moduleScope: "Disbursement Voucher",
		condition: "Any one approver",
		sequence: 2,
		status: "Active",
		lastUpdatedBy: "Sin Bad",
		lastUpdatedAt: "2026-07-08",
	},
	{
		id: "approver-003",
		userIds: ["usr-008", "usr-002"],
		assignmentType: "Level-based",
		levelName: "Management Approval",
		moduleScope: "Disbursement Voucher",
		condition: "Any two approvers",
		sequence: 3,
		status: "Active",
		lastUpdatedBy: "Sin Bad",
		lastUpdatedAt: "2026-07-08",
	},
	{
		id: "approver-004",
		userIds: UserListMockData.map((user) => user.id),
		assignmentType: "Level-based",
		levelName: "Budget Check",
		moduleScope: "Purchase Request",
		condition: "All approvers",
		sequence: 2,
		status: "Active",
		lastUpdatedBy: "Sin Bad",
		lastUpdatedAt: "2026-07-05",
	},
	{
		id: "approver-005",
		userIds: ["usr-001"],
		assignmentType: "No condition",
		levelName: "Management Approval",
		moduleScope: "All cash disbursement modules",
		condition: "Any one approver",
		sequence: 3,
		status: "Active",
		lastUpdatedBy: "Andy Reyes",
		lastUpdatedAt: "2026-06-30",
	},
	{
		id: "approver-006",
		userIds: ["usr-008"],
		assignmentType: "Temporary",
		levelName: "Department Review",
		moduleScope: "Purchase Request",
		condition: "Any one approver",
		sequence: 1,
		effectiveFrom: "2026-07-08",
		effectiveTo: "2026-07-19",
		status: "Scheduled",
		lastUpdatedBy: "Sin Bad",
		lastUpdatedAt: "2026-07-08",
	},
];

export function getApproverSetupUser(userId: string) {
	return UserListMockData.find((user) => user.id === userId);
}

export function getApproverSetupInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}
