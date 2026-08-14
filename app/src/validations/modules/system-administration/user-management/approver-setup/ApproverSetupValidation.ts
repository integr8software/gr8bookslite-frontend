import type {
	ApproverCondition,
	ApproverSetupFormValues,
	ApproverSetupUser,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import {
	ApproverConditionLabels,
	ApproverSetupMaxApprovers,
} from "@/app/src/constants/modules/system-administration/user-management/approver-setup/ApproverSetupConstants";

export function getApproverConditionLimit(
	condition: ApproverCondition,
	users: ApproverSetupUser[] = [],
) {
	if (condition === "Any one approver") {
		return 1;
	}

	if (condition === "Any two approvers") {
		return 2;
	}

	return Math.min(users.length, ApproverSetupMaxApprovers);
}

export function normalizeSelectedApproverIds(
	condition: ApproverCondition,
	userIds: string[],
	users: ApproverSetupUser[] = [],
) {
	if (condition === "All approvers") {
		return users.slice(0, ApproverSetupMaxApprovers).map((user) => user.id);
	}

	return userIds.slice(0, getApproverConditionLimit(condition, users));
}

export function getApproverSelectionError(
	values: ApproverSetupFormValues,
	users: ApproverSetupUser[] = [],
) {
	if (users.length === 0) {
		return "Approver users are still loading. Please try again.";
	}

	const requiredCount = getApproverConditionLimit(values.condition, users);

	if (values.condition === "All approvers") {
		return values.userIds.length === requiredCount
			? ""
			: `Select all ${requiredCount} approvers for this condition.`;
	}

	if (values.userIds.length !== requiredCount) {
		return `${ApproverConditionLabels[values.condition]} requires exactly ${requiredCount} selected approver${requiredCount === 1 ? "" : "s"}.`;
	}

	return "";
}

export function getApproverConditionHelpText(
	condition: ApproverCondition,
	users: ApproverSetupUser[] = [],
) {
	if (condition === "All approvers") {
		return `Up to ${ApproverSetupMaxApprovers} users are automatically selected for this condition.`;
	}

	return `Select exactly ${getApproverConditionLimit(condition, users)} approver${condition === "Any one approver" ? "" : "s"} for this condition.`;
}
