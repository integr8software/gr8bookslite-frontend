import { UsersRound } from "lucide-react";
import {
	getApproverSetupInitials,
	getApproverSetupUser,
} from "@/app/src/data/modules/system-administration/user-management/approver-setup/ApproverSetupData";
import type { ApproverSetupRecord } from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import type { UserListRecord } from "@/app/src/types/modules/user-management/UserListTypes";
import { ApprovalReadOnlyField } from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementEditorFields";

type ApprovalManagementLevelCardProps = {
	record: ApproverSetupRecord;
};

export function ApprovalManagementLevelCard({
	record,
}: ApprovalManagementLevelCardProps) {
	const approvers = record.userIds
		.map((userId) => getApproverSetupUser(userId))
		.filter((user): user is UserListRecord => Boolean(user));

	return (
		<article className="overflow-hidden rounded-lg border border-darknavy/10 bg-white">
			<div className="grid min-h-20 grid-cols-[2.5rem_3rem_minmax(0,1fr)] items-center gap-3 border-b border-darknavy/10 px-4 py-3">
				<span className="relative inline-flex h-full items-center justify-center">
					<span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-skyblue/15" />
					<span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-skyblue text-sm font-bold text-white shadow-sm">
						{record.sequence}
					</span>
				</span>
				<span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-offwhite text-darknavy/60">
					<UsersRound className="h-5 w-5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<div className="truncate text-sm font-semibold leading-5 text-darknavy">
						{record.levelName}
					</div>
					<div className="mt-0.5 text-xs font-medium text-darknavy/55">
						{record.condition}
						<span className="px-1.5 text-darknavy/25">-</span>
						{record.userIds.length} approver
						{record.userIds.length === 1 ? "" : "s"}
					</div>
				</div>
			</div>
			<div className="grid gap-3 bg-offwhite/35 p-4 md:grid-cols-2">
				<ApprovalReadOnlyField
					label="Level Name"
					value={record.levelName}
				/>
				<ApprovalReadOnlyField
					label="Condition"
					value={record.condition}
				/>
				<ApprovalReadOnlyField
					label="Type"
					value={record.assignmentType}
				/>
				<ApprovalReadOnlyField
					label="Module Scope"
					value={record.moduleScope}
				/>
				<div className="md:col-span-2">
					<div className="mb-2 text-sm font-semibold text-darknavy">
						Approvers
					</div>
					<div className="grid gap-2 md:grid-cols-2">
						{approvers.map((approver) => (
							<div
								key={approver.id}
								className="flex min-h-14 items-center gap-3 rounded-md border border-darknavy/10 bg-white px-3 py-2"
							>
								<span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-darknavy text-xs font-bold text-white">
									{getApproverSetupInitials(approver.name)}
								</span>
								<span className="min-w-0">
									<span className="block truncate text-sm font-semibold text-darknavy">
										{approver.name}
									</span>
									<span className="block truncate text-xs font-medium text-darknavy/45">
										{approver.userRole}
									</span>
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</article>
	);
}
