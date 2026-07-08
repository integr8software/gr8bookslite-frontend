import { UserListMockData } from "@/app/src/data/modules/system-administration/user-management/users/UserListData";
import type {
	ApproverCondition,
	ApproverSetupFormValues,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";

export function getApproverConditionLimit(condition: ApproverCondition) {
	if (condition === "Any one approver") {
		return 1;
	}

	if (condition === "Any two approvers") {
		return 2;
	}

	return UserListMockData.length;
}

export function normalizeSelectedApproverIds(
	condition: ApproverCondition,
	userIds: string[],
) {
	if (condition === "All approvers") {
		return UserListMockData.map((user) => user.id);
	}

	return userIds.slice(0, getApproverConditionLimit(condition));
}

export function getApproverSelectionError(values: ApproverSetupFormValues) {
	const requiredCount = getApproverConditionLimit(values.condition);

	if (values.condition === "All approvers") {
		return values.userIds.length === UserListMockData.length
			? ""
			: "All approvers must be selected for this condition.";
	}

	if (values.userIds.length !== requiredCount) {
		return `${values.condition} requires exactly ${requiredCount} selected approver${requiredCount === 1 ? "" : "s"}.`;
	}

	return "";
}

export function getApproverConditionHelpText(condition: ApproverCondition) {
	if (condition === "All approvers") {
		return "All users are automatically selected for this condition.";
	}

	return `Select exactly ${getApproverConditionLimit(condition)} approver${condition === "Any one approver" ? "" : "s"} for this condition.`;
}
