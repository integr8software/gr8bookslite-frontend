import { UserListMockData } from "@/app/src/data/modules/system-administration/user-management/users/UserListData";
import type { ApproverCondition } from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import {
	getApproverConditionHelpText,
	getApproverConditionLimit,
} from "@/app/src/validations/modules/system-administration/user-management/approver-setup/ApproverSetupValidation";

type ApproverSetupUserCheckboxListProps = {
	condition: ApproverCondition;
	onChange: (userIds: string[]) => void;
	selectedUserIds: string[];
};

export function ApproverSetupUserCheckboxList({
	condition,
	onChange,
	selectedUserIds,
}: ApproverSetupUserCheckboxListProps) {
	const maxApprovers = getApproverConditionLimit(condition);
	const requiresAllApprovers = condition === "All approvers";

	return (
		<div>
			<div className="mb-2 text-sm font-semibold text-darknavy">
				Approvers
			</div>
			<div className="grid max-h-48 gap-2 overflow-auto rounded-md border border-darknavy/10 bg-offwhite/35 p-2 sm:grid-cols-2">
				{UserListMockData.map((user) => {
					const checked = selectedUserIds.includes(user.id);
					const isSelectionLocked =
						requiresAllApprovers ||
						(!checked && selectedUserIds.length >= maxApprovers);

					return (
						<label
							key={user.id}
							className={
								isSelectionLocked
									? "flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-offwhite/60 px-3 py-2 text-sm font-semibold text-darknavy/55"
									: "flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm font-semibold text-darknavy transition hover:border-skyblue/40"
							}
						>
							<input
								type="checkbox"
								checked={checked}
								disabled={isSelectionLocked}
								onChange={() =>
									onChange(
										checked
											? selectedUserIds.filter(
													(userId) =>
														userId !== user.id,
												)
											: [...selectedUserIds, user.id],
									)
								}
								className="h-4 w-4 accent-skyblue"
							/>
							<span className="min-w-0">
								<span className="block truncate">
									{user.name}
								</span>
								<span className="block truncate text-xs font-medium text-darknavy/45">
									{user.email}
								</span>
							</span>
						</label>
					);
				})}
			</div>
			<p className="mt-2 text-xs font-medium text-darknavy/50">
				{getApproverConditionHelpText(condition)}
			</p>
		</div>
	);
}
