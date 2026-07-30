import type {
	ApproverCondition,
	ApproverSetupFormValues,
	ApproverSetupUser,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";

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

	return users.length;
}

export function normalizeSelectedApproverIds(
	condition: ApproverCondition,
	userIds: string[],
	users: ApproverSetupUser[] = [],
) {
	if (condition === "All approvers") {
		return users.map((user) => user.id);
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
		return values.userIds.length === users.length
			? ""
			: "All approvers must be selected for this condition.";
	}

	if (values.userIds.length !== requiredCount) {
		return `${values.condition} requires exactly ${requiredCount} selected approver${requiredCount === 1 ? "" : "s"}.`;
	}

	return "";
}

export function getApproverConditionHelpText(
	condition: ApproverCondition,
	users: ApproverSetupUser[] = [],
) {
	if (condition === "All approvers") {
		return "All users are automatically selected for this condition.";
	}

	return `Select exactly ${getApproverConditionLimit(condition, users)} approver${condition === "Any one approver" ? "" : "s"} for this condition.`;
}
