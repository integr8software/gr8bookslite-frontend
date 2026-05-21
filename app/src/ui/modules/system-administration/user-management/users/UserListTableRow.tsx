import { UserCircle } from "lucide-react";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import type { UserStatus } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type { UserListTableRecord } from "@/app/src/types/modules/user-management/UserListTypes";
import { UserListRecordActions } from "@/app/src/ui/modules/system-administration/user-management/users/UserListRecordActions";

type UserListTableRowProps = {
	user: UserListTableRecord;
	onStatusChange: (user: UserListTableRecord) => void;
};

export function UserListTableRow({
	user,
	onStatusChange,
}: UserListTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-3">
				<div className="flex min-w-0 items-center gap-3">
					{user.profileImageUrl ? (
						<span
							aria-hidden="true"
							className="block h-8 w-8 shrink-0 rounded-full bg-cover bg-center ring-1 ring-darknavy/10"
							style={{
								backgroundImage: `url("${user.profileImageUrl}")`,
							}}
						/>
					) : (
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-skyblue/18 text-darknavy ring-1 ring-darknavy/10">
							<UserCircle
								className="h-4 w-4"
								aria-hidden="true"
							/>
						</span>
					)}
					<span className="truncate text-xs font-semibold text-darknavy">
						{user.name}
					</span>
				</div>
			</td>
			<UserListTableCell>{user.email}</UserListTableCell>
			<UserListTableCell>
				<span className="inline-flex min-h-6 items-center rounded bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
					{user.userRole}
				</span>
			</UserListTableCell>
			<UserListTableCell>{user.department}</UserListTableCell>
			<UserListTableCell>
				<UserListStatusBadge status={user.status} />
			</UserListTableCell>
			<UserListTableCell>{user.lastLogin ?? "-"}</UserListTableCell>
			<UserListTableCell align="center">
				<UserListRecordActions
					baseHref={UserListHref}
					id={user.id}
					name={user.name}
					status={user.status}
					onStatusChange={() => onStatusChange(user)}
				/>
			</UserListTableCell>
		</tr>
	);
}

function UserListTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: React.ReactNode;
}) {
	return (
		<td
			className={`px-4 py-3 align-middle text-xs text-darknavy first:pl-5 last:pr-5 ${
				align === "center" ? "text-center" : "text-left"
			}`}
		>
			{children}
		</td>
	);
}

function UserListStatusBadge({ status }: { status: UserStatus }) {
	const classes = {
		Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
		Pending: "bg-amber-50 text-amber-700 ring-amber-100",
		Inactive: "bg-orange-50 text-orange-700 ring-orange-100",
	} satisfies Record<UserStatus, string>;

	return (
		<span
			className={`inline-flex min-h-6 items-center rounded px-2.5 text-xs font-semibold ring-1 ${classes[status]}`}
		>
			{status}
		</span>
	);
}
